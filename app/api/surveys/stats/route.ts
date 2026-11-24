import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth-middleware"

const READ_ROLES = ["MINISTER", "PA", "ADMIN", "BACK_OFFICER"]

export async function GET(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  if (!READ_ROLES.includes(user.role))
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

  const [totalSurveys, activeSurveys, totalResponses, gradeA, gradeB, gradeC, gradeD, criticalBooths] = await Promise.all([
    prisma.survey.count(),
    prisma.survey.count({ where: { status: "ACTIVE" } }),
    prisma.surveyResponse.count(),
    prisma.boothGrade.count({ where: { grade: "A" } }),
    prisma.boothGrade.count({ where: { grade: "B" } }),
    prisma.boothGrade.count({ where: { grade: "C" } }),
    prisma.boothGrade.count({ where: { grade: "D" } }),
    prisma.boothGrade.findMany({
      where: { grade: "D" },
      orderBy: { totalScore: "asc" },
      take: 10,
      select: { boothNumber: true, villageName: true, mandalName: true, totalScore: true, grade: true, gradeDrop: true },
    }),
  ])

  return NextResponse.json({
    success: true,
    totalSurveys, activeSurveys, totalResponses,
    gradeDistribution: { A: gradeA, B: gradeB, C: gradeC, D: gradeD },
    criticalBooths,
  })
}
