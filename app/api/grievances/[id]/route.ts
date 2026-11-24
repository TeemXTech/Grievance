import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth-middleware"
import { createAuditLog } from "@/lib/audit-log"

// Roles that can read a single grievance
const READ_ROLES   = ["MINISTER", "PA", "ADMIN", "BACK_OFFICER", "OFFICER", "FIELD_OFFICER", "PUBLIC"]
// Roles that can update status / assignment
const UPDATE_ROLES = ["MINISTER", "PA", "ADMIN", "BACK_OFFICER", "OFFICER"]

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!READ_ROLES.includes(user.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  try {
    const grievance = await prisma.grievance.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        assignedTo: { select: { id: true, name: true, email: true, role: true } },
        attachments: true,
        statusUpdates: {
          include: { user: { select: { name: true, role: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    })

    if (!grievance) return NextResponse.json({ error: "Grievance not found" }, { status: 404 })

    return NextResponse.json({ success: true, grievance })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!UPDATE_ROLES.includes(user.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  try {
    const body = await req.json()
    const { status, assignedToId, remarks, priority } = body

    const existing = await prisma.grievance.findUnique({ where: { id: params.id } })
    if (!existing) return NextResponse.json({ error: "Grievance not found" }, { status: 404 })

    const updateData: any = {}
    if (status) updateData.status = status
    if (assignedToId !== undefined) updateData.assignedToId = assignedToId
    if (priority) updateData.priority = priority

    const updated = await prisma.grievance.update({ where: { id: params.id }, data: updateData })

    if (status && status !== existing.status) {
      await prisma.grievanceStatusUpdate.create({
        data: {
          grievanceId: params.id,
          userId: user.id,
          oldStatus: existing.status,
          newStatus: status,
          remarks,
        },
      })
    }

    if (status && status !== existing.status) {
      await createAuditLog({ action: "STATUS_CHANGE", entityType: "GRIEVANCE", entityId: params.id, userId: user.id, oldValues: { status: existing.status }, newValues: { status } })
    }

    return NextResponse.json({ success: true, grievance: updated })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
