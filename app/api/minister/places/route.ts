import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, hasRole } from '@/lib/auth-middleware'

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    if (!hasRole(user, 'MINISTER', 'PA', 'ADMIN')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }
    const mandals = await prisma.mandal.findMany({
      include: {
        villages: true,
        works: {
          select: { id: true, stage: true, sanctionedBudget: true, spentBudget: true },
        },
        petitions: {
          select: { id: true, status: true, isOverdue: true },
        },
        leaders: {
          select: { id: true, name: true, designation: true },
        },
      },
      orderBy: { name: 'asc' },
    })

    const formatted = mandals.map((m) => {
      const totalWorks = m.works.length
      const completedWorks = m.works.filter((w) => w.stage === 'COMPLETED').length
      const inProgressWorks = m.works.filter((w) => w.stage === 'IN_PROGRESS').length
      const stuckWorks = m.works.filter((w) => w.stage === 'STUCK_DELAYED').length
      const totalSanctioned = m.works.reduce((acc, w) => acc + (w.sanctionedBudget || 0), 0)
      const totalSpent = m.works.reduce((acc, w) => acc + (w.spentBudget || 0), 0)

      const totalPetitions = m.petitions.length
      const resolvedPetitions = m.petitions.filter((p) => p.status === 'SANCTIONED' || p.status === 'RESOLVED').length
      const overduePetitions = m.petitions.filter((p) => p.isOverdue).length

      return {
        id: m.id,
        name: m.name,
        district: m.district,
        totalWorks,
        completedWorks,
        inProgressWorks,
        stuckWorks,
        totalSanctioned,
        totalSpent,
        totalPetitions,
        resolvedPetitions,
        overduePetitions,
        leadersCount: m.leaders.length,
        villages: m.villages.map((v) => ({
          id: v.id,
          name: v.name,
          population: v.population || 2500,
        })),
      }
    })

    return NextResponse.json({
      success: true,
      places: formatted,
    })
  } catch (error: any) {
    console.error('Places API error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
