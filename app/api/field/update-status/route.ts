import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, hasRole } from '@/lib/auth-middleware'

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!hasRole(user, 'FIELD_OFFICER', 'ADMIN', 'PA', 'MINISTER')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { petitionId, status, remarks } = await req.json()
  if (!petitionId || !status) {
    return NextResponse.json({ error: 'petitionId and status are required' }, { status: 400 })
  }

  const existing = await prisma.petitionRequest.findUnique({ where: { id: petitionId } })
  if (!existing) return NextResponse.json({ error: 'Petition not found' }, { status: 404 })

  const updated = await prisma.petitionRequest.update({
    where: { id: petitionId },
    data: {
      status,
      lastFollowUpAt: new Date(),
      ...(status === 'RESOLVED' || status === 'SANCTIONED'
        ? { resolvedAt: new Date(), isOverdue: false }
        : {}),
    },
  })

  await prisma.requestTimeline.create({
    data: {
      petitionRequestId: petitionId,
      fromStatus: existing.status,
      toStatus: status,
      actionTaken: remarks || `Status updated to ${status}`,
      performedByName: user.name,
      performedByRole: user.role,
      isPrivateNote: false,
    },
  })

  await prisma.auditLog.create({
    data: {
      action: 'PETITION_STATUS_UPDATE',
      entityType: 'PetitionRequest',
      entityId: petitionId,
      userId: user.id,
      oldValues: { status: existing.status },
      newValues: { status, remarks },
    },
  })

  return NextResponse.json({ success: true, petition: updated })
}
