import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser, hasRole } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'
import { askGemini } from '@/lib/gemini'

const READ_ROLES = ['MINISTER', 'PA', 'ADMIN', 'BACK_OFFICER']

export async function POST(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!READ_ROLES.includes(user.role))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { question, format = 'text' } = await req.json()
  if (!question?.trim()) return NextResponse.json({ error: 'question is required' }, { status: 400 })

  // Pull live DB context for the question
  const [
    totalPetitions, overduePetitions, pendingPetitions, resolvedPetitions,
    totalWorks, worksStuck, totalTasks, tasksOverdue,
    totalFunds, fundsStuck, totalLetters, overdueLetters,
    recentPetitions,
  ] = await Promise.all([
    prisma.petitionRequest.count(),
    prisma.petitionRequest.count({ where: { isOverdue: true } }),
    prisma.petitionRequest.count({ where: { status: { in: ['PENDING', 'SUBMITTED_TO_PA', 'UNDER_REVIEW'] } } }),
    prisma.petitionRequest.count({ where: { status: { in: ['RESOLVED', 'SANCTIONED'] } } }),
    prisma.publicWork.count(),
    prisma.publicWork.count({ where: { stage: 'STUCK_DELAYED' } }),
    prisma.task.count({ where: { status: { notIn: ['COMPLETED', 'CANCELLED'] } } }),
    prisma.task.count({ where: { isOverdue: true } }),
    prisma.fundAllocation.count(),
    prisma.fundAllocation.count({ where: { isStuck: true } }),
    prisma.letter.count(),
    prisma.letter.count({ where: { dueDate: { lt: new Date() }, status: { notIn: ['FILED', 'CANCELLED', 'ACKNOWLEDGED'] } } }),
    prisma.petitionRequest.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      select: { trackingNumber: true, type: true, applicantName: true, mandalName: true, status: true, isOverdue: true, priority: true },
    }),
  ])

  const context = `You are the AI assistant for the Minister's office, Telangana Government.
Answer the question using ONLY the live data below. Be concise, factual, and actionable.
Format your answer in clear bullet points. If the data doesn't cover the question, say so honestly.

LIVE DATA:
- Petitions: ${totalPetitions} total | ${pendingPetitions} pending | ${overduePetitions} OVERDUE | ${resolvedPetitions} resolved
- Public Works: ${totalWorks} total | ${worksStuck} stuck/delayed
- Tasks: ${totalTasks} open | ${tasksOverdue} overdue
- Fund Allocations: ${totalFunds} total | ${fundsStuck} stuck
- Letters: ${totalLetters} total | ${overdueLetters} overdue
- Recent petitions: ${recentPetitions.map(p => `[${p.trackingNumber}] ${p.applicantName} (${p.mandalName || 'unknown'}) - ${p.type.replace(/_/g, ' ')} - ${p.status}${p.isOverdue ? ' ⚠️OVERDUE' : ''}`).join(' | ')}

Question from ${user.role} (${user.name}): ${question}`

  try {
    const answer = await askGemini(context)
    return NextResponse.json({ ok: true, answer, source: 'gemini' })
  } catch (err: any) {
    // Structured fallback — still useful without AI
    const q = question.toLowerCase()
    let answer = ''
    if (q.includes('overdue'))   answer = `${overduePetitions} petitions are overdue. ${tasksOverdue} tasks are past deadline.`
    else if (q.includes('work')) answer = `${totalWorks} public works total. ${worksStuck} are stuck or delayed.`
    else if (q.includes('fund')) answer = `${totalFunds} fund allocations. ${fundsStuck} are stuck in bureaucracy.`
    else if (q.includes('letter')) answer = `${totalLetters} letters. ${overdueLetters} have missed their response deadline.`
    else answer = `Petitions: ${totalPetitions} (${overduePetitions} overdue, ${pendingPetitions} pending, ${resolvedPetitions} resolved). Works: ${totalWorks} (${worksStuck} stuck). Tasks: ${totalTasks} open (${tasksOverdue} overdue).`
    return NextResponse.json({ ok: true, answer, source: 'fallback' })
  }
}
