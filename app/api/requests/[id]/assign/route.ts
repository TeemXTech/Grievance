import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const { assigneeId } = body || {}
  if (!assigneeId) return NextResponse.json({ error: "assigneeId required" }, { status: 400 })
  const updated = await prisma.grievance.update({
    where: { id: params.id },
    data: { assignedToId: assigneeId },
  })
  return NextResponse.json(updated)
}


