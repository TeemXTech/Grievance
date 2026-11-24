import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, hasRole } from "@/lib/auth-middleware"
import { sanitizeInput } from "@/lib/input-sanitizer"
import { createAuditLog } from "@/lib/audit-log"

const READ_ROLES  = ["MINISTER", "PA", "ADMIN", "BACK_OFFICER", "FIELD_OFFICER"]
const WRITE_ROLES = ["PA", "ADMIN", "BACK_OFFICER"]

async function generateWorkCode(category: string): Promise<string> {
  const year = new Date().getFullYear()
  const catCode: Record<string, string> = {
    ROADS_BRIDGES: "RD", DRINKING_WATER: "WTR", EDUCATION_SCHOOLS: "SCH",
    HEALTH_CLINICS: "HLT", COMMUNITY_HALL: "CH", ELECTRICITY_LIGHTS: "EL",
    DRAINAGE_SANITATION: "DR", IRRIGATION_LAKES: "IR",
  }
  const code = catCode[category] || "WRK"
  const prefix = `WRK-${code}-${year}-`
  const last = await prisma.publicWork.findFirst({
    where: { workCode: { startsWith: prefix } },
    orderBy: { workCode: "desc" },
  })
  const seq = last ? parseInt(last.workCode.split("-").pop()!, 10) + 1 : 1
  return `${prefix}${String(seq).padStart(4, "0")}`
}

export async function GET(request: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!READ_ROLES.includes(user.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const status   = searchParams.get("status")
  const search   = searchParams.get("search")
  const mandal   = searchParams.get("mandal")
  const category = searchParams.get("category")

  const where: any = {}
  if (status && status !== "all") where.stage = status
  if (mandal)   where.mandalName = { contains: mandal, mode: "insensitive" }
  if (category) where.category   = category
  if (search) {
    where.OR = [
      { title:       { contains: search, mode: "insensitive" } },
      { workCode:    { contains: search, mode: "insensitive" } },
      { villageName: { contains: search, mode: "insensitive" } },
      { mandalName:  { contains: search, mode: "insensitive" } },
    ]
  }

  const works = await prisma.publicWork.findMany({
    where,
    include: {
      requestedByLeader: true,
      milestones:  { orderBy: { createdAt: "desc" } },
      attachments: true,
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ success: true, works })
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!WRITE_ROLES.includes(user.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const data = await request.json()
  const title = data.projectName || data.title
  if (!title?.trim())
    return NextResponse.json({ error: "Title is required" }, { status: 400 })

  const category = data.category || "ROADS_BRIDGES"
  const workCode = await generateWorkCode(category)

  const project = await prisma.publicWork.create({
    data: {
      workCode,
      title:           sanitizeInput(title),
      description:     data.description     ? sanitizeInput(data.description)     : null,
      category,
      stage:           data.status || data.stage || "PLANNED",
      estimatedBudget: data.estimatedCost   ? parseFloat(data.estimatedCost)      : null,
      sanctionedBudget:data.actualCost      ? parseFloat(data.actualCost)         : null,
      villageName:     data.village || data.villageName || null,
      mandalName:      data.mandal  || data.mandalName  || null,
      district:        data.district        || "Peddapalli",
      privateNotes:    data.remarks || data.privateNotes || null,
      handlingPaId:    user.id,
      handlingPaName:  user.name,
      spentBudget:     0,
    },
  })

  await prisma.workTimeline.create({
    data: {
      publicWorkId:   project.id,
      stage:          project.stage,
      percentageDone: 0,
      updateNote:     "Work created",
      updatedByName:  user.name,
      updatedByRole:  user.role,
    },
  })

  await createAuditLog({ action: "CREATE", entityType: "PUBLIC_WORK", entityId: project.id, userId: user.id, newValues: { workCode, title } })
  return NextResponse.json({ success: true, work: project }, { status: 201 })
}
