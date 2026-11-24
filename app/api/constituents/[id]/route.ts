import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth-middleware"
import { sanitizeInput } from "@/lib/input-sanitizer"
import { createAuditLog } from "@/lib/audit-log"

const READ_ROLES  = ["MINISTER", "PA", "ADMIN", "BACK_OFFICER", "FIELD_OFFICER"]
const WRITE_ROLES = ["PA", "ADMIN", "BACK_OFFICER"]

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  if (!READ_ROLES.includes(user.role))
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

  const citizen = await prisma.citizen.findUnique({
    where: { id: params.id },
    include: {
      booth:     true,
      household: { include: { citizens: { select: { id: true, name: true, age: true, gender: true, epicNumber: true } } } },
    },
  })
  if (!citizen) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 })

  // 360° profile: fetch all petitions from this citizen's phone or name+village match
  const petitions = citizen.phone
    ? await prisma.petitionRequest.findMany({
        where: { applicantPhone: citizen.phone },
        orderBy: { createdAt: "desc" },
        take: 20,
        select: { id: true, trackingNumber: true, type: true, title: true, status: true, createdAt: true, resolvedAt: true },
      })
    : []

  // Booth leader for this citizen's booth
  const boothLeader = citizen.boothNumber
    ? await prisma.partyWorker.findFirst({
        where: { boothNumber: citizen.boothNumber, status: "ACTIVE" },
        select: { id: true, name: true, phone: true, postTitle: true },
      })
    : null

  // Mask sensitive fields for FIELD_OFFICER
  const canSeePrivate = ["MINISTER", "PA", "ADMIN", "BACK_OFFICER"].includes(user.role)
  const profile = canSeePrivate
    ? citizen
    : {
        ...citizen,
        phone:       citizen.phone ? citizen.phone.slice(0, 2) + "XXXXXX" + citizen.phone.slice(-2) : null,
        aadharLast4: undefined,
        epicNumber:  citizen.epicNumber ? citizen.epicNumber.slice(0, 3) + "XXXXX" : null,
      }

  return NextResponse.json({ success: true, citizen: profile, petitions, boothLeader })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  if (!WRITE_ROLES.includes(user.role))
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

  const citizen = await prisma.citizen.findUnique({ where: { id: params.id } })
  if (!citizen) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 })

  const body = await req.json()
  const {
    phone, whatsappOptIn, aadharLast4, schemeBenefits,
    householdId, boothId, boothNumber, dataSource,
    age, gender, houseNumber, streetColony,
  } = body

  const updated = await prisma.citizen.update({
    where: { id: params.id },
    data: {
      ...(phone           !== undefined && { phone:           phone ? sanitizeInput(phone) : null }),
      ...(whatsappOptIn   !== undefined && { whatsappOptIn:   !!whatsappOptIn }),
      ...(aadharLast4     !== undefined && { aadharLast4:     aadharLast4 ? sanitizeInput(aadharLast4) : null }),
      ...(schemeBenefits  !== undefined && { schemeBenefits }),
      ...(householdId     !== undefined && { householdId:     householdId || null }),
      ...(boothId         !== undefined && { boothId:         boothId || null }),
      ...(boothNumber     !== undefined && { boothNumber:     boothNumber ? sanitizeInput(boothNumber) : null }),
      ...(dataSource      !== undefined && { dataSource }),
      ...(age             !== undefined && { age:             age ? parseInt(age) : null }),
      ...(gender          !== undefined && { gender }),
      ...(houseNumber     !== undefined && { houseNumber:     houseNumber ? sanitizeInput(houseNumber) : null }),
      ...(streetColony    !== undefined && { streetColony:    streetColony ? sanitizeInput(streetColony) : null }),
      lastInteraction:  new Date(),
      interactionCount: { increment: 1 },
    },
  })

  await createAuditLog({ action: "UPDATE", entityType: "CITIZEN", entityId: params.id, userId: user.id, newValues: { phone: body.phone, schemeBenefits } })
  return NextResponse.json({ success: true, citizen: updated })
}
