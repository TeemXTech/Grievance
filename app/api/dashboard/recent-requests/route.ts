import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    const recentRequests = await prisma.grievance.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    })

    const formattedRequests = recentRequests.map(request => ({
      id: request.id,
      title: request.title,
      status: request.status.toLowerCase(),
      priority: request.priority.toLowerCase(),
      createdAt: request.createdAt.toISOString(),
      citizen: request.requesterName,
      category: request.category?.name || "Uncategorized",
      assignedTo: request.assignedTo?.name || null,
    }))

    return NextResponse.json(formattedRequests)
  } catch (error) {
    console.error("Error fetching recent requests:", error)
    return NextResponse.json(
      { error: "Failed to fetch recent requests" },
      { status: 500 }
    )
  }
}