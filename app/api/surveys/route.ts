import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth-middleware"
import { sanitizeInput } from "@/lib/input-sanitizer"

const READ_ROLES  = ["MINISTER", "PA", "ADMIN", "BACK_OFFICER", "FIELD_OFFICER"]
const WRITE_ROLES = ["PA", "ADMIN"]

export async function GET(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  if (!READ_ROLES.includes(user.role))
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status") || ""

  const where: any = {}
  if (status) where.status = status

  const surveys = await prisma.survey.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { questions: true, responses: true } },
    },
  })
  return NextResponse.json({ success: true, surveys })
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  if (!WRITE_ROLES.includes(user.role))
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

  const body = await req.json()
  const { title, description, targetLevel, languages, startsAt, endsAt, questions } = body

  if (!title?.trim()) return NextResponse.json({ success: false, error: "Title is required" }, { status: 400 })
  if (!questions?.length) return NextResponse.json({ success: false, error: "At least one question is required" }, { status: 400 })

  const survey = await prisma.survey.create({
    data: {
      title:        sanitizeInput(title),
      description:  description  ? sanitizeInput(description) : null,
      targetLevel:  targetLevel  || "BOOTH",
      languages:    languages    || ["en"],
      startsAt:     startsAt     ? new Date(startsAt) : null,
      endsAt:       endsAt       ? new Date(endsAt)   : null,
      createdById:  user.id,
      createdByName: user.name,
      questions: {
        create: questions.map((q: any, i: number) => ({
          orderIndex:   i,
          questionType: q.questionType || "YES_NO",
          questionText: sanitizeInput(q.questionText),
          questionTe:   q.questionTe   ? sanitizeInput(q.questionTe)   : null,
          questionHi:   q.questionHi   ? sanitizeInput(q.questionHi)   : null,
          options:      q.options       || null,
          isRequired:   q.isRequired    !== false,
          weight:       q.weight        || 1.0,
        })),
      },
    },
    include: { questions: { orderBy: { orderIndex: "asc" } } },
  })

  return NextResponse.json({ success: true, survey }, { status: 201 })
}
