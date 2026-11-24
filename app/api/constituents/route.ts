import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth-middleware"
import { sanitizeInput } from "@/lib/input-sanitizer"
import { createAuditLog } from "@/lib/audit-log"

// MINISTER/PA/ADMIN: full access including phone, aadhar
// BACK_OFFICER: can read/create, no phone masking needed (they do intake)
// FIELD_OFFICER: read-only, phone masked
const READ_ROLES  = ["MINISTER", "PA", "ADMIN", "BACK_OFFICER", "FIELD_OFFICER"]
const WRITE_ROLES = ["PA", "ADMIN", "BACK_OFFICER"]

export async function GET(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  if (!READ_ROLES.includes(user.role))
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const search      = searchParams.get("search")      || ""
  const boothNumber = searchParams.get("booth")       || ""
  const mandalName  = searchParams.get("mandal")      || ""
  const villageName = searchParams.get("village")     || ""
  const gender      = searchParams.get("gender")      || ""
  const dataSource  = searchParams.get("source")      || ""
  const scheme      = searchParams.get("scheme")      || "" // filter by scheme benefit key
  const page        = Math.max(1, parseInt(searchParams.get("page") || "1"))
  const pageSize    = 50

  const where: any = { isActive: true }

  if (search) {
    where.OR = [
      { name:           { contains: search, mode: "insensitive" } },
      { epicNumber:     { contains: search, mode: "insensitive" } },
      { phone:          { contains: search, mode: "insensitive" } },
      { fatherOrHusband:{ contains: search, mode: "insensitive" } },
      { villageName:    { contains: search, mode: "insensitive" } },
    ]
  }
  if (boothNumber) where.boothNumber = boothNumber
  if (mandalName)  where.mandalName  = { contains: mandalName, mode: "insensitive" }
  if (villageName) where.villageName = { contains: villageName, mode: "insensitive" }
  if (gender)      where.gender      = gender
  if (dataSource)  where.dataSource  = dataSource
  // Scheme filter: check JSON field contains key=true
  if (scheme)      where.schemeBenefits = { path: [scheme], equals: true }

  const [total, citizens] = await Promise.all([
    prisma.citizen.count({ where }),
    prisma.citizen.findMany({
      where,
      orderBy: [{ mandalName: "asc" }, { name: "asc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        booth:     { select: { id: true, boothNumber: true, boothName: true } },
        household: { select: { id: true, houseNumber: true, address: true } },
      },
    }),
  ])

  // Mask phone for FIELD_OFFICER
  const canSeePhone = ["MINISTER", "PA", "ADMIN", "BACK_OFFICER"].includes(user.role)
  const result = canSeePhone
    ? citizens
    : citizens.map(c => ({
        ...c,
        phone:       c.phone ? c.phone.slice(0, 2) + "XXXXXX" + c.phone.slice(-2) : null,
        aadharLast4: undefined,
        epicNumber:  c.epicNumber ? c.epicNumber.slice(0, 3) + "XXXXX" : null,
      }))

  return NextResponse.json({ success: true, citizens: result, total, page, pageSize, totalPages: Math.ceil(total / pageSize) })
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  if (!WRITE_ROLES.includes(user.role))
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

  const body = await req.json()
  const {
    epicNumber, name, fatherOrHusband, age, gender,
    houseNumber, streetColony, villageName, mandalName, district, pincode,
    boothId, boothNumber, householdId,
    phone, whatsappOptIn, aadharLast4,
    schemeBenefits, dataSource,
  } = body

  if (!name?.trim()) return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 })

  // Deduplicate: check EPIC number if provided
  if (epicNumber) {
    const existing = await prisma.citizen.findUnique({ where: { epicNumber } })
    if (existing) return NextResponse.json({ success: false, error: "Citizen with this Voter ID already exists", existingId: existing.id }, { status: 409 })
  }

  const citizen = await prisma.citizen.create({
    data: {
      epicNumber:      epicNumber      ? sanitizeInput(epicNumber)      : null,
      name:            sanitizeInput(name),
      fatherOrHusband: fatherOrHusband ? sanitizeInput(fatherOrHusband) : null,
      age:             age             ? parseInt(age)                  : null,
      gender:          gender          || null,
      houseNumber:     houseNumber     ? sanitizeInput(houseNumber)     : null,
      streetColony:    streetColony    ? sanitizeInput(streetColony)    : null,
      villageName:     villageName     ? sanitizeInput(villageName)     : null,
      mandalName:      mandalName      ? sanitizeInput(mandalName)      : null,
      district:        district        || "Peddapalli",
      pincode:         pincode         ? sanitizeInput(pincode)         : null,
      boothId:         boothId         || null,
      boothNumber:     boothNumber     ? sanitizeInput(boothNumber)     : null,
      householdId:     householdId     || null,
      phone:           phone           ? sanitizeInput(phone)           : null,
      whatsappOptIn:   !!whatsappOptIn,
      aadharLast4:     aadharLast4     ? sanitizeInput(aadharLast4)     : null,
      schemeBenefits:  schemeBenefits  || null,
      dataSource:      dataSource      || "MANUAL",
      lastInteraction: new Date(),
      interactionCount: 1,
    },
  })

  await createAuditLog({ action: "CREATE", entityType: "CITIZEN", entityId: citizen.id, userId: user.id, newValues: { name: citizen.name, epicNumber: citizen.epicNumber } })
  return NextResponse.json({ success: true, citizen }, { status: 201 })
}
