import { NextResponse } from "next/server"
import { PrismaClient, GrievanceStatus } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  const [total, pending, inProgress, resolved] = await Promise.all([
    prisma.grievance.count(),
    prisma.grievance.count({ where: { status: GrievanceStatus.PENDING } }),
    prisma.grievance.count({ where: { status: GrievanceStatus.IN_PROGRESS } }),
    prisma.grievance.count({ where: { status: GrievanceStatus.RESOLVED } }),
  ])

  return NextResponse.json({
    totalRequests: total,
    pendingRequests: pending,
    resolvedRequests: resolved,
    inProgressRequests: inProgress,
  })
}


