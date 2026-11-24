import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, hasRole } from "@/lib/auth-middleware"
import { sanitizeInput } from "@/lib/input-sanitizer"
import { createAuditLog } from "@/lib/audit-log"

const READ_ROLES  = ["MINISTER", "PA", "ADMIN", "BACK_OFFICER"]
const WRITE_ROLES = ["PA", "ADMIN"]

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!READ_ROLES.includes(user.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const event = await prisma.tourAppointment.findUnique({ where: { id: params.id } })
  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const canSeePrivate = hasRole(user, "MINISTER", "PA", "ADMIN")
  const result = canSeePrivate ? event : (() => { const { privateNotes, ...e } = event; return e })()
  return NextResponse.json({ success: true, event: result })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!WRITE_ROLES.includes(user.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const event = await prisma.tourAppointment.findUnique({ where: { id: params.id } })
  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const body = await req.json()
  const { title, description, eventType, startDate, endDate, location, mandalName, villageName, linkedLeaderName, vipGuests, notes, privateNotes, status } = body

  const updated = await prisma.tourAppointment.update({
    where: { id: params.id },
    data: {
      ...(title            !== undefined && { title:            sanitizeInput(title) }),
      ...(description      !== undefined && { description:      description ? sanitizeInput(description) : null }),
      ...(eventType        !== undefined && { eventType }),
      ...(startDate        !== undefined && { startDate:        new Date(startDate) }),
      ...(endDate          !== undefined && { endDate:          endDate ? new Date(endDate) : null }),
      ...(location         !== undefined && { location:         sanitizeInput(location) }),
      ...(mandalName       !== undefined && { mandalName:       mandalName ? sanitizeInput(mandalName) : null }),
      ...(villageName      !== undefined && { villageName:      villageName ? sanitizeInput(villageName) : null }),
      ...(linkedLeaderName !== undefined && { linkedLeaderName: linkedLeaderName ? sanitizeInput(linkedLeaderName) : null }),
      ...(vipGuests        !== undefined && { vipGuests:        vipGuests ? sanitizeInput(vipGuests) : null }),
      ...(notes            !== undefined && { notes:            notes ? sanitizeInput(notes) : null }),
      ...(privateNotes     !== undefined && hasRole(user, "MINISTER", "PA", "ADMIN") && { privateNotes: privateNotes ? sanitizeInput(privateNotes) : null }),
      ...(status           !== undefined && { status }),
    },
  })

  await createAuditLog({ action: "UPDATE", entityType: "TOUR_APPOINTMENT", entityId: params.id, userId: user.id, newValues: { status, title: body.title } })
  return NextResponse.json({ success: true, event: updated })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!WRITE_ROLES.includes(user.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const event = await prisma.tourAppointment.findUnique({ where: { id: params.id } })
  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 })

  // Soft-cancel rather than hard delete to preserve history
  await prisma.tourAppointment.update({ where: { id: params.id }, data: { status: "CANCELLED" } })
  await createAuditLog({ action: "DELETE", entityType: "TOUR_APPOINTMENT", entityId: params.id, userId: user.id })
  return NextResponse.json({ success: true })
}
