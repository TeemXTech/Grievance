import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth-middleware"
import { sanitizeInput, sanitizeMultiline } from "@/lib/input-sanitizer"
import { createAuditLog } from "@/lib/audit-log"
import { askGemini } from "@/lib/gemini"

const READ_ROLES  = ["MINISTER", "PA", "ADMIN", "BACK_OFFICER"]
const WRITE_ROLES = ["PA", "ADMIN", "BACK_OFFICER"]

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  if (!READ_ROLES.includes(user.role))
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

  const question = await prisma.assemblyQuestion.findUnique({
    where: { id: params.id },
    include: { timeline: { orderBy: { createdAt: "asc" } } },
  })
  if (!question) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 })

  const canSeePrivate = ["MINISTER", "PA", "ADMIN"].includes(user.role)
  const result = canSeePrivate ? question : { ...question, privateNotes: undefined, draftAnswerText: undefined }

  return NextResponse.json({ success: true, question: result })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  if (!WRITE_ROLES.includes(user.role))
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

  const question = await prisma.assemblyQuestion.findUnique({ where: { id: params.id } })
  if (!question) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 })

  const body = await req.json()
  const {
    status, actionTaken, remarks,
    sentToDeptName, draftAnswerText, finalAnswerText,
    answeredDate, answerDueDate,
    linkedPetitionId, linkedWorkId, linkedLetterId,
    fileUrl, privateNotes,
    regenerateTalkingPoints, // boolean — re-run AI on demand
  } = body

  const fromStatus = question.status
  const updateData: any = {}

  if (status && status !== fromStatus) {
    updateData.status = status
    if (status === "SENT_TO_DEPT")    updateData.sentToDeptAt    = new Date()
    if (status === "DRAFT_RECEIVED")  updateData.draftReceivedAt = new Date()
    if (status === "ANSWERED")        updateData.answeredDate     = answeredDate ? new Date(answeredDate) : new Date()
  }

  if (sentToDeptName !== undefined)
    updateData.sentToDeptName = sentToDeptName ? sanitizeInput(sentToDeptName) : null

  if (draftAnswerText !== undefined)
    updateData.draftAnswerText = draftAnswerText ? sanitizeMultiline(draftAnswerText) : null

  if (finalAnswerText !== undefined)
    updateData.finalAnswerText = finalAnswerText ? sanitizeMultiline(finalAnswerText) : null

  if (answerDueDate !== undefined)
    updateData.answerDueDate = answerDueDate ? new Date(answerDueDate) : null

  if (linkedPetitionId !== undefined) updateData.linkedPetitionId = linkedPetitionId || null
  if (linkedWorkId     !== undefined) updateData.linkedWorkId     = linkedWorkId     || null
  if (linkedLetterId   !== undefined) updateData.linkedLetterId   = linkedLetterId   || null
  if (fileUrl          !== undefined) updateData.fileUrl          = fileUrl          || null

  if (privateNotes !== undefined && ["MINISTER", "PA", "ADMIN"].includes(user.role))
    updateData.privateNotes = privateNotes ? sanitizeInput(privateNotes) : null

  // Regenerate AI talking points on demand (e.g. after draft answer received)
  if (regenerateTalkingPoints) {
    const contextText = draftAnswerText || question.draftAnswerText || question.questionText
    const prompt = `You are preparing briefing notes for a Minister of Telangana Government.
Generate 5-6 concise talking points for answering this Assembly Question.
Format as numbered bullet points. Be factual, positive, and action-oriented.

Subject: ${question.subject}
Question: ${question.questionText}
Ministry: ${question.ministry}
${contextText !== question.questionText ? `Draft Answer Context: ${contextText?.substring(0, 500)}` : ""}

Keep each point under 2 sentences.`
    try {
      updateData.talkingPoints = await askGemini(prompt)
    } catch {
      // keep existing talking points if Gemini fails
    }
  }

  await prisma.assemblyQuestion.update({ where: { id: params.id }, data: updateData })

  // Timeline entry
  const timelineAction = actionTaken
    || (status && status !== fromStatus ? `Status changed to ${status}` : null)
    || (sentToDeptName ? `Sent to department: ${sentToDeptName}` : null)
    || (draftAnswerText ? "Draft answer received from department" : null)
    || (finalAnswerText ? "Final answer approved" : null)
    || "Question updated"

  await prisma.aQTimeline.create({
    data: {
      assemblyQuestionId: question.id,
      fromStatus:         fromStatus as any,
      toStatus:           (updateData.status || fromStatus) as any,
      actionTaken:        timelineAction,
      remarks:            remarks || null,
      performedByName:    user.name,
      performedByRole:    user.role,
    },
  })

  await createAuditLog({
    action: "UPDATE", entityType: "ASSEMBLY_QUESTION", entityId: params.id,
    userId: user.id,
    oldValues: { status: question.status },
    newValues: { status: updateData.status || question.status, sentToDeptName: updateData.sentToDeptName },
  })

  const result = await prisma.assemblyQuestion.findUnique({
    where: { id: params.id },
    include: { timeline: { orderBy: { createdAt: "asc" } } },
  })

  return NextResponse.json({ success: true, question: result })
}
