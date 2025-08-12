import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { z } from "zod"

const prisma = new PrismaClient()

// File validation schema
const fileUploadSchema = z.object({
  fileName: z.string().min(1, "File name is required").max(255, "File name too long"),
  originalName: z.string().min(1, "Original file name is required").max(255, "Original file name too long"),
  url: z.string().url("Invalid file URL"),
  mimeType: z.string().min(1, "MIME type is required"),
  fileSize: z.number().min(1, "File size must be greater than 0").max(10 * 1024 * 1024, "File size must be less than 10MB"), // 10MB limit
  uploadedBy: z.string().optional(),
})

// Allowed file types
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const ipAddress = req.headers.get('x-forwarded-for') || req.ip
    const userAgent = req.headers.get('user-agent')

    // Validate request body
    const validatedData = fileUploadSchema.parse(body)

    // Check if grievance exists
    const grievance = await prisma.grievance.findUnique({
      where: { id: params.id }
    })

    if (!grievance) {
      return NextResponse.json({ error: "Grievance not found" }, { status: 404 })
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(validatedData.mimeType)) {
      return NextResponse.json(
        { error: "File type not allowed. Allowed types: images, PDF, Word, Excel, text files" },
        { status: 400 }
      )
    }

    // Create attachment
    const attachment = await prisma.attachment.create({
      data: {
        ...validatedData,
        grievanceId: params.id,
      },
      include: {
        grievance: true,
      }
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'ATTACHMENT_UPLOAD',
        entityType: 'ATTACHMENT',
        entityId: attachment.id,
        userId: 'system', // You might want to get actual user ID from session
        newValues: attachment,
        ipAddress,
        userAgent,
      }
    })

    return NextResponse.json(attachment, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error uploading attachment:', error)
    return NextResponse.json(
      { error: "Failed to upload attachment" },
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

    // Get attachments for the grievance
    const attachments = await prisma.attachment.findMany({
      where: { grievanceId: params.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(attachments)
  } catch (error) {
    console.error('Error fetching attachments:', error)
    return NextResponse.json(
      { error: "Failed to fetch attachments" },
      { status: 500 }
    )
  }
}
