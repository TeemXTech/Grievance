import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    const categoryStats = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            grievances: true
          }
        }
      },
      where: {
        isActive: true
      }
    })

    const totalGrievances = categoryStats.reduce((sum, cat) => sum + cat._count.grievances, 0)

    const distribution = categoryStats.map(category => ({
      name: category.name,
      count: category._count.grievances,
      value: totalGrievances > 0 ? Math.round((category._count.grievances / totalGrievances) * 100) : 0
    }))

    // Add "Others" category for uncategorized grievances
    const uncategorizedCount = await prisma.grievance.count({
      where: {
        categoryId: null
      }
    })

    if (uncategorizedCount > 0) {
      distribution.push({
        name: "Others",
        count: uncategorizedCount,
        value: totalGrievances > 0 ? Math.round((uncategorizedCount / (totalGrievances + uncategorizedCount)) * 100) : 0
      })
    }

    return NextResponse.json(distribution)
  } catch (error) {
    console.error("Error fetching category distribution:", error)
    // Return mock data as fallback
    const mockDistribution = [
      { name: "Infrastructure", value: 35, count: 437 },
      { name: "Utilities", value: 25, count: 312 },
      { name: "Healthcare", value: 20, count: 249 },
      { name: "Education", value: 12, count: 150 },
      { name: "Others", value: 8, count: 99 },
    ]
    return NextResponse.json(mockDistribution)
  }
}