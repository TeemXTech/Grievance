import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, hasRole } from "@/lib/auth-middleware"

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!hasRole(user, "MINISTER", "PA", "ADMIN", "BACK_OFFICER")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "grievance"
    const village = searchParams.get("village")
    const minister = searchParams.get("minister")
    const status = searchParams.get("status")
    const dateFrom = searchParams.get("dateFrom")
    const dateTo = searchParams.get("dateTo")

    const where: any = {}
    if (village) where.village = { contains: village, mode: "insensitive" }
    if (status) where.status = status
    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) where.createdAt.gte = new Date(dateFrom)
      if (dateTo) where.createdAt.lte = new Date(dateTo)
    }

    let data: any[] = []

    if (type === "grievance") {
      data = await prisma.patientGrievance.findMany({
        where,
        include: {
          createdByUser: { select: { name: true } },
          assignedTo: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      })
    } else if (type === "project") {
      if (minister) where.ministerName = { contains: minister, mode: "insensitive" }
      data = await prisma.governmentProject.findMany({
        where,
        include: {
          createdByUser: { select: { name: true } },
          assignedTo: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      })
    }

    return NextResponse.json({ data, total: data.length })
  } catch (error: any) {
    console.error("Report error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
