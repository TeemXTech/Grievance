import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser, hasRole } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!hasRole(user, 'MINISTER', 'PA', 'ADMIN')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const [
    byType,
    byStatus,
    byPriority,
    byDepartment,
    allPetitions,
    weeklyPetitions,
    resolvedWithTime,
    publicWorksByStage,
    publicWorksByCategory,
  ] = await Promise.all([
    // Petitions by type
    prisma.petitionRequest.groupBy({
      by: ['type'],
      _count: { id: true },
    }),

    // Petitions by status
    prisma.petitionRequest.groupBy({
      by: ['status'],
      _count: { id: true },
    }),

    // Petitions by priority
    prisma.petitionRequest.groupBy({
      by: ['priority'],
      _count: { id: true },
    }),

    // Top departments by petition count
    prisma.petitionRequest.groupBy({
      by: ['assignedDepartment'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 8,
    }),

    // All petitions for daily trend (last 30 days)
    prisma.petitionRequest.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true, status: true, type: true },
      orderBy: { createdAt: 'asc' },
    }),

    // Last 7 days daily count
    prisma.petitionRequest.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true },
    }),

    // Resolved petitions with resolution time
    prisma.petitionRequest.findMany({
      where: {
        status: { in: ['RESOLVED', 'SANCTIONED'] },
        resolvedAt: { not: null },
      },
      select: { createdAt: true, resolvedAt: true, type: true },
      take: 100,
    }),

    // Public works by stage
    prisma.publicWork.groupBy({
      by: ['stage'],
      _count: { id: true },
      _sum: { sanctionedBudget: true, spentBudget: true },
    }),

    // Public works by category
    prisma.publicWork.groupBy({
      by: ['category'],
      _count: { id: true },
      _sum: { sanctionedBudget: true },
    }),
  ])

  // Build daily trend for last 7 days
  const dailyTrend = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000)
    const dayStr = day.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' })
    const count = weeklyPetitions.filter(p => {
      const d = new Date(p.createdAt)
      return d.getDate() === day.getDate() && d.getMonth() === day.getMonth()
    }).length
    return { day: dayStr, count }
  })

  // Average resolution time by type
  const avgResolutionByType: Record<string, number> = {}
  for (const p of resolvedWithTime) {
    if (!p.resolvedAt) continue
    const days = Math.floor((new Date(p.resolvedAt).getTime() - new Date(p.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    if (!avgResolutionByType[p.type]) avgResolutionByType[p.type] = 0
    avgResolutionByType[p.type] = Math.round((avgResolutionByType[p.type] + days) / 2)
  }

  // Overdue rate
  const totalActive = await prisma.petitionRequest.count({
    where: { status: { notIn: ['RESOLVED', 'SANCTIONED', 'CLOSED', 'REJECTED'] } },
  })
  const overdueCount = await prisma.petitionRequest.count({ where: { isOverdue: true } })
  const overdueRate = totalActive > 0 ? Math.round((overdueCount / totalActive) * 100) : 0

  return NextResponse.json({
    success: true,
    charts: {
      byType: byType.map(r => ({ name: r.type.replace(/_/g, ' '), value: r._count.id })),
      byStatus: byStatus.map(r => ({ name: r.status.replace(/_/g, ' '), value: r._count.id })),
      byPriority: byPriority.map(r => ({ name: r.priority, value: r._count.id })),
      byDepartment: byDepartment
        .filter(r => r.assignedDepartment)
        .map(r => ({ name: r.assignedDepartment!.substring(0, 25), value: r._count.id })),
      dailyTrend,
      worksByStage: publicWorksByStage.map(r => ({
        name: r.stage.replace(/_/g, ' '),
        count: r._count.id,
        budget: Math.round((r._sum.sanctionedBudget || 0) / 100000),
        spent: Math.round((r._sum.spentBudget || 0) / 100000),
      })),
      worksByCategory: publicWorksByCategory.map(r => ({
        name: r.category.replace(/_/g, ' '),
        count: r._count.id,
        budget: Math.round((r._sum.sanctionedBudget || 0) / 100000),
      })),
    },
    kpis: {
      totalPetitions: await prisma.petitionRequest.count(),
      resolvedThisMonth: await prisma.petitionRequest.count({
        where: { status: { in: ['RESOLVED', 'SANCTIONED'] }, updatedAt: { gte: thirtyDaysAgo } },
      }),
      overdueCount,
      overdueRate,
      avgResolutionByType,
      totalBudgetLakhs: Math.round(
        (await prisma.publicWork.aggregate({ _sum: { sanctionedBudget: true } }))._sum.sanctionedBudget || 0
      ) / 100000,
    },
  })
}
