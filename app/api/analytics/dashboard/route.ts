import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, hasRole } from "@/lib/auth-middleware"
import { GrievanceStatus, Priority } from "@prisma/client"

export async function GET(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!hasRole(user, "MINISTER", "PA", "ADMIN", "BACK_OFFICER"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const district = searchParams.get("district") || ""
  const year     = searchParams.get("year")     || new Date().getFullYear().toString()
  const month    = searchParams.get("month")    || ""

  // Build date range — fully parameterized, no string interpolation
  let dateGte: Date
  let dateLte: Date
  if (month) {
    const m = month.padStart(2, "0")
    dateGte = new Date(`${year}-${m}-01T00:00:00.000Z`)
    // Last day of month
    dateLte = new Date(new Date(`${year}-${m}-01T00:00:00.000Z`).setMonth(parseInt(m), 0))
    dateLte.setHours(23, 59, 59, 999)
  } else {
    dateGte = new Date(`${year}-01-01T00:00:00.000Z`)
    dateLte = new Date(`${year}-12-31T23:59:59.999Z`)
  }

  const whereClause: any = { createdAt: { gte: dateGte, lte: dateLte } }
  if (district) whereClause.district = district

  const [
    overallStats, statusCounts, priorityCounts, categoryCounts,
    districtDistribution, recentGrievances, criticalGrievances,
    overdueGrievances, resolvedCount, resolvedWithDates, officerWorkload,
  ] = await Promise.all([
    prisma.grievance.aggregate({
      where: whereClause,
      _count: { id: true },
      _sum:   { estimatedCost: true },
      _avg:   { estimatedCost: true },
    }),
    prisma.grievance.groupBy({ by: ["status"],   where: whereClause, _count: { status: true } }),
    prisma.grievance.groupBy({ by: ["priority"], where: whereClause, _count: { priority: true } }),
    prisma.grievance.groupBy({ by: ["categoryId"], where: whereClause, _count: { categoryId: true } }),
    prisma.grievance.groupBy({
      by: ["district"], where: whereClause,
      _count: { id: true }, _sum: { estimatedCost: true },
      orderBy: { _count: { id: "desc" } }, take: 10,
    }),
    prisma.grievance.findMany({
      where: whereClause,
      include: { category: true, assignedTo: { select: { name: true, phone: true } } },
      orderBy: { createdAt: "desc" }, take: 10,
    }),
    prisma.grievance.count({ where: { ...whereClause, priority: { in: [Priority.URGENT, Priority.HIGH] } } }),
    prisma.grievance.count({ where: { ...whereClause, expectedResolutionDate: { lt: new Date() }, status: { not: GrievanceStatus.RESOLVED } } }),
    prisma.grievance.count({ where: { ...whereClause, status: GrievanceStatus.RESOLVED } }),
    prisma.grievance.findMany({ where: { ...whereClause, actualResolutionDate: { not: null } }, select: { createdAt: true, actualResolutionDate: true } }),
    prisma.grievance.groupBy({ by: ["assignedToId"], where: whereClause, _count: { id: true }, orderBy: { _count: { id: "desc" } }, take: 5 }),
  ])

  // Monthly trend — fully parameterized via Prisma $queryRaw tagged template (safe)
  const monthlyTrend = await prisma.$queryRaw<any[]>`
    SELECT
      DATE_TRUNC('month', "createdAt") AS month,
      COUNT(*)::int                    AS count,
      COALESCE(SUM("estimatedCost"), 0)::float AS total_cost,
      COUNT(CASE WHEN status = 'RESOLVED' THEN 1 END)::int AS resolved_count
    FROM "Grievance"
    WHERE "createdAt" >= ${dateGte} AND "createdAt" <= ${dateLte}
    GROUP BY DATE_TRUNC('month', "createdAt")
    ORDER BY month ASC
  `

  // Enrich category counts
  const categoryIds = categoryCounts.map(c => c.categoryId).filter(Boolean) as string[]
  const categories  = await prisma.category.findMany({ where: { id: { in: categoryIds } }, select: { id: true, name: true, color: true } })

  // Enrich officer workload
  const officerIds = officerWorkload.map(o => o.assignedToId).filter(Boolean) as string[]
  const officers   = await prisma.user.findMany({ where: { id: { in: officerIds } }, select: { id: true, name: true, phone: true, email: true, role: true } })

  const avgResolutionDays = resolvedWithDates.length > 0
    ? resolvedWithDates.reduce((sum, g) => sum + Math.floor((new Date(g.actualResolutionDate!).getTime() - new Date(g.createdAt).getTime()) / 86400000), 0) / resolvedWithDates.length
    : 0

  return NextResponse.json({
    success: true,
    period: { year: parseInt(year), month: month ? parseInt(month) : null, district },
    kpis: {
      totalGrievances:      overallStats._count.id,
      totalEstimatedCost:   overallStats._sum.estimatedCost  || 0,
      averageEstimatedCost: overallStats._avg.estimatedCost  || 0,
      criticalGrievances,
      overdueGrievances,
      resolvedGrievances:   resolvedCount,
      resolutionRate:       overallStats._count.id > 0 ? +((resolvedCount / overallStats._count.id) * 100).toFixed(2) : 0,
      averageResolutionDays: +avgResolutionDays.toFixed(1),
    },
    distributions: {
      status:   statusCounts.reduce((a, i) => ({ ...a, [i.status]: i._count.status }), {} as Record<string, number>),
      priority: priorityCounts.reduce((a, i) => ({ ...a, [i.priority]: i._count.priority }), {} as Record<string, number>),
      category: categoryCounts.map(i => ({ categoryId: i.categoryId, categoryName: categories.find(c => c.id === i.categoryId)?.name || "Unknown", count: i._count.categoryId })),
      district: districtDistribution.map(i => ({ district: i.district, count: i._count.id, totalCost: i._sum.estimatedCost || 0 })),
    },
    trends: { monthly: monthlyTrend },
    recentGrievances: recentGrievances.map(g => ({ id: g.id, referenceNumber: g.referenceNumber, title: g.title, status: g.status, priority: g.priority, category: g.category?.name, assignedTo: g.assignedTo?.name, createdAt: g.createdAt })),
    officerWorkload: officerWorkload.map(w => { const o = officers.find(x => x.id === w.assignedToId); return { officerId: w.assignedToId, officerName: o?.name || "Unassigned", count: w._count.id } }),
  })
}
