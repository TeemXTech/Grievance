import { NextRequest, NextResponse } from 'next/server'

// In-memory storage for demo with dummy data
let grievances: any[] = [
  {
    id: 1, trackingNumber: "GRI-I-23-08012025", title: "Road Repair Needed", category: "Infrastructure",
    status: "Pending", priority: "High", citizenName: "Rajesh Kumar", citizenPhone: "+91-9876543210",
    location: "Manthanani Village", description: "Main road has multiple potholes", 
    createdAt: "2025-01-08T10:30:00Z", updatedAt: "2025-01-08T10:30:00Z", assignedTo: "Field Officer Ramesh"
  },
  {
    id: 2, trackingNumber: "GRI-H-45-07012025", title: "Water Supply Issue", category: "Water",
    status: "In Progress", priority: "Medium", citizenName: "Sita Devi", citizenPhone: "+91-9876543211",
    location: "Ramagundam", description: "Irregular water supply", 
    createdAt: "2025-01-07T10:30:00Z", updatedAt: "2025-01-07T10:30:00Z", assignedTo: "PA Srinivas"
  },
  {
    id: 3, trackingNumber: "GRI-E-67-06012025", title: "School Building Repair", category: "Education",
    status: "Resolved", priority: "Medium", citizenName: "Ravi Kumar", citizenPhone: "+91-9876543212",
    location: "Karimnagar", description: "School roof needs repair", 
    createdAt: "2025-01-06T10:30:00Z", updatedAt: "2025-01-06T10:30:00Z", assignedTo: "Engineer Kumar"
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const mobile = searchParams.get('mobile')

    if (!mobile) {
      return NextResponse.json({
        error: 'Mobile number is required'
      }, { status: 400 })
    }

    const userGrievances = grievances.filter(g => g.citizenPhone === mobile)

    return NextResponse.json({
      success: true,
      grievances: userGrievances,
      count: userGrievances.length
    })

  } catch (error) {
    console.error('Error fetching grievances:', error)
    return NextResponse.json({
      error: 'Failed to fetch grievances'
    }, { status: 500 })
  }
}