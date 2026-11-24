import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth-middleware"
import { sanitizeInput } from "@/lib/input-sanitizer"
import { createAuditLog } from "@/lib/audit-log"

const READ_ROLES  = ["MINISTER", "PA", "ADMIN", "BACK_OFFICER"]
const WRITE_ROLES = ["PA", "ADMIN", "BACK_OFFICER"]

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  if (!READ_ROLES.includes(user.role))
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

  const worker = await prisma.partyWorker.findUnique({
    where: { id: params.id },
    include: { partyPost: true, mandal: { select: { id: true, name: true } }, village: { select: { id: true, name: true } } },
  })
  if (!worker) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 })

  const canSeePrivate = ["MINISTER", "PA", "ADMIN"].includes(user.role)
  const result = canSeePrivate
    ? worker
    : { ...worker, privateNotes: undefined, aadharLast4: undefined, voterId: undefined }

  return NextResponse.json({ success: true, worker: result })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  if (!WRITE_ROLES.includes(user.role))
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

  const worker = await prisma.partyWorker.findUnique({ where: { id: params.id } })
  if (!worker) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 })

  const body = await req.json()
  const {
    name, phone, whatsappPhone, email, gender, photoUrl, dateOfBirth,
    partyPostId, postTitle, wing, level,
    district, mandalId, mandalName, villageId, villageName, boothNumber,
    status, joinedPartyOn, voterId, aadharLast4, notes, privateNotes,
  } = body

  // Resolve postTitle if partyPostId changed
  let resolvedPostTitle = postTitle
  if (partyPostId && partyPostId !== worker.partyPostId && !postTitle) {
    const post = await prisma.partyPost.findUnique({ where: { id: partyPostId }, select: { title: true } })
    resolvedPostTitle = post?.title
  }

  const updated = await prisma.partyWorker.update({
    where: { id: params.id },
    data: {
      ...(name          !== undefined && { name:          sanitizeInput(name) }),
      ...(phone         !== undefined && { phone:         sanitizeInput(phone) }),
      ...(whatsappPhone !== undefined && { whatsappPhone: whatsappPhone ? sanitizeInput(whatsappPhone) : null }),
      ...(email         !== undefined && { email:         email ? sanitizeInput(email) : null }),
      ...(gender        !== undefined && { gender }),
      ...(photoUrl      !== undefined && { photoUrl }),
      ...(dateOfBirth   !== undefined && { dateOfBirth:   dateOfBirth ? new Date(dateOfBirth) : null }),
      ...(partyPostId   !== undefined && { partyPostId:   partyPostId || null }),
      ...(resolvedPostTitle !== undefined && { postTitle: resolvedPostTitle ? sanitizeInput(resolvedPostTitle) : null }),
      ...(wing          !== undefined && { wing:          wing ? sanitizeInput(wing) : null }),
      ...(level         !== undefined && { level }),
      ...(district      !== undefined && { district }),
      ...(mandalId      !== undefined && { mandalId:      mandalId || null }),
      ...(mandalName    !== undefined && { mandalName:    mandalName ? sanitizeInput(mandalName) : null }),
      ...(villageId     !== undefined && { villageId:     villageId || null }),
      ...(villageName   !== undefined && { villageName:   villageName ? sanitizeInput(villageName) : null }),
      ...(boothNumber   !== undefined && { boothNumber:   boothNumber ? sanitizeInput(boothNumber) : null }),
      ...(status        !== undefined && { status }),
      ...(joinedPartyOn !== undefined && { joinedPartyOn: joinedPartyOn ? new Date(joinedPartyOn) : null }),
      ...(voterId       !== undefined && { voterId:       voterId ? sanitizeInput(voterId) : null }),
      ...(aadharLast4   !== undefined && { aadharLast4:   aadharLast4 ? sanitizeInput(aadharLast4) : null }),
      ...(notes         !== undefined && { notes:         notes ? sanitizeInput(notes) : null }),
      ...(privateNotes  !== undefined && { privateNotes:  privateNotes ? sanitizeInput(privateNotes) : null }),
      lastActiveAt: new Date(),
    },
    include: { partyPost: true },
  })

  await createAuditLog({ action: "UPDATE", entityType: "PARTY_WORKER", entityId: params.id, userId: user.id, newValues: { status: body.status } })
  return NextResponse.json({ success: true, worker: updated })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  // Only ADMIN can hard-delete; PA can only deactivate
  if (user.role !== "ADMIN")
    return NextResponse.json({ success: false, error: "Only ADMIN can delete workers. Use PATCH status=INACTIVE to deactivate." }, { status: 403 })

  const worker = await prisma.partyWorker.findUnique({ where: { id: params.id } })
  if (!worker) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 })

  await createAuditLog({ action: "DELETE", entityType: "PARTY_WORKER", entityId: params.id, userId: user.id })
  await prisma.partyWorker.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
