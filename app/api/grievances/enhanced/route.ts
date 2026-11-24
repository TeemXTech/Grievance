import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth-middleware"

async function generateReferenceNumber(type: string): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = type === 'patient' ? 'PAT' : 'GRV'
  const count = await prisma.patientGrievance.count()
  const sequence = (count + 1).toString().padStart(4, '0')
  return `${prefix}-${year}-${sequence}`
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    const referenceNumber = await generateReferenceNumber('patient')
    
    const qrData = JSON.stringify({
      ref: referenceNumber,
      type: 'grievance'
    })

    const grievance = await prisma.patientGrievance.create({
      data: {
        referenceNumber,
        patientName: data.patientName,
        patientPhone: data.patientPhone,
        village: data.village,
        issue: data.issue,
        qrCode: qrData,
        createdBy: user.id
      }
    })

    return NextResponse.json({
      ...grievance,
      message: "Grievance created successfully"
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating enhanced grievance:", error)
    return NextResponse.json(
      { error: "Failed to create grievance" },
      { status: 500 }
    )
  }
}
