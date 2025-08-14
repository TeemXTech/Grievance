import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "grievance"
    const village = searchParams.get("village")
    const minister = searchParams.get("minister")
    const status = searchParams.get("status")
    const dateFrom = searchParams.get("dateFrom")
    const dateTo = searchParams.get("dateTo")

    const where: any = {}
    
    if (village) where.village = { contains: village, mode: 'insensitive' }
    if (status) where.status = status
    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) where.createdAt.gte = new Date(dateFrom)
      if (dateTo) where.createdAt.lte = new Date(dateTo)
    }

    let data = []
    
    if (type === 'grievance') {
      data = await prisma.patientGrievance.findMany({
        where,
        include: {
          createdByUser: { select: { name: true } },
          assignedTo: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' }
      })
    } else if (type === 'project') {
      if (minister) where.ministerName = { contains: minister, mode: 'insensitive' }
      data = await prisma.governmentProject.findMany({
        where,
        include: {
          createdByUser: { select: { name: true } },
          assignedTo: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' }
      })
    }

    return NextResponse.json({
      data,
      filters: { village, minister, status, dateFrom, dateTo },
      total: data.length
    })
  } catch (error) {
    console.error("Error generating report:", error)
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    )
  }
}