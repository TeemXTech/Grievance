import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth-middleware"
import { createAuditLog } from "@/lib/audit-log"

// Two-key: the approver must be different from the creator
const APPROVE_ROLES = ["PA", "ADMIN"]

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  if (!APPROVE_ROLES.includes(user.role))
    return NextResponse.json({ success: false, error: "Forbidden: only PA/ADMIN can approve campaigns" }, { status: 403 })

  const campaign = await prisma.campaign.findUnique({ where: { id: params.id } })
  if (!campaign) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 })

  if (campaign.status !== "PENDING_APPROVAL")
    return NextResponse.json({ success: false, error: "Campaign must be in PENDING_APPROVAL status to approve" }, { status: 409 })

  // Two-key: approver cannot be the same person who created it
  if (campaign.createdById === user.id)
    return NextResponse.json({ success: false, error: "Two-key rule: approver cannot be the same person who created the campaign" }, { status: 403 })

  const updated = await prisma.campaign.update({
    where: { id: params.id },
    data: {
      status:          "APPROVED",
      approvedById:    user.id,
      approvedByName:  user.name,
      approvedAt:      new Date(),
    },
  })

  await createAuditLog({ action: "APPROVE", entityType: "CAMPAIGN", entityId: params.id, userId: user.id, newValues: { status: "APPROVED" } })
  return NextResponse.json({ success: true, campaign: updated })
}
