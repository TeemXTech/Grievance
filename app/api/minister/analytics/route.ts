import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const district = searchParams.get('district') || 'all'
    const village = searchParams.get('village') || 'all'
    const category = searchParams.get('category') || 'all'

    // Build where clause
    const whereClause: any = {}
    if (district !== 'all') whereClause.district = district
    if (village !== 'all') whereClause.village = village

    // Get grievances
    const grievances = await prisma.grievance.findMany({
      where: whereClause,
      include: {
        assignedTo: { select: { name: true } },
        category: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Get patient grievances
    const patientGrievances = await prisma.patientGrievance.findMany({
      where: district !== 'all' ? { village: { contains: district } } : {},
      include: {
        assignedTo: { select: { name: true } }
      }
    })

    // Calculate analytics
    const totalGrievances = grievances.length + patientGrievances.length
    const resolvedGrievances = grievances.filter(g => g.status === 'RESOLVED').length
    const pendingGrievances = grievances.filter(g => g.status === 'PENDING').length
    
    // Calculate average resolution days
    const resolvedWithDates = grievances.filter(g => 
      g.status === 'RESOLVED' && g.createdAt && g.updatedAt
    )
    const avgResolutionDays = resolvedWithDates.length > 0 
      ? Math.round(resolvedWithDates.reduce((acc, g) => {
          const days = Math.ceil((new Date(g.updatedAt).getTime() - new Date(g.createdAt).getTime()) / (1000 * 60 * 60 * 24))
          return acc + days
        }, 0) / resolvedWithDates.length)
      : 0

    // Mock spending data
    const totalSpent = Math.floor(Math.random() * 1000) + 500

    return NextResponse.json({
      totalGrievances,
      resolvedGrievances,
      pendingGrievances,
      avgResolutionDays,
      totalSpent,
      grievances: [...grievances, ...patientGrievances].slice(0, 20),
      leaders: [
        { name: "Sarpanch Ramesh", role: "Village Head", phone: "+91 9876543210" },
        { name: "Dr. Priya Sharma", role: "PHC Doctor", phone: "+91 9876543211" }
      ]
    })

  } catch (error) {
    console.error('Minister analytics error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}