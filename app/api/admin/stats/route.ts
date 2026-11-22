import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, hasRole } from '@/lib/auth-middleware'

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  if (!hasRole(user, 'ADMIN', 'MINISTER')) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  try {
    const [
      totalUsers,
      activeUsers,
      usersByRole,
      totalGrievances,
      pendingGrievances,
      resolvedGrievances,
      totalProjects,
      ongoingProjects,
      completedProjects,
      whatsappTotal,
      whatsappProcessed,
      recentActivity,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: 'active' } }),
      prisma.user.groupBy({ by: ['role'], _count: { id: true } }),
      prisma.grievance.count(),
      prisma.grievance.count({ where: { status: { in: ['PENDING', 'ASSIGNED'] } } }),
      prisma.grievance.count({ where: { status: { in: ['RESOLVED', 'CLOSED'] } } }),
      prisma.publicWork.count(),
      prisma.publicWork.count({ where: { stage: 'IN_PROGRESS' } }),
      prisma.publicWork.count({ where: { stage: 'COMPLETED' } }),
      prisma.whatsAppMessage.count(),
      prisma.whatsAppMessage.count({ where: { isProcessed: true } }),
      prisma.auditLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, email: true } } },
      }),
    ])

    const roleMap: Record<string, number> = {}
    usersByRole.forEach((r) => { roleMap[r.role] = r._count.id })

    return NextResponse.json({
      success: true,
      users: { total: totalUsers, active: activeUsers, roles: roleMap },
      grievances: { total: totalGrievances, pending: pendingGrievances, resolved: resolvedGrievances },
      projects: { total: totalProjects, ongoing: ongoingProjects, completed: completedProjects },
      whatsapp: { total: whatsappTotal, processed: whatsappProcessed, pending: whatsappTotal - whatsappProcessed },
      recentActivity,
    })
  } catch (error: any) {
    console.error('Admin stats error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
