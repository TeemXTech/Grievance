import { NextRequest, NextResponse } from "next/server"
import { PrismaClient, ProjectStatus } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    
    const project = await prisma.governmentProject.create({
      data: {
        projectName: data.projectName,
        description: data.description,
        ministerName: data.ministerName,
        status: data.status as ProjectStatus,
        estimatedCost: data.estimatedCost ? parseFloat(data.estimatedCost) : null,
        actualCost: data.actualCost ? parseFloat(data.actualCost) : null,
        startDate: data.startDate ? new Date(data.startDate) : null,
        completionDate: data.completionDate ? new Date(data.completionDate) : null,
        village: data.village,
        mandal: data.mandal,
        district: data.district,
        state: data.state || "Telangana",
        beneficiaries: data.beneficiaries ? parseInt(data.beneficiaries) : null,
        remarks: data.remarks,
        createdBy: session.user.id
      }
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error("Error creating government project:", error)
    return NextResponse.json(
      { error: "Failed to create government project" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const minister = searchParams.get("minister")
    
    const where: any = {}
    if (status) where.status = status
    if (minister) where.ministerName = { contains: minister, mode: 'insensitive' }

    const projects = await prisma.governmentProject.findMany({
      where,
      include: {
        createdByUser: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(projects)
  } catch (error) {
    console.error("Error fetching government projects:", error)
    return NextResponse.json(
      { error: "Failed to fetch government projects" },
      { status: 500 }
    )
  }
}