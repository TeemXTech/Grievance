import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, hasRole } from "@/lib/auth-middleware"

// Immutable ledger — ADMIN and MINISTER only. No DELETE handler ever.
const READ_ROLES = ["ADMIN", "MINISTER"]

export async function GET(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!hasRole(user, ...READ_ROLES))
    return NextResponse.json({ error: "Forbidden: audit logs are restricted to ADMIN and MINISTER" }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const entityType = searchParams.get("entityType") || ""
  const entityId   = searchParams.get("entityId")   || ""
  const userId     = searchParams.get("userId")      || ""
  const action     = searchParams.get("action")      || ""
  const from       = searchParams.get("from")        || ""
  const to         = searchParams.get("to")          || ""
  const page       = Math.max(1, parseInt(searchParams.get("page") || "1"))
  const pageSize   = 50

  const where: any = {}
  if (entityType) where.entityType = entityType
  if (entityId)   where.entityId   = entityId
  if (userId)     where.userId     = userId
  if (action)     where.action     = action
  if (from || to) {
    where.createdAt = {}
    if (from) where.createdAt.gte = new Date(from)
    if (to)   where.createdAt.lte = new Date(to)
  }

  const [total, logs] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      include: { user: { select: { name: true, email: true, role: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ])

  return NextResponse.json({ success: true, logs, total, page, pageSize, totalPages: Math.ceil(total / pageSize) })
}
