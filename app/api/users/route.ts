import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, hasRole } from "@/lib/auth-middleware"
import { sanitizeInput, validateEmail } from "@/lib/input-sanitizer"
import { createAuditLog } from "@/lib/audit-log"
import bcrypt from "bcryptjs"

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

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  // Only ADMIN can create new staff users
  if (!hasRole(user, "ADMIN")) {
    return NextResponse.json({ success: false, error: "Forbidden: only ADMIN can create users" }, { status: 403 })
  }

  const body = await req.json()
  const { name, email, password, role, phone } = body

  if (!name?.trim())     return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 })
  if (!email?.trim())    return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 })
  if (!password?.trim()) return NextResponse.json({ success: false, error: "Password is required" }, { status: 400 })
  if (!role)             return NextResponse.json({ success: false, error: "Role is required" }, { status: 400 })
  if (!validateEmail(email)) return NextResponse.json({ success: false, error: "Invalid email format" }, { status: 400 })
  if (password.length < 8)   return NextResponse.json({ success: false, error: "Password must be at least 8 characters" }, { status: 400 })

  // Prevent creating MINISTER role via API — must be done via seed
  const allowedRoles = ["PA", "ADMIN", "BACK_OFFICER", "FIELD_OFFICER", "OFFICER", "GOVERNMENT_OFFICIAL"]
  if (!allowedRoles.includes(role))
    return NextResponse.json({ success: false, error: `Role must be one of: ${allowedRoles.join(", ")}` }, { status: 400 })

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } })
  if (existing) return NextResponse.json({ success: false, error: "Email already in use" }, { status: 409 })

  const passwordHash = await bcrypt.hash(password, 12)

  const newUser = await prisma.user.create({
    data: {
      name:         sanitizeInput(name),
      email:        email.toLowerCase().trim(),
      passwordHash,
      role,
      phone:        phone ? sanitizeInput(phone) : null,
      status:       "active",
    },
    select: { id: true, name: true, email: true, role: true, phone: true, status: true, createdAt: true },
  })

  await createAuditLog({ action: "CREATE", entityType: "USER", entityId: newUser.id, userId: user.id, newValues: { name: newUser.name, email: newUser.email, role: newUser.role } })
  return NextResponse.json({ success: true, user: newUser }, { status: 201 })
}
