import { NextRequest, NextResponse } from "next/server"
import { PrismaClient, GrievanceStatus } from "@prisma/client"
import { z } from "zod"

const prisma = new PrismaClient()

// Status update validation schema
const statusUpdateSchema = z.object({
  newStatus: z.nativeEnum(GrievanceStatus, {
    errorMap: () => ({ message: "Invalid status value" })
  }),
  remarks: z.string().max(500, "Remarks must be less than 500 characters").optional(),
  actualResolutionDate: z.string().datetime().optional(),
})

// Status transition rules
const STATUS_TRANSITIONS: Record<GrievanceStatus, GrievanceStatus[]> = {
  [GrievanceStatus.PENDING]: [GrievanceStatus.ASSIGNED, GrievanceStatus.REJECTED],
  [GrievanceStatus.ASSIGNED]: [GrievanceStatus.IN_PROGRESS, GrievanceStatus.REJECTED],
  [GrievanceStatus.IN_PROGRESS]: [GrievanceStatus.UNDER_REVIEW, GrievanceStatus.REJECTED],
  [GrievanceStatus.UNDER_REVIEW]: [GrievanceStatus.RESOLVED, GrievanceStatus.IN_PROGRESS, GrievanceStatus.REJECTED],
  [GrievanceStatus.RESOLVED]: [GrievanceStatus.CLOSED, GrievanceStatus.IN_PROGRESS],
  [GrievanceStatus.CLOSED]: [], // Terminal state
  [GrievanceStatus.REJECTED]: [GrievanceStatus.PENDING], // Can be reopened
}

// Create status update entry
async function createStatusUpdate(
  grievanceId: string,
  userId: string,
  oldStatus: GrievanceStatus | null,
  newStatus: GrievanceStatus,
  remarks?: string
) {
  return await prisma.grievanceStatusUpdate.create({
    data: {
      grievanceId,
      userId,
      oldStatus,
      newStatus,
      remarks,
    },
    include: {
      user: true,
    }
  })
}

// Create audit log entry
async function createAuditLog(
  action: string,
  entityType: string,
  entityId: string,
  userId: string,
  oldValues?: any,
  newValues?: any,
  ipAddress?: string,
  userAgent?: string
) {
  await prisma.auditLog.create({
    data: {
      action,
      entityType,
      entityId,
      userId,
      oldValues: oldValues ? JSON.parse(JSON.stringify(oldValues)) : null,
      newValues: newValues ? JSON.parse(JSON.stringify(newValues)) : null,
      ipAddress,
      userAgent,
    }
  })
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const ipAddress = req.headers.get('x-forwarded-for') || req.ip
    const userAgent = req.headers.get('user-agent')

    // Validate request body
    const validatedData = statusUpdateSchema.parse(body)

    // Get current grievance
    const currentGrievance = await prisma.grievance.findUnique({
      where: { id: params.id },
      include: { category: true, assignedTo: true }
    })

    if (!currentGrievance) {
      return NextResponse.json({ error: "Grievance not found" }, { status: 404 })
    }

    // Validate status transition
    const allowedTransitions = STATUS_TRANSITIONS[currentGrievance.status]
    if (!allowedTransitions.includes(validatedData.newStatus)) {
      return NextResponse.json(
        { 
          error: "Invalid status transition", 
          currentStatus: currentGrievance.status,
          allowedTransitions 
        },
        { status: 400 }
      )
    }

    // Prepare update data
    const updateData: any = {
      status: validatedData.newStatus,
    }

    // Set actual resolution date if status is RESOLVED
    if (validatedData.newStatus === GrievanceStatus.RESOLVED && validatedData.actualResolutionDate) {
      updateData.actualResolutionDate = new Date(validatedData.actualResolutionDate)
    }

    // Update grievance
    const updatedGrievance = await prisma.grievance.update({
      where: { id: params.id },
      data: updateData,
      include: {
        category: true,
        assignedTo: true,
        attachments: true,
      }
    })

    // Create status update record
    const statusUpdate = await createStatusUpdate(
      params.id,
      'system', // You might want to get actual user ID from session
      currentGrievance.status,
      validatedData.newStatus,
      validatedData.remarks
    )

    // Create audit log
    await createAuditLog(
      'STATUS_CHANGE',
      'GRIEVANCE',
      params.id,
      'system', // You might want to get actual user ID from session
      currentGrievance,
      updatedGrievance,
      ipAddress,
      userAgent
    )

    return NextResponse.json({
      grievance: updatedGrievance,
      statusUpdate,
      message: `Status updated from ${currentGrievance.status} to ${validatedData.newStatus}`
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error updating grievance status:', error)
    return NextResponse.json(
      { error: "Failed to update grievance status" },
      { status: 500 }
    )
  }
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check if grievance exists
    const grievance = await prisma.grievance.findUnique({
      where: { id: params.id }
    })

    if (!grievance) {
      return NextResponse.json({ error: "Grievance not found" }, { status: 404 })
    }

    // Get status updates for the grievance
    const statusUpdates = await prisma.grievanceStatusUpdate.findMany({
      where: { grievanceId: params.id },
      include: {
        user: true,
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      currentStatus: grievance.status,
      statusUpdates,
      allowedTransitions: STATUS_TRANSITIONS[grievance.status]
    })
  } catch (error) {
    console.error('Error fetching status updates:', error)
    return NextResponse.json(
      { error: "Failed to fetch status updates" },
      { status: 500 }
    )
  }
}
