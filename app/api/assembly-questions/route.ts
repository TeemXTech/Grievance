import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth-middleware"
import { sanitizeInput, sanitizeMultiline } from "@/lib/input-sanitizer"
import { createAuditLog } from "@/lib/audit-log"
import { askGemini } from "@/lib/gemini"

const READ_ROLES  = ["MINISTER", "PA", "ADMIN", "BACK_OFFICER"]
const WRITE_ROLES = ["PA", "ADMIN", "BACK_OFFICER"]

async function generateQuestionNumber(type: string): Promise<string> {
  const year   = new Date().getFullYear()
  const prefix = `${type === "STARRED" ? "LAQ" : type === "UNSTARRED" ? "LCQ" : "AQ"}-${year}-`
  const last   = await prisma.assemblyQuestion.findFirst({
    where:   { questionNumber: { startsWith: prefix } },
    orderBy: { questionNumber: "desc" },
  })
  const seq = last ? parseInt(last.questionNumber.split("-").pop()!, 10) + 1 : 1
  return `${prefix}${String(seq).padStart(4, "0")}`
}

// AI generates talking points for the Minister from the question text
async function generateTalkingPoints(question: AssemblyQuestionInput): Promise<string> {
  const prompt = `You are preparing briefing notes for a Minister of Telangana Government.
A Legislative Assembly Question has been raised. Generate 5-6 concise talking points the Minister can use when answering.
Format as numbered bullet points. Be factual, positive, and action-oriented.

Question Type: ${question.questionType}
Subject: ${question.subject}
Full Question: ${question.questionText}
Ministry: ${question.ministry}
Department: ${question.department || "Not specified"}
Asked by MLA: ${question.askedByMLA} (${question.askedByConstituency || "unknown constituency"})

Generate talking points in English. Keep each point under 2 sentences.`

  try {
    return await askGemini(prompt)
  } catch {
    return `• Review department records for ${question.subject}\n• Prepare factual data on current status\n• Highlight government achievements in this area\n• Mention upcoming initiatives\n• Assure the House of timely action`
  }
}

interface AssemblyQuestionInput {
  questionType: string
  subject: string
  questionText: string
  askedByMLA: string
  askedByConstituency?: string
  ministry: string
  department?: string
}

export async function GET(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  if (!READ_ROLES.includes(user.role))
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const search  = searchParams.get("search")  || ""
  const status  = searchParams.get("status")  || ""
  const type    = searchParams.get("type")    || ""
  const session = searchParams.get("session") || ""
  const overdue = searchParams.get("overdue") === "true"
  const page    = Math.max(1, parseInt(searchParams.get("page") || "1"))
  const pageSize = 50

  const where: any = {}
  if (search) {
    where.OR = [
      { subject:       { contains: search, mode: "insensitive" } },
      { questionNumber:{ contains: search, mode: "insensitive" } },
      { askedByMLA:    { contains: search, mode: "insensitive" } },
      { ministry:      { contains: search, mode: "insensitive" } },
    ]
  }
  if (status)  where.status       = status
  if (type)    where.questionType = type
  if (session) where.sessionName  = { contains: session, mode: "insensitive" }
  if (overdue) where.answerDueDate = { lt: new Date() }

  const canSeePrivate = ["MINISTER", "PA", "ADMIN"].includes(user.role)

  const [total, questions] = await Promise.all([
    prisma.assemblyQuestion.count({ where }),
    prisma.assemblyQuestion.findMany({
      where,
      orderBy: [{ answerDueDate: "asc" }, { createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { timeline: { orderBy: { createdAt: "asc" } } },
    }),
  ])

  const result = canSeePrivate
    ? questions
    : questions.map(q => ({ ...q, privateNotes: undefined, draftAnswerText: undefined }))

  return NextResponse.json({ success: true, questions: result, total, page, pageSize })
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  if (!WRITE_ROLES.includes(user.role))
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

  const body = await req.json()
  const {
    questionType, sessionName, subject, questionText,
    askedByMLA, askedByConstituency, ministry, department,
    receivedDate, answerDueDate,
    linkedPetitionId, linkedWorkId, linkedLetterId,
    fileUrl, privateNotes,
  } = body

  if (!subject?.trim())      return NextResponse.json({ success: false, error: "Subject is required" }, { status: 400 })
  if (!questionText?.trim()) return NextResponse.json({ success: false, error: "Question text is required" }, { status: 400 })
  if (!askedByMLA?.trim())   return NextResponse.json({ success: false, error: "MLA name is required" }, { status: 400 })
  if (!ministry?.trim())     return NextResponse.json({ success: false, error: "Ministry is required" }, { status: 400 })
  if (!sessionName?.trim())  return NextResponse.json({ success: false, error: "Session name is required" }, { status: 400 })

  const questionNumber = await generateQuestionNumber(questionType || "STARRED")

  // Auto-generate AI talking points on creation
  const talkingPoints = await generateTalkingPoints({
    questionType: questionType || "STARRED",
    subject, questionText, askedByMLA, askedByConstituency, ministry, department,
  })

  const question = await prisma.assemblyQuestion.create({
    data: {
      questionNumber,
      sessionName:         sanitizeInput(sessionName),
      questionType:        questionType   || "STARRED",
      status:              "RECEIVED",
      subject:             sanitizeInput(subject),
      questionText:        sanitizeMultiline(questionText),
      askedByMLA:          sanitizeInput(askedByMLA),
      askedByConstituency: askedByConstituency ? sanitizeInput(askedByConstituency) : null,
      ministry:            sanitizeInput(ministry),
      department:          department          ? sanitizeInput(department)          : null,
      receivedDate:        receivedDate        ? new Date(receivedDate)             : new Date(),
      answerDueDate:       answerDueDate       ? new Date(answerDueDate)            : null,
      linkedPetitionId:    linkedPetitionId    || null,
      linkedWorkId:        linkedWorkId        || null,
      linkedLetterId:      linkedLetterId      || null,
      fileUrl:             fileUrl             || null,
      privateNotes:        privateNotes        ? sanitizeInput(privateNotes)        : null,
      handledById:         user.id,
      handledByName:       user.name,
      talkingPoints,
    },
  })

  await prisma.aQTimeline.create({
    data: {
      assemblyQuestionId: question.id,
      toStatus:           "RECEIVED",
      actionTaken:        `Question ${questionNumber} received and registered`,
      performedByName:    user.name,
      performedByRole:    user.role,
    },
  })

  await createAuditLog({
    action: "CREATE", entityType: "ASSEMBLY_QUESTION", entityId: question.id,
    userId: user.id, newValues: { questionNumber, subject, askedByMLA },
  })

  return NextResponse.json({ success: true, question }, { status: 201 })
}
