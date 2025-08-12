import { NextRequest, NextResponse } from "next/server"
import { PrismaClient, Priority, GrievanceStatus } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const district = searchParams.get("district")
    const mandal = searchParams.get("mandal")
    const priority = searchParams.get("priority") as Priority
    const status = searchParams.get("status") as GrievanceStatus
    const limit = parseInt(searchParams.get("limit") || "50")
    const page = parseInt(searchParams.get("page") || "1")

    // Build where clause for critical grievances
    const whereClause: any = {
      OR: [
        { priority: Priority.URGENT },
        { priority: Priority.HIGH },
        { status: GrievanceStatus.PENDING },
        { status: GrievanceStatus.ASSIGNED }
      ]
    }

    if (district) {
      whereClause.district = district
    }
    if (mandal) {
      whereClause.mandal = mandal
    }
    if (priority) {
      whereClause.priority = priority
    }
    if (status) {
      whereClause.status = status
    }

    // Get critical grievances with officer details
    const criticalGrievances = await prisma.grievance.findMany({
      where: whereClause,
      include: {
        category: true,
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true
          }
        },
        statusUpdates: {
          include: {
            user: {
              select: {
                name: true,
                phone: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 3
        },
        attachments: {
          select: {
            id: true,
            fileName: true,
            mimeType: true,
            createdAt: true
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' }
      ],
      skip: (page - 1) * limit,
      take: limit
    })

    // Get total count for pagination
    const totalCount = await prisma.grievance.count({
      where: whereClause
    })

    // Calculate days since creation for each grievance
    const grievancesWithAge = criticalGrievances.map(grievance => {
      const daysSinceCreation = Math.floor(
        (new Date().getTime() - new Date(grievance.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      )
      
      const isOverdue = grievance.expectedResolutionDate && 
        new Date() > new Date(grievance.expectedResolutionDate)

      return {
        ...grievance,
        daysSinceCreation,
        isOverdue,
        overdueDays: isOverdue ? Math.floor(
          (new Date().getTime() - new Date(grievance.expectedResolutionDate!).getTime()) / (1000 * 60 * 60 * 24)
        ) : 0
      }
    })

    // Get summary statistics
    const summaryStats = await prisma.grievance.aggregate({
      where: whereClause,
      _count: {
        id: true
      },
      _avg: {
        estimatedCost: true
      }
    })

    // Get priority breakdown
    const priorityBreakdown = await prisma.grievance.groupBy({
      by: ['priority'],
      where: whereClause,
      _count: {
        priority: true
      }
    })

    // Get status breakdown
    const statusBreakdown = await prisma.grievance.groupBy({
      by: ['status'],
      where: whereClause,
      _count: {
        status: true
      }
    })

    // Get officer workload
    const officerWorkload = await prisma.grievance.groupBy({
      by: ['assignedToId'],
      where: whereClause,
      _count: {
        id: true
      }
    })

    // Get officer details for workload
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

    const response = {
      criticalGrievances: grievancesWithAge,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      },
      summary: {
        totalCriticalGrievances: summaryStats._count.id,
        averageEstimatedCost: summaryStats._avg.estimatedCost,
        priorityBreakdown: priorityBreakdown.reduce((acc, item) => {
          acc[item.priority] = item._count.priority
          return acc
        }, {} as Record<string, number>),
        statusBreakdown: statusBreakdown.reduce((acc, item) => {
          acc[item.status] = item._count.status
          return acc
        }, {} as Record<string, number>),
        officerWorkload: formattedOfficerWorkload
      },
      filters: {
        district,
        mandal,
        priority,
        status
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching critical grievances:', error)
    return NextResponse.json(
      { error: "Failed to fetch critical grievances" },
      { status: 500 }
    )
  }
}
