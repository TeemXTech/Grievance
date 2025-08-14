import { NextRequest, NextResponse } from "next/server"
import { PrismaClient, Priority, GrievanceStatus } from "@prisma/client"
import { z } from "zod"

const prisma = new PrismaClient()

const approveMessageSchema = z.object({
  type: z.string().default("OTHER"),
  title: z.string().min(5).max(200),
  description: z.string().min(10).max(2000),
  requester_name: z.string().min(2).max(100),
  requester_phone: z.string().regex(/^\+?[0-9]{10,15}$/),
  requester_address: z.string().max(500).optional(),
  priority: z.nativeEnum(Priority).default(Priority.MEDIUM),
  status: z.nativeEnum(GrievanceStatus).default(GrievanceStatus.PENDING)
})

// Generate unique reference number
async function generateReferenceNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const count = await prisma.grievance.count({
    where: {
      referenceNumber: {
        startsWith: `GRV-${year}-`
      }
    }
  })
  const sequence = (count + 1).toString().padStart(4, '0')
  return `GRV-${year}-${sequence}`
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validatedData = approveMessageSchema.parse(body)
    
    // Generate reference number
    const referenceNumber = await generateReferenceNumber()
    
    // Create grievance from WhatsApp message
    const grievance = await prisma.grievance.create({
      data: {
        referenceNumber,
        title: validatedData.title,
        description: validatedData.description,
        priority: validatedData.priority,
        status: validatedData.status,
        requesterName: validatedData.requester_name,
        requesterPhone: validatedData.requester_phone,
        requesterAddress: validatedData.requester_address,
        state: "Telangana"
      },
      include: {
        category: true,
        assignedTo: true,
      }
    })

    // Create status update
    await prisma.grievanceStatusUpdate.create({
      data: {
        grievanceId: grievance.id,
        userId: 'system', // You might want to get actual user ID from session
        oldStatus: null,
        newStatus: GrievanceStatus.PENDING,
        remarks: `Created from WhatsApp message ID: ${params.id}`
      }
    })

    return NextResponse.json({
      success: true,
      grievance: grievance
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }
    
    console.error("Error approving WhatsApp message:", error)
    return NextResponse.json(
      { error: "Failed to approve WhatsApp message" },
      { status: 500 }
    )
  }
}