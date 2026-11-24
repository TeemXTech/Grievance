import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth-middleware"
import { sanitizeInput, sanitizeMultiline } from "@/lib/input-sanitizer"
import { createAuditLog } from "@/lib/audit-log"

const READ_ROLES  = ["MINISTER", "PA", "ADMIN"]
const WRITE_ROLES = ["PA", "ADMIN"]

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  if (!READ_ROLES.includes(user.role))
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

  const campaign = await prisma.campaign.findUnique({
    where: { id: params.id },
    include: {
      deliveries: {
        orderBy: { createdAt: "desc" },
        take: 100,
        select: { id: true, phone: true, citizenName: true, status: true, sentAt: true, deliveredAt: true, errorMessage: true },
      },
      _count: { select: { deliveries: true } },
    },
  })
  if (!campaign) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 })
  return NextResponse.json({ success: true, campaign })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  if (!WRITE_ROLES.includes(user.role))
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

  const campaign = await prisma.campaign.findUnique({ where: { id: params.id } })
  if (!campaign) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 })

  // Cannot edit a campaign that is already SENDING or SENT
  if (["SENDING", "SENT"].includes(campaign.status))
    return NextResponse.json({ success: false, error: "Cannot edit a campaign that has been sent" }, { status: 409 })

  const body = await req.json()
  const { title, messageTemplate, channel, segmentQuery, segmentLabel, scheduledAt, notes } = body

  const updated = await prisma.campaign.update({
    where: { id: params.id },
    data: {
      ...(title           !== undefined && { title:           sanitizeInput(title) }),
      ...(messageTemplate !== undefined && { messageTemplate: sanitizeMultiline(messageTemplate) }),
      ...(channel         !== undefined && { channel }),
      ...(segmentQuery    !== undefined && { segmentQuery }),
      ...(segmentLabel    !== undefined && { segmentLabel:    segmentLabel ? sanitizeInput(segmentLabel) : null }),
      ...(scheduledAt     !== undefined && { scheduledAt:     scheduledAt ? new Date(scheduledAt) : null }),
      ...(notes           !== undefined && { notes:           notes ? sanitizeInput(notes) : null }),
    },
  })

  await createAuditLog({ action: "UPDATE", entityType: "CAMPAIGN", entityId: params.id, userId: user.id, newValues: { title: body.title } })
  return NextResponse.json({ success: true, campaign: updated })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  if (user.role !== "ADMIN")
    return NextResponse.json({ success: false, error: "Only ADMIN can delete campaigns" }, { status: 403 })

  const campaign = await prisma.campaign.findUnique({ where: { id: params.id } })
  if (!campaign) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 })
  if (["SENDING", "SENT"].includes(campaign.status))
    return NextResponse.json({ success: false, error: "Cannot delete a sent campaign" }, { status: 409 })

  await createAuditLog({ action: "DELETE", entityType: "CAMPAIGN", entityId: params.id, userId: user.id })
  await prisma.campaign.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
