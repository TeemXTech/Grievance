import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  // naive monthly grouping based on createdAt
  const rows = await prisma.$queryRawUnsafe<any[]>(
    `select to_char(date_trunc('month', "createdAt"), 'Mon') as month,
            count(*) as requests
     from "Grievance"
     group by 1
     order by min("createdAt") asc`,
  )
  return NextResponse.json(rows)
}


