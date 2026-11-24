import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth-middleware"
import { sanitizeInput } from "@/lib/input-sanitizer"

// Who can read party posts
const READ_ROLES  = ["MINISTER", "PA", "ADMIN", "BACK_OFFICER"]
// Who can create/edit party posts
const WRITE_ROLES = ["PA", "ADMIN"]

export async function GET(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  if (!READ_ROLES.includes(user.role))
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const level    = searchParams.get("level") || ""
  const wing     = searchParams.get("wing")  || ""
  const isActive = searchParams.get("active")

  const where: any = {}
  if (level)    where.level    = level
  if (wing)     where.wing     = { contains: wing, mode: "insensitive" }
  if (isActive !== null && isActive !== "") where.isActive = isActive === "true"

  const posts = await prisma.partyPost.findMany({
    where,
    orderBy: [{ level: "asc" }, { title: "asc" }],
    include: {
      _count: { select: { workers: { where: { status: "ACTIVE" } } } },
    },
  })

  return NextResponse.json({ success: true, posts })
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  if (!WRITE_ROLES.includes(user.role))
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

  const body = await req.json()
  const { title, wing, level, description } = body

  if (!title?.trim()) return NextResponse.json({ success: false, error: "Title is required" }, { status: 400 })
  if (!level)         return NextResponse.json({ success: false, error: "Level is required" }, { status: 400 })

  // Check for duplicate
  const existing = await prisma.partyPost.findFirst({
    where: {
      title: { equals: title.trim(), mode: "insensitive" },
      level,
      wing: wing || null,
    },
  })
  if (existing) return NextResponse.json({ success: false, error: "This post already exists at this level" }, { status: 409 })

  const post = await prisma.partyPost.create({
    data: {
      title:       sanitizeInput(title),
      wing:        wing        ? sanitizeInput(wing)        : null,
      level,
      description: description ? sanitizeInput(description) : null,
    },
  })

  return NextResponse.json({ success: true, post }, { status: 201 })
}
