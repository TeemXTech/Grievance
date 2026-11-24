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
    total, drafts, pendingApproval, dispatched, acknowledged, filed, cancelled,
    overdueResponse,   // letters past expectedReplyBy with no acknowledgement
    pendingEndorsement, // inbound letters with no endorsementText yet
    withFileNumber,    // letters that have a physical file number
    recentlyMoved,     // letters where currentlyWithName was updated in last 7 days
    awaitingAck,       // dispatched but not yet acknowledged
  ] = await Promise.all([
    prisma.letter.count(),
    prisma.letter.count({ where: { status: "DRAFT" } }),
    prisma.letter.count({ where: { status: "PENDING_APPROVAL" } }),
    prisma.letter.count({ where: { status: "DISPATCHED" } }),
    prisma.letter.count({ where: { status: "ACKNOWLEDGED" } }),
    prisma.letter.count({ where: { status: "FILED" } }),
    prisma.letter.count({ where: { status: "CANCELLED" } }),

    // Overdue: expectedReplyBy is past and not yet acknowledged/filed
    prisma.letter.count({
      where: {
        expectedReplyBy: { lt: now },
        status: { notIn: ["ACKNOWLEDGED", "FILED", "CANCELLED"] },
      },
    }),

    // Inbound letters that arrived but have no endorsement yet
    prisma.letter.count({
      where: {
        direction: "INBOUND",
        endorsementText: null,
        status: { notIn: ["FILED", "CANCELLED"] },
      },
    }),

    prisma.letter.count({ where: { fileNumber: { not: null } } }),

    // Letters moved to a new desk in last 7 days
    prisma.letter.count({
      where: {
        currentlyWithName: { not: null },
        updatedAt: { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),

    // Dispatched but recipient hasn't acknowledged
    prisma.letter.count({
      where: {
        status: "DISPATCHED",
        recipientAcknowledgedBy: null,
      },
    }),
  ])

  // Letters currently sitting with each department
  const byDept = await prisma.letter.groupBy({
    by: ["currentlyWithDept"],
    where: { currentlyWithDept: { not: null }, status: { notIn: ["FILED", "CANCELLED"] } },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 10,
  })

  // Overdue letters detail (for red-flag panel)
  const overdueList = await prisma.letter.findMany({
    where: {
      expectedReplyBy: { lt: now },
      status: { notIn: ["ACKNOWLEDGED", "FILED", "CANCELLED"] },
    },
    select: {
      id: true, letterNumber: true, subject: true,
      toName: true, toDepartment: true,
      expectedReplyBy: true, currentlyWithName: true, currentlyWithDept: true,
    },
    orderBy: { expectedReplyBy: "asc" },
    take: 10,
  })

  return NextResponse.json({
    success: true,
    stats: {
      total, drafts, pendingApproval, dispatched, acknowledged, filed, cancelled,
      overdueResponse, pendingEndorsement, withFileNumber, recentlyMoved, awaitingAck,
    },
    byDepartment: byDept.map(d => ({ dept: d.currentlyWithDept, count: d._count.id })),
    overdueList,
  })
}
