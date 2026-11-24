import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth-middleware"
import { sanitizeInput } from "@/lib/input-sanitizer"
import { createAuditLog } from "@/lib/audit-log"

const READ_ROLES  = ["MINISTER", "PA", "ADMIN", "BACK_OFFICER", "FIELD_OFFICER"]
const WRITE_ROLES = ["PA", "ADMIN"]

export async function GET(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  if (!READ_ROLES.includes(user.role))
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const mandalId   = searchParams.get("mandalId")   || ""
  const mandalName = searchParams.get("mandal")     || ""
  const grade      = searchParams.get("grade")      || ""
  const search     = searchParams.get("search")     || ""

  const where: any = { isActive: true }
  if (mandalId)   where.mandalId   = mandalId
  if (mandalName) where.mandalName = { contains: mandalName, mode: "insensitive" }
  if (grade)      where.currentGrade = grade
  if (search) {
    where.OR = [
      { boothNumber: { contains: search, mode: "insensitive" } },
      { boothName:   { contains: search, mode: "insensitive" } },
      { villageName: { contains: search, mode: "insensitive" } },
    ]
  }

  const booths = await prisma.pollingBooth.findMany({
    where,
    orderBy: [{ mandalName: "asc" }, { boothNumber: "asc" }],
    include: {
      _count: { select: { citizens: true, households: true } },
    },
  })

  return NextResponse.json({ success: true, booths })
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  if (!WRITE_ROLES.includes(user.role))
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

  const body = await req.json()
  const { boothNumber, boothName, address, mandalId, mandalName, villageName, district, totalVoters, maleVoters, femaleVoters, otherVoters } = body

  if (!boothNumber?.trim()) return NextResponse.json({ success: false, error: "Booth number is required" }, { status: 400 })

  // Check duplicate
  const existing = await prisma.pollingBooth.findFirst({
    where: { boothNumber, mandalId: mandalId || null },
  })
  if (existing) return NextResponse.json({ success: false, error: "Booth already exists in this mandal" }, { status: 409 })

  const booth = await prisma.pollingBooth.create({
    data: {
      boothNumber:  sanitizeInput(boothNumber),
      boothName:    boothName    ? sanitizeInput(boothName)    : null,
      address:      address      ? sanitizeInput(address)      : null,
      mandalId:     mandalId     || null,
      mandalName:   mandalName   ? sanitizeInput(mandalName)   : null,
      villageName:  villageName  ? sanitizeInput(villageName)  : null,
      district:     district     || "Peddapalli",
      totalVoters:  totalVoters  ? parseInt(totalVoters)       : null,
      maleVoters:   maleVoters   ? parseInt(maleVoters)        : null,
      femaleVoters: femaleVoters ? parseInt(femaleVoters)      : null,
      otherVoters:  otherVoters  ? parseInt(otherVoters)       : null,
    },
  })

  await createAuditLog({ action: "CREATE", entityType: "POLLING_BOOTH", entityId: booth.id, userId: user.id, newValues: { boothNumber: booth.boothNumber, mandalName: booth.mandalName } })
  return NextResponse.json({ success: true, booth }, { status: 201 })
}
