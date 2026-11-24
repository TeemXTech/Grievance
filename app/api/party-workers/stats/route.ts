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
    total, active, inactive, suspended,
    byLevel, byWing, byMandal, byStatus,
    recentlyAdded,
  ] = await Promise.all([
    prisma.partyWorker.count(),
    prisma.partyWorker.count({ where: { status: "ACTIVE" } }),
    prisma.partyWorker.count({ where: { status: "INACTIVE" } }),
    prisma.partyWorker.count({ where: { status: "SUSPENDED" } }),
    prisma.partyWorker.groupBy({ by: ["level"],  _count: { id: true } }),
    prisma.partyWorker.groupBy({ by: ["wing"],   _count: { id: true }, where: { wing: { not: null } } }),
    prisma.partyWorker.groupBy({ by: ["mandalName"], _count: { id: true }, where: { mandalName: { not: null } }, orderBy: { _count: { id: "desc" } }, take: 10 }),
    prisma.partyWorker.groupBy({ by: ["status"], _count: { id: true } }),
    prisma.partyWorker.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, phone: true, postTitle: true, mandalName: true, villageName: true, createdAt: true },
    }),
  ])

  return NextResponse.json({
    success: true,
    total, active, inactive, suspended,
    byLevel:   byLevel.map(r => ({ name: r.level,      value: r._count.id })),
    byWing:    byWing.map(r  => ({ name: r.wing!,       value: r._count.id })),
    byMandal:  byMandal.map(r => ({ name: r.mandalName!, value: r._count.id })),
    byStatus:  byStatus.map(r => ({ name: r.status,     value: r._count.id })),
    recentlyAdded,
  })
}
