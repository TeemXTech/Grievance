import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const place = searchParams.get('place')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')

    // Mock grievances data
    let grievances = [
      {
        id: 1,
        referenceNumber: "GRV-2024-JAI-001",
        title: "Water Supply Issue - Irregular Timing",
        status: "OPEN",
        priority: "HIGH",
        village: "Jaipur",
        mandal: "Jaipur",
        district: "Peddapalli",
        address: "H.No 12-34, Jaipur Village",
        description: "Water supply is irregular, only 2 hours per day instead of promised 6 hours.",
        subcategory: "Water Supply",
        estimatedCost: 250000,
        affectedCount: 52,
        attachments: '["water_tank_empty.jpg", "complaint_letter.jpg"]',
        user: { name: "Smt. Kamala Devi", phone: "+91-9876543210" },
        assignedOfficer: { name: "Field Officer Ramesh" },
        category: { name: "Infrastructure" },
        updates: [
          { createdAt: new Date('2024-01-10'), description: "Grievance registered", updatedBy: "PA Srinivas" },
          { createdAt: new Date('2024-01-12'), description: "Site inspection scheduled", updatedBy: "Field Officer Ramesh" }
        ],
        createdAt: new Date('2024-01-10'),
        resolvedAt: null
      },
      {
        id: 2,
        referenceNumber: "GRV-2024-GOD-002",
        title: "Road Repair Needed - Potholes",
        status: "IN_PROGRESS",
        priority: "MEDIUM",
        village: "Godavarikhani",
        mandal: "Godavarikhani",
        district: "Peddapalli",
        address: "Main Road, Godavarikhani",
        description: "Multiple potholes on main road causing vehicle damage and accidents.",
        subcategory: "Roads",
        estimatedCost: 120000,
        attachments: '["pothole_damage.jpg", "road_condition.jpg"]',
        user: { name: "Sri. Venkat Reddy", phone: "+91-9876543211" },
        assignedOfficer: { name: "Field Officer Priya" },
        category: { name: "Infrastructure" },
        updates: [
          { createdAt: new Date('2024-01-05'), description: "Grievance registered", updatedBy: "PA Rajesh" },
          { createdAt: new Date('2024-01-08'), description: "Site inspected, estimate prepared", updatedBy: "Field Officer Priya" }
        ],
        createdAt: new Date('2024-01-05'),
        resolvedAt: null
      }
    ]

    // Apply filters
    if (place) grievances = grievances.filter(g => g.village === place)
    if (status) grievances = grievances.filter(g => g.status === status)
    if (priority) grievances = grievances.filter(g => g.priority === priority)

    const formattedGrievances = grievances.map(grievance => ({
      id: grievance.id,
      referenceNumber: grievance.referenceNumber,
      title: grievance.title,
      status: grievance.status,
      priority: grievance.priority,
      place: grievance.village,
      village: grievance.village,
      mandal: grievance.mandal,
      district: grievance.district,
      requesterName: grievance.user?.name || 'Anonymous',
      requesterPhone: grievance.user?.phone || 'N/A',
      requesterAddress: grievance.address || 'N/A',
      description: grievance.description,
      category: grievance.category?.name || 'General',
      subcategory: grievance.subcategory || 'General',
      assignedFieldOfficer: grievance.assignedOfficer?.name || 'Unassigned',
      assignedPAOfficer: 'PA Srinivas',
      createdDate: grievance.createdAt.toISOString().split('T')[0],
      resolvedDate: grievance.resolvedAt?.toISOString().split('T')[0],
      daysOpen: grievance.status === 'OPEN' ? Math.floor((new Date().getTime() - grievance.createdAt.getTime()) / (1000 * 60 * 60 * 24)) : null,
      daysInProgress: grievance.status === 'IN_PROGRESS' ? Math.floor((new Date().getTime() - grievance.createdAt.getTime()) / (1000 * 60 * 60 * 24)) : null,
      daysToResolve: grievance.resolvedAt ? Math.floor((grievance.resolvedAt.getTime() - grievance.createdAt.getTime()) / (1000 * 60 * 60 * 24)) : null,
      estimatedCost: grievance.estimatedCost ? `₹${(grievance.estimatedCost / 100).toFixed(0)}` : null,
      resolutionCost: grievance.resolutionCost ? `₹${(grievance.resolutionCost / 100).toFixed(0)}` : null,
      resolution: grievance.resolution,
      affectedFamilies: grievance.affectedCount || 1,
      images: grievance.attachments ? JSON.parse(grievance.attachments) : [],
      updates: grievance.updates.map(update => ({
        date: update.createdAt.toISOString().split('T')[0],
        update: update.description,
        officer: update.updatedBy || 'System'
      })),
      createdAt: grievance.createdAt
    }))

    return NextResponse.json(formattedGrievances)
  } catch (error) {
    console.error('Grievances API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch grievances' },
      { status: 500 }
    )
  }
}