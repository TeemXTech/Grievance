import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  const data = await prisma.grievance.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { category: true },
  })
  return NextResponse.json(data)
}


