import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, hasRole } from '@/lib/auth-middleware'

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!hasRole(user, 'FIELD_OFFICER', 'ADMIN', 'PA', 'MINISTER')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // FIELD_OFFICER sees only their assigned petitions
  // ADMIN/PA/MINISTER see all
  const where = hasRole(user, 'FIELD_OFFICER')
    ? { assignedOfficialId: user.id }
    : {}

  const petitions = await prisma.petitionRequest.findMany({
    where,
    select: {
      id: true,
      trackingNumber: true,
      type: true,
      title: true,
      status: true,
      priority: true,
      applicantName: true,
      applicantPhone: true,
      villageName: true,
      mandalName: true,
      assignedDepartment: true,
      dueDate: true,
      isOverdue: true,
      createdAt: true,
    },
    orderBy: [{ isOverdue: 'desc' }, { priority: 'desc' }, { createdAt: 'desc' }],
    take: 100,
  })

  const works = await prisma.publicWork.findMany({
    where: hasRole(user, 'FIELD_OFFICER') ? {} : {},
    select: {
      id: true,
      workCode: true,
      title: true,
      category: true,
      stage: true,
      villageName: true,
      mandalName: true,
      targetCompletionDate: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return NextResponse.json({
    success: true,
    petitions,
    works,
    summary: {
      totalPetitions: petitions.length,
      overdue: petitions.filter((p) => p.isOverdue).length,
      pending: petitions.filter((p) => p.status === 'SUBMITTED_TO_PA' || p.status === 'ASSIGNED_TO_OFFICIAL').length,
      resolved: petitions.filter((p) => p.status === 'RESOLVED' || p.status === 'SANCTIONED').length,
    },
  })
}
