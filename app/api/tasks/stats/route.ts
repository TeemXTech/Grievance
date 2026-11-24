import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth-middleware"

const READ_ROLES = ["MINISTER", "PA", "ADMIN", "BACK_OFFICER", "FIELD_OFFICER"]

export async function GET(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  if (!READ_ROLES.includes(user.role))
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

  const baseWhere = user.role === "FIELD_OFFICER" ? { assignedToId: user.id } : {}

  const [total, open, inProgress, completed, overdue, byPriority, byOffice, byStatus] = await Promise.all([
    prisma.task.count({ where: baseWhere }),
    prisma.task.count({ where: { ...baseWhere, status: "OPEN" } }),
    prisma.task.count({ where: { ...baseWhere, status: "IN_PROGRESS" } }),
    prisma.task.count({ where: { ...baseWhere, status: "COMPLETED" } }),
    prisma.task.count({ where: { ...baseWhere, isOverdue: true } }),
    prisma.task.groupBy({ by: ["priority"], _count: { id: true }, where: baseWhere }),
    prisma.task.groupBy({ by: ["officeName"], _count: { id: true }, where: { ...baseWhere, officeName: { not: null } } }),
    prisma.task.groupBy({ by: ["status"],   _count: { id: true }, where: baseWhere }),
  ])

  return NextResponse.json({
    success: true,
    total, open, inProgress, completed, overdue,
    byPriority: byPriority.map(r => ({ name: r.priority,    value: r._count.id })),
    byOffice:   byOffice.map(r   => ({ name: r.officeName!,  value: r._count.id })),
    byStatus:   byStatus.map(r   => ({ name: r.status,       value: r._count.id })),
  })
}
