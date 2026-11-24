import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth-middleware"
import { sanitizeInput } from "@/lib/input-sanitizer"
import { createAuditLog } from "@/lib/audit-log"

const READ_ROLES  = ["MINISTER", "PA", "ADMIN", "BACK_OFFICER"]
const SUBMIT_ROLES = ["PA", "ADMIN", "BACK_OFFICER", "FIELD_OFFICER"]

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  if (!READ_ROLES.includes(user.role))
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const boothNumber = searchParams.get("booth")   || ""
  const mandalName  = searchParams.get("mandal")  || ""
  const page        = Math.max(1, parseInt(searchParams.get("page") || "1"))
  const pageSize    = 100

  const where: any = { surveyId: params.id }
  if (boothNumber) where.boothNumber = boothNumber
  if (mandalName)  where.mandalName  = { contains: mandalName, mode: "insensitive" }

  const [total, responses] = await Promise.all([
    prisma.surveyResponse.count({ where }),
    prisma.surveyResponse.findMany({
      where,
      orderBy: { collectedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ])

  return NextResponse.json({ success: true, responses, total, page, pageSize })
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  if (!SUBMIT_ROLES.includes(user.role))
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

  const survey = await prisma.survey.findUnique({ where: { id: params.id } })
  if (!survey) return NextResponse.json({ success: false, error: "Survey not found" }, { status: 404 })
  if (survey.status !== "ACTIVE") return NextResponse.json({ success: false, error: "Survey is not active" }, { status: 400 })

  const body = await req.json()
  const { boothNumber, villageName, mandalName, district,
    respondentName, respondentPhone, voterId,
    answers, latitude, longitude } = body

  if (!answers || typeof answers !== "object")
    return NextResponse.json({ success: false, error: "Answers are required" }, { status: 400 })

  const response = await prisma.surveyResponse.create({
    data: {
      surveyId:        params.id,
      boothNumber:     boothNumber     || null,
      villageName:     villageName     ? sanitizeInput(villageName)     : null,
      mandalName:      mandalName      ? sanitizeInput(mandalName)      : null,
      district:        district        || "Peddapalli",
      respondentName:  respondentName  ? sanitizeInput(respondentName)  : null,
      respondentPhone: respondentPhone ? sanitizeInput(respondentPhone) : null,
      voterId:         voterId         ? sanitizeInput(voterId)         : null,
      answers,
      collectedById:   user.id,
      collectedByName: user.name,
      latitude:        latitude        || null,
      longitude:       longitude       || null,
    },
  })

  await createAuditLog({ action: "CREATE", entityType: "SURVEY_RESPONSE", entityId: response.id, userId: user.id, newValues: { surveyId: params.id, boothNumber, mandalName } })
  return NextResponse.json({ success: true, response }, { status: 201 })
}
