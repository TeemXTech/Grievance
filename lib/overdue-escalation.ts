import { prisma } from '@/lib/prisma'

// ─── Petitions ────────────────────────────────────────────────────────────────
async function escalatePetitions(now: Date): Promise<number> {
  const candidates = await prisma.petitionRequest.findMany({
    where: {
      isOverdue: false,
      status: { notIn: ['RESOLVED', 'SANCTIONED', 'CLOSED', 'REJECTED'] },
      dueDate: { lt: now },
    },
    select: { id: true, trackingNumber: true, applicantName: true, type: true, handlingPaId: true },
  })
  if (candidates.length === 0) return 0

  await prisma.petitionRequest.updateMany({
    where: { id: { in: candidates.map(c => c.id) } },
    data: { isOverdue: true },
  })

  const paUsers = await prisma.user.findMany({
    where: { role: 'PA', status: 'active' },
    select: { id: true },
  })

  const notifications = candidates.flatMap(petition =>
    paUsers.map(pa => ({
      type: 'OVERDUE_ALERT',
      title: `Overdue Petition: ${petition.applicantName}`,
      message: `Petition ${petition.trackingNumber} (${petition.type.replace(/_/g, ' ')}) is past its due date and needs immediate follow-up.`,
      userId: pa.id,
      data: { petitionId: petition.id, trackingNumber: petition.trackingNumber },
    }))
  )

  if (notifications.length > 0) {
    await prisma.notification.createMany({ data: notifications, skipDuplicates: true })
  }

  return candidates.length
}

// ─── Tasks ────────────────────────────────────────────────────────────────────
async function escalateTasks(now: Date): Promise<number> {
  const result = await prisma.task.updateMany({
    where: {
      isOverdue: false,
      status: { notIn: ['COMPLETED', 'CANCELLED'] },
      dueDate: { lt: now },
    },
    data: { isOverdue: true },
  })

  if (result.count === 0) return 0

  // Notify PA/ADMIN users about overdue tasks
  const overdueTasksForNotify = await prisma.task.findMany({
    where: { isOverdue: true, status: { notIn: ['COMPLETED', 'CANCELLED'] }, dueDate: { lt: now } },
    select: { id: true, title: true, assignedToId: true, assignedToName: true },
    take: 50,
  })

  const paAdminUsers = await prisma.user.findMany({
    where: { role: { in: ['PA', 'ADMIN'] }, status: 'active' },
    select: { id: true },
  })

  const notifications = overdueTasksForNotify.flatMap(task =>
    paAdminUsers.map(u => ({
      type: 'TASK_OVERDUE',
      title: `Overdue Task: ${task.title}`,
      message: `Task "${task.title}"${task.assignedToName ? ` (assigned to ${task.assignedToName})` : ''} is past its deadline.`,
      userId: u.id,
      data: { taskId: task.id },
    }))
  )

  if (notifications.length > 0) {
    await prisma.notification.createMany({ data: notifications, skipDuplicates: true })
  }

  return result.count
}

// ─── Letters ──────────────────────────────────────────────────────────────────
// Letters don't have an isOverdue flag — the nightly briefing counts them live.
// We just return the count so the cron digest can report it.
async function countOverdueLetters(now: Date): Promise<number> {
  return prisma.letter.count({
    where: {
      dueDate: { lt: now },
      status: { notIn: ['FILED', 'CANCELLED', 'ACKNOWLEDGED'] },
    },
  })
}

// ─── Fund Allocations (stuck detection) ───────────────────────────────────────
// A fund is "stuck" if it has been in the same non-terminal status for >30 days
// and isStuck is not already true.
const FUND_STUCK_DAYS = 30
const FUND_TERMINAL_STATUSES = ['COMPLETED', 'CANCELLED']

async function escalateFunds(now: Date): Promise<number> {
  const cutoff = new Date(now)
  cutoff.setDate(cutoff.getDate() - FUND_STUCK_DAYS)

  const candidates = await prisma.fundAllocation.findMany({
    where: {
      isStuck: false,
      status: { notIn: FUND_TERMINAL_STATUSES as any },
      updatedAt: { lt: cutoff },
    },
    select: { id: true, referenceNumber: true, workTitle: true, status: true },
  })

  if (candidates.length === 0) return 0

  await prisma.fundAllocation.updateMany({
    where: { id: { in: candidates.map(c => c.id) } },
    data: { isStuck: true, stuckSince: now },
  })

  const paAdminUsers = await prisma.user.findMany({
    where: { role: { in: ['PA', 'ADMIN'] }, status: 'active' },
    select: { id: true },
  })

  const notifications = candidates.flatMap(fund =>
    paAdminUsers.map(u => ({
      type: 'FUND_STUCK',
      title: `Fund Stuck: ${fund.referenceNumber}`,
      message: `Fund allocation "${fund.workTitle}" (${fund.referenceNumber}) has been in status ${fund.status} for over ${FUND_STUCK_DAYS} days.`,
      userId: u.id,
      data: { fundId: fund.id, referenceNumber: fund.referenceNumber },
    }))
  )

  if (notifications.length > 0) {
    await prisma.notification.createMany({ data: notifications, skipDuplicates: true })
  }

  return candidates.length
}

// ─── Main export ──────────────────────────────────────────────────────────────
export interface OverdueEscalationResult {
  petitionsMarked: number
  tasksMarked: number
  overdueLetters: number
  fundsMarkedStuck: number
  ranAt: string
}

export async function runOverdueEscalation(): Promise<OverdueEscalationResult> {
  const now = new Date()

  const [petitionsMarked, tasksMarked, overdueLetters, fundsMarkedStuck] = await Promise.all([
    escalatePetitions(now),
    escalateTasks(now),
    countOverdueLetters(now),
    escalateFunds(now),
  ])

  return { petitionsMarked, tasksMarked, overdueLetters, fundsMarkedStuck, ranAt: now.toISOString() }
}
