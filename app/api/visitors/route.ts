import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, hasRole } from "@/lib/auth-middleware"
import { sanitizeInput } from "@/lib/input-sanitizer"

// Roles that can READ visitors
const READ_ROLES = ["MINISTER", "PA", "ADMIN", "BACK_OFFICER"]
// Roles that can CREATE visitors
const WRITE_ROLES = ["PA", "ADMIN", "BACK_OFFICER"]

// Generate daily token: VIS-YYYYMMDD-NNNN
async function generateToken(): Promise<string> {
  const today = new Date()
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "")
  const prefix = `VIS-${dateStr}-`

  const last = await prisma.visitorLog.findFirst({
    where: { tokenNumber: { startsWith: prefix } },
    orderBy: { tokenNumber: "desc" },
  })

  let seq = 1
  if (last) {
    const parts = last.tokenNumber.split("-")
    seq = parseInt(parts[parts.length - 1], 10) + 1
  }
  return `${prefix}${String(seq).padStart(4, "0")}`
}

export async function GET(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  if (!READ_ROLES.includes(user.role))
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const search   = searchParams.get("search") || ""
  const status   = searchParams.get("status") || ""
  const type     = searchParams.get("type") || ""
  const date     = searchParams.get("date") || ""   // YYYY-MM-DD
  const page     = Math.max(1, parseInt(searchParams.get("page") || "1"))
  const pageSize = 50

  const where: any = {}

  if (search) {
    where.OR = [
      { visitorName:   { contains: search, mode: "insensitive" } },
      { visitorPhone:  { contains: search, mode: "insensitive" } },
      { tokenNumber:   { contains: search, mode: "insensitive" } },
      { organization:  { contains: search, mode: "insensitive" } },
      { purpose:       { contains: search, mode: "insensitive" } },
    ]
  }
  if (status) where.status = status
  if (type)   where.visitType = type
  if (date) {
    const start = new Date(date)
    const end   = new Date(date)
    end.setDate(end.getDate() + 1)
    where.appointmentDate = { gte: start, lt: end }
  }

  const [total, visitors] = await Promise.all([
    prisma.visitorLog.count({ where }),
    prisma.visitorLog.findMany({
      where,
      orderBy: { appointmentDate: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ])

  // Today's summary counts
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date()
  todayEnd.setHours(23, 59, 59, 999)

  const [todayTotal, todayWaiting, todayInMeeting, todayCompleted] = await Promise.all([
    prisma.visitorLog.count({ where: { appointmentDate: { gte: todayStart, lte: todayEnd } } }),
    prisma.visitorLog.count({ where: { appointmentDate: { gte: todayStart, lte: todayEnd }, status: "WAITING" } }),
    prisma.visitorLog.count({ where: { appointmentDate: { gte: todayStart, lte: todayEnd }, status: "IN_MEETING" } }),
    prisma.visitorLog.count({ where: { appointmentDate: { gte: todayStart, lte: todayEnd }, status: "COMPLETED" } }),
  ])

  return NextResponse.json({
    success: true,
    visitors,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
    todaySummary: { total: todayTotal, waiting: todayWaiting, inMeeting: todayInMeeting, completed: todayCompleted },
  })
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  if (!WRITE_ROLES.includes(user.role))
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

  const body = await req.json()

  const {
    visitorName, visitorPhone, visitorAadhar, visitorAddress,
    organization, visitType, purpose, appointmentDate,
    meetingWith, priorityFlag, grievanceId, projectId,
    petitionId, notes,
  } = body

  if (!visitorName?.trim()) return NextResponse.json({ success: false, error: "Visitor name is required" }, { status: 400 })
  if (!purpose?.trim())     return NextResponse.json({ success: false, error: "Purpose is required" }, { status: 400 })

  const tokenNumber = await generateToken()

  const visitor = await prisma.visitorLog.create({
    data: {
      tokenNumber,
      visitorName:     sanitizeInput(visitorName),
      visitorPhone:    visitorPhone   ? sanitizeInput(visitorPhone)   : null,
      visitorAadhar:   visitorAadhar  ? sanitizeInput(visitorAadhar)  : null,
      visitorAddress:  visitorAddress ? sanitizeInput(visitorAddress) : null,
      organization:    organization   ? sanitizeInput(organization)   : null,
      visitType:       visitType || "WALK_IN",
      purpose:         sanitizeInput(purpose),
      appointmentDate: appointmentDate ? new Date(appointmentDate) : new Date(),
      meetingWith:     meetingWith ? sanitizeInput(meetingWith) : null,
      priorityFlag:    !!priorityFlag,
      status:          "WAITING",
      grievanceId:     grievanceId || null,
      projectId:       projectId   || null,
      petitionId:      petitionId  || null,
      loggedById:      user.id,
      notes:           notes ? sanitizeInput(notes) : null,
    },
  })

  return NextResponse.json({ success: true, visitor }, { status: 201 })
}
