import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, hasRole } from '@/lib/auth-middleware'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    if (!hasRole(user, 'MINISTER', 'PA', 'ADMIN')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const now        = new Date()
    const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0)
    const todayEnd   = new Date(now); todayEnd.setHours(23, 59, 59, 999)

    const [
      totalWorks,
      completedWorks,
      inProgressWorks,
      stuckWorks,
      totalPetitions,
      overduePetitions,
      resolvedPetitions,
      allWorks,
      recentWorks,
      recentPetitions,
      leaders,
      mandals,
      // New cross-module KPIs
      tasksOverdue,
      tasksUrgent,
      lettersOverdue,
      fundsStuck,
      visitorsToday,
      visitorsWaiting,
      criticalBooths,
      totalCitizens,
      totalPartyWorkers,
    ] = await Promise.all([
      prisma.publicWork.count(),
      prisma.publicWork.count({ where: { stage: 'COMPLETED' } }),
      prisma.publicWork.count({ where: { stage: 'IN_PROGRESS' } }),
      prisma.publicWork.count({ where: { stage: 'STUCK_DELAYED' } }),
      prisma.petitionRequest.count(),
      prisma.petitionRequest.count({ where: { isOverdue: true } }),
      prisma.petitionRequest.count({ where: { status: { in: ['SANCTIONED', 'RESOLVED'] } } }),
      prisma.publicWork.findMany({
        select: { sanctionedBudget: true, spentBudget: true },
      }),
      prisma.publicWork.findMany({
        include: {
          requestedByLeader: true,
          milestones: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
        orderBy: { createdAt: 'desc' },
        take: 6,
      }),
      prisma.petitionRequest.findMany({
        include: { referredByLeader: true },
        orderBy: { createdAt: 'desc' },
        take: 6,
      }),
      prisma.localLeader.findMany({
        where: { isActive: true },
        include: {
          referredRequests: {
            select: { id: true, title: true, type: true, status: true, applicantName: true },
          },
          referredWorks: {
            select: { id: true, title: true, category: true, stage: true, sanctionedBudget: true, spentBudget: true },
          },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.mandal.findMany({
        include: { villages: true, works: true, petitions: true },
      }),
      // Cross-module
      prisma.task.count({ where: { isOverdue: true, status: { notIn: ['COMPLETED', 'CANCELLED'] } } }),
      prisma.task.count({ where: { priority: 'URGENT', status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
      prisma.letter.count({ where: { dueDate: { lt: now }, status: { notIn: ['FILED', 'CANCELLED', 'ACKNOWLEDGED'] } } }),
      prisma.fundAllocation.count({ where: { isStuck: true } }),
      prisma.visitorLog.count({ where: { appointmentDate: { gte: todayStart, lte: todayEnd } } }),
      prisma.visitorLog.count({ where: { status: 'WAITING' } }),
      prisma.boothGrade.count({ where: { grade: 'D' } }),
      prisma.citizen.count({ where: { isActive: true } }),
      prisma.partyWorker.count({ where: { status: 'ACTIVE' } }),
    ])

    const totalSanctionedBudget = allWorks.reduce((acc, w) => acc + (w.sanctionedBudget || 0), 0)
    const totalSpentBudget      = allWorks.reduce((acc, w) => acc + (w.spentBudget      || 0), 0)

    return NextResponse.json({
      success: true,
      summary: {
        totalProjects:          totalWorks,
        completedProjects:      completedWorks,
        inProgressProjects:     inProgressWorks,
        stuckProjects:          stuckWorks,
        totalGrievances:        totalPetitions,
        overdueGrievances:      overduePetitions,
        resolvedGrievances:     resolvedPetitions,
        totalSanctionedBudget,
        totalSpentBudget,
        totalLeaders:           leaders.length,
        // Cross-module KPIs
        tasksOverdue,
        tasksUrgent,
        lettersOverdue,
        fundsStuck,
        visitorsToday,
        visitorsWaiting,
        criticalBooths,
        totalCitizens,
        totalPartyWorkers,
      },
      recentProjects:   recentWorks,
      recentGrievances: recentPetitions,
      leaders,
      mandals,
    })
  } catch (error: any) {
    console.error('Dashboard API error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
