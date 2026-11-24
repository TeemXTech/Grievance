import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, hasRole } from "@/lib/auth-middleware"

const READ_ROLES = ["MINISTER", "PA", "ADMIN"]

export async function GET(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!hasRole(user, ...READ_ROLES))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const now        = new Date()
  const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0)
  const weekAgo    = new Date(now); weekAgo.setDate(now.getDate() - 7)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const [
    total, pending, overdue, resolved, sanctioned, rejected,
    todayNew, weekNew, monthNew,
    byType, byStatus, byPriority, byDepartment,
    cmrfPending, transferPending, jobPending,
    resolvedSample,
    recentOverdue,
  ] = await Promise.all([
    prisma.petitionRequest.count(),
    prisma.petitionRequest.count({ where: { status: { in: ["PENDING", "SUBMITTED_TO_PA", "ASSIGNED_TO_OFFICIAL", "UNDER_REVIEW"] } } }),
    prisma.petitionRequest.count({ where: { isOverdue: true, status: { notIn: ["RESOLVED", "SANCTIONED", "CLOSED", "REJECTED"] } } }),
    prisma.petitionRequest.count({ where: { status: "RESOLVED" } }),
    prisma.petitionRequest.count({ where: { status: "SANCTIONED" } }),
    prisma.petitionRequest.count({ where: { status: "REJECTED" } }),
    prisma.petitionRequest.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.petitionRequest.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.petitionRequest.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.petitionRequest.groupBy({ by: ["type"],               _count: { id: true } }),
    prisma.petitionRequest.groupBy({ by: ["status"],             _count: { id: true } }),
    prisma.petitionRequest.groupBy({ by: ["priority"],           _count: { id: true } }),
    prisma.petitionRequest.groupBy({ by: ["assignedDepartment"], _count: { id: true }, where: { assignedDepartment: { not: null } }, orderBy: { _count: { id: "desc" } }, take: 10 }),
    prisma.petitionRequest.count({ where: { type: "CMRF_MEDICAL",     status: { notIn: ["RESOLVED", "SANCTIONED", "CLOSED", "REJECTED"] } } }),
    prisma.petitionRequest.count({ where: { type: "EMPLOYEE_TRANSFER", status: { notIn: ["RESOLVED", "SANCTIONED", "CLOSED", "REJECTED"] } } }),
    prisma.petitionRequest.count({ where: { type: "JOB_EMPLOYMENT",   status: { notIn: ["RESOLVED", "SANCTIONED", "CLOSED", "REJECTED"] } } }),
    // Average actual days to resolve (createdAt → resolvedAt)
    prisma.petitionRequest.findMany({
      where: { status: { in: ["RESOLVED", "SANCTIONED"] }, resolvedAt: { not: null } },
      select: { createdAt: true, resolvedAt: true },
      take: 500,
    }),
    // Top 5 most overdue
    prisma.petitionRequest.findMany({
      where: { isOverdue: true, status: { notIn: ["RESOLVED", "SANCTIONED", "CLOSED"] } },
      orderBy: { dueDate: "asc" },
      take: 5,
      select: { id: true, trackingNumber: true, type: true, title: true, applicantName: true, dueDate: true, priority: true, mandalName: true },
    }),
  ])

  const resolutionRate = total > 0 ? +((resolved + sanctioned) / total * 100).toFixed(1) : 0

  // Compute average actual days from creation to resolution
  const avgActualDays = resolvedSample.length > 0
    ? +(resolvedSample.reduce((sum, p) => {
        return sum + Math.floor((new Date(p.resolvedAt!).getTime() - new Date(p.createdAt).getTime()) / 86400000)
      }, 0) / resolvedSample.length).toFixed(1)
    : 0

  return NextResponse.json({
    success: true,
    totals: { total, pending, overdue, resolved, sanctioned, rejected },
    intake: { todayNew, weekNew, monthNew },
    urgent: { cmrfPending, transferPending, jobPending },
    resolutionRate,
    avgActualDaysToResolve: avgActualDays,
    byType:       byType.map(r => ({ name: r.type,               count: r._count.id })),
    byStatus:     byStatus.map(r => ({ name: r.status,           count: r._count.id })),
    byPriority:   byPriority.map(r => ({ name: r.priority,       count: r._count.id })),
    byDepartment: byDepartment.map(r => ({ name: r.assignedDepartment!, count: r._count.id })),
    recentOverdue,
  })
}
