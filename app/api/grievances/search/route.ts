import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const phone = searchParams.get("phone")
    const reference = searchParams.get("reference")
    const village = searchParams.get("village")
    const category = searchParams.get("category")

    const where: any = {}
    
    if (phone) {
      where.OR = [
        { patientPhone: { contains: phone } },
        { referenceNumber: { contains: phone } }
      ]
    }
    
    if (reference) {
      where.referenceNumber = { contains: reference }
    }
    
    if (village) {
      where.village = { contains: village, mode: 'insensitive' }
    }

    const grievances = await prisma.patientGrievance.findMany({
      where,
      include: {
        createdByUser: {
          select: { name: true, email: true }
        },
        assignedTo: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 50
    })

    // Get count by phone for history
    let phoneHistory = 0
    if (phone) {
      phoneHistory = await prisma.patientGrievance.count({
        where: { patientPhone: phone }
      })
    }

    return NextResponse.json({
      grievances,
      phoneHistory,
      total: grievances.length
    })
  } catch (error) {
    console.error("Error searching grievances:", error)
    return NextResponse.json(
      { error: "Failed to search grievances" },
      { status: 500 }
    )
  }
}