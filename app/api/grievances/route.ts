import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth-middleware"
import { GrievanceStatus, Priority } from "@prisma/client"
import { z } from "zod"

// Validation schemas
const createGrievanceSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(200, "Title must be less than 200 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").max(2000, "Description must be less than 2000 characters"),
  priority: z.nativeEnum(Priority).optional().default(Priority.MEDIUM),
  
  // Requester Information
  requesterName: z.string().min(2, "Requester name must be at least 2 characters").max(100, "Requester name must be less than 100 characters"),
  requesterPhone: z.string().regex(/^[0-9]{10}$/, "Phone number must be exactly 10 digits"),
  requesterEmail: z.string().email("Invalid email format").optional(),
  requesterAddress: z.string().max(500, "Address must be less than 500 characters").optional(),
  
  // Location Information
  village: z.string().min(2, "Village must be at least 2 characters").max(100, "Village must be less than 100 characters").optional(),
  mandal: z.string().min(2, "Mandal must be at least 2 characters").max(100, "Mandal must be less than 100 characters").optional(),
  district: z.string().min(2, "District must be at least 2 characters").max(100, "District must be less than 100 characters").optional(),
  state: z.string().default("Telangana"),
  pincode: z.string().regex(/^[0-9]{6}$/, "Pincode must be exactly 6 digits").optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  
  // Additional Details
  estimatedCost: z.number().positive("Estimated cost must be positive").optional(),
  expectedResolutionDate: z.string().datetime().optional(),
  remarks: z.string().max(1000, "Remarks must be less than 1000 characters").optional(),
  
  // Relations
  categoryId: z.string().cuid("Invalid category ID").optional(),
})

const updateGrievanceSchema = createGrievanceSchema.partial().extend({
  status: z.nativeEnum(GrievanceStatus).optional(),
  assignedToId: z.string().cuid("Invalid user ID").optional(),
})

// Generate unique reference number — findFirst pattern prevents race conditions
async function generateReferenceNumber(): Promise<string> {
  const year   = new Date().getFullYear()
  const prefix = `GRV-${year}-`
  const last   = await prisma.grievance.findFirst({
    where:   { referenceNumber: { startsWith: prefix } },
    orderBy: { referenceNumber: "desc" },
  })
  const seq = last ? parseInt(last.referenceNumber.split("-").pop()!, 10) + 1 : 1
  return `${prefix}${String(seq).padStart(4, "0")}`
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

// Roles allowed to read grievances
const READ_ROLES  = ["MINISTER", "PA", "ADMIN", "BACK_OFFICER", "OFFICER", "FIELD_OFFICER", "PUBLIC"]
// Roles allowed to update grievance status / assignment
const UPDATE_ROLES = ["MINISTER", "PA", "ADMIN", "BACK_OFFICER", "OFFICER"]

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (!READ_ROLES.includes(user.role))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status") as keyof typeof GrievanceStatus | null
    const category = searchParams.get("category")
    const priority = searchParams.get("priority") as keyof typeof Priority | null
    const district = searchParams.get("district")
    const assignedTo = searchParams.get("assignedTo")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const search = searchParams.get("search")

    const where: any = {}

    // PUBLIC role: can only see their own grievances (by phone)
    // They submit via POST which stores requesterPhone — scope reads to that
    if (user.role === "PUBLIC" && user.phone) {
      where.requesterPhone = user.phone
    }
    
    if (status) where.status = status
    if (priority) where.priority = priority
    if (district) where.district = district
    if (assignedTo) where.assignedToId = assignedTo
    if (category) where.category = { name: category }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { requesterName: { contains: search, mode: 'insensitive' } },
        { referenceNumber: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [grievances, total] = await Promise.all([
      prisma.grievance.findMany({
        where,
        include: {
          category: true,
          assignedTo: true,
          attachments: true,
          statusUpdates: {
            include: { user: true },
            orderBy: { createdAt: 'desc' },
            take: 5
          }
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.grievance.count({ where })
    ])

    return NextResponse.json({
      grievances,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching grievances:', error)
    return NextResponse.json(
      { error: "Failed to fetch grievances" },
      { status: 500 }
    )
  }
}

// Roles allowed to submit grievances
const SUBMIT_ROLES = ["MINISTER", "PA", "ADMIN", "BACK_OFFICER", "OFFICER", "PUBLIC"]

export async function POST(req: NextRequest) {
  try {
    // Auth guard FIRST — before any body parsing or DB writes
    const user = await getAuthUser(req)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (!SUBMIT_ROLES.includes(user.role))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const body = await req.json()
    const ipAddress = req.headers.get('x-forwarded-for') || req.ip
    const userAgent = req.headers.get('user-agent')

    // Validate request body
    const validatedData = createGrievanceSchema.parse(body)

    // Generate reference number
    const referenceNumber = await generateReferenceNumber()

    // Create grievance
    const grievance = await prisma.grievance.create({
      data: {
        ...validatedData,
        referenceNumber,
        expectedResolutionDate: validatedData.expectedResolutionDate ? new Date(validatedData.expectedResolutionDate) : null,
      },
      include: {
        category: true,
        assignedTo: true,
        attachments: true,
      }
    })

    await createStatusUpdate(grievance.id, user.id, null, GrievanceStatus.PENDING, 'Grievance created')
    await createAuditLog(
      'CREATE', 'GRIEVANCE', grievance.id, user.id,
      null,
      { id: grievance.id, referenceNumber: grievance.referenceNumber },
      ipAddress ?? undefined,
      userAgent ?? undefined
    )

    return NextResponse.json(grievance, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error creating grievance:', error)
    return NextResponse.json(
      { error: "Failed to create grievance" },
      { status: 500 }
    )
  }
}


