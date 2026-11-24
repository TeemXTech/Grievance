import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth-middleware"
import { sanitizeInput } from "@/lib/input-sanitizer"

const READ_ROLES  = ["MINISTER", "PA", "ADMIN", "BACK_OFFICER"]
const WRITE_ROLES = ["PA", "ADMIN"]

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  if (!READ_ROLES.includes(user.role))
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

  const office = await prisma.office.findUnique({
    where: { id: params.id },
    include: {
      tasks: { where: { status: { in: ["OPEN", "IN_PROGRESS"] } }, orderBy: { dueDate: "asc" }, take: 10 },
      _count: { select: { tasks: true } },
    },
  })
  if (!office) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 })
  return NextResponse.json({ success: true, office })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  if (!WRITE_ROLES.includes(user.role))
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

  const office = await prisma.office.findUnique({ where: { id: params.id } })
  if (!office) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 })

  const body = await req.json()
  const { name, officeType, address, city, phone, email, inChargeName, isActive, isDefault } = body

  if (isDefault) {
    await prisma.office.updateMany({ where: { isDefault: true, id: { not: params.id } }, data: { isDefault: false } })
  }

  const updated = await prisma.office.update({
    where: { id: params.id },
    data: {
      ...(name         !== undefined && { name:         sanitizeInput(name) }),
      ...(officeType   !== undefined && { officeType }),
      ...(address      !== undefined && { address:      address ? sanitizeInput(address) : null }),
      ...(city         !== undefined && { city:         city ? sanitizeInput(city) : null }),
      ...(phone        !== undefined && { phone:        phone ? sanitizeInput(phone) : null }),
      ...(email        !== undefined && { email:        email ? sanitizeInput(email) : null }),
      ...(inChargeName !== undefined && { inChargeName: inChargeName ? sanitizeInput(inChargeName) : null }),
      ...(isActive     !== undefined && { isActive: !!isActive }),
      ...(isDefault    !== undefined && { isDefault: !!isDefault }),
    },
  })
  return NextResponse.json({ success: true, office: updated })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  if (user.role !== "ADMIN")
    return NextResponse.json({ success: false, error: "Only ADMIN can delete offices" }, { status: 403 })

  const office = await prisma.office.findUnique({ where: { id: params.id }, include: { _count: { select: { tasks: true } } } })
  if (!office) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 })
  if (office._count.tasks > 0)
    return NextResponse.json({ success: false, error: `Cannot delete — ${office._count.tasks} task(s) linked. Reassign first.` }, { status: 409 })

  await prisma.office.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
