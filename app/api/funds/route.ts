import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth-middleware"
import { sanitizeInput } from "@/lib/input-sanitizer"
import { createAuditLog } from "@/lib/audit-log"

const READ_ROLES  = ["MINISTER", "PA", "ADMIN", "BACK_OFFICER"]
const WRITE_ROLES = ["PA", "ADMIN"]

async function generateRefNumber(scheme: string): Promise<string> {
  const year   = new Date().getFullYear()
  const prefix = `FUND-${scheme}-${year}-`
  const last   = await prisma.fundAllocation.findFirst({
    where: { referenceNumber: { startsWith: prefix } },
    orderBy: { referenceNumber: "desc" },
  })
  const seq = last ? parseInt(last.referenceNumber.split("-").pop()!, 10) + 1 : 1
  return `${prefix}${String(seq).padStart(4, "0")}`
}

export async function GET(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  if (!READ_ROLES.includes(user.role))
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const search = searchParams.get("search") || ""
  const scheme = searchParams.get("scheme") || ""
  const status = searchParams.get("status") || ""
  const fy     = searchParams.get("fy")     || ""
  const stuck  = searchParams.get("stuck")  === "true"
  const page   = Math.max(1, parseInt(searchParams.get("page") || "1"))
  const pageSize = 50

  const where: any = {}
  if (search) {
    where.OR = [
      { workTitle:       { contains: search, mode: "insensitive" } },
      { referenceNumber: { contains: search, mode: "insensitive" } },
      { mandalName:      { contains: search, mode: "insensitive" } },
      { villageName:     { contains: search, mode: "insensitive" } },
    ]
  }
  if (scheme) where.scheme         = scheme
  if (status) where.status         = status
  if (fy)     where.financialYear  = fy
  if (stuck)  where.isStuck        = true

  const canSeePrivate = ["MINISTER", "PA", "ADMIN"].includes(user.role)

  const [total, funds] = await Promise.all([
    prisma.fundAllocation.count({ where }),
    prisma.fundAllocation.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { timeline: { orderBy: { createdAt: "asc" } } },
    }),
  ])

  const result = canSeePrivate ? funds : funds.map(f => ({ ...f, privateNotes: undefined }))
  return NextResponse.json({ success: true, funds: result, total, page, pageSize })
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  if (!WRITE_ROLES.includes(user.role))
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

  const body = await req.json()
  const {
    scheme, financialYear, workTitle, workDescription, category,
    district, mandalName, villageName, wardNumber,
    recommendedAmount, collectorOffice, executingAgency,
    recommendationDate, notes, privateNotes,
  } = body

  if (!workTitle?.trim())       return NextResponse.json({ success: false, error: "Work title is required" }, { status: 400 })
  if (!recommendedAmount)       return NextResponse.json({ success: false, error: "Recommended amount is required" }, { status: 400 })
  if (!financialYear?.trim())   return NextResponse.json({ success: false, error: "Financial year is required" }, { status: 400 })

  const referenceNumber = await generateRefNumber(scheme || "MLACDS")

  const fund = await prisma.fundAllocation.create({
    data: {
      referenceNumber,
      scheme:             scheme          || "MLACDS",
      financialYear:      sanitizeInput(financialYear),
      workTitle:          sanitizeInput(workTitle),
      workDescription:    workDescription ? sanitizeInput(workDescription) : null,
      category:           category        ? sanitizeInput(category)        : null,
      district:           district        || "Peddapalli",
      mandalName:         mandalName      ? sanitizeInput(mandalName)      : null,
      villageName:        villageName     ? sanitizeInput(villageName)     : null,
      wardNumber:         wardNumber      ? sanitizeInput(wardNumber)      : null,
      recommendedAmount:  parseFloat(recommendedAmount),
      collectorOffice:    collectorOffice ? sanitizeInput(collectorOffice) : null,
      executingAgency:    executingAgency ? sanitizeInput(executingAgency) : null,
      recommendationDate: recommendationDate ? new Date(recommendationDate) : new Date(),
      notes:              notes           ? sanitizeInput(notes)           : null,
      privateNotes:       privateNotes    ? sanitizeInput(privateNotes)    : null,
      recommendedById:    user.id,
      recommendedByName:  user.name,
    },
  })

  // Timeline entry
  await prisma.fundTimeline.create({
    data: {
      fundAllocationId: fund.id,
      toStatus:         "RECOMMENDED",
      actionTaken:      "Fund allocation recommended",
      performedByName:  user.name,
      performedByRole:  user.role,
    },
  })

  await createAuditLog({ action: "CREATE", entityType: "FUND_ALLOCATION", entityId: fund.id, userId: user.id, newValues: { referenceNumber: fund.referenceNumber, workTitle: fund.workTitle, recommendedAmount: fund.recommendedAmount } })
  return NextResponse.json({ success: true, fund }, { status: 201 })
}
