import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth-middleware"
import { sanitizeInput } from "@/lib/input-sanitizer"
import { createAuditLog } from "@/lib/audit-log"

const WRITE_ROLES = ["PA", "ADMIN", "BACK_OFFICER"]

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  if (!WRITE_ROLES.includes(user.role))
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

  const visitor = await prisma.visitorLog.findUnique({ where: { id: params.id } })
  if (!visitor) return NextResponse.json({ success: false, error: "Visitor not found" }, { status: 404 })

  // If already linked to a petition, return it
  if (visitor.petitionId) {
    const existing = await prisma.petitionRequest.findUnique({ where: { id: visitor.petitionId } })
    if (existing) return NextResponse.json({ success: true, petition: existing, alreadyExisted: true })
  }

  const body = await req.json()
  const {
    type = "PERSONAL_GRIEVANCE",
    title,
    description,
    priority = "MEDIUM",
    mandalName,
    villageName,
    referredByLeaderName,
    assignedDepartment,
    privateNotes,
    daysAllowed = 7,
  } = body

  if (!title?.trim()) return NextResponse.json({ success: false, error: "Title is required" }, { status: 400 })

  // Generate tracking number
  const prefix = type === "CMRF_MEDICAL" ? "CMRF" : type === "JOB_EMPLOYMENT" ? "JOB" : type === "EMPLOYEE_TRANSFER" ? "TRF" : "REQ"
  const yearStr = new Date().getFullYear()
  const prefixFull = `REQ-${prefix}-${yearStr}-`
  const last = await prisma.petitionRequest.findFirst({
    where: { trackingNumber: { startsWith: prefixFull } },
    orderBy: { trackingNumber: "desc" },
  })
  const seq = last ? parseInt(last.trackingNumber.split("-").pop()!, 10) + 1 : 1
  const trackingNumber = `${prefixFull}${String(seq).padStart(4, "0")}`
  const dueDate = new Date(Date.now() + daysAllowed * 24 * 60 * 60 * 1000)

  const petition = await prisma.petitionRequest.create({
    data: {
      trackingNumber,
      type,
      title:               sanitizeInput(title),
      description:         description ? sanitizeInput(description) : sanitizeInput(title),
      priority,
      status:              "SUBMITTED_TO_PA",
      applicantName:       visitor.visitorName,
      applicantPhone:      visitor.visitorPhone || "",
      applicantAddress:    visitor.visitorAddress || null,
      mandalName:          mandalName    ? sanitizeInput(mandalName)    : null,
      villageName:         villageName   ? sanitizeInput(villageName)   : null,
      referredByLeaderName: referredByLeaderName ? sanitizeInput(referredByLeaderName) : null,
      handlingPaId:        user.id,
      handlingPaName:      user.name,
      assignedDepartment:  assignedDepartment ? sanitizeInput(assignedDepartment) : "General Administration",
      privateNotes:        privateNotes  ? sanitizeInput(privateNotes)  : null,
      daysAllowed:         parseInt(daysAllowed) || 7,
      dueDate,
      qrCode:              `QR-${trackingNumber}`,
    },
  })

  // Timeline entry
  await prisma.requestTimeline.create({
    data: {
      petitionRequestId: petition.id,
      fromStatus:        "PENDING",
      toStatus:          "SUBMITTED_TO_PA",
      actionTaken:       `Petition created from visitor log ${visitor.tokenNumber}`,
      remarks:           `Visitor purpose: ${visitor.purpose}`,
      performedByName:   user.name,
      performedByRole:   user.role,
    },
  })

  // Link visitor to petition
  await prisma.visitorLog.update({
    where: { id: params.id },
    data:  { petitionId: petition.id },
  })

  await createAuditLog({ action: "CREATE", entityType: "PETITION", entityId: petition.id, userId: user.id, newValues: { trackingNumber, fromVisitor: visitor.tokenNumber } })
  return NextResponse.json({ success: true, petition }, { status: 201 })
}
