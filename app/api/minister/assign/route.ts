import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { type, itemId, assigneeId } = await request.json()

    if (!type || !itemId || !assigneeId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    if (type === "grievance") {
      await prisma.grievance.update({
        where: { id: itemId },
        data: {
          assignedToId: assigneeId,
          assignedAt: new Date(),
          status: "ASSIGNED"
        }
      })

      // Create status update log
      await prisma.grievanceStatusUpdate.create({
        data: {
          grievanceId: itemId,
          userId: assigneeId,
          oldStatus: "PENDING",
          newStatus: "ASSIGNED",
          remarks: "Assigned by Minister"
        }
      })
    } else if (type === "project") {
      await prisma.governmentProject.update({
        where: { id: itemId },
        data: {
          assignedToId: assigneeId,
          assignedAt: new Date()
        }
      })

      // Create project status update log
      await prisma.projectStatusUpdate.create({
        data: {
          projectId: itemId,
          userId: assigneeId,
          oldStatus: "YET_TO_COMPLETE",
          newStatus: "IN_PROGRESS",
          remarks: "Assigned by Minister"
        }
      })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("Assignment error:", error)
    return NextResponse.json(
      { error: "Failed to assign item" },
      { status: 500 }
    )
  }
}