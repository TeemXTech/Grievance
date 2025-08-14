import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Mock dashboard data - fallback when database is not available
    const dashboardData = {
      summary: {
        totalProjects: 45,
        totalGrievances: 128,
        pendingActions: 23,
        completedProjects: 32,
        openGrievances: 15,
        inProgressProjects: 13,
        criticalIssues: 5
      },
      recentProjects: [
        {
          id: 1,
          name: "Road Construction - NH 563",
          status: "IN_PROGRESS",
          progress: 75,
          budget: "₹2.5 Cr",
          place: "Manthanani Town",
          assignedOfficer: "Eng. Suresh Kumar",
          category: "Infrastructure",
          createdAt: new Date()
        }
      ],
      recentGrievances: [
        {
          id: 1,
          title: "Water Supply Issue - Irregular Timing",
          status: "OPEN",
          priority: "HIGH",
          place: "Jaipur",
          requesterName: "Smt. Kamala Devi",
          assignedOfficer: "Field Officer Ramesh",
          category: "Infrastructure",
          referenceNumber: "GRV-2024-JAI-001",
          createdAt: new Date()
        }
      ]
    }



    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}