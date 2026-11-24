import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth-middleware"
import { sanitizeInput } from "@/lib/input-sanitizer"
import { createAuditLog } from "@/lib/audit-log"

const READ_ROLES  = ["MINISTER", "PA", "ADMIN", "BACK_OFFICER", "FIELD_OFFICER"]
const WRITE_ROLES = ["MINISTER", "PA", "ADMIN", "BACK_OFFICER"]

export async function GET(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  if (!READ_ROLES.includes(user.role))
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const search   = searchParams.get("search")   || ""
  const status   = searchParams.get("status")   || ""
  const priority = searchParams.get("priority") || ""
  const officeId = searchParams.get("officeId") || ""
  const assignedToId = searchParams.get("assignedToId") || ""
  const overdue  = searchParams.get("overdue")  === "true"
  const page     = Math.max(1, parseInt(searchParams.get("page") || "1"))
  const pageSize = 50

  const where: any = {}

  // FIELD_OFFICER sees only tasks assigned to them
  if (user.role === "FIELD_OFFICER") where.assignedToId = user.id

  if (search) {
    where.OR = [
      { title:          { contains: search, mode: "insensitive" } },
      { description:    { contains: search, mode: "insensitive" } },
      { assignedToName: { contains: search, mode: "insensitive" } },
      { officeName:     { contains: search, mode: "insensitive" } },
    ]
  }
  if (status)      where.status      = status
  if (priority)    where.priority    = priority
  if (officeId)    where.officeId    = officeId
  if (assignedToId) where.assignedToId = assignedToId
  if (overdue)     where.isOverdue   = true

  // Auto-flag overdue tasks on read
  await prisma.task.updateMany({
    where: { dueDate: { lt: new Date() }, status: { notIn: ["COMPLETED", "CANCELLED"] }, isOverdue: false },
    data: { isOverdue: true },
  })

  const [total, tasks] = await Promise.all([
    prisma.task.count({ where }),
    prisma.task.findMany({
      where,
      orderBy: [{ isOverdue: "desc" }, { priority: "desc" }, { dueDate: "asc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { office: { select: { id: true, name: true, officeType: true } } },
    }),
  ])

  return NextResponse.json({ success: true, tasks, total, page, pageSize })
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  if (!WRITE_ROLES.includes(user.role))
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

  const body = await req.json()
  const {
    title, description, priority, officeId, officeName,
    assignedToId, assignedToName, assignedToRole,
    linkedPetitionId, linkedWorkId, linkedLetterId,
    dueDate, notes, voiceNoteUrl, transcription,
  } = body

  if (!title?.trim()) return NextResponse.json({ success: false, error: "Title is required" }, { status: 400 })

  // Resolve officeName if not provided
  let resolvedOfficeName = officeName
  if (officeId && !resolvedOfficeName) {
    const office = await prisma.office.findUnique({ where: { id: officeId }, select: { name: true } })
    resolvedOfficeName = office?.name
  }

  const task = await prisma.task.create({
    data: {
      title:            sanitizeInput(title),
      description:      description   ? sanitizeInput(description)   : null,
      priority:         priority      || "MEDIUM",
      officeId:         officeId      || null,
      officeName:       resolvedOfficeName ? sanitizeInput(resolvedOfficeName) : null,
      assignedToId:     assignedToId  || null,
      assignedToName:   assignedToName  ? sanitizeInput(assignedToName)  : null,
      assignedToRole:   assignedToRole  || null,
      createdById:      user.id,
      createdByName:    user.name,
      createdByRole:    user.role,
      linkedPetitionId: linkedPetitionId || null,
      linkedWorkId:     linkedWorkId     || null,
      linkedLetterId:   linkedLetterId   || null,
      dueDate:          dueDate          ? new Date(dueDate) : null,
      notes:            notes            ? sanitizeInput(notes) : null,
      voiceNoteUrl:     voiceNoteUrl     || null,
      transcription:    transcription    ? sanitizeInput(transcription) : null,
    },
    include: { office: { select: { id: true, name: true, officeType: true } } },
  })

  await createAuditLog({ action: "CREATE", entityType: "TASK", entityId: task.id, userId: user.id, newValues: { title: task.title, priority: task.priority } })
  return NextResponse.json({ success: true, task }, { status: 201 })
}
