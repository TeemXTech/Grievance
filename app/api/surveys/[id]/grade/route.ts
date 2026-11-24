import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth-middleware"
import { createAuditLog } from "@/lib/audit-log"

const WRITE_ROLES = ["PA", "ADMIN"]

// Grade thresholds
function computeGrade(score: number): string {
  if (score >= 75) return "A" // Stronghold
  if (score >= 55) return "B" // Leaning
  if (score >= 35) return "C" // Swing
  return "D"                  // Critical / Weak
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  if (!WRITE_ROLES.includes(user.role))
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

  const survey = await prisma.survey.findUnique({
    where: { id: params.id },
    include: { questions: true },
  })
  if (!survey) return NextResponse.json({ success: false, error: "Survey not found" }, { status: 404 })

  // Get all responses grouped by booth
  const responses = await prisma.surveyResponse.findMany({
    where: { surveyId: params.id, boothNumber: { not: null } },
  })

  // Group by booth
  const boothMap = new Map<string, { responses: any[]; villageName?: string; mandalName?: string }>()
  for (const r of responses) {
    const key = r.boothNumber!
    if (!boothMap.has(key)) boothMap.set(key, { responses: [], villageName: r.villageName ?? undefined, mandalName: r.mandalName ?? undefined })
    boothMap.get(key)!.responses.push(r)
  }

  const grades = []

  for (const [boothNumber, data] of boothMap) {
    const { responses: boothResponses, villageName, mandalName } = data
    const totalQuestions = survey.questions.length
    if (totalQuestions === 0) continue

    // Score: average positive answer rate across all questions weighted
    let totalWeightedScore = 0
    let totalWeight = 0

    for (const q of survey.questions) {
      const weight = q.weight || 1.0
      totalWeight += weight

      let positiveCount = 0
      for (const r of boothResponses) {
        const answers = r.answers as Record<string, any>
        const answer = answers[q.id]
        if (q.questionType === "YES_NO" && answer === "YES") positiveCount++
        else if (q.questionType === "RATING_1_5" && typeof answer === "number" && answer >= 4) positiveCount++
        else if (q.questionType === "MULTIPLE_CHOICE" && answer) positiveCount++ // any answer = engaged
      }
      const rate = boothResponses.length > 0 ? (positiveCount / boothResponses.length) * 100 : 0
      totalWeightedScore += rate * weight
    }

    const totalScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0
    const grade = computeGrade(totalScore)

    // Get previous grade for drop detection
    const existing = await prisma.boothGrade.findUnique({
      where: { surveyId_boothNumber: { surveyId: params.id, boothNumber } },
    })
    const previousGrade = existing?.grade || null
    // Grade drop = moved from better grade to worse (A→B, B→C, C→D)
    // A=best(1), B=2, C=3, D=worst(4)
    const gradeRank: Record<string, number> = { A: 1, B: 2, C: 3, D: 4 }
    const gradeDrop = previousGrade !== null && gradeRank[grade] > gradeRank[previousGrade]

    const upserted = await prisma.boothGrade.upsert({
      where: { surveyId_boothNumber: { surveyId: params.id, boothNumber } },
      create: {
        surveyId:                params.id,
        boothNumber,
        villageName:             villageName || null,
        mandalName:              mandalName  || null,
        schemePenetrationScore:  totalScore,
        grievanceResolutionScore: 0,
        surveysentimentScore:    totalScore,
        totalScore,
        grade,
        previousGrade,
        gradeDrop,
        responseCount:           boothResponses.length,
        computedAt:              new Date(),
      },
      update: {
        villageName:             villageName || null,
        mandalName:              mandalName  || null,
        schemePenetrationScore:  totalScore,
        surveysentimentScore:    totalScore,
        totalScore,
        previousGrade:           existing?.grade || null,
        grade,
        gradeDrop,
        responseCount:           boothResponses.length,
        computedAt:              new Date(),
      },
    })
    grades.push(upserted)
  }

  await createAuditLog({ action: "GRADE_COMPUTE", entityType: "SURVEY", entityId: params.id, userId: user.id, newValues: { gradesComputed: grades.length } })
  return NextResponse.json({ success: true, gradesComputed: grades.length, grades })
}
