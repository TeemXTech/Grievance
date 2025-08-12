import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } })
  return NextResponse.json(categories)
}


