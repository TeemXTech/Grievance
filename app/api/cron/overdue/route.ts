import { NextRequest, NextResponse } from 'next/server'
import { runOverdueEscalation } from '@/lib/overdue-escalation'
import { getAuthUser } from '@/lib/auth-middleware'
import { createAuditLog } from '@/lib/audit-log'

// Roles allowed to trigger manually from the UI
const MANUAL_TRIGGER_ROLES = ['MINISTER', 'PA', 'ADMIN']

export async function POST(req: NextRequest) {
  // ── Auth: accept CRON_SECRET header (scheduler) OR privileged session (manual) ──
  const authHeader = req.headers.get('authorization') || ''
  const cronSecret = process.env.CRON_SECRET

  const isCronCall = cronSecret && authHeader === `Bearer ${cronSecret}`

  if (!isCronCall) {
    // Fall back to session auth for manual triggers
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (!MANUAL_TRIGGER_ROLES.includes(user.role)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const result = await runOverdueEscalation()

    await createAuditLog({
      action: 'CRON_MANUAL_TRIGGER',
      entityType: 'SYSTEM',
      entityId: 'overdue-escalation',
      userId: user.id,
      newValues: result,
    })

    return NextResponse.json({ success: true, triggeredBy: 'manual', ...result })
  }

  // Cron call — no session available, run directly
  const result = await runOverdueEscalation()

  return NextResponse.json({ success: true, triggeredBy: 'cron', ...result })
}

// GET: health-check / last-run info (session required, PA+ only)
export async function GET(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  if (!MANUAL_TRIGGER_ROLES.includes(user.role)) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  return NextResponse.json({
    success: true,
    endpoint: 'POST /api/cron/overdue',
    description: 'Marks overdue petitions, tasks, and stuck fund allocations. Sends in-app notifications.',
    schedule: 'Daily at 00:05 IST (18:35 UTC previous day)',
    manualTrigger: 'POST with PA/ADMIN/MINISTER session',
    cronTrigger: 'POST with Authorization: Bearer <CRON_SECRET>',
  })
}
