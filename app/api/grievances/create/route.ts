import { NextRequest, NextResponse } from 'next/server'
import { generateQR } from '@/lib/qr'
import { getColorForCategory, getColorForStatus } from '@/lib/colors'
import { getMessageTemplate } from '@/lib/messages'

// In-memory storage for demo with dummy data
let grievances: any[] = [
  {
    id: 1, trackingNumber: "GRI-I-23-08012025", title: "Road Repair Needed", category: "Infrastructure",
    status: "Pending", priority: "High", citizenName: "Rajesh Kumar", citizenPhone: "+91-9876543210",
    location: "Manthanani Village", description: "Main road has multiple potholes", 
    createdAt: "2025-01-08T10:30:00Z", updatedAt: "2025-01-08T10:30:00Z", assignedTo: "Field Officer Ramesh",
    categoryColor: "bg-blue-100 text-blue-800", statusColor: "bg-orange-100 text-orange-800"
  },
  {
    id: 2, trackingNumber: "GRI-H-45-07012025", title: "Water Supply Issue", category: "Water",
    status: "In Progress", priority: "Medium", citizenName: "Sita Devi", citizenPhone: "+91-9876543211",
    location: "Ramagundam", description: "Irregular water supply", 
    createdAt: "2025-01-07T10:30:00Z", updatedAt: "2025-01-07T10:30:00Z", assignedTo: "PA Srinivas",
    categoryColor: "bg-cyan-100 text-cyan-800", statusColor: "bg-blue-100 text-blue-800"
  },
  {
    id: 3, trackingNumber: "GRI-E-67-06012025", title: "School Building Repair", category: "Education",
    status: "Resolved", priority: "Medium", citizenName: "Ravi Kumar", citizenPhone: "+91-9876543212",
    location: "Karimnagar", description: "School roof needs repair", 
    createdAt: "2025-01-06T10:30:00Z", updatedAt: "2025-01-06T10:30:00Z", assignedTo: "Engineer Kumar",
    categoryColor: "bg-green-100 text-green-800", statusColor: "bg-green-100 text-green-800"
  }
]
let nextId = 4

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      title, 
      description, 
      category, 
      citizenName, 
      citizenPhone, 
      location, 
      priority = 'Medium',
      language = 'en'
    } = body

    // Check for duplicate within last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const duplicate = grievances.find(g => 
      g.citizenPhone === citizenPhone && 
      g.title.toLowerCase() === title.toLowerCase() &&
      new Date(g.createdAt) > oneDayAgo
    )

    if (duplicate) {
      return NextResponse.json({
        error: 'Duplicate grievance detected within 24 hours',
        existingGrievance: duplicate
      }, { status: 409 })
    }

    // Generate tracking number
    const categoryCode = category.charAt(0).toUpperCase()
    const date = new Date()
    const dateStr = date.toLocaleDateString('en-GB').replace(/\//g, '')
    const trackingNumber = `GRI-${categoryCode}-${nextId.toString().padStart(2, '0')}-${dateStr}`

    // Create grievance
    const grievance = {
      id: nextId++,
      trackingNumber,
      title,
      description,
      category,
      status: 'Pending',
      priority,
      citizenName,
      citizenPhone,
      location,
      createdAt: date.toISOString(),
      updatedAt: date.toISOString(),
      assignedTo: null,
      categoryColor: getColorForCategory(category),
      statusColor: getColorForStatus('Pending')
    }

    grievances.push(grievance)

    // Generate QR code
    const qrCode = await generateQR(grievance.id.toString(), trackingNumber)
    grievance.qrCode = qrCode

    // Send WhatsApp notification
    const message = getMessageTemplate(language, 'created', {
      trackingNumber,
      title,
      citizenName
    })

    console.log(`WhatsApp notification sent to ${citizenPhone}: ${message}`)

    return NextResponse.json({
      success: true,
      grievance,
      message: 'Grievance created successfully'
    })

  } catch (error) {
    console.error('Error creating grievance:', error)
    return NextResponse.json({
      error: 'Failed to create grievance'
    }, { status: 500 })
  }
}