import { prisma } from '@/lib/prisma'

// Called lazily on every petition fetch.
// Marks petitions as overdue and creates a notification if not already done today.
export async function runOverdueEscalation(): Promise<number> {
  const now = new Date()

  // Find petitions that should be overdue but aren't marked yet
  const candidates = await prisma.petitionRequest.findMany({
    where: {
      isOverdue: false,
      status: { notIn: ['RESOLVED', 'SANCTIONED', 'CLOSED', 'REJECTED'] },
      dueDate: { lt: now },
    },
    select: { id: true, trackingNumber: true, applicantName: true, type: true, handlingPaId: true },
  })

  if (candidates.length === 0) return 0

  // Mark all as overdue in one query
  await prisma.petitionRequest.updateMany({
    where: { id: { in: candidates.map(c => c.id) } },
    data: { isOverdue: true },
  })

  // Create notifications for PA users
  const paUsers = await prisma.user.findMany({
    where: { role: 'PA', status: 'active' },
    select: { id: true },
  })

  const notifications = []
  for (const petition of candidates) {
    for (const pa of paUsers) {
      notifications.push({
        type: 'OVERDUE_ALERT',
        title: `Overdue: ${petition.applicantName}'s petition`,
        message: `Petition ${petition.trackingNumber} (${petition.type.replace(/_/g, ' ')}) is past its due date and needs immediate follow-up.`,
        userId: pa.id,
        data: { petitionId: petition.id, trackingNumber: petition.trackingNumber },
      })
    }
  }

  if (notifications.length > 0) {
    await prisma.notification.createMany({ data: notifications, skipDuplicates: true })
  }

  return candidates.length
}
