import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth-middleware"
import { sanitizeInput } from "@/lib/input-sanitizer"
import { createAuditLog } from "@/lib/audit-log"

const READ_ROLES  = ["MINISTER", "PA", "ADMIN", "BACK_OFFICER"]
const WRITE_ROLES = ["PA", "ADMIN"]

export async function GET(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  if (!READ_ROLES.includes(user.role))
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

  const offices = await prisma.office.findMany({
    orderBy: [{ isDefault: "desc" }, { name: "asc" }],
    include: { _count: { select: { tasks: { where: { status: { in: ["OPEN", "IN_PROGRESS"] } } } } } },
  })
  return NextResponse.json({ success: true, offices })
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  if (!WRITE_ROLES.includes(user.role))
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

  const body = await req.json()
  const { name, officeType, address, city, phone, email, inChargeName, isDefault } = body

  if (!name?.trim()) return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 })

  // Only one default office allowed
  if (isDefault) {
    await prisma.office.updateMany({ where: { isDefault: true }, data: { isDefault: false } })
  }

  const office = await prisma.office.create({
    data: {
      name:         sanitizeInput(name),
      officeType:   officeType   || "CONSTITUENCY",
      address:      address      ? sanitizeInput(address)      : null,
      city:         city         ? sanitizeInput(city)         : null,
      phone:        phone        ? sanitizeInput(phone)        : null,
      email:        email        ? sanitizeInput(email)        : null,
      inChargeName: inChargeName ? sanitizeInput(inChargeName) : null,
      isDefault:    !!isDefault,
    },
  })
  await createAuditLog({ action: "CREATE", entityType: "OFFICE", entityId: office.id, userId: user.id, newValues: { name: office.name, officeType: office.officeType } })
  return NextResponse.json({ success: true, office }, { status: 201 })
}
