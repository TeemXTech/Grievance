import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, hasRole } from "@/lib/auth-middleware"

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!hasRole(user, "MINISTER", "PA", "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { constituencyId } = await req.json()
    if (!constituencyId) {
      return NextResponse.json({ error: "constituencyId is required" }, { status: 400 })
    }

    const [grievanceStats, criticalGrievances, officerWorkload] = await Promise.all([
      prisma.grievance.groupBy({
        by: ["status"],
        where: { district: constituencyId },
        _count: { id: true },
      }),
      prisma.grievance.findMany({
        where: {
          district: constituencyId,
          OR: [
            { priority: "URGENT" },
            { priority: "HIGH" },
            { expectedResolutionDate: { lt: new Date() }, status: { not: "RESOLVED" } },
          ],
        },
        include: {
          assignedTo: { select: { name: true, phone: true, email: true, role: true } },
          category: { select: { name: true } },
        },
        orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
        take: 20,
      }),
      prisma.grievance.groupBy({
        by: ["assignedToId"],
        where: { district: constituencyId, assignedToId: { not: null } },
        _count: { id: true },
      }),
    ])

    const officerIds = officerWorkload.map((o) => o.assignedToId).filter(Boolean) as string[]
    const officers = await prisma.user.findMany({
      where: { id: { in: officerIds } },
      select: { id: true, name: true, phone: true, email: true, role: true },
    })

    const totalGrievances = grievanceStats.reduce((sum, s) => sum + s._count.id, 0)
    const resolvedCount = grievanceStats.find((s) => s.status === "RESOLVED")?._count.id || 0

    return NextResponse.json({
      success: true,
      constituency: constituencyId,
      summary: {
        totalGrievances,
        resolvedGrievances: resolvedCount,
        pendingGrievances: grievanceStats.find((s) => s.status === "PENDING")?._count.id || 0,
        resolutionRate: totalGrievances > 0 ? ((resolvedCount / totalGrievances) * 100).toFixed(1) : "0",
        criticalIssues: criticalGrievances.length,
      },
      grievanceStats,
      criticalGrievances,
      officers: officers.map((o) => ({
        ...o,
        assignedGrievances: officerWorkload.find((w) => w.assignedToId === o.id)?._count.id || 0,
      })),
    })
  } catch (error: any) {
    console.error("Minister visit report error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
