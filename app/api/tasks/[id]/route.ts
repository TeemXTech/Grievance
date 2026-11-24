import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth-middleware"
import { sanitizeInput } from "@/lib/input-sanitizer"
import { createAuditLog } from "@/lib/audit-log"

const READ_ROLES  = ["MINISTER", "PA", "ADMIN", "BACK_OFFICER", "FIELD_OFFICER"]
const WRITE_ROLES = ["MINISTER", "PA", "ADMIN", "BACK_OFFICER", "FIELD_OFFICER"]

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  if (!READ_ROLES.includes(user.role))
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

  const task = await prisma.task.findUnique({
    where: { id: params.id },
    include: { office: true },
  })
  if (!task) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 })

  // FIELD_OFFICER can only see their own tasks
  if (user.role === "FIELD_OFFICER" && task.assignedToId !== user.id)
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

  return NextResponse.json({ success: true, task })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  if (!WRITE_ROLES.includes(user.role))
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

  const task = await prisma.task.findUnique({ where: { id: params.id } })
  if (!task) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 })

  // FIELD_OFFICER can only update their own tasks
  if (user.role === "FIELD_OFFICER" && task.assignedToId !== user.id)
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

  const body = await req.json()
  const { title, description, status, priority, officeId, officeName,
    assignedToId, assignedToName, assignedToRole,
    dueDate, notes, transcription } = body

  let resolvedOfficeName = officeName
  if (officeId && officeId !== task.officeId && !officeName) {
    const office = await prisma.office.findUnique({ where: { id: officeId }, select: { name: true } })
    resolvedOfficeName = office?.name
  }

  const updated = await prisma.task.update({
    where: { id: params.id },
    data: {
      ...(title          !== undefined && { title:          sanitizeInput(title) }),
      ...(description    !== undefined && { description:    description ? sanitizeInput(description) : null }),
      ...(status         !== undefined && { status }),
      ...(priority       !== undefined && { priority }),
      ...(officeId       !== undefined && { officeId:       officeId || null }),
      ...(resolvedOfficeName !== undefined && { officeName: resolvedOfficeName ? sanitizeInput(resolvedOfficeName) : null }),
      ...(assignedToId   !== undefined && { assignedToId:   assignedToId || null }),
      ...(assignedToName !== undefined && { assignedToName: assignedToName ? sanitizeInput(assignedToName) : null }),
      ...(assignedToRole !== undefined && { assignedToRole: assignedToRole || null }),
      ...(dueDate        !== undefined && { dueDate:        dueDate ? new Date(dueDate) : null }),
      ...(notes          !== undefined && { notes:          notes ? sanitizeInput(notes) : null }),
      ...(transcription  !== undefined && { transcription:  transcription ? sanitizeInput(transcription) : null }),
      // Auto-set completedAt
      ...(status === "COMPLETED" && { completedAt: new Date(), isOverdue: false }),
      ...(status === "CANCELLED" && { isOverdue: false }),
    },
    include: { office: true },
  })

  if (status && status !== task.status) {
    await createAuditLog({ action: "STATUS_CHANGE", entityType: "TASK", entityId: params.id, userId: user.id, oldValues: { status: task.status }, newValues: { status } })
  }
  return NextResponse.json({ success: true, task: updated })
}
