import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth-middleware"
import { sanitizeInput } from "@/lib/input-sanitizer"
import { createAuditLog } from "@/lib/audit-log"

const READ_ROLES  = ["MINISTER", "PA", "ADMIN", "BACK_OFFICER"]
const WRITE_ROLES = ["PA", "ADMIN", "BACK_OFFICER"]

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  if (!READ_ROLES.includes(user.role))
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

  const visitor = await prisma.visitorLog.findUnique({ where: { id: params.id } })
  if (!visitor) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 })

  return NextResponse.json({ success: true, visitor })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  if (!WRITE_ROLES.includes(user.role))
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

  const visitor = await prisma.visitorLog.findUnique({ where: { id: params.id } })
  if (!visitor) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 })

  const body = await req.json()
  const { action, status, outcomeNotes, meetingWith, notes, priorityFlag } = body

  const updateData: any = {}

  // Action-based shortcuts
  if (action === "CHECK_IN") {
    updateData.status      = "IN_MEETING"
    updateData.checkedInAt = new Date()
    if (meetingWith) updateData.meetingWith = sanitizeInput(meetingWith)
  } else if (action === "CHECK_OUT") {
    updateData.status       = "COMPLETED"
    updateData.checkedOutAt = new Date()
    if (outcomeNotes) updateData.outcomeNotes = sanitizeInput(outcomeNotes)
  } else if (action === "CANCEL") {
    updateData.status = "CANCELLED"
  } else if (action === "NO_SHOW") {
    updateData.status = "NO_SHOW"
  } else {
    // Manual field update
    if (status)       updateData.status       = status
    if (outcomeNotes) updateData.outcomeNotes = sanitizeInput(outcomeNotes)
    if (meetingWith)  updateData.meetingWith  = sanitizeInput(meetingWith)
    if (notes)        updateData.notes        = sanitizeInput(notes)
    if (priorityFlag !== undefined) updateData.priorityFlag = !!priorityFlag
  }

  updateData.updatedAt = new Date()

  const updated = await prisma.visitorLog.update({
    where: { id: params.id },
    data: updateData,
  })

  await createAuditLog({ action: "STATUS_CHANGE", entityType: "VISITOR", entityId: params.id, userId: user.id, oldValues: { status: visitor.status }, newValues: { status: updated.status, action: body.action } })
  return NextResponse.json({ success: true, visitor: updated })
}
