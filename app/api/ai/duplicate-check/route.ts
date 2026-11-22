import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser, hasRole } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!hasRole(user, 'PA', 'BACK_OFFICER', 'ADMIN', 'MINISTER')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { phone, name, type } = await req.json()
  if (!phone && !name) return NextResponse.json({ duplicates: [] })

  const where: any = {
    status: { notIn: ['RESOLVED', 'SANCTIONED', 'CLOSED', 'REJECTED'] },
  }

  if (phone && name) {
    where.OR = [
      { applicantPhone: phone },
      { applicantName: { contains: name, mode: 'insensitive' } },
    ]
  } else if (phone) {
    where.applicantPhone = phone
  } else {
    where.applicantName = { contains: name, mode: 'insensitive' }
  }

  const duplicates = await prisma.petitionRequest.findMany({
    where,
    select: {
      id: true,
      trackingNumber: true,
      type: true,
      status: true,
      applicantName: true,
      applicantPhone: true,
      createdAt: true,
      assignedDepartment: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  })

  const enriched = duplicates.map(d => ({
    ...d,
    daysAgo: Math.floor((Date.now() - new Date(d.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
    sameType: d.type === type,
  }))

  return NextResponse.json({ success: true, duplicates: enriched, count: enriched.length })
}
