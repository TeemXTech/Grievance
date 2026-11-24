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
    
    const individualGrievance = await prisma.individualGrievance.create({
      data: {
        ...data,
        createdBy: user.id
      }
    })

    return NextResponse.json(individualGrievance, { status: 201 })
  } catch (error) {
    console.error("Error creating individual grievance:", error)
    return NextResponse.json(
      { error: "Failed to create individual grievance" },
      { status: 500 }
    )
  }
}
