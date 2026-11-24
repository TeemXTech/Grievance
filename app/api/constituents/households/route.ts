import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth-middleware"
import { sanitizeInput } from "@/lib/input-sanitizer"
import { createAuditLog } from "@/lib/audit-log"

const READ_ROLES  = ["MINISTER", "PA", "ADMIN", "BACK_OFFICER"]
const WRITE_ROLES = ["PA", "ADMIN", "BACK_OFFICER"]

export async function GET(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  if (!READ_ROLES.includes(user.role))
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const boothNumber = searchParams.get("booth")   || ""
  const villageName = searchParams.get("village") || ""
  const mandalName  = searchParams.get("mandal")  || ""
  const search      = searchParams.get("search")  || ""
  const page        = Math.max(1, parseInt(searchParams.get("page") || "1"))
  const pageSize    = 50

  const where: any = {}
  if (boothNumber) where.boothNumber = boothNumber
  if (villageName) where.villageName = { contains: villageName, mode: "insensitive" }
  if (mandalName)  where.mandalName  = { contains: mandalName,  mode: "insensitive" }
  if (search) {
    where.OR = [
      { houseNumber: { contains: search, mode: "insensitive" } },
      { address:     { contains: search, mode: "insensitive" } },
      { streetColony:{ contains: search, mode: "insensitive" } },
    ]
  }

  const [total, households] = await Promise.all([
    prisma.household.count({ where }),
    prisma.household.findMany({
      where,
      orderBy: [{ villageName: "asc" }, { houseNumber: "asc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        citizens: { select: { id: true, name: true, age: true, gender: true, epicNumber: true, phone: true } },
        booth:    { select: { id: true, boothNumber: true, boothName: true } },
        _count:   { select: { citizens: true } },
      },
    }),
  ])

  return NextResponse.json({ success: true, households, total, page, pageSize })
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  if (!WRITE_ROLES.includes(user.role))
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

  const body = await req.json()
  const { houseNumber, address, streetColony, villageName, mandalName, district, boothId, boothNumber, schemeBenefits, notes } = body

  const household = await prisma.household.create({
    data: {
      houseNumber:   houseNumber   ? sanitizeInput(houseNumber)   : null,
      address:       address       ? sanitizeInput(address)       : null,
      streetColony:  streetColony  ? sanitizeInput(streetColony)  : null,
      villageName:   villageName   ? sanitizeInput(villageName)   : null,
      mandalName:    mandalName    ? sanitizeInput(mandalName)    : null,
      district:      district      || "Peddapalli",
      boothId:       boothId       || null,
      boothNumber:   boothNumber   ? sanitizeInput(boothNumber)   : null,
      schemeBenefits: schemeBenefits || null,
      notes:         notes         ? sanitizeInput(notes)         : null,
    },
  })

  await createAuditLog({ action: "CREATE", entityType: "HOUSEHOLD", entityId: household.id, userId: user.id, newValues: { houseNumber: household.houseNumber, villageName: household.villageName } })
  return NextResponse.json({ success: true, household }, { status: 201 })
}
