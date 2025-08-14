import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const type = searchParams.get("type") || "patient"

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 })
    }

    let data
    switch (type) {
      case 'patient':
        data = await prisma.patientGrievance.findUnique({
          where: { id }
        })
        break
      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 })
    }

    if (!data) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Error fetching receipt data:", error)
    return NextResponse.json(
      { error: "Failed to fetch receipt data" },
      { status: 500 }
    )
  }
}