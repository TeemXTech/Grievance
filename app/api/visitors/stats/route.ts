import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth-middleware"

const READ_ROLES = ["MINISTER", "PA", "ADMIN", "BACK_OFFICER"]

export async function GET(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  if (!READ_ROLES.includes(user.role))
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

  const now       = new Date()
  const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0)
  const todayEnd   = new Date(now); todayEnd.setHours(23, 59, 59, 999)

  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - 6)
  weekStart.setHours(0, 0, 0, 0)

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const [
    todayTotal, todayWaiting, todayInMeeting, todayCompleted, todayNoShow,
    weekTotal, monthTotal,
    byType, byStatus,
    recentVIP,
  ] = await Promise.all([
    prisma.visitorLog.count({ where: { appointmentDate: { gte: todayStart, lte: todayEnd } } }),
    prisma.visitorLog.count({ where: { appointmentDate: { gte: todayStart, lte: todayEnd }, status: "WAITING" } }),
    prisma.visitorLog.count({ where: { appointmentDate: { gte: todayStart, lte: todayEnd }, status: "IN_MEETING" } }),
    prisma.visitorLog.count({ where: { appointmentDate: { gte: todayStart, lte: todayEnd }, status: "COMPLETED" } }),
    prisma.visitorLog.count({ where: { appointmentDate: { gte: todayStart, lte: todayEnd }, status: "NO_SHOW" } }),
    prisma.visitorLog.count({ where: { appointmentDate: { gte: weekStart } } }),
    prisma.visitorLog.count({ where: { appointmentDate: { gte: monthStart } } }),
    prisma.visitorLog.groupBy({ by: ["visitType"], _count: { id: true }, where: { appointmentDate: { gte: monthStart } } }),
    prisma.visitorLog.groupBy({ by: ["status"],    _count: { id: true }, where: { appointmentDate: { gte: monthStart } } }),
    prisma.visitorLog.findMany({
      where: { priorityFlag: true, status: { in: ["WAITING", "IN_MEETING"] } },
      orderBy: { appointmentDate: "asc" },
      take: 5,
    }),
  ])

  // Daily trend last 7 days
  const dailyTrend = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    const ds = new Date(d); ds.setHours(0, 0, 0, 0)
    const de = new Date(d); de.setHours(23, 59, 59, 999)
    const count = await prisma.visitorLog.count({ where: { appointmentDate: { gte: ds, lte: de } } })
    dailyTrend.push({ day: d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric" }), count })
  }

  return NextResponse.json({
    success: true,
    today: { total: todayTotal, waiting: todayWaiting, inMeeting: todayInMeeting, completed: todayCompleted, noShow: todayNoShow },
    weekTotal,
    monthTotal,
    byType:   byType.map(r => ({ name: r.visitType, value: r._count.id })),
    byStatus: byStatus.map(r => ({ name: r.status,  value: r._count.id })),
    recentVIP,
    dailyTrend,
  })
}
