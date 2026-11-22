import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, hasRole } from "@/lib/auth-middleware"

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!hasRole(user, "MINISTER", "PA", "ADMIN"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  try {
    const [
      totalPetitions,
      pendingPetitions,
      overduePetitions,
      resolvedPetitions,
      totalWorks,
      worksInProgress,
      worksCompleted,
      totalGrievances,
      recentPetitions,
      districtCounts,
    ] = await Promise.all([
      prisma.petitionRequest.count(),
      prisma.petitionRequest.count({ where: { status: { in: ["PENDING", "SUBMITTED_TO_PA"] } } }),
      prisma.petitionRequest.count({ where: { isOverdue: true } }),
      prisma.petitionRequest.count({ where: { status: { in: ["RESOLVED", "SANCTIONED"] } } }),
      prisma.publicWork.count(),
      prisma.publicWork.count({ where: { stage: "IN_PROGRESS" } }),
      prisma.publicWork.count({ where: { stage: "COMPLETED" } }),
      prisma.grievance.count(),
      prisma.petitionRequest.findMany({
        take: 20,
        orderBy: [{ isOverdue: "desc" }, { createdAt: "desc" }],
        select: {
          id: true,
          trackingNumber: true,
          type: true,
          title: true,
          description: true,
          status: true,
          priority: true,
          applicantName: true,
          applicantPhone: true,
          mandalName: true,
          villageName: true,
          isOverdue: true,
          createdAt: true,
          handlingPaName: true,
          assignedDepartment: true,
          referredByLeaderName: true,
          privateNotes: true,
          requestedAmount: true,
          sanctionedAmount: true,
        },
      }),
      prisma.petitionRequest.groupBy({
        by: ["district"],
        _count: { id: true },
        where: { district: { not: null } },
      }),
    ])

    return NextResponse.json({
      success: true,
      stats: {
        totalPetitions,
        pendingPetitions,
        overduePetitions,
        resolvedPetitions,
        totalWorks,
        worksInProgress,
        worksCompleted,
        totalGrievances,
      },
      recentPetitions,
      districtCounts: districtCounts.map((d) => ({
        district: d.district,
        count: d._count.id,
      })),
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
