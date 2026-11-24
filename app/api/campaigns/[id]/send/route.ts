import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth-middleware"
import { createAuditLog } from "@/lib/audit-log"
import { sendWhatsApp } from "@/lib/whatsapp-sender"

const SEND_ROLES = ["PA", "ADMIN"]

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  if (!SEND_ROLES.includes(user.role))
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

  const campaign = await prisma.campaign.findUnique({ where: { id: params.id } })
  if (!campaign) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 })

  if (campaign.status !== "APPROVED")
    return NextResponse.json({ success: false, error: "Campaign must be APPROVED before sending" }, { status: 409 })

  // Mark as SENDING immediately
  await prisma.campaign.update({ where: { id: params.id }, data: { status: "SENDING" } })

  // Resolve recipients from segment query
  const citizenWhere: any = { isActive: true, phone: { not: null } }
  const sq = campaign.segmentQuery as any
  if (sq) {
    if (sq.mandal)       citizenWhere.mandalName   = { contains: sq.mandal, mode: "insensitive" }
    if (sq.village)      citizenWhere.villageName  = { contains: sq.village, mode: "insensitive" }
    if (sq.boothNumber)  citizenWhere.boothNumber  = sq.boothNumber
    if (sq.scheme)       citizenWhere.schemeBenefits = { path: [sq.scheme], equals: true }
    // WhatsApp channel: only opt-in citizens
    if (campaign.channel === "WHATSAPP" || campaign.channel === "BOTH") {
      citizenWhere.whatsappOptIn = true
    }
  }

  const citizens = await prisma.citizen.findMany({
    where: citizenWhere,
    select: { id: true, name: true, phone: true },
  })

  // Render message for each citizen and create delivery records
  const deliveries = citizens.map(c => {
    const message = campaign.messageTemplate
      .replace(/\{\{Citizen_Name\}\}/g, c.name)
      .replace(/\{\{Name\}\}/g, c.name)
    return {
      campaignId:  campaign.id,
      phone:       c.phone!,
      citizenName: c.name,
      citizenId:   c.id,
      message,
      status:      "PENDING",
    }
  })

  if (deliveries.length > 0) {
    await prisma.campaignDelivery.createMany({ data: deliveries })
  }

  // Send messages via real WhatsApp provider (Gupshup / Twilio / Meta / stub)
  let sentCount = 0
  let failedCount = 0

  // Process in batches of 10 to avoid overwhelming the provider
  const BATCH = 10
  const allDeliveries = await prisma.campaignDelivery.findMany({
    where: { campaignId: campaign.id, status: "PENDING" },
    select: { id: true, phone: true, message: true },
  })

  for (let i = 0; i < allDeliveries.length; i += BATCH) {
    const batch = allDeliveries.slice(i, i + BATCH)
    await Promise.all(
      batch.map(async (delivery) => {
        const result = await sendWhatsApp(delivery.phone, delivery.message)
        if (result.success) {
          await prisma.campaignDelivery.update({
            where: { id: delivery.id },
            data:  { status: "SENT", sentAt: new Date() },
          })
          sentCount++
        } else {
          await prisma.campaignDelivery.update({
            where: { id: delivery.id },
            data:  { status: "FAILED", errorMessage: result.error?.substring(0, 255) },
          })
          failedCount++
          console.error(`[Campaign ${params.id}] Failed to send to ${delivery.phone}:`, result.error)
        }
      })
    )
  }

  await prisma.campaign.update({
    where: { id: params.id },
    data: {
      status:         "SENT",
      sentAt:         new Date(),
      recipientCount: allDeliveries.length,
      sentCount,
      failedCount,
    },
  })

  await createAuditLog({ action: "DISPATCH", entityType: "CAMPAIGN", entityId: params.id, userId: user.id, newValues: { sentCount, failedCount } })
  return NextResponse.json({ success: true, sentCount, failedCount, message: `Campaign sent to ${sentCount} recipients (${failedCount} failed)` })
}
