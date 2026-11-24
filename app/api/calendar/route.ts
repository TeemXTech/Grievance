import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, hasRole } from "@/lib/auth-middleware"
import { sanitizeInput } from "@/lib/input-sanitizer"

const READ_ROLES  = ["MINISTER", "PA", "ADMIN", "BACK_OFFICER"]
const WRITE_ROLES = ["PA", "ADMIN"]

export async function GET(request: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  if (!READ_ROLES.includes(user.role))
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const date  = searchParams.get("date")   // YYYY-MM-DD — filter single day
  const month = searchParams.get("month")  // YYYY-MM — filter whole month
  const type  = searchParams.get("type")

  const where: any = {}
  if (type) where.eventType = type

  if (date) {
    const start = new Date(date); start.setHours(0, 0, 0, 0)
    const end   = new Date(date); end.setHours(23, 59, 59, 999)
    where.startDate = { gte: start, lte: end }
  } else if (month) {
    const [y, m] = month.split("-").map(Number)
    const start  = new Date(y, m - 1, 1)
    const end    = new Date(y, m, 0, 23, 59, 59, 999)
    where.startDate = { gte: start, lte: end }
  }

  const canSeePrivate = hasRole(user, "MINISTER", "PA", "ADMIN")

  const events = await prisma.tourAppointment.findMany({
    where,
    orderBy: { startDate: "asc" },
  })

  const result = canSeePrivate ? events : events.map(({ privateNotes, ...e }) => e)
  return NextResponse.json({ success: true, events: result })
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  if (!WRITE_ROLES.includes(user.role))
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

  const body = await request.json()
  const { title, description, eventType = "VILLAGE_TOUR", startDate, endDate, location, mandalName, villageName, linkedLeaderName, vipGuests, notes, privateNotes } = body

  if (!title?.trim())     return NextResponse.json({ success: false, error: "Title is required" }, { status: 400 })
  if (!startDate)         return NextResponse.json({ success: false, error: "startDate is required" }, { status: 400 })
  if (!location?.trim())  return NextResponse.json({ success: false, error: "Location is required" }, { status: 400 })

  const start = new Date(startDate)
  const end   = endDate ? new Date(endDate) : null

  // Conflict detection: check for overlapping events on same day
  if (end) {
    const conflict = await prisma.tourAppointment.findFirst({
      where: {
        status: { not: "CANCELLED" },
        startDate: { lt: end },
        endDate:   { gt: start },
      },
    })
    if (conflict)
      return NextResponse.json({ success: false, error: `Time conflict with existing event: "${conflict.title}"` }, { status: 409 })
  }

  const event = await prisma.tourAppointment.create({
    data: {
      title:            sanitizeInput(title),
      description:      description       ? sanitizeInput(description)       : null,
      eventType,
      startDate:        start,
      endDate:          end,
      location:         sanitizeInput(location),
      mandalName:       mandalName        ? sanitizeInput(mandalName)        : null,
      villageName:      villageName       ? sanitizeInput(villageName)       : null,
      linkedLeaderName: linkedLeaderName  ? sanitizeInput(linkedLeaderName)  : null,
      vipGuests:        vipGuests         ? sanitizeInput(vipGuests)         : null,
      notes:            notes             ? sanitizeInput(notes)             : null,
      privateNotes:     hasRole(user, "MINISTER", "PA", "ADMIN") && privateNotes ? sanitizeInput(privateNotes) : null,
      status:           "SCHEDULED",
      createdById:      user.id,
    },
  })

  return NextResponse.json({ success: true, event }, { status: 201 })
}
