import { NextRequest, NextResponse } from "next/server"
import { PrismaClient, GrievanceStatus, Priority } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const groupBy = searchParams.get("groupBy") || "district" // district, mandal, village
    const constituency = searchParams.get("constituency")
    const year = searchParams.get("year") || new Date().getFullYear().toString()
    const status = searchParams.get("status") as GrievanceStatus
    const priority = searchParams.get("priority") as Priority

    // Validate groupBy parameter
    const validGroupBy = ["district", "mandal", "village"]
    if (!validGroupBy.includes(groupBy)) {
      return NextResponse.json(
        { error: "Invalid groupBy parameter. Must be one of: district, mandal, village" },
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
    if (status) {
      whereClause.status = status
    }
    if (priority) {
      whereClause.priority = priority
    }

    // Determine grouping fields based on groupBy parameter
    let groupByFields: string[] = []
    switch (groupBy) {
      case "district":
        groupByFields = ["district"]
        break
      case "mandal":
        groupByFields = ["district", "mandal"]
        break
      case "village":
        groupByFields = ["district", "mandal", "village"]
        break
    }

    // Get aggregated data by location
    const aggregatedData = await prisma.grievance.groupBy({
      by: groupByFields,
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

    // Get status breakdown for each group
    const statusBreakdown = await prisma.grievance.groupBy({
      by: [...groupByFields, "status"],
      where: whereClause,
      _count: {
        id: true
      }
    })

    // Get priority breakdown for each group
    const priorityBreakdown = await prisma.grievance.groupBy({
      by: [...groupByFields, "priority"],
      where: whereClause,
      _count: {
        id: true
      }
    })

    // Get category breakdown for each group
    const categoryBreakdown = await prisma.grievance.groupBy({
      by: [...groupByFields, "categoryId"],
      where: whereClause,
      _count: {
        id: true
      }
    })

    // Get category names
    const categoryIds = categoryBreakdown.map(c => c.categoryId).filter(Boolean)
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

    // Format the aggregated data
    const formattedData = aggregatedData.map(item => {
      const key = groupByFields.map(field => item[field as keyof typeof item]).join(" - ")
      
      // Get status breakdown for this group
      const groupStatusBreakdown = statusBreakdown.filter(statusItem => 
        groupByFields.every(field => statusItem[field as keyof typeof statusItem] === item[field as keyof typeof item])
      )

      // Get priority breakdown for this group
      const groupPriorityBreakdown = priorityBreakdown.filter(priorityItem => 
        groupByFields.every(field => priorityItem[field as keyof typeof priorityItem] === item[field as keyof typeof item])
      )

      // Get category breakdown for this group
      const groupCategoryBreakdown = categoryBreakdown.filter(categoryItem => 
        groupByFields.every(field => categoryItem[field as keyof typeof categoryItem] === item[field as keyof typeof item])
      )

      return {
        key,
        location: {
          district: item.district,
          mandal: item.mandal,
          village: item.village
        },
        totalGrievances: item._count.id,
        totalEstimatedCost: item._sum.estimatedCost || 0,
        averageEstimatedCost: item._avg.estimatedCost || 0,
        statusBreakdown: groupStatusBreakdown.reduce((acc, statusItem) => {
          acc[statusItem.status] = statusItem._count.id
          return acc
        }, {} as Record<string, number>),
        priorityBreakdown: groupPriorityBreakdown.reduce((acc, priorityItem) => {
          acc[priorityItem.priority] = priorityItem._count.id
          return acc
        }, {} as Record<string, number>),
        categoryBreakdown: groupCategoryBreakdown.map(categoryItem => {
          const category = categories.find(c => c.id === categoryItem.categoryId)
          return {
            categoryId: categoryItem.categoryId,
            categoryName: category?.name || 'Unknown',
            categoryColor: category?.color,
            count: categoryItem._count.id
          }
        })
      }
    })

    // Get overall summary
    const overallSummary = await prisma.grievance.aggregate({
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

    // Get resolution time statistics
    const resolutionStats = await prisma.grievance.aggregate({
      where: {
        ...whereClause,
        actualResolutionDate: {
          not: null
        }
      },
      _count: {
        id: true
      }
    })

    // Get pending grievances count
    const pendingCount = await prisma.grievance.count({
      where: {
        ...whereClause,
        status: GrievanceStatus.PENDING
      }
    })

    // Get urgent grievances count
    const urgentCount = await prisma.grievance.count({
      where: {
        ...whereClause,
        priority: Priority.URGENT
      }
    })

    const response = {
      groupBy,
      constituency,
      year: parseInt(year),
      filters: {
        status,
        priority
      },
      aggregatedData: formattedData,
      summary: {
        totalGrievances: overallSummary._count.id,
        totalEstimatedCost: overallSummary._sum.estimatedCost || 0,
        averageEstimatedCost: overallSummary._avg.estimatedCost || 0,
        resolvedGrievances: resolutionStats._count.id,
        pendingGrievances: pendingCount,
        urgentGrievances: urgentCount,
        resolutionRate: overallSummary._count.id > 0 ? 
          (resolutionStats._count.id / overallSummary._count.id * 100).toFixed(2) : 0
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching aggregated data:', error)
    return NextResponse.json(
      { error: "Failed to fetch aggregated data" },
      { status: 500 }
    )
  }
}
