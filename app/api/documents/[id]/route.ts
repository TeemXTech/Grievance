import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth-middleware"
import { createAuditLog } from "@/lib/audit-log"

const READ_ROLES   = ["MINISTER", "PA", "ADMIN", "BACK_OFFICER"]
const DELETE_ROLES = ["PA", "ADMIN"]

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  if (!READ_ROLES.includes(user.role))
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

  const doc = await prisma.fileAttachment.findUnique({
    where: { id: params.id },
    include: {
      petitionRequest: { select: { id: true, trackingNumber: true, title: true, applicantName: true } },
      publicWork:      { select: { id: true, workCode: true, title: true } },
    },
  })
  if (!doc) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 })
  return NextResponse.json({ success: true, document: doc })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  if (!DELETE_ROLES.includes(user.role))
    return NextResponse.json({ success: false, error: "Forbidden: only PA/ADMIN can delete documents" }, { status: 403 })

  const doc = await prisma.fileAttachment.findUnique({ where: { id: params.id } })
  if (!doc) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 })

  await createAuditLog({ action: "DELETE", entityType: "ATTACHMENT", entityId: params.id, userId: user.id, oldValues: { fileName: doc.fileName } })
  await prisma.fileAttachment.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
