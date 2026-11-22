import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser, hasRole } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!hasRole(user, 'MINISTER', 'PA', 'ADMIN')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const mandalName = searchParams.get('mandal')
  if (!mandalName) return NextResponse.json({ error: 'mandal param required' }, { status: 400 })

  const [mandal, works, petitions, leaders] = await Promise.all([
    prisma.mandal.findFirst({
      where: { name: { contains: mandalName, mode: 'insensitive' } },
      include: { villages: true },
    }),
    prisma.publicWork.findMany({
      where: { mandalName: { contains: mandalName, mode: 'insensitive' } },
      select: {
        id: true, title: true, category: true, stage: true,
        sanctionedBudget: true, spentBudget: true,
        villageName: true, stuckReason: true,
        targetCompletionDate: true,
      },
    }),
    prisma.petitionRequest.findMany({
      where: { mandalName: { contains: mandalName, mode: 'insensitive' } },
      select: {
        id: true, applicantName: true, type: true, status: true,
        villageName: true, isOverdue: true, createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
    prisma.localLeader.findMany({
      where: {
        OR: [
          { mandalName: { contains: mandalName, mode: 'insensitive' } },
          { mandal: { name: { contains: mandalName, mode: 'insensitive' } } },
        ],
        isActive: true,
      },
      select: { id: true, name: true, designation: true, villageName: true, phone: true, notes: true },
    }),
  ])

  const totalBudget = works.reduce((s, w) => s + (w.sanctionedBudget || 0), 0)
  const spentBudget = works.reduce((s, w) => s + (w.spentBudget || 0), 0)
  const completedWorks = works.filter(w => w.stage === 'COMPLETED')
  const inProgressWorks = works.filter(w => w.stage === 'IN_PROGRESS')
  const stuckWorks = works.filter(w => w.stage === 'STUCK_DELAYED')
  const resolvedPetitions = petitions.filter(p => p.status === 'RESOLVED' || p.status === 'SANCTIONED')
  const overduePetitions = petitions.filter(p => p.isOverdue)

  // Auto-generate speech points in English and Telugu
  const speechPoints = {
    en: [
      `In ${mandalName} Mandal, our government has sanctioned ₹${(totalBudget / 100000).toFixed(1)} Lakhs across ${works.length} development works.`,
      completedWorks.length > 0
        ? `${completedWorks.length} works are 100% completed and handed over to citizens.`
        : null,
      inProgressWorks.length > 0
        ? `${inProgressWorks.length} works are actively ongoing on the ground.`
        : null,
      stuckWorks.length > 0
        ? `We have identified ${stuckWorks.length} delayed project(s). ${stuckWorks.map(w => w.title).join(', ')}. We are taking immediate action.`
        : 'All sanctioned works are progressing on schedule.',
      `Through our Praja Darbar, we have processed ${petitions.length} public petitions, successfully resolving ${resolvedPetitions.length} cases.`,
      overduePetitions.length > 0
        ? `${overduePetitions.length} cases need urgent follow-up from our office.`
        : null,
      leaders.length > 0
        ? `I want to acknowledge the hard work of our local leaders: ${leaders.slice(0, 3).map(l => `${l.name} (${l.designation})`).join(', ')}.`
        : null,
    ].filter(Boolean),

    te: [
      `${mandalName} మండలంలో మన ప్రభుత్వం ${works.length} అభివృద్ధి పనులకు ₹${(totalBudget / 100000).toFixed(1)} లక్షలు మంజూరు చేసింది.`,
      completedWorks.length > 0
        ? `${completedWorks.length} పనులు 100% పూర్తయి ప్రజలకు అందజేయబడ్డాయి.`
        : null,
      inProgressWorks.length > 0
        ? `${inProgressWorks.length} పనులు నేల మీద చురుగ్గా జరుగుతున్నాయి.`
        : null,
      stuckWorks.length > 0
        ? `${stuckWorks.length} ఆలస్యమైన ప్రాజెక్టులను గుర్తించాం. వెంటనే చర్యలు తీసుకుంటున్నాం.`
        : 'మంజూరైన అన్ని పనులు సకాలంలో జరుగుతున్నాయి.',
      `మన ప్రజా దర్బార్ ద్వారా ${petitions.length} పిటిషన్లు పరిష్కరించాం, ${resolvedPetitions.length} కేసులు విజయవంతంగా పరిష్కరించబడ్డాయి.`,
      overduePetitions.length > 0
        ? `${overduePetitions.length} కేసులకు మన కార్యాలయం నుండి అత్యవసర ఫాలో-అప్ అవసరం.`
        : null,
    ].filter(Boolean),
  }

  return NextResponse.json({
    success: true,
    mandal: mandalName,
    villages: mandal?.villages || [],
    stats: {
      totalWorks: works.length,
      completedWorks: completedWorks.length,
      inProgressWorks: inProgressWorks.length,
      stuckWorks: stuckWorks.length,
      totalBudget,
      spentBudget,
      totalPetitions: petitions.length,
      resolvedPetitions: resolvedPetitions.length,
      overduePetitions: overduePetitions.length,
    },
    works,
    leaders,
    recentPetitions: petitions.slice(0, 10),
    speechPoints,
  })
}
