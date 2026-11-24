import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, hasRole } from "@/lib/auth-middleware"

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!hasRole(user, "MINISTER", "PA", "ADMIN"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  try {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const todayEnd = new Date(todayStart.getTime() + 86400000)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const [
      totalPetitions,
      pendingPetitions,
      overduePetitions,
      resolvedPetitions,
      cmrfPending,
      totalWorks,
      worksInProgress,
      worksCompleted,
      stuckWorks,
      totalGrievances,
      recentPetitions,
      districtCounts,
      departmentBottlenecks,
      todayEvents,
      resolvedThisMonth,
      totalBudget,
    ] = await Promise.all([
      prisma.petitionRequest.count(),
      prisma.petitionRequest.count({ where: { status: { in: ["PENDING", "SUBMITTED_TO_PA", "ASSIGNED_TO_OFFICIAL", "UNDER_REVIEW"] } } }),
      prisma.petitionRequest.count({ where: { isOverdue: true } }),
      prisma.petitionRequest.count({ where: { status: { in: ["RESOLVED", "SANCTIONED"] } } }),
      // CMRF cases pending — life/death urgency
      prisma.petitionRequest.count({ where: { type: "CMRF_MEDICAL", status: { notIn: ["RESOLVED", "SANCTIONED", "REJECTED", "CLOSED"] } } }),
      prisma.publicWork.count(),
      prisma.publicWork.count({ where: { stage: "IN_PROGRESS" } }),
      prisma.publicWork.count({ where: { stage: "COMPLETED" } }),
      prisma.publicWork.count({ where: { stage: "STUCK_DELAYED" } }),
      prisma.grievance.count(),
      prisma.petitionRequest.findMany({
        take: 20,
        orderBy: [{ isOverdue: "desc" }, { priority: "desc" }, { createdAt: "desc" }],
        select: {
          id: true, trackingNumber: true, type: true, title: true,
          description: true, status: true, priority: true,
          applicantName: true, applicantPhone: true,
          mandalName: true, villageName: true,
          isOverdue: true, createdAt: true,
          handlingPaName: true, assignedDepartment: true,
          referredByLeaderName: true, privateNotes: true,
          requestedAmount: true, sanctionedAmount: true,
        },
      }),
      prisma.petitionRequest.groupBy({
        by: ["district"],
        _count: { id: true },
        where: { district: { not: null } },
      }),
      // Department bottleneck: which dept has most unresolved cases
      prisma.petitionRequest.groupBy({
        by: ["assignedDepartment"],
        _count: { id: true },
        where: {
          assignedDepartment: { not: null },
          status: { notIn: ["RESOLVED", "SANCTIONED", "REJECTED", "CLOSED"] },
        },
        orderBy: { _count: { id: "desc" } },
        take: 5,
      }),
      // Today's events
      prisma.tourAppointment.findMany({
        where: { startDate: { gte: todayStart, lt: todayEnd }, status: { not: "CANCELLED" } },
        orderBy: { startDate: "asc" },
        take: 5,
      }),
      // Resolved this month
      prisma.petitionRequest.count({
        where: { status: { in: ["RESOLVED", "SANCTIONED"] }, updatedAt: { gte: monthStart } },
      }),
      // Total sanctioned budget across all works
      prisma.publicWork.aggregate({ _sum: { sanctionedBudget: true, spentBudget: true } }),
    ])

    // Oldest overdue petition
    const oldestOverdue = await prisma.petitionRequest.findFirst({
      where: { isOverdue: true },
      orderBy: { createdAt: "asc" },
      select: { applicantName: true, type: true, createdAt: true, mandalName: true },
    })

    // Stuck work with reason
    const stuckWorkDetail = await prisma.publicWork.findFirst({
      where: { stage: "STUCK_DELAYED" },
      select: { title: true, mandalName: true, stuckReason: true },
    })

    // Next upcoming event
    const nextEvent = await prisma.tourAppointment.findFirst({
      where: { startDate: { gte: now }, status: { not: "CANCELLED" } },
      orderBy: { startDate: "asc" },
      select: { title: true, startDate: true, location: true, eventType: true },
    })

    const oldestOverdueDays = oldestOverdue
      ? Math.floor((now.getTime() - new Date(oldestOverdue.createdAt).getTime()) / 86400000)
      : 0

    return NextResponse.json({
      success: true,
      stats: {
        totalPetitions,
        pendingPetitions,
        overduePetitions,
        resolvedPetitions,
        resolvedThisMonth,
        cmrfPending,
        totalWorks,
        worksInProgress,
        worksCompleted,
        stuckWorks,
        totalGrievances,
        totalSanctionedBudget: totalBudget._sum.sanctionedBudget || 0,
        totalSpentBudget: totalBudget._sum.spentBudget || 0,
        todayEventsCount: todayEvents.length,
      },
      signals: {
        oldestOverdueDays,
        oldestOverdue: oldestOverdue ? {
          name: oldestOverdue.applicantName,
          type: oldestOverdue.type,
          mandal: oldestOverdue.mandalName,
          days: oldestOverdueDays,
        } : null,
        stuckWork: stuckWorkDetail,
        nextEvent: nextEvent ? {
          title: nextEvent.title,
          time: new Date(nextEvent.startDate).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
          location: nextEvent.location,
          eventType: nextEvent.eventType,
        } : null,
        cmrfPending,
        departmentBottlenecks: departmentBottlenecks
          .filter(d => d.assignedDepartment)
          .map(d => ({ dept: d.assignedDepartment!, count: d._count.id })),
      },
      recentPetitions,
      todayEvents,
      districtCounts: districtCounts.map(d => ({ district: d.district, count: d._count.id })),
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
