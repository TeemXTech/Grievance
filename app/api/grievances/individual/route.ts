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

    const data = await request.json()
    
    const individualGrievance = await prisma.individualGrievance.create({
      data: {
        ...data,
        createdBy: session.user.id
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