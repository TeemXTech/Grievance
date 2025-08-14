import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { taskId, status, remarks, type } = await request.json()

    if (type === "grievance") {
      await prisma.patientGrievance.update({
        where: { id: taskId },
        data: { status }
      })
    } else if (type === "project") {
      await prisma.governmentProject.update({
        where: { id: taskId },
        data: { status }
      })
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: "STATUS_UPDATE",
        entityType: type.toUpperCase(),
        entityId: taskId,
        userId: session.user.id,
        newValues: { status, remarks }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating status:", error)
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 })
  }
}