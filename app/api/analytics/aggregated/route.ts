import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, hasRole } from "@/lib/auth-middleware"
import { GrievanceStatus, Priority } from "@prisma/client"

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!hasRole(user, "MINISTER", "PA", "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const groupBy = searchParams.get("groupBy") || "district"
    const constituency = searchParams.get("constituency")
    const year = searchParams.get("year") || new Date().getFullYear().toString()
    const status = searchParams.get("status") as GrievanceStatus | null
    const priority = searchParams.get("priority") as Priority | null

    if (!["district", "mandal", "village"].includes(groupBy)) {
      return NextResponse.json({ error: "Invalid groupBy" }, { status: 400 })
    }

    const whereClause: any = {
      createdAt: { gte: new Date(`${year}-01-01`), lte: new Date(`${year}-12-31`) },
    }
    if (constituency) whereClause.district = constituency
    if (status) whereClause.status = status
    if (priority) whereClause.priority = priority

    // Use typed groupBy fields
    type GrievanceGroupField = "district" | "mandal" | "village"
    const groupByFields: GrievanceGroupField[] =
      groupBy === "village" ? ["district", "mandal", "village"] :
      groupBy === "mandal" ? ["district", "mandal"] :
      ["district"]

    const [aggregatedData, overallSummary, pendingCount, urgentCount] = await Promise.all([
      prisma.grievance.groupBy({
        by: groupByFields,
        where: whereClause,
        _count: { id: true },
        _sum: { estimatedCost: true },
      }),
      prisma.grievance.aggregate({
        where: whereClause,
        _count: { id: true },
        _sum: { estimatedCost: true },
      }),
      prisma.grievance.count({ where: { ...whereClause, status: GrievanceStatus.PENDING } }),
      prisma.grievance.count({ where: { ...whereClause, priority: Priority.URGENT } }),
    ])

    return NextResponse.json({
      groupBy,
      year: parseInt(year),
      aggregatedData: aggregatedData.map((item: any) => ({
        location: { district: item.district, mandal: item.mandal, village: item.village },
        totalGrievances: item._count.id,
        totalEstimatedCost: item._sum.estimatedCost || 0,
      })),
      summary: {
        totalGrievances: overallSummary._count.id,
        totalEstimatedCost: overallSummary._sum.estimatedCost || 0,
        pendingGrievances: pendingCount,
        urgentGrievances: urgentCount,
      },
    })
  } catch (error: any) {
    console.error("Aggregated analytics error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
