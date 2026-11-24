import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, hasRole } from "@/lib/auth-middleware"

const READ_ROLES = ["PA", "ADMIN", "BACK_OFFICER"]

export async function GET(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!hasRole(user, ...READ_ROLES))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const page     = Math.max(1, parseInt(searchParams.get("page") || "1"))
  const pageSize = 50
  const processed = searchParams.get("processed")

  const where: any = {}
  if (processed === "false") where.isProcessed = false
  if (processed === "true")  where.isProcessed = true

  const [total, messages] = await Promise.all([
    prisma.whatsAppMessage.count({ where }),
    prisma.whatsAppMessage.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ])

  return NextResponse.json({ success: true, messages, total, page, pageSize, totalPages: Math.ceil(total / pageSize) })
}
