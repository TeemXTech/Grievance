import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth-middleware"
import { sanitizeInput } from "@/lib/input-sanitizer"

const READ_ROLES  = ["MINISTER", "PA", "ADMIN", "BACK_OFFICER", "FIELD_OFFICER"]
const WRITE_ROLES = ["PA", "ADMIN"]

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  if (!READ_ROLES.includes(user.role))
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

  const survey = await prisma.survey.findUnique({
    where: { id: params.id },
    include: {
      questions:  { orderBy: { orderIndex: "asc" } },
      boothGrades: { orderBy: { totalScore: "desc" } },
      _count: { select: { responses: true } },
    },
  })
  if (!survey) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 })
  return NextResponse.json({ success: true, survey })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  if (!WRITE_ROLES.includes(user.role))
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

  const survey = await prisma.survey.findUnique({ where: { id: params.id } })
  if (!survey) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 })

  const body = await req.json()
  const { title, description, status, targetLevel, startsAt, endsAt } = body

  const updated = await prisma.survey.update({
    where: { id: params.id },
    data: {
      ...(title       !== undefined && { title:       sanitizeInput(title) }),
      ...(description !== undefined && { description: description ? sanitizeInput(description) : null }),
      ...(status      !== undefined && { status }),
      ...(targetLevel !== undefined && { targetLevel }),
      ...(startsAt    !== undefined && { startsAt:    startsAt ? new Date(startsAt) : null }),
      ...(endsAt      !== undefined && { endsAt:      endsAt   ? new Date(endsAt)   : null }),
    },
    include: { questions: { orderBy: { orderIndex: "asc" } }, _count: { select: { responses: true } } },
  })
  return NextResponse.json({ success: true, survey: updated })
}
