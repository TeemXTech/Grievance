import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth-middleware"
import { sanitizeInput } from "@/lib/input-sanitizer"
import { createAuditLog } from "@/lib/audit-log"

const READ_ROLES  = ["MINISTER", "PA", "ADMIN", "BACK_OFFICER"]
const WRITE_ROLES = ["PA", "ADMIN"]

// Days allowed at each stage before flagging as stuck
const STUCK_THRESHOLDS: Record<string, number> = {
  RECOMMENDED:    30,
  LETTER_SENT:    30,
  ADMIN_SANCTION: 45,
  TECH_SANCTION:  30,
  TENDER_FLOATED: 60,
  WORK_IN_PROGRESS: 180,
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  if (!READ_ROLES.includes(user.role))
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

  const fund = await prisma.fundAllocation.findUnique({
    where: { id: params.id },
    include: { timeline: { orderBy: { createdAt: "asc" } } },
  })
  if (!fund) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 })

  const canSeePrivate = ["MINISTER", "PA", "ADMIN"].includes(user.role)
  const result = canSeePrivate ? fund : { ...fund, privateNotes: undefined }
  return NextResponse.json({ success: true, fund: result })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  if (!WRITE_ROLES.includes(user.role))
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

  const fund = await prisma.fundAllocation.findUnique({ where: { id: params.id } })
  if (!fund) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 })

  const body = await req.json()
  const {
    status, actionTaken, remarks,
    sanctionedAmount, releasedAmount, utilizedAmount,
    adminSanctionDate, techSanctionDate, tenderDate,
    firstInstallmentDate, finalInstallmentDate, completionDate,
    isStuck, stuckReason, privateNotes, notes,
  } = body

  const fromStatus = fund.status
  const updateData: any = { updatedAt: new Date() }

  if (status)               updateData.status               = status
  if (sanctionedAmount)     updateData.sanctionedAmount     = parseFloat(sanctionedAmount)
  if (releasedAmount)       updateData.releasedAmount       = parseFloat(releasedAmount)
  if (utilizedAmount)       updateData.utilizedAmount       = parseFloat(utilizedAmount)
  if (adminSanctionDate)    updateData.adminSanctionDate    = new Date(adminSanctionDate)
  if (techSanctionDate)     updateData.techSanctionDate     = new Date(techSanctionDate)
  if (tenderDate)           updateData.tenderDate           = new Date(tenderDate)
  if (firstInstallmentDate) updateData.firstInstallmentDate = new Date(firstInstallmentDate)
  if (finalInstallmentDate) updateData.finalInstallmentDate = new Date(finalInstallmentDate)
  if (completionDate)       updateData.completionDate       = new Date(completionDate)
  if (isStuck !== undefined) {
    updateData.isStuck    = !!isStuck
    updateData.stuckSince = isStuck ? new Date() : null
    updateData.stuckReason = stuckReason ? sanitizeInput(stuckReason) : null
  }
  if (privateNotes !== undefined) updateData.privateNotes = privateNotes ? sanitizeInput(privateNotes) : null
  if (notes        !== undefined) updateData.notes        = notes        ? sanitizeInput(notes)        : null

  // Auto stuck detection: check if current stage has exceeded threshold days
  // Only set stuckSince when transitioning INTO a new stage, not on every update
  if (status && status !== fromStatus) {
    const threshold = STUCK_THRESHOLDS[status]
    if (threshold) {
      updateData.stuckSince = new Date() // reset clock for new stage
      updateData.isStuck    = false      // not stuck yet at new stage
    }
  } else if (!status) {
    // Check if current stage is overdue
    const threshold = STUCK_THRESHOLDS[fund.status]
    if (threshold && fund.stuckSince) {
      const daysSinceStage = Math.floor((Date.now() - fund.stuckSince.getTime()) / 86400000)
      if (daysSinceStage > threshold && !fund.isStuck) {
        updateData.isStuck = true
      }
    }
  }

  const updated = await prisma.fundAllocation.update({ where: { id: params.id }, data: updateData })

  // Timeline entry on status change
  if (status && status !== fromStatus) {
    await prisma.fundTimeline.create({
      data: {
        fundAllocationId: fund.id,
        fromStatus:       fromStatus as any,
        toStatus:         status as any,
        actionTaken:      actionTaken || `Stage advanced to ${status}`,
        remarks:          remarks     || null,
        performedByName:  user.name,
        performedByRole:  user.role,
      },
    })
  }

  if (status && status !== fromStatus) {
    await createAuditLog({ action: "STATUS_CHANGE", entityType: "FUND_ALLOCATION", entityId: params.id, userId: user.id, oldValues: { status: fromStatus }, newValues: { status } })
  }

  const result = await prisma.fundAllocation.findUnique({
    where: { id: params.id },
    include: { timeline: { orderBy: { createdAt: "asc" } } },
  })
  return NextResponse.json({ success: true, fund: result })
}
