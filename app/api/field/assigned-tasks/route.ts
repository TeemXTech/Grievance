import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Get assigned grievances
    const grievances = await prisma.patientGrievance.findMany({
      where: { assignedToId: userId },
      include: {
        createdByUser: { select: { name: true } }
      },
      orderBy: { createdAt: "desc" }
    })

    // Get assigned projects
    const projects = await prisma.governmentProject.findMany({
      where: { assignedToId: userId },
      include: {
        createdByUser: { select: { name: true } }
      },
      orderBy: { createdAt: "desc" }
    })

    // Combine and format tasks
    const tasks = [
      ...grievances.map(g => ({
        ...g,
        type: "grievance"
      })),
      ...projects.map(p => ({
        ...p,
        type: "project"
      }))
    ]

    return NextResponse.json(tasks)
  } catch (error) {
    console.error("Error fetching assigned tasks:", error)
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 })
  }
}