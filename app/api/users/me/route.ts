import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth-middleware"
import { createAuditLog } from "@/lib/audit-log"
import bcrypt from "bcryptjs"

// Any authenticated user can change their own password
export async function PATCH(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { currentPassword, newPassword } = body

  if (!currentPassword?.trim()) return NextResponse.json({ success: false, error: "Current password is required" }, { status: 400 })
  if (!newPassword?.trim())     return NextResponse.json({ success: false, error: "New password is required" }, { status: 400 })
  if (newPassword.length < 8)   return NextResponse.json({ success: false, error: "New password must be at least 8 characters" }, { status: 400 })
  if (currentPassword === newPassword) return NextResponse.json({ success: false, error: "New password must be different from current password" }, { status: 400 })

  // Fetch current hash
  const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { passwordHash: true } })
  if (!dbUser) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })

  const valid = await bcrypt.compare(currentPassword, dbUser.passwordHash)
  if (!valid) return NextResponse.json({ success: false, error: "Current password is incorrect" }, { status: 401 })

  const newHash = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: newHash, mustChangePassword: false } })

  await createAuditLog({
    action: "PASSWORD_CHANGE", entityType: "USER", entityId: user.id,
    userId: user.id, newValues: { selfService: true },
  })

  return NextResponse.json({ success: true, message: "Password changed successfully" })
}
