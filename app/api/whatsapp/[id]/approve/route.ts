import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, hasRole } from "@/lib/auth-middleware"
import { sanitizeInput } from "@/lib/input-sanitizer"
import { createAuditLog } from "@/lib/audit-log"
import { Priority, GrievanceStatus } from "@prisma/client"
import { z } from "zod"

const APPROVE_ROLES = ["PA", "ADMIN", "BACK_OFFICER"]

const approveMessageSchema = z.object({
  title:             z.string().min(5).max(200),
  description:       z.string().min(10).max(2000),
  requester_name:    z.string().min(2).max(100),
  requester_phone:   z.string().regex(/^\+?[0-9]{10,15}$/),
  requester_address: z.string().max(500).optional(),
  priority:          z.nativeEnum(Priority).default(Priority.MEDIUM),
  status:            z.nativeEnum(GrievanceStatus).default(GrievanceStatus.PENDING),
})

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

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!hasRole(user, ...APPROVE_ROLES))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body = await req.json()
  const parsed = approveMessageSchema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: "Validation failed", details: parsed.error.errors }, { status: 400 })

  const data = parsed.data

  const referenceNumber = await generateReferenceNumber()

  const grievance = await prisma.grievance.create({
    data: {
      referenceNumber,
      title:            sanitizeInput(data.title),
      description:      sanitizeInput(data.description),
      priority:         data.priority,
      status:           data.status,
      requesterName:    sanitizeInput(data.requester_name),
      requesterPhone:   sanitizeInput(data.requester_phone),
      requesterAddress: data.requester_address ? sanitizeInput(data.requester_address) : null,
      state:            "Telangana",
      intakeMethod:     "WHATSAPP",
    },
    include: { category: true, assignedTo: true },
  })

  await prisma.grievanceStatusUpdate.create({
    data: {
      grievanceId: grievance.id,
      userId:      user.id,
      oldStatus:   null,
      newStatus:   GrievanceStatus.PENDING,
      remarks:     `Approved from WhatsApp message ID: ${params.id}`,
    },
  })

  // Mark the source WhatsApp message as processed
  await prisma.whatsAppMessage.updateMany({
    where: { id: params.id },
    data:  { isProcessed: true, processedAt: new Date(), grievanceId: grievance.id },
  })

  await createAuditLog({
    action: "CREATE", entityType: "GRIEVANCE", entityId: grievance.id,
    userId: user.id, newValues: { referenceNumber, fromWhatsApp: params.id },
  })

  return NextResponse.json({ success: true, grievance })
}
