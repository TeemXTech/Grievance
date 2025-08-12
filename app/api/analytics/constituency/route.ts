import { NextRequest, NextResponse } from "next/server"
import { PrismaClient, GrievanceStatus } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const constituency = searchParams.get("constituency")
    const district = searchParams.get("district")
    const mandal = searchParams.get("mandal")
    const year = searchParams.get("year") || new Date().getFullYear().toString()

    if (!constituency && !district) {
      return NextResponse.json(
        { error: "Constituency or district parameter is required" },
        { status: 400 }
      )
    }

    // Build where clause
    const whereClause: any = {
      createdAt: {
        gte: new Date(`${year}-01-01`),
        lte: new Date(`${year}-12-31`),
      }
    }

    if (constituency) {
      whereClause.district = constituency
    }
    if (district) {
      whereClause.district = district
    }
    if (mandal) {
      whereClause.mandal = mandal
    }

    // Get status-wise counts
    const statusCounts = await prisma.grievance.groupBy({
      by: ['status'],
      where: whereClause,
      _count: {
        status: true
      }
    })

    // Get fund spending by district/mandal/village
    const fundSpending = await prisma.grievance.groupBy({
      by: ['district', 'mandal', 'village'],
      where: {
        ...whereClause,
        estimatedCost: {
          not: null
        }
      },
      _sum: {
        estimatedCost: true
      },
      _count: {
        id: true
      },
      orderBy: [
        { district: 'asc' },
        { mandal: 'asc' },
        { village: 'asc' }
      ]
    })

    // Get top villages by pending grievances
    const topVillagesPending = await prisma.grievance.groupBy({
      by: ['village', 'mandal', 'district'],
      where: {
        ...whereClause,
        status: GrievanceStatus.PENDING
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 10
    })

    // Get priority-wise distribution
    const priorityDistribution = await prisma.grievance.groupBy({
      by: ['priority'],
      where: whereClause,
      _count: {
        priority: true
      }
    })

    // Get category-wise distribution
    const categoryDistribution = await prisma.grievance.groupBy({
      by: ['categoryId'],
      where: whereClause,
      _count: {
        categoryId: true
      }
    })

    // Get category names for the distribution
    const categoryIds = categoryDistribution.map(c => c.categoryId).filter(Boolean)
    const categories = await prisma.category.findMany({
      where: {
        id: {
          in: categoryIds as string[]
        }
      },
      select: {
        id: true,
        name: true,
        color: true
      }
    })

    // Get monthly trend
    const monthlyTrend = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        COUNT(*) as count,
        SUM("estimatedCost") as total_cost
      FROM "Grievance" 
      WHERE "district" = ${constituency || district}
        AND "createdAt" >= ${new Date(`${year}-01-01`)}
        AND "createdAt" <= ${new Date(`${year}-12-31`)}
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month ASC
    `

    // Get resolution time statistics
    const resolutionStats = await prisma.grievance.aggregate({
      where: {
        ...whereClause,
        actualResolutionDate: {
          not: null
        }
      },
      _avg: {
        // Calculate days between creation and resolution
      }
    })

    // Format status counts
    const formattedStatusCounts = statusCounts.reduce((acc, item) => {
      acc[item.status] = item._count.status
      return acc
    }, {} as Record<string, number>)

    // Format priority distribution
    const formattedPriorityDistribution = priorityDistribution.reduce((acc, item) => {
      acc[item.priority] = item._count.priority
      return acc
    }, {} as Record<string, number>)

    // Format category distribution with names
    const formattedCategoryDistribution = categoryDistribution.map(item => {
      const category = categories.find(c => c.id === item.categoryId)
      return {
        categoryId: item.categoryId,
        categoryName: category?.name || 'Unknown',
        categoryColor: category?.color,
        count: item._count.categoryId
      }
    })

    // Format fund spending
    const formattedFundSpending = fundSpending.map(item => ({
      district: item.district,
      mandal: item.mandal,
      village: item.village,
      totalCost: item._sum.estimatedCost,
      grievanceCount: item._count.id
    }))

    // Format top villages
    const formattedTopVillages = topVillagesPending.map(item => ({
      village: item.village,
      mandal: item.mandal,
      district: item.district,
      pendingCount: item._count.id
    }))

    const summary = {
      constituency: constituency || district,
      year: parseInt(year),
      totalGrievances: Object.values(formattedStatusCounts).reduce((a, b) => a + b, 0),
      statusDistribution: formattedStatusCounts,
      priorityDistribution: formattedPriorityDistribution,
      categoryDistribution: formattedCategoryDistribution,
      fundSpending: formattedFundSpending,
      topVillagesPending: formattedTopVillages,
      monthlyTrend,
      totalFundSpent: fundSpending.reduce((sum, item) => sum + (item._sum.estimatedCost || 0), 0),
      averageResolutionTime: resolutionStats._avg.actualResolutionDate, // This would need custom calculation
      pendingGrievances: formattedStatusCounts[GrievanceStatus.PENDING] || 0,
      resolvedGrievances: formattedStatusCounts[GrievanceStatus.RESOLVED] || 0,
      inProgressGrievances: formattedStatusCounts[GrievanceStatus.IN_PROGRESS] || 0,
    }

    return NextResponse.json(summary)
  } catch (error) {
    console.error('Error fetching constituency analytics:', error)
    return NextResponse.json(
      { error: "Failed to fetch constituency analytics" },
      { status: 500 }
    )
  }
}
