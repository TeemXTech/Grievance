import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, hasRole } from "@/lib/auth-middleware"

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  if (!hasRole(user, "ADMIN", "MINISTER", "PA")) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      status: true,
      createdAt: true,
    },
  })
  return NextResponse.json({ success: true, users })
}
