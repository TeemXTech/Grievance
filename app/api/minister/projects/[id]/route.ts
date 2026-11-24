import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, hasRole } from "@/lib/auth-middleware"
import { sanitizeInput } from "@/lib/input-sanitizer"
import { createAuditLog } from "@/lib/audit-log"

const READ_ROLES  = ["MINISTER", "PA", "ADMIN", "BACK_OFFICER", "FIELD_OFFICER"]
const WRITE_ROLES = ["PA", "ADMIN", "BACK_OFFICER"]

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!READ_ROLES.includes(user.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const work = await prisma.publicWork.findUnique({
    where: { id: params.id },
    include: {
      requestedByLeader: true,
      milestones:  { orderBy: { createdAt: "desc" } },
      attachments: true,
    },
  })
  if (!work) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const canSeePrivate = hasRole(user, "MINISTER", "PA", "ADMIN")
  const result = canSeePrivate ? work : (() => { const { privateNotes, ...w } = work; return w })()
  return NextResponse.json({ success: true, work: result })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!WRITE_ROLES.includes(user.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const existing = await prisma.publicWork.findUnique({ where: { id: params.id } })
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const body = await req.json()
  const { title, description, stage, category, mandalName, villageName, wardNumber,
    estimatedBudget, sanctionedBudget, spentBudget,
    contractorName, contractorPhone, supervisingOfficial, executingDepartment,
    stuckReason, privateNotes, targetCompletionDate, milestoneNote, percentageDone } = body

  const updated = await prisma.publicWork.update({
    where: { id: params.id },
    data: {
      ...(title              !== undefined && { title:              sanitizeInput(title) }),
      ...(description        !== undefined && { description:        description ? sanitizeInput(description) : null }),
      ...(stage              !== undefined && { stage }),
      ...(category           !== undefined && { category }),
      ...(mandalName         !== undefined && { mandalName:         mandalName ? sanitizeInput(mandalName) : null }),
      ...(villageName        !== undefined && { villageName:        villageName ? sanitizeInput(villageName) : null }),
      ...(wardNumber         !== undefined && { wardNumber:         wardNumber ? sanitizeInput(wardNumber) : null }),
      ...(estimatedBudget    !== undefined && { estimatedBudget:    parseFloat(estimatedBudget) }),
      ...(sanctionedBudget   !== undefined && { sanctionedBudget:   parseFloat(sanctionedBudget) }),
      ...(spentBudget        !== undefined && { spentBudget:        parseFloat(spentBudget) }),
      ...(contractorName     !== undefined && { contractorName:     contractorName ? sanitizeInput(contractorName) : null }),
      ...(contractorPhone    !== undefined && { contractorPhone:    contractorPhone ? sanitizeInput(contractorPhone) : null }),
      ...(supervisingOfficial!== undefined && { supervisingOfficial: supervisingOfficial ? sanitizeInput(supervisingOfficial) : null }),
      ...(executingDepartment!== undefined && { executingDepartment: executingDepartment ? sanitizeInput(executingDepartment) : null }),
      ...(stuckReason        !== undefined && { stuckReason:        stuckReason ? sanitizeInput(stuckReason) : null }),
      ...(privateNotes       !== undefined && { privateNotes:       privateNotes ? sanitizeInput(privateNotes) : null }),
      ...(targetCompletionDate !== undefined && { targetCompletionDate: targetCompletionDate ? new Date(targetCompletionDate) : null }),
      ...(stage === "COMPLETED" && { actualCompletionDate: new Date() }),
    },
    include: { requestedByLeader: true, milestones: { orderBy: { createdAt: "desc" } }, attachments: true },
  })

  // Create milestone entry on stage change or explicit note
  if (milestoneNote || (stage && stage !== existing.stage)) {
    await prisma.workTimeline.create({
      data: {
        publicWorkId:   params.id,
        stage:          stage || existing.stage,
        percentageDone: percentageDone !== undefined ? parseInt(percentageDone) : (stage === "COMPLETED" ? 100 : 50),
        updateNote:     milestoneNote || `Stage updated to ${stage}`,
        updatedByName:  user.name,
        updatedByRole:  user.role,
      },
    })
  }

  if (stage && stage !== existing.stage) {
    await createAuditLog({ action: "STATUS_CHANGE", entityType: "PUBLIC_WORK", entityId: params.id, userId: user.id, oldValues: { stage: existing.stage }, newValues: { stage } })
  }

  return NextResponse.json({ success: true, work: updated })
}
