import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Return dummy data for demo purposes
    const dummyTasks = [
      { id: "1", referenceNumber: "GRV-2025-001", type: "grievance", village: "Kondapur", status: "PENDING", issue: "Water supply disruption", requesterName: "Rajesh Kumar", createdAt: new Date('2025-01-08') },
      { id: "2", referenceNumber: "PRJ-2025-001", type: "project", village: "Gachibowli", status: "IN_PROGRESS", projectName: "Road construction", ministerName: "Minister Health", createdAt: new Date('2025-01-07') },
      { id: "3", referenceNumber: "GRV-2025-002", type: "grievance", village: "Miyapur", status: "RESOLVED", issue: "Street light repair", requesterName: "Priya Sharma", createdAt: new Date('2025-01-06') },
      { id: "4", referenceNumber: "PAT-2025-001", type: "patient", village: "Kukatpally", status: "NEW", patientName: "Suresh Reddy", issue: "Medical assistance needed", createdAt: new Date('2025-01-05') },
      { id: "5", referenceNumber: "GRV-2025-003", type: "grievance", village: "Ameerpet", status: "IN_PROGRESS", issue: "Drainage blockage", requesterName: "Lakshmi Devi", createdAt: new Date('2025-01-04') },
      { id: "6", referenceNumber: "PRJ-2025-002", type: "project", village: "Begumpet", status: "PENDING", projectName: "School renovation", ministerName: "Minister Education", createdAt: new Date('2025-01-03') },
      { id: "7", referenceNumber: "GRV-2025-004", type: "grievance", village: "Secunderabad", status: "RESOLVED", issue: "Electricity connection", requesterName: "Venkat Rao", createdAt: new Date('2025-01-02') },
      { id: "8", referenceNumber: "PAT-2025-002", type: "patient", village: "Uppal", status: "IN_PROGRESS", patientName: "Kavitha Reddy", issue: "Hospital referral", createdAt: new Date('2025-01-01') },
      { id: "9", referenceNumber: "GRV-2025-005", type: "grievance", village: "LB Nagar", status: "PENDING", issue: "Waste management", requesterName: "Mohan Krishna", createdAt: new Date('2024-12-31') },
      { id: "10", referenceNumber: "PRJ-2025-003", type: "project", village: "Dilsukhnagar", status: "IN_PROGRESS", projectName: "Health center upgrade", ministerName: "Minister Health", createdAt: new Date('2024-12-30') }
    ]

    return NextResponse.json(dummyTasks)
  } catch (error) {
    console.error("Error fetching assigned tasks:", error)
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 })
  }
}