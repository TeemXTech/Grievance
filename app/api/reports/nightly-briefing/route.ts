import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth-middleware"

// Minister and PA only — this is the executive digest
const READ_ROLES = ["MINISTER", "PA", "ADMIN"]

export async function GET(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  if (!READ_ROLES.includes(user.role))
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

  const now        = new Date()
  const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0)
  const todayEnd   = new Date(now); todayEnd.setHours(23, 59, 59, 999)
  const weekAgo    = new Date(now); weekAgo.setDate(now.getDate() - 7)

  const [
    // Petitions
    petitionsToday,
    petitionsOverdue,
    petitionsResolvedToday,
    criticalPetitions,

    // Tasks
    tasksOverdue,
    tasksUrgentOpen,
    tasksDueToday,

    // Letters
    lettersOverdue,
    lettersDraftPending,

    // Funds
    fundsStuck,
    fundsStuckList,

    // Visitors
    visitorsToday,
    visitorsWaiting,

    // Surveys
    criticalBooths,

    // Works
    worksStuck,

    // Recent activity
    recentTimeline,
  ] = await Promise.all([
    prisma.petitionRequest.count({ where: { createdAt: { gte: todayStart, lte: todayEnd } } }),
    prisma.petitionRequest.count({ where: { isOverdue: true, status: { notIn: ["RESOLVED", "SANCTIONED", "CLOSED", "REJECTED"] } } }),
    prisma.petitionRequest.count({ where: { resolvedAt: { gte: todayStart, lte: todayEnd } } }),
    prisma.petitionRequest.findMany({
      where: { isOverdue: true, priority: { in: ["HIGH", "URGENT"] }, status: { notIn: ["RESOLVED", "SANCTIONED", "CLOSED"] } },
      orderBy: { dueDate: "asc" },
      take: 5,
      select: { id: true, trackingNumber: true, title: true, applicantName: true, type: true, dueDate: true, priority: true },
    }),

    prisma.task.count({ where: { isOverdue: true, status: { notIn: ["COMPLETED", "CANCELLED"] } } }),
    prisma.task.count({ where: { priority: "URGENT", status: { in: ["OPEN", "IN_PROGRESS"] } } }),
    prisma.task.count({ where: { dueDate: { gte: todayStart, lte: todayEnd }, status: { notIn: ["COMPLETED", "CANCELLED"] } } }),

    prisma.letter.count({ where: { dueDate: { lt: now }, status: { notIn: ["FILED", "CANCELLED", "ACKNOWLEDGED"] } } }),
    prisma.letter.count({ where: { status: { in: ["DRAFT", "PENDING_APPROVAL"] } } }),

    prisma.fundAllocation.count({ where: { isStuck: true } }),
    prisma.fundAllocation.findMany({
      where: { isStuck: true },
      orderBy: { stuckSince: "asc" },
      take: 5,
      select: { id: true, referenceNumber: true, workTitle: true, status: true, stuckSince: true, mandalName: true },
    }),

    prisma.visitorLog.count({ where: { appointmentDate: { gte: todayStart, lte: todayEnd } } }),
    prisma.visitorLog.count({ where: { status: "WAITING" } }),

    prisma.boothGrade.findMany({
      where: { grade: "D" },
      orderBy: { totalScore: "asc" },
      take: 5,
      select: { boothNumber: true, villageName: true, mandalName: true, totalScore: true, gradeDrop: true },
    }),

    prisma.publicWork.count({ where: { stage: "STUCK_DELAYED" } }),

    prisma.requestTimeline.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { actionTaken: true, performedByName: true, performedByRole: true, toStatus: true, createdAt: true },
    }),
  ])

  // Red flags — items needing Minister's immediate attention
  const redFlags: string[] = []
  if (petitionsOverdue > 0)   redFlags.push(`${petitionsOverdue} overdue petition(s) need urgent follow-up`)
  if (tasksOverdue > 0)       redFlags.push(`${tasksOverdue} task(s) are past deadline`)
  if (fundsStuck > 0)         redFlags.push(`${fundsStuck} fund allocation(s) are stuck in bureaucracy`)
  if (lettersOverdue > 0)     redFlags.push(`${lettersOverdue} letter(s) have missed their response deadline`)
  if (criticalBooths.length > 0) redFlags.push(`${criticalBooths.length} booth(s) graded D — require tour/camp visit`)
  if (worksStuck > 0)         redFlags.push(`${worksStuck} public work(s) are stuck/delayed`)

  return NextResponse.json({
    success: true,
    generatedAt: now.toISOString(),
    redFlags,
    petitions: {
      today:         petitionsToday,
      overdue:       petitionsOverdue,
      resolvedToday: petitionsResolvedToday,
      critical:      criticalPetitions,
    },
    tasks: {
      overdue:    tasksOverdue,
      urgentOpen: tasksUrgentOpen,
      dueToday:   tasksDueToday,
    },
    letters: {
      overdue:        lettersOverdue,
      draftsPending:  lettersDraftPending,
    },
    funds: {
      stuck:     fundsStuck,
      stuckList: fundsStuckList,
    },
    visitors: {
      today:   visitorsToday,
      waiting: visitorsWaiting,
    },
    surveys: {
      criticalBooths,
    },
    works: {
      stuck: worksStuck,
    },
    recentActivity: recentTimeline,
  })
}
