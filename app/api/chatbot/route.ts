import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { processQuery, type ChatbotContext } from '@/lib/chatbot'

type GrievanceStats = {
  status: string;
  count: number;
}

type DistrictStats = {
  district: string;
  status: string;
  count: number;
  avg_resolution_days: number | null;
}

type CategoryStats = {
  categoryId: string;
  count: number;
  avg_cost: number | null;
}

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    // Get statistics from the database
    const [
      totalGrievances,
      districtStats,
      categoryStats
    ] = await Promise.all([
      // Get overall statistics
      prisma.$queryRaw`
        SELECT status, COUNT(*) as count
        FROM "Grievance"
        GROUP BY status
      ` as Promise<GrievanceStats[]>,

      // Get district-wise statistics
      prisma.$queryRaw`
        SELECT 
          district,
          status,
          COUNT(*) as count,
          AVG(
            CASE 
              WHEN "actualResolutionDate" IS NOT NULL 
              THEN EXTRACT(EPOCH FROM ("actualResolutionDate" - "createdAt"))/86400
              ELSE NULL 
            END
          ) as avg_resolution_days
        FROM "Grievance"
        WHERE district IS NOT NULL
        GROUP BY district, status
      ` as Promise<DistrictStats[]>,

      // Get category-wise statistics
      prisma.$queryRaw`
        SELECT 
          c.id as "categoryId",
          COUNT(*) as count,
          AVG(g."estimatedCost") as avg_cost
        FROM "Grievance" g
        JOIN "Category" c ON c.id = g."categoryId"
        WHERE c."isActive" = true
        GROUP BY c.id
      ` as Promise<CategoryStats[]>
    ])

    // Process statistics into chatbot context
    const context: ChatbotContext = {
      grievanceStats: {
        totalGrievances: totalGrievances.reduce((acc: number, curr: GrievanceStats) => acc + curr.count, 0),
        pendingCount: totalGrievances.find((g: GrievanceStats) => g.status === 'PENDING')?.count || 0,
        resolvedCount: totalGrievances.find((g: GrievanceStats) => g.status === 'RESOLVED')?.count || 0,
        inProgressCount: totalGrievances.find((g: GrievanceStats) => g.status === 'IN_PROGRESS')?.count || 0
      },
      districtStats: {},
      categoryStats: {}
    }

    // Process district statistics
    const districts = [...new Set(districtStats.map((stat: DistrictStats) => stat.district))]
    districts.forEach((district: string) => {
      const stats = districtStats.filter((stat: DistrictStats) => stat.district === district)
      context.districtStats[district] = {
        totalGrievances: stats.reduce((acc: number, curr: DistrictStats) => acc + curr.count, 0),
        pendingCount: stats.find((s: DistrictStats) => s.status === 'PENDING')?.count || 0,
        resolvedCount: stats.find((s: DistrictStats) => s.status === 'RESOLVED')?.count || 0,
        inProgressCount: stats.find((s: DistrictStats) => s.status === 'IN_PROGRESS')?.count || 0,
        averageResolutionTime: Math.round(
          stats.reduce((acc: number, curr: DistrictStats) => acc + (curr.avg_resolution_days || 0), 0) / stats.length
        )
      }
    })

    // Get category names
    const categories = await prisma.category.findMany({
      where: {
        id: {
          in: [...new Set(categoryStats.map((stat: CategoryStats) => stat.categoryId))]
        }
      },
      select: {
        id: true,
        name: true
      }
    })

    // Process category statistics
    categories.forEach((category: { id: string, name: string }) => {
      const stats = categoryStats.find((stat: CategoryStats) => stat.categoryId === category.id)
      if (stats) {
        context.categoryStats[category.name] = {
          totalGrievances: stats.count,
          resolvedCount: stats.count, // You might want to get this from a separate query
          averageCost: Math.round(stats.avg_cost || 0)
        }
      }
    })

    // Process the query using the chatbot engine
    const response = await processQuery(message, context)

    return NextResponse.json({ response })
  } catch (error) {
    console.error('Chatbot error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
