import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth-middleware"
import { sanitizeInput, sanitizeMultiline } from "@/lib/input-sanitizer"
import { createAuditLog } from "@/lib/audit-log"

const READ_ROLES    = ["MINISTER", "PA", "ADMIN", "BACK_OFFICER"]
const WRITE_ROLES   = ["PA", "ADMIN", "BACK_OFFICER"]
const ENDORSE_ROLES = ["MINISTER", "PA", "ADMIN"] // only these can add endorsement

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  if (!READ_ROLES.includes(user.role))
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

  const letter = await prisma.letter.findUnique({
    where: { id: params.id },
    include: { timeline: { orderBy: { createdAt: "asc" } } },
  })
  if (!letter) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 })

  const canSeePrivate = ["MINISTER", "PA", "ADMIN"].includes(user.role)
  const result = canSeePrivate ? letter : { ...letter, privateNotes: undefined, endorsementText: undefined }

  return NextResponse.json({ success: true, letter: result })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  if (!WRITE_ROLES.includes(user.role))
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

  const letter = await prisma.letter.findUnique({ where: { id: params.id } })
  if (!letter) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 })

  const body = await req.json()
  const {
    status, actionTaken, remarks,
    // Peshi fields
    fileNumber, eOfficeRef, endorsementText,
    recipientAcknowledgedBy, currentlyWithName, currentlyWithDept, expectedReplyBy,
    // Standard fields
    privateNotes, approvedByName, fileUrl, dueDate,
  } = body

  const updateData: any = {}
  const fromStatus = letter.status

  // ── Status transitions ──────────────────────────────────────────────────────
  if (status && status !== fromStatus) {
    updateData.status = status
    if (status === "DISPATCHED")   updateData.dispatchedAt   = new Date()
    if (status === "RECEIVED")     updateData.receivedAt     = new Date()
    if (status === "ACKNOWLEDGED") {
      updateData.acknowledgedAt = new Date()
      // When acknowledged, record who acknowledged
      if (recipientAcknowledgedBy) {
        updateData.recipientAcknowledgedBy = sanitizeInput(recipientAcknowledgedBy)
        updateData.recipientAcknowledgedAt = new Date()
      }
    }
    if (status === "APPROVED") {
      updateData.approvedById   = user.id
      updateData.approvedByName = approvedByName || user.name
    }
  }

  // ── Peshi / Secretariat fields ──────────────────────────────────────────────
  if (fileNumber !== undefined)
    updateData.fileNumber = fileNumber ? sanitizeInput(fileNumber) : null

  if (eOfficeRef !== undefined)
    updateData.eOfficeRef = eOfficeRef ? sanitizeInput(eOfficeRef) : null

  // Endorsement — only MINISTER/PA/ADMIN can add
  if (endorsementText !== undefined) {
    if (!ENDORSE_ROLES.includes(user.role))
      return NextResponse.json({ success: false, error: "Only Minister or PA can add endorsements" }, { status: 403 })
    updateData.endorsementText = endorsementText ? sanitizeMultiline(endorsementText) : null
    if (endorsementText) {
      updateData.endorsedById   = user.id
      updateData.endorsedByName = user.name
      updateData.endorsedAt     = new Date()
    }
  }

  if (recipientAcknowledgedBy !== undefined)
    updateData.recipientAcknowledgedBy = recipientAcknowledgedBy ? sanitizeInput(recipientAcknowledgedBy) : null

  if (currentlyWithName !== undefined)
    updateData.currentlyWithName = currentlyWithName ? sanitizeInput(currentlyWithName) : null

  if (currentlyWithDept !== undefined)
    updateData.currentlyWithDept = currentlyWithDept ? sanitizeInput(currentlyWithDept) : null

  if (expectedReplyBy !== undefined)
    updateData.expectedReplyBy = expectedReplyBy ? new Date(expectedReplyBy) : null

  // ── Standard fields ─────────────────────────────────────────────────────────
  if (privateNotes !== undefined && ["MINISTER", "PA", "ADMIN"].includes(user.role))
    updateData.privateNotes = privateNotes ? sanitizeInput(privateNotes) : null

  if (fileUrl)  updateData.fileUrl = fileUrl
  if (dueDate)  updateData.dueDate = new Date(dueDate)

  await prisma.letter.update({ where: { id: params.id }, data: updateData })

  // ── Timeline entry ──────────────────────────────────────────────────────────
  const timelineAction = actionTaken
    || (endorsementText ? `Endorsement added by ${user.name}` : null)
    || (status && status !== fromStatus ? `Status changed to ${status}` : null)
    || (fileNumber ? `File number set: ${fileNumber}` : null)
    || (currentlyWithName ? `File moved to: ${currentlyWithName} (${currentlyWithDept || "unknown dept"})` : null)
    || "Letter updated"

  const toStatus = (status && status !== fromStatus ? status : fromStatus) as any

  await prisma.letterTimeline.create({
    data: {
      letterId:        letter.id,
      fromStatus:      fromStatus as any,
      toStatus,
      actionTaken:     timelineAction,
      remarks:         remarks || null,
      performedByName: user.name,
      performedByRole: user.role,
    },
  })

  await createAuditLog({
    action:     "UPDATE",
    entityType: "LETTER",
    entityId:   params.id,
    userId:     user.id,
    oldValues:  { status: letter.status },
    newValues:  { status: updateData.status || letter.status, fileNumber: updateData.fileNumber, endorsedBy: updateData.endorsedByName },
  })

  const result = await prisma.letter.findUnique({
    where: { id: params.id },
    include: { timeline: { orderBy: { createdAt: "asc" } } },
  })

  return NextResponse.json({ success: true, letter: result })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  if (!["PA", "ADMIN"].includes(user.role))
    return NextResponse.json({ success: false, error: "Only PA/ADMIN can delete letters" }, { status: 403 })

  const letter = await prisma.letter.findUnique({ where: { id: params.id } })
  if (!letter) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 })

  // Soft-cancel — never hard delete government correspondence
  await prisma.letter.update({ where: { id: params.id }, data: { status: "CANCELLED" } })
  await prisma.letterTimeline.create({
    data: {
      letterId:        letter.id,
      fromStatus:      letter.status as any,
      toStatus:        "CANCELLED",
      actionTaken:     "Letter cancelled",
      performedByName: user.name,
      performedByRole: user.role,
    },
  })

  await createAuditLog({ action: "DELETE", entityType: "LETTER", entityId: params.id, userId: user.id, oldValues: { letterNumber: letter.letterNumber } })
  return NextResponse.json({ success: true })
}
