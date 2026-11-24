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
    
    const patientGrievance = await prisma.patientGrievance.create({
      data: {
        ...data,
        createdBy: user.id
      }
    })

    return NextResponse.json(patientGrievance, { status: 201 })
  } catch (error) {
    console.error("Error creating patient grievance:", error)
    return NextResponse.json(
      { error: "Failed to create patient grievance" },
      { status: 500 }
    )
  }
}
