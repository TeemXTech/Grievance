import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, hasRole } from '@/lib/auth-middleware'

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request)
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  if (!hasRole(user, 'MINISTER', 'PA', 'ADMIN')) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const mandalName = searchParams.get('mandal')

    const where: any = {}
    if (status && status !== 'ALL') where.status = status
    if (priority && priority !== 'ALL') where.priority = priority
    if (mandalName && mandalName !== 'ALL') where.mandalName = mandalName

    const petitions = await prisma.petitionRequest.findMany({
      where,
      include: {
        referredByLeader: { select: { id: true, name: true, designation: true } },
        handlingPa: { select: { id: true, name: true } },
        assignedOfficial: { select: { id: true, name: true } },
        timeline: { orderBy: { createdAt: 'desc' }, take: 3 },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json({ success: true, count: petitions.length, petitions })
  } catch (error: any) {
    console.error('Minister grievances error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
