import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth-middleware"
import { sanitizeInput, sanitizeMultiline } from "@/lib/input-sanitizer"
import { createAuditLog } from "@/lib/audit-log"

// Only PA/ADMIN can create campaigns; MINISTER can read
const READ_ROLES  = ["MINISTER", "PA", "ADMIN"]
const WRITE_ROLES = ["PA", "ADMIN"]

export async function GET(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  if (!READ_ROLES.includes(user.role))
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const status  = searchParams.get("status")  || ""
  const channel = searchParams.get("channel") || ""
  const page    = Math.max(1, parseInt(searchParams.get("page") || "1"))
  const pageSize = 20

  const where: any = {}
  if (status)  where.status  = status
  if (channel) where.channel = channel

  const [total, campaigns] = await Promise.all([
    prisma.campaign.count({ where }),
    prisma.campaign.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { _count: { select: { deliveries: true } } },
    }),
  ])

  return NextResponse.json({ success: true, campaigns, total, page, pageSize })
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  if (!WRITE_ROLES.includes(user.role))
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

  const body = await req.json()
  const { title, messageTemplate, channel, segmentQuery, segmentLabel, scheduledAt, notes } = body

  if (!title?.trim())           return NextResponse.json({ success: false, error: "Title is required" }, { status: 400 })
  if (!messageTemplate?.trim()) return NextResponse.json({ success: false, error: "Message template is required" }, { status: 400 })

  // Compute recipient count from segment query
  let recipientCount = 0
  if (segmentQuery) {
    const citizenWhere: any = { isActive: true, whatsappOptIn: true }
    if (segmentQuery.mandal)    citizenWhere.mandalName  = { contains: segmentQuery.mandal, mode: "insensitive" }
    if (segmentQuery.village)   citizenWhere.villageName = { contains: segmentQuery.village, mode: "insensitive" }
    if (segmentQuery.boothNumber) citizenWhere.boothNumber = segmentQuery.boothNumber
    if (segmentQuery.scheme)    citizenWhere.schemeBenefits = { path: [segmentQuery.scheme], equals: true }
    recipientCount = await prisma.citizen.count({ where: citizenWhere })
  }

  const campaign = await prisma.campaign.create({
    data: {
      title:           sanitizeInput(title),
      messageTemplate: sanitizeMultiline(messageTemplate),
      channel:         channel       || "WHATSAPP",
      status:          "DRAFT",
      segmentQuery:    segmentQuery  || null,
      segmentLabel:    segmentLabel  ? sanitizeInput(segmentLabel) : null,
      recipientCount,
      createdById:     user.id,
      createdByName:   user.name,
      scheduledAt:     scheduledAt   ? new Date(scheduledAt) : null,
      notes:           notes         ? sanitizeInput(notes)   : null,
    },
  })

  await createAuditLog({ action: "CREATE", entityType: "CAMPAIGN", entityId: campaign.id, userId: user.id, newValues: { title: campaign.title, channel: campaign.channel, recipientCount } })
  return NextResponse.json({ success: true, campaign }, { status: 201 })
}
