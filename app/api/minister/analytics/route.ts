import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, hasRole } from '@/lib/auth-middleware'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    if (!hasRole(user, 'MINISTER', 'PA', 'ADMIN')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const mandal = searchParams.get('mandal') || 'all'
    const village = searchParams.get('village') || 'all'
    const leaderId = searchParams.get('leaderId')

    const leaderWhere: any = { isActive: true }
    if (mandal !== 'all') leaderWhere.mandalName = mandal
    if (village !== 'all') leaderWhere.villageName = village
    if (leaderId) leaderWhere.id = leaderId

    const [leaders, works, petitions] = await Promise.all([
      prisma.localLeader.findMany({
        where: leaderWhere,
        include: {
          referredRequests: {
            orderBy: { createdAt: 'desc' },
          },
          referredWorks: {
            include: { milestones: { orderBy: { createdAt: 'desc' } } },
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.publicWork.findMany(),
      prisma.petitionRequest.findMany(),
    ])

    const totalSpent = works.reduce((acc, w) => acc + (w.spentBudget || 0), 0)
    const totalSanctioned = works.reduce((acc, w) => acc + (w.sanctionedBudget || 0), 0)

    return NextResponse.json({
      success: true,
      totalGrievances: petitions.length,
      resolvedGrievances: petitions.filter((p) => p.status === 'RESOLVED' || p.status === 'SANCTIONED').length,
      pendingGrievances: petitions.filter((p) => p.status !== 'RESOLVED' && p.status !== 'SANCTIONED').length,
      overdueGrievances: petitions.filter((p) => p.isOverdue).length,
      totalWorks: works.length,
      completedWorks: works.filter((w) => w.stage === 'COMPLETED').length,
      inProgressWorks: works.filter((w) => w.stage === 'IN_PROGRESS').length,
      stuckWorks: works.filter((w) => w.stage === 'STUCK_DELAYED').length,
      totalSpent,
      totalSanctioned,
      leaders,
    })
  } catch (error: any) {
    console.error('Minister analytics error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    if (!hasRole(user, 'MINISTER', 'PA', 'ADMIN')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const {
      name,
      phone,
      email,
      designation = 'Village Leader',
      partyRole,
      photoUrl,
      mandalName,
      villageName,
      notes,
      privateNotes,
    } = body

    if (!name || !phone) {
      return NextResponse.json({ success: false, error: 'Name and phone are required.' }, { status: 400 })
    }

    const leader = await prisma.localLeader.create({
      data: {
        name,
        phone,
        email,
        designation,
        partyRole,
        photoUrl,
        mandalName,
        villageName,
        notes,
        privateNotes,
        isActive: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Local leader added successfully',
      leader,
    })
  } catch (error: any) {
    console.error('Error adding local leader:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
