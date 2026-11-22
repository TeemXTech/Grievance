import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, hasRole } from '@/lib/auth-middleware'
import { buildTeluguBriefing } from '@/lib/translations'

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!hasRole(user, 'MINISTER', 'PA', 'ADMIN')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)
  const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000)

  const [
    todayEvents,
    overduePetitions,
    newPetitions,
    pendingApproval,
    stuckWorks,
    recentTimeline,
  ] = await Promise.all([
    // Today's tour/events
    prisma.tourAppointment.findMany({
      where: {
        startDate: { gte: todayStart, lt: todayEnd },
        status: { not: 'CANCELLED' },
      },
      orderBy: { startDate: 'asc' },
    }),

    // Overdue petitions with citizen names
    prisma.petitionRequest.findMany({
      where: {
        isOverdue: true,
        status: { notIn: ['RESOLVED', 'SANCTIONED', 'CLOSED', 'REJECTED'] },
      },
      select: {
        id: true,
        applicantName: true,
        type: true,
        daysAllowed: true,
        createdAt: true,
        assignedDepartment: true,
      },
      orderBy: { createdAt: 'asc' },
      take: 10,
    }),

    // New petitions since yesterday
    prisma.petitionRequest.count({
      where: { createdAt: { gte: yesterdayStart } },
    }),

    // Petitions waiting for minister approval (UNDER_REVIEW)
    prisma.petitionRequest.count({
      where: { status: 'UNDER_REVIEW' },
    }),

    // Stuck public works
    prisma.publicWork.count({
      where: { stage: 'STUCK_DELAYED' },
    }),

    // Last 5 timeline actions for context
    prisma.requestTimeline.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        petition: { select: { applicantName: true, type: true } },
      },
    }),
  ])

  // Compute days overdue for each petition
  const overdueItems = overduePetitions.map(p => ({
    id: p.id,
    name: p.applicantName,
    type: p.type.replace(/_/g, ' '),
    days: Math.floor((now.getTime() - new Date(p.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
    department: p.assignedDepartment || 'Unassigned',
  }))

  const todayEventsSummary = todayEvents.map(e => ({
    title: e.title,
    location: e.location,
    time: new Date(e.startDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    type: e.eventType,
  }))

  const briefingText = buildTeluguBriefing({
    ministerName: user.name,
    todayEvents: todayEventsSummary,
    overdueCount: overduePetitions.length,
    overdueItems,
    newPetitions,
    pendingApproval,
    stuckWorks,
  })

  return NextResponse.json({
    success: true,
    briefing: {
      text: briefingText,
      data: {
        todayEvents: todayEventsSummary,
        overdueCount: overduePetitions.length,
        overdueItems,
        newPetitions,
        pendingApproval,
        stuckWorks,
        recentActions: recentTimeline.map(t => ({
          action: t.actionTaken,
          petition: t.petition?.applicantName,
          by: t.performedByName,
          when: t.createdAt,
        })),
      },
    },
    generatedAt: now.toISOString(),
  })
}
