import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth-middleware"

const READ_ROLES = ["MINISTER", "PA", "ADMIN", "BACK_OFFICER"]

export async function GET(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  if (!READ_ROLES.includes(user.role))
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

  const [
    total, stuck, completed,
    byScheme, byStatus,
    amountAgg, stuckFunds,
  ] = await Promise.all([
    prisma.fundAllocation.count(),
    prisma.fundAllocation.count({ where: { isStuck: true } }),
    prisma.fundAllocation.count({ where: { status: "COMPLETED" } }),
    prisma.fundAllocation.groupBy({ by: ["scheme"],  _count: { id: true }, _sum: { recommendedAmount: true } }),
    prisma.fundAllocation.groupBy({ by: ["status"],  _count: { id: true } }),
    prisma.fundAllocation.aggregate({
      _sum: { recommendedAmount: true, sanctionedAmount: true, releasedAmount: true, utilizedAmount: true },
    }),
    prisma.fundAllocation.findMany({
      where: { isStuck: true },
      orderBy: { stuckSince: "asc" },
      take: 10,
      select: { id: true, referenceNumber: true, workTitle: true, status: true, stuckReason: true, stuckSince: true, mandalName: true },
    }),
  ])

  return NextResponse.json({
    success: true,
    total, stuck, completed,
    totalRecommended: amountAgg._sum.recommendedAmount || 0,
    totalSanctioned:  amountAgg._sum.sanctionedAmount  || 0,
    totalReleased:    amountAgg._sum.releasedAmount     || 0,
    totalUtilized:    amountAgg._sum.utilizedAmount     || 0,
    byScheme: byScheme.map(r => ({ name: r.scheme, count: r._count.id, amount: r._sum.recommendedAmount || 0 })),
    byStatus: byStatus.map(r => ({ name: r.status, value: r._count.id })),
    stuckFunds,
  })
}
