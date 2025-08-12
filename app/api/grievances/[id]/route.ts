import { NextRequest, NextResponse } from "next/server"
import { PrismaClient, GrievanceStatus, Priority } from "@prisma/client"
import { z } from "zod"

const prisma = new PrismaClient()

// Validation schemas
const updateGrievanceSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(200, "Title must be less than 200 characters").optional(),
  description: z.string().min(10, "Description must be at least 10 characters").max(2000, "Description must be less than 2000 characters").optional(),
  priority: z.nativeEnum(Priority).optional(),
  status: z.nativeEnum(GrievanceStatus).optional(),
  
  // Requester Information
  requesterName: z.string().min(2, "Requester name must be at least 2 characters").max(100, "Requester name must be less than 100 characters").optional(),
  requesterPhone: z.string().regex(/^[0-9]{10}$/, "Phone number must be exactly 10 digits").optional(),
  requesterEmail: z.string().email("Invalid email format").optional(),
  requesterAddress: z.string().max(500, "Address must be less than 500 characters").optional(),
  
  // Location Information
  village: z.string().min(2, "Village must be at least 2 characters").max(100, "Village must be less than 100 characters").optional(),
  mandal: z.string().min(2, "Mandal must be at least 2 characters").max(100, "Mandal must be less than 100 characters").optional(),
  district: z.string().min(2, "District must be at least 2 characters").max(100, "District must be less than 100 characters").optional(),
  state: z.string().optional(),
  pincode: z.string().regex(/^[0-9]{6}$/, "Pincode must be exactly 6 digits").optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  
  // Additional Details
  estimatedCost: z.number().positive("Estimated cost must be positive").optional(),
  expectedResolutionDate: z.string().datetime().optional(),
  actualResolutionDate: z.string().datetime().optional(),
  remarks: z.string().max(1000, "Remarks must be less than 1000 characters").optional(),
  
  // Relations
  categoryId: z.string().cuid("Invalid category ID").optional(),
  assignedToId: z.string().cuid("Invalid user ID").optional(),
  
  // Status update
  statusRemarks: z.string().max(500, "Status remarks must be less than 500 characters").optional(),
})

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

// Create status update entry
async function createStatusUpdate(
  grievanceId: string,
  userId: string,
  oldStatus: GrievanceStatus | null,
  newStatus: GrievanceStatus,
  remarks?: string
) {
  await prisma.grievanceStatusUpdate.create({
    data: {
      grievanceId,
      userId,
      oldStatus,
      newStatus,
      remarks,
    }
  })
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const grievance = await prisma.grievance.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        assignedTo: true,
        attachments: true,
        statusUpdates: {
          include: { user: true },
          orderBy: { createdAt: 'desc' }
        },
        auditLogs: {
          include: { user: true },
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      },
    })
    
    if (!grievance) {
      return NextResponse.json({ error: "Grievance not found" }, { status: 404 })
    }
    
    return NextResponse.json(grievance)
  } catch (error) {
    console.error('Error fetching grievance:', error)
    return NextResponse.json(
      { error: "Failed to fetch grievance" },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const ipAddress = req.headers.get('x-forwarded-for') || req.ip
    const userAgent = req.headers.get('user-agent')

    // Validate request body
    const validatedData = updateGrievanceSchema.parse(body)

    // Get current grievance
    const currentGrievance = await prisma.grievance.findUnique({
      where: { id: params.id },
      include: { category: true, assignedTo: true }
    })

    if (!currentGrievance) {
      return NextResponse.json({ error: "Grievance not found" }, { status: 404 })
    }

    // Prepare update data
    const updateData: any = { ...validatedData }
    delete updateData.statusRemarks // Remove from update data as it's for status tracking

    // Handle date fields
    if (validatedData.expectedResolutionDate) {
      updateData.expectedResolutionDate = new Date(validatedData.expectedResolutionDate)
    }
    if (validatedData.actualResolutionDate) {
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

    // Handle status change
    if (validatedData.status && validatedData.status !== currentGrievance.status) {
      await createStatusUpdate(
        params.id,
        'system', // You might want to get actual user ID from session
        currentGrievance.status,
        validatedData.status,
        validatedData.statusRemarks
      )
    }

    // Create audit log
    await createAuditLog(
      'UPDATE',
      'GRIEVANCE',
      params.id,
      'system', // You might want to get actual user ID from session
      currentGrievance,
      updatedGrievance,
      ipAddress,
      userAgent
    )

    return NextResponse.json(updatedGrievance)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error updating grievance:', error)
    return NextResponse.json(
      { error: "Failed to update grievance" },
      { status: 500 }
    )
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const grievance = await prisma.grievance.findUnique({
      where: { id: params.id }
    })

    if (!grievance) {
      return NextResponse.json({ error: "Grievance not found" }, { status: 404 })
    }

    // Delete grievance (cascade will handle related records)
    await prisma.grievance.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: "Grievance deleted successfully" })
  } catch (error) {
    console.error('Error deleting grievance:', error)
    return NextResponse.json(
      { error: "Failed to delete grievance" },
      { status: 500 }
    )
  }
}


