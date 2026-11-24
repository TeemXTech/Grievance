import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth-middleware"

const READ_ROLES = ["MINISTER", "PA", "ADMIN", "BACK_OFFICER"]

export async function GET(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  if (!READ_ROLES.includes(user.role))
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

  const now = new Date()

  const [
    total, received, sentToDept, draftReceived, underReview, answerReady, answered, lapsed,
    overdueAnswer, starred, unstarred,
    urgentList,
  ] = await Promise.all([
    prisma.assemblyQuestion.count(),
    prisma.assemblyQuestion.count({ where: { status: "RECEIVED" } }),
    prisma.assemblyQuestion.count({ where: { status: "SENT_TO_DEPT" } }),
    prisma.assemblyQuestion.count({ where: { status: "DRAFT_RECEIVED" } }),
    prisma.assemblyQuestion.count({ where: { status: "UNDER_REVIEW" } }),
    prisma.assemblyQuestion.count({ where: { status: "ANSWER_READY" } }),
    prisma.assemblyQuestion.count({ where: { status: "ANSWERED" } }),
    prisma.assemblyQuestion.count({ where: { status: "LAPSED" } }),

    // Overdue: answerDueDate passed and not yet answered
    prisma.assemblyQuestion.count({
      where: {
        answerDueDate: { lt: now },
        status: { notIn: ["ANSWERED", "LAPSED"] },
      },
    }),

    prisma.assemblyQuestion.count({ where: { questionType: "STARRED" } }),
    prisma.assemblyQuestion.count({ where: { questionType: "UNSTARRED" } }),

    // Questions due in next 7 days — urgent attention needed
    prisma.assemblyQuestion.findMany({
      where: {
        answerDueDate: { gte: now, lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) },
        status: { notIn: ["ANSWERED", "LAPSED", "ANSWER_READY"] },
      },
      select: {
        id: true, questionNumber: true, subject: true, questionType: true,
        askedByMLA: true, ministry: true, answerDueDate: true, status: true,
      },
      orderBy: { answerDueDate: "asc" },
      take: 10,
    }),
  ])

  // Group by ministry
  const byMinistry = await prisma.assemblyQuestion.groupBy({
    by: ["ministry"],
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 10,
  })

  return NextResponse.json({
    success: true,
    stats: {
      total, received, sentToDept, draftReceived, underReview,
      answerReady, answered, lapsed, overdueAnswer, starred, unstarred,
    },
    urgentList,
    byMinistry: byMinistry.map(m => ({ ministry: m.ministry, count: m._count.id })),
  })
}
