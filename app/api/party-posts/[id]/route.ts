import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth-middleware"
import { sanitizeInput } from "@/lib/input-sanitizer"

const READ_ROLES  = ["MINISTER", "PA", "ADMIN", "BACK_OFFICER"]
const WRITE_ROLES = ["PA", "ADMIN"]

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  if (!READ_ROLES.includes(user.role))
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

  const post = await prisma.partyPost.findUnique({
    where: { id: params.id },
    include: {
      workers: {
        where: { status: "ACTIVE" },
        orderBy: { name: "asc" },
        select: { id: true, name: true, phone: true, mandalName: true, villageName: true, status: true },
      },
      _count: { select: { workers: true } },
    },
  })
  if (!post) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 })

  return NextResponse.json({ success: true, post })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  if (!WRITE_ROLES.includes(user.role))
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

  const post = await prisma.partyPost.findUnique({ where: { id: params.id } })
  if (!post) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 })

  const body = await req.json()
  const { title, wing, level, description, isActive } = body

  const post_updated = await prisma.partyPost.update({
    where: { id: params.id },
    data: {
      ...(title       !== undefined && { title:       sanitizeInput(title) }),
      ...(wing        !== undefined && { wing:        wing ? sanitizeInput(wing) : null }),
      ...(level       !== undefined && { level }),
      ...(description !== undefined && { description: description ? sanitizeInput(description) : null }),
      ...(isActive    !== undefined && { isActive: !!isActive }),
    },
  })

  return NextResponse.json({ success: true, post: post_updated })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  if (!WRITE_ROLES.includes(user.role))
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

  const post = await prisma.partyPost.findUnique({
    where: { id: params.id },
    include: { _count: { select: { workers: true } } },
  })
  if (!post) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 })
  if (post._count.workers > 0)
    return NextResponse.json({ success: false, error: `Cannot delete — ${post._count.workers} worker(s) hold this post. Reassign them first.` }, { status: 409 })

  await prisma.partyPost.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
