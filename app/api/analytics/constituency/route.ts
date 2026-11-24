import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, hasRole } from "@/lib/auth-middleware"
import { GrievanceStatus } from "@prisma/client"

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!hasRole(user, "MINISTER", "PA", "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const constituency = searchParams.get("constituency")
    const district = searchParams.get("district")
    const mandal = searchParams.get("mandal")
    const year = searchParams.get("year") || new Date().getFullYear().toString()

    if (!constituency && !district) {
      return NextResponse.json({ error: "constituency or district is required" }, { status: 400 })
    }

    const whereClause: any = {
      createdAt: { gte: new Date(`${year}-01-01`), lte: new Date(`${year}-12-31`) },
    }
    if (constituency || district) whereClause.district = constituency || district
    if (mandal) whereClause.mandal = mandal

    const [statusCounts, fundSpending, topVillagesPending, priorityDistribution, monthlyTrend] =
      await Promise.all([
        prisma.grievance.groupBy({ by: ["status"], where: whereClause, _count: { status: true } }),
        prisma.grievance.groupBy({
          by: ["district", "mandal", "village"],
          where: { ...whereClause, estimatedCost: { not: null } },
          _sum: { estimatedCost: true },
          _count: { id: true },
        }),
        prisma.grievance.groupBy({
          by: ["village", "mandal", "district"],
          where: { ...whereClause, status: GrievanceStatus.PENDING },
          _count: { id: true },
          orderBy: { _count: { id: "desc" } },
          take: 10,
        }),
        prisma.grievance.groupBy({ by: ["priority"], where: whereClause, _count: { priority: true } }),
        prisma.$queryRaw<{ month: Date; count: bigint }[]>`
          SELECT DATE_TRUNC('month', "createdAt") as month, COUNT(*) as count
          FROM "Grievance"
          WHERE "district" = ${constituency || district}
            AND "createdAt" >= ${new Date(`${year}-01-01`)}
            AND "createdAt" <= ${new Date(`${year}-12-31`)}
          GROUP BY DATE_TRUNC('month', "createdAt")
          ORDER BY month ASC
        `,
      ])

    const formattedStatusCounts = statusCounts.reduce((acc, item) => {
      acc[item.status] = item._count.status
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      constituency: constituency || district,
      year: parseInt(year),
      totalGrievances: Object.values(formattedStatusCounts).reduce((a, b) => a + b, 0),
      statusDistribution: formattedStatusCounts,
      priorityDistribution: priorityDistribution.reduce((acc, item) => {
        acc[item.priority] = item._count.priority
        return acc
      }, {} as Record<string, number>),
      fundSpending: fundSpending.map((item) => ({
        district: item.district,
        mandal: item.mandal,
        village: item.village,
        totalCost: item._sum.estimatedCost,
        grievanceCount: item._count.id,
      })),
      topVillagesPending: topVillagesPending.map((item) => ({
        village: item.village,
        mandal: item.mandal,
        district: item.district,
        pendingCount: item._count.id,
      })),
      monthlyTrend: (monthlyTrend as any[]).map((r) => ({
        month: r.month,
        count: Number(r.count),
      })),
      totalFundSpent: fundSpending.reduce((sum, item) => sum + (item._sum.estimatedCost || 0), 0),
      pendingGrievances: formattedStatusCounts[GrievanceStatus.PENDING] || 0,
      resolvedGrievances: formattedStatusCounts[GrievanceStatus.RESOLVED] || 0,
      inProgressGrievances: formattedStatusCounts[GrievanceStatus.IN_PROGRESS] || 0,
    })
  } catch (error: any) {
    console.error("Constituency analytics error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
