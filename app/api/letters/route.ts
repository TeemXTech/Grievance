import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth-middleware"
import { sanitizeInput, sanitizeMultiline } from "@/lib/input-sanitizer"
import { createAuditLog } from "@/lib/audit-log"

const READ_ROLES  = ["MINISTER", "PA", "ADMIN", "BACK_OFFICER"]
const WRITE_ROLES = ["PA", "ADMIN", "BACK_OFFICER"]

async function generateLetterNumber(direction: string): Promise<string> {
  const year = new Date().getFullYear()
  const dir  = direction === "INBOUND" ? "IN" : "OUT"
  const prefix = `LTR-${dir}-${year}-`
  const last = await prisma.letter.findFirst({
    where: { letterNumber: { startsWith: prefix } },
    orderBy: { letterNumber: "desc" },
  })
  const seq = last ? parseInt(last.letterNumber.split("-").pop()!, 10) + 1 : 1
  return `${prefix}${String(seq).padStart(4, "0")}`
}

export async function GET(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  if (!READ_ROLES.includes(user.role))
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const search    = searchParams.get("search") || ""
  const status    = searchParams.get("status") || ""
  const direction = searchParams.get("direction") || ""
  const type      = searchParams.get("type") || ""
  const page      = Math.max(1, parseInt(searchParams.get("page") || "1"))
  const pageSize  = 50

  const where: any = {}
  if (search) {
    where.OR = [
      { subject:       { contains: search, mode: "insensitive" } },
      { letterNumber:  { contains: search, mode: "insensitive" } },
      { fromName:      { contains: search, mode: "insensitive" } },
      { toName:        { contains: search, mode: "insensitive" } },
      { fromDepartment:{ contains: search, mode: "insensitive" } },
      { toDepartment:  { contains: search, mode: "insensitive" } },
    ]
  }
  if (status)    where.status    = status
  if (direction) where.direction = direction
  if (type)      where.letterType = type

  const [total, letters] = await Promise.all([
    prisma.letter.count({ where }),
    prisma.letter.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { timeline: { orderBy: { createdAt: "asc" } } },
    }),
  ])

  // Strip privateNotes for non-privileged roles
  const canSeePrivate = ["MINISTER", "PA", "ADMIN"].includes(user.role)
  const result = canSeePrivate ? letters : letters.map(l => ({ ...l, privateNotes: undefined }))

  return NextResponse.json({ success: true, letters: result, total, page, pageSize })
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  if (!WRITE_ROLES.includes(user.role))
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

  const body = await req.json()
  const {
    direction, letterType, subject, body: letterBody, priority,
    fromName, fromDesignation, fromDepartment, fromAddress,
    toName, toDesignation, toDepartment, toAddress,
    letterDate, dueDate, linkedPetitionId, linkedWorkId,
    fileUrl, privateNotes,
    // Peshi fields
    fileNumber, eOfficeRef, endorsementText, currentlyWithName, currentlyWithDept, expectedReplyBy,
  } = body

  if (!subject?.trim()) return NextResponse.json({ success: false, error: "Subject is required" }, { status: 400 })
  if (!fromName?.trim()) return NextResponse.json({ success: false, error: "From name is required" }, { status: 400 })
  if (!toName?.trim()) return NextResponse.json({ success: false, error: "To name is required" }, { status: 400 })

  const letterNumber = await generateLetterNumber(direction || "OUTBOUND")

  const letter = await prisma.letter.create({
    data: {
      letterNumber,
      direction:       direction    || "OUTBOUND",
      letterType:      letterType   || "OFFICIAL_LETTER",
      status:          "DRAFT",
      subject:         sanitizeInput(subject),
      body:            letterBody   ? sanitizeMultiline(letterBody) : null,
      priority:        priority     || "MEDIUM",
      fromName:        sanitizeInput(fromName),
      fromDesignation: fromDesignation ? sanitizeInput(fromDesignation) : null,
      fromDepartment:  fromDepartment  ? sanitizeInput(fromDepartment)  : null,
      fromAddress:     fromAddress     ? sanitizeInput(fromAddress)     : null,
      toName:          sanitizeInput(toName),
      toDesignation:   toDesignation   ? sanitizeInput(toDesignation)   : null,
      toDepartment:    toDepartment    ? sanitizeInput(toDepartment)    : null,
      toAddress:       toAddress       ? sanitizeInput(toAddress)       : null,
      letterDate:      letterDate      ? new Date(letterDate)           : new Date(),
      dueDate:         dueDate         ? new Date(dueDate)              : null,
      linkedPetitionId: linkedPetitionId || null,
      linkedWorkId:     linkedWorkId    || null,
      fileUrl:          fileUrl         || null,
      privateNotes:     privateNotes    ? sanitizeInput(privateNotes)   : null,
      draftedById:      user.id,
      draftedByName:    user.name,
      // Peshi fields
      fileNumber:          fileNumber          ? sanitizeInput(fileNumber)          : null,
      eOfficeRef:          eOfficeRef          ? sanitizeInput(eOfficeRef)          : null,
      endorsementText:     endorsementText     ? sanitizeMultiline(endorsementText) : null,
      endorsedById:        endorsementText     ? user.id                            : null,
      endorsedByName:      endorsementText     ? user.name                          : null,
      endorsedAt:          endorsementText     ? new Date()                         : null,
      currentlyWithName:   currentlyWithName   ? sanitizeInput(currentlyWithName)   : null,
      currentlyWithDept:   currentlyWithDept   ? sanitizeInput(currentlyWithDept)   : null,
      expectedReplyBy:     expectedReplyBy     ? new Date(expectedReplyBy)          : null,
    },
  })

  // Timeline entry for creation
  await prisma.letterTimeline.create({
    data: {
      letterId:        letter.id,
      toStatus:        "DRAFT",
      actionTaken:     "Letter created / drafted",
      performedByName: user.name,
      performedByRole: user.role,
    },
  })

  await createAuditLog({ action: "CREATE", entityType: "LETTER", entityId: letter.id, userId: user.id, newValues: { letterNumber: letter.letterNumber, subject: letter.subject } })
  return NextResponse.json({ success: true, letter }, { status: 201 })
}
