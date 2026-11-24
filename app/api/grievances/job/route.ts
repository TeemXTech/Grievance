import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth-middleware"

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    
    const jobRequest = await prisma.jobRequest.create({
      data: {
        ...data,
        createdBy: user.id
      }
    })

    return NextResponse.json(jobRequest, { status: 201 })
  } catch (error) {
    console.error("Error creating job request:", error)
    return NextResponse.json(
      { error: "Failed to create job request" },
      { status: 500 }
    )
  }
}
