import { NextRequest, NextResponse } from "next/server"
import { PrismaClient, GrievanceStatus, Priority } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const constituency = searchParams.get("constituency")
    const district = searchParams.get("district")
    const year = searchParams.get("year") || new Date().getFullYear().toString()
    const month = searchParams.get("month")

    // Build where clause
    const whereClause: any = {
      createdAt: {
        gte: new Date(`${year}-01-01`),
        lte: new Date(`${year}-12-31`),
      }
    }

    if (month) {
      whereClause.createdAt = {
        gte: new Date(`${year}-${month.padStart(2, '0')}-01`),
        lte: new Date(`${year}-${month.padStart(2, '0')}-31`),
      }
    }

    if (constituency) {
      whereClause.district = constituency
    }
    if (district) {
      whereClause.district = district
    }

    // Get overall statistics
    const overallStats = await prisma.grievance.aggregate({
      where: whereClause,
      _count: {
        id: true
      },
      _sum: {
        estimatedCost: true
      },
      _avg: {
        estimatedCost: true
      }
    })

    // Get status-wise counts
    const statusCounts = await prisma.grievance.groupBy({
      by: ['status'],
      where: whereClause,
      _count: {
        status: true
      }
    })

    // Get priority-wise counts
    const priorityCounts = await prisma.grievance.groupBy({
      by: ['priority'],
      where: whereClause,
      _count: {
        priority: true
      }
    })

    // Get category-wise counts
    const categoryCounts = await prisma.grievance.groupBy({
      by: ['categoryId'],
      where: whereClause,
      _count: {
        categoryId: true
      }
    })

    // Get category names
    const categoryIds = categoryCounts.map(c => c.categoryId).filter(Boolean)
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

    // Get district-wise distribution
    const districtDistribution = await prisma.grievance.groupBy({
      by: ['district'],
      where: whereClause,
      _count: {
        id: true
      },
      _sum: {
        estimatedCost: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 10
    })

    // Get recent grievances
    const recentGrievances = await prisma.grievance.findMany({
      where: whereClause,
      include: {
        category: true,
        assignedTo: {
          select: {
            name: true,
            phone: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })

    // Get critical grievances (urgent + high priority)
    const criticalGrievances = await prisma.grievance.count({
      where: {
        ...whereClause,
        OR: [
          { priority: Priority.URGENT },
          { priority: Priority.HIGH }
        ]
      }
    })

    // Get overdue grievances
    const overdueGrievances = await prisma.grievance.count({
      where: {
        ...whereClause,
        expectedResolutionDate: {
          lt: new Date()
        },
        status: {
          not: GrievanceStatus.RESOLVED
        }
      }
    })

    // Get resolution rate
    const resolvedCount = await prisma.grievance.count({
      where: {
        ...whereClause,
        status: GrievanceStatus.RESOLVED
      }
    })

    // Get average resolution time (in days)
    const resolvedGrievances = await prisma.grievance.findMany({
      where: {
        ...whereClause,
        actualResolutionDate: {
          not: null
        }
      },
      select: {
        createdAt: true,
        actualResolutionDate: true
      }
    })

    const averageResolutionTime = resolvedGrievances.length > 0 ? 
      resolvedGrievances.reduce((sum, grievance) => {
        const days = Math.floor(
          (new Date(grievance.actualResolutionDate!).getTime() - new Date(grievance.createdAt).getTime()) / (1000 * 60 * 60 * 24)
        )
        return sum + days
      }, 0) / resolvedGrievances.length : 0

    // Get monthly trend for the year
    const monthlyTrend = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        COUNT(*) as count,
        SUM("estimatedCost") as total_cost,
        COUNT(CASE WHEN "status" = 'RESOLVED' THEN 1 END) as resolved_count
      FROM "Grievance" 
      WHERE "createdAt" >= ${new Date(`${year}-01-01`)}
        AND "createdAt" <= ${new Date(`${year}-12-31`)}
        ${constituency ? `AND "district" = ${constituency}` : ''}
        ${district ? `AND "district" = ${district}` : ''}
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month ASC
    `

    // Get officer workload
    const officerWorkload = await prisma.grievance.groupBy({
      by: ['assignedToId'],
      where: whereClause,
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 5
    })

    // Get officer details
    const officerIds = officerWorkload.map(o => o.assignedToId).filter(Boolean)
    const officers = await prisma.user.findMany({
      where: {
        id: {
          in: officerIds as string[]
        }
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true
      }
    })

    // Format status counts
    const formattedStatusCounts = statusCounts.reduce((acc, item) => {
      acc[item.status] = item._count.status
      return acc
    }, {} as Record<string, number>)

    // Format priority counts
    const formattedPriorityCounts = priorityCounts.reduce((acc, item) => {
      acc[item.priority] = item._count.priority
      return acc
    }, {} as Record<string, number>)

    // Format category counts
    const formattedCategoryCounts = categoryCounts.map(item => {
      const category = categories.find(c => c.id === item.categoryId)
      return {
        categoryId: item.categoryId,
        categoryName: category?.name || 'Unknown',
        categoryColor: category?.color,
        count: item._count.categoryId
      }
    })

    // Format district distribution
    const formattedDistrictDistribution = districtDistribution.map(item => ({
      district: item.district,
      grievanceCount: item._count.id,
      totalCost: item._sum.estimatedCost || 0
    }))

    // Format officer workload
    const formattedOfficerWorkload = officerWorkload.map(workload => {
      const officer = officers.find(o => o.id === workload.assignedToId)
      return {
        officerId: workload.assignedToId,
        officerName: officer?.name || 'Unassigned',
        officerPhone: officer?.phone,
        officerEmail: officer?.email,
        officerRole: officer?.role,
        grievanceCount: workload._count.id
      }
    })

    const dashboard = {
      period: {
        year: parseInt(year),
        month: month ? parseInt(month) : null,
        constituency,
        district
      },
      kpis: {
        totalGrievances: overallStats._count.id,
        totalEstimatedCost: overallStats._sum.estimatedCost || 0,
        averageEstimatedCost: overallStats._avg.estimatedCost || 0,
        criticalGrievances,
        overdueGrievances,
        resolvedGrievances: resolvedCount,
        resolutionRate: overallStats._count.id > 0 ? 
          (resolvedCount / overallStats._count.id * 100).toFixed(2) : 0,
        averageResolutionTime: averageResolutionTime.toFixed(1)
      },
      distributions: {
        status: formattedStatusCounts,
        priority: formattedPriorityCounts,
        category: formattedCategoryCounts,
        district: formattedDistrictDistribution
      },
      trends: {
        monthly: monthlyTrend
      },
      recentActivity: {
        recentGrievances: recentGrievances.map(grievance => ({
          id: grievance.id,
          referenceNumber: grievance.referenceNumber,
          title: grievance.title,
          status: grievance.status,
          priority: grievance.priority,
          category: grievance.category?.name,
          assignedTo: grievance.assignedTo?.name,
          assignedToPhone: grievance.assignedTo?.phone,
          createdAt: grievance.createdAt
        }))
      },
      officerWorkload: formattedOfficerWorkload
    }

    return NextResponse.json(dashboard)
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error)
    return NextResponse.json(
      { error: "Failed to fetch dashboard analytics" },
      { status: 500 }
    )
  }
}
