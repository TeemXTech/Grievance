import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, stripPrivateFields } from "@/lib/auth-middleware"
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
  const search      = searchParams.get("search")      || ""
  const status      = searchParams.get("status")      || ""
  const level       = searchParams.get("level")       || ""
  const wing        = searchParams.get("wing")        || ""
  const mandalId    = searchParams.get("mandalId")    || ""
  const villageId   = searchParams.get("villageId")   || ""
  const partyPostId = searchParams.get("partyPostId") || ""
  const page        = Math.max(1, parseInt(searchParams.get("page") || "1"))
  const pageSize    = 50

  const where: any = {}

  if (search) {
    where.OR = [
      { name:        { contains: search, mode: "insensitive" } },
      { phone:       { contains: search, mode: "insensitive" } },
      { mandalName:  { contains: search, mode: "insensitive" } },
      { villageName: { contains: search, mode: "insensitive" } },
      { postTitle:   { contains: search, mode: "insensitive" } },
      { voterId:     { contains: search, mode: "insensitive" } },
    ]
  }
  if (status)      where.status      = status
  if (level)       where.level       = level
  if (wing)        where.wing        = { contains: wing, mode: "insensitive" }
  if (mandalId)    where.mandalId    = mandalId
  if (villageId)   where.villageId   = villageId
  if (partyPostId) where.partyPostId = partyPostId

  const [total, workers] = await Promise.all([
    prisma.partyWorker.count({ where }),
    prisma.partyWorker.findMany({
      where,
      orderBy: [{ level: "asc" }, { name: "asc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { partyPost: { select: { id: true, title: true, wing: true, level: true } } },
    }),
  ])

  const canSeePrivate = ["MINISTER", "PA", "ADMIN"].includes(user.role)
  const result = canSeePrivate
    ? workers
    : workers.map(w => ({ ...w, privateNotes: undefined, aadharLast4: undefined, voterId: undefined }))

  return NextResponse.json({ success: true, workers: result, total, page, pageSize })
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  if (!WRITE_ROLES.includes(user.role))
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

  const body = await req.json()
  const {
    name, phone, whatsappPhone, email, photoUrl, dateOfBirth, gender,
    partyPostId, postTitle, wing, level,
    district, mandalId, mandalName, villageId, villageName, boothNumber,
    joinedPartyOn, voterId, aadharLast4, notes, privateNotes,
  } = body

  if (!name?.trim())  return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 })
  if (!phone?.trim()) return NextResponse.json({ success: false, error: "Phone is required" }, { status: 400 })

  // Resolve postTitle from partyPostId if not provided
  let resolvedPostTitle = postTitle
  if (partyPostId && !resolvedPostTitle) {
    const post = await prisma.partyPost.findUnique({ where: { id: partyPostId }, select: { title: true } })
    resolvedPostTitle = post?.title
  }

  const worker = await prisma.partyWorker.create({
    data: {
      name:          sanitizeInput(name),
      phone:         sanitizeInput(phone),
      whatsappPhone: whatsappPhone ? sanitizeInput(whatsappPhone) : null,
      email:         email         ? sanitizeInput(email)         : null,
      photoUrl:      photoUrl      || null,
      dateOfBirth:   dateOfBirth   ? new Date(dateOfBirth)        : null,
      gender:        gender        || null,
      partyPostId:   partyPostId   || null,
      postTitle:     resolvedPostTitle ? sanitizeInput(resolvedPostTitle) : null,
      wing:          wing          ? sanitizeInput(wing)          : null,
      level:         level         || "MANDAL",
      district:      district      || "Peddapalli",
      mandalId:      mandalId      || null,
      mandalName:    mandalName    ? sanitizeInput(mandalName)    : null,
      villageId:     villageId     || null,
      villageName:   villageName   ? sanitizeInput(villageName)   : null,
      boothNumber:   boothNumber   ? sanitizeInput(boothNumber)   : null,
      joinedPartyOn: joinedPartyOn ? new Date(joinedPartyOn)      : null,
      voterId:       voterId       ? sanitizeInput(voterId)       : null,
      aadharLast4:   aadharLast4   ? sanitizeInput(aadharLast4)   : null,
      notes:         notes         ? sanitizeInput(notes)         : null,
      privateNotes:  privateNotes  ? sanitizeInput(privateNotes)  : null,
      addedById:     user.id,
      addedByName:   user.name,
      lastActiveAt:  new Date(),
    },
    include: { partyPost: { select: { id: true, title: true, wing: true, level: true } } },
  })

  await createAuditLog({ action: "CREATE", entityType: "PARTY_WORKER", entityId: worker.id, userId: user.id, newValues: { name: worker.name, phone: worker.phone } })
  return NextResponse.json({ success: true, worker }, { status: 201 })
}
