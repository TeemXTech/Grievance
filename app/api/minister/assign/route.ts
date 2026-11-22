import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, hasRole } from "@/lib/auth-middleware"

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request)
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  if (!hasRole(user, "MINISTER", "PA", "ADMIN")) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
  }

  try {
    const { type, itemId, assigneeId } = await request.json()
    if (!type || !itemId || !assigneeId) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    if (type === "grievance") {
      const existing = await prisma.grievance.findUnique({ where: { id: itemId } })
      if (!existing) return NextResponse.json({ success: false, error: "Grievance not found" }, { status: 404 })

      await prisma.grievance.update({
        where: { id: itemId },
        data: { assignedToId: assigneeId, assignedAt: new Date(), status: "ASSIGNED" },
      })
      await prisma.grievanceStatusUpdate.create({
        data: {
          grievanceId: itemId,
          userId: user.id,
          oldStatus: existing.status,
          newStatus: "ASSIGNED",
          remarks: `Assigned by ${user.name} (${user.role})`,
        },
      })
    } else if (type === "project") {
      const existing = await prisma.governmentProject.findUnique({ where: { id: itemId } })
      if (!existing) return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 })

      await prisma.governmentProject.update({
        where: { id: itemId },
        data: { assignedToId: assigneeId, assignedAt: new Date() },
      })
      await prisma.projectStatusUpdate.create({
        data: {
          projectId: itemId,
          userId: user.id,
          oldStatus: existing.status,
          newStatus: "IN_PROGRESS",
          remarks: `Assigned by ${user.name} (${user.role})`,
        },
      })
    } else {
      return NextResponse.json({ success: false, error: "Invalid type" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Assignment error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
