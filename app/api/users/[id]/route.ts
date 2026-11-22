import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, hasRole } from "@/lib/auth-middleware"
import bcrypt from "bcryptjs"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!hasRole(user, "ADMIN", "MINISTER", "PA")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const found = await prisma.user.findUnique({
    where: { id: params.id },
    select: { id: true, name: true, email: true, role: true, phone: true, status: true, createdAt: true },
  })
  if (!found) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ success: true, user: found })
}

// PATCH /api/users/[id] — Admin resets a user's password or updates status
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!hasRole(user, "ADMIN")) {
    return NextResponse.json({ error: "Forbidden: only ADMIN can reset passwords" }, { status: 403 })
  }

  const body = await req.json()
  const { newPassword, status } = body

  const updateData: any = {}

  if (newPassword) {
    if (newPassword.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }
    updateData.passwordHash = await bcrypt.hash(newPassword, 12)
  }

  if (status && ["active", "inactive"].includes(status)) {
    updateData.status = status
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 })
  }

  await prisma.user.update({ where: { id: params.id }, data: updateData })

  await prisma.auditLog.create({
    data: {
      action: newPassword ? "PASSWORD_RESET" : "USER_STATUS_UPDATE",
      entityType: "User",
      entityId: params.id,
      userId: user.id,
      newValues: { status, passwordReset: !!newPassword },
    },
  })

  return NextResponse.json({ success: true, message: newPassword ? "Password reset successfully" : "Status updated" })
}
