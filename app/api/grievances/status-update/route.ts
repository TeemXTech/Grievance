import { NextRequest, NextResponse } from 'next/server'
import { getMessageTemplate } from '@/lib/messages'
import { getColorForStatus } from '@/lib/colors'

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

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, assignedTo, language = 'en' } = body

    const grievanceIndex = grievances.findIndex(g => g.id === parseInt(id))
    
    if (grievanceIndex === -1) {
      return NextResponse.json({
        error: 'Grievance not found'
      }, { status: 404 })
    }

    const grievance = grievances[grievanceIndex]
    const oldStatus = grievance.status

    // Update grievance
    grievances[grievanceIndex] = {
      ...grievance,
      status,
      assignedTo: assignedTo || grievance.assignedTo,
      updatedAt: new Date().toISOString(),
      statusColor: getColorForStatus(status)
    }

    // Send WhatsApp notification if status changed
    if (oldStatus !== status) {
      const message = getMessageTemplate(language, 'statusUpdate', {
        trackingNumber: grievance.trackingNumber,
        title: grievance.title,
        citizenName: grievance.citizenName,
        status
      })

      console.log(`WhatsApp notification sent to ${grievance.citizenPhone}: ${message}`)
    }

    return NextResponse.json({
      success: true,
      grievance: grievances[grievanceIndex],
      message: 'Grievance updated successfully'
    })

  } catch (error) {
    console.error('Error updating grievance:', error)
    return NextResponse.json({
      error: 'Failed to update grievance'
    }, { status: 500 })
  }
}