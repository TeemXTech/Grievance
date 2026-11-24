import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, hasRole } from "@/lib/auth-middleware"

const READ_ROLES = ["MINISTER", "PA", "ADMIN", "BACK_OFFICER"]

export async function GET(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!hasRole(user, ...READ_ROLES))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const [
    totalCitizens, whatsappOptIn, totalHouseholds, totalBooths,
    byGender, byMandal, byDataSource,
    gradeA, gradeB, gradeC, gradeD,
    criticalBooths, totalPartyWorkers, activeWorkers,
  ] = await Promise.all([
    prisma.citizen.count({ where: { isActive: true } }),
    prisma.citizen.count({ where: { isActive: true, whatsappOptIn: true } }),
    prisma.household.count(),
    prisma.pollingBooth.count({ where: { isActive: true } }),
    prisma.citizen.groupBy({ by: ["gender"], _count: { id: true }, where: { isActive: true, gender: { not: null } } }),
    prisma.citizen.groupBy({ by: ["mandalName"], _count: { id: true }, where: { isActive: true, mandalName: { not: null } }, orderBy: { _count: { id: "desc" } }, take: 10 }),
    prisma.citizen.groupBy({ by: ["dataSource"], _count: { id: true }, where: { isActive: true } }),
    prisma.boothGrade.count({ where: { grade: "A" } }),
    prisma.boothGrade.count({ where: { grade: "B" } }),
    prisma.boothGrade.count({ where: { grade: "C" } }),
    prisma.boothGrade.count({ where: { grade: "D" } }),
    prisma.boothGrade.findMany({
      where: { grade: "D" },
      orderBy: { totalScore: "asc" },
      take: 10,
      select: { boothNumber: true, villageName: true, mandalName: true, totalScore: true, gradeDrop: true, computedAt: true },
    }),
    prisma.partyWorker.count(),
    prisma.partyWorker.count({ where: { status: "ACTIVE" } }),
  ])

  const whatsappRate = totalCitizens > 0 ? +((whatsappOptIn / totalCitizens) * 100).toFixed(1) : 0

  return NextResponse.json({
    success: true,
    citizens: {
      total:        totalCitizens,
      whatsappOptIn,
      whatsappRate,
      byGender:     byGender.map(r => ({ gender: r.gender, count: r._count.id })),
      byMandal:     byMandal.map(r => ({ mandal: r.mandalName!, count: r._count.id })),
      byDataSource: byDataSource.map(r => ({ source: r.dataSource, count: r._count.id })),
    },
    households:   { total: totalHouseholds },
    booths:       { total: totalBooths },
    boothGrades:  { A: gradeA, B: gradeB, C: gradeC, D: gradeD, criticalBooths },
    partyWorkers: { total: totalPartyWorkers, active: activeWorkers },
  })
}
