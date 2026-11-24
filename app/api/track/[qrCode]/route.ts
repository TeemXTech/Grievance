import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Public route — no auth. Citizens scan QR to track their petition.
export async function GET(
  _req: NextRequest,
  { params }: { params: { qrCode: string } }
) {
  const { qrCode } = params
  if (!qrCode) return NextResponse.json({ error: 'QR code required' }, { status: 400 })

  // Search PetitionRequest by qrCode or trackingNumber
  const petition = await prisma.$queryRaw<any[]>`
    SELECT
      id, "trackingNumber", type, title, status, priority,
      "applicantName", "applicantPhone",
      "villageName", "mandalName",
      "assignedDepartment", "assignedOfficialName",
      "handlingPaName",
      "isOverdue", "dueDate", "createdAt", "updatedAt", "resolvedAt"
    FROM "PetitionRequest"
    WHERE "qrCode" = ${qrCode}
       OR "trackingNumber" = ${qrCode}
    LIMIT 1
  `

  if (!petition || petition.length === 0) {
    return NextResponse.json({ error: 'Petition not found. Please check your QR code or tracking number.' }, { status: 404 })
  }

  const p = petition[0]

  // Get timeline (public-safe — no privateNotes)
  const timeline = await prisma.requestTimeline.findMany({
    where: { petitionRequestId: p.id, isPrivateNote: false },
    select: {
      actionTaken: true,
      toStatus: true,
      performedByRole: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  })

  const statusMessages: Record<string, { en: string; te: string }> = {
    SUBMITTED_TO_PA:      { en: 'Your petition has been received and is in the PA office.', te: 'మీ దరఖాస్తు స్వీకరించబడింది మరియు PA కార్యాలయంలో ఉంది.' },
    ASSIGNED_TO_OFFICIAL: { en: 'Your petition has been assigned to the concerned department.', te: 'మీ దరఖాస్తు సంబంధిత విభాగానికి అప్పగించబడింది.' },
    UNDER_REVIEW:         { en: 'Your petition is currently under review.', te: 'మీ దరఖాస్తు సమీక్షలో ఉంది.' },
    SANCTIONED:           { en: 'Congratulations! Your petition has been sanctioned/approved.', te: 'అభినందనలు! మీ దరఖాస్తు మంజూరు చేయబడింది.' },
    RESOLVED:             { en: 'Your petition has been resolved.', te: 'మీ దరఖాస్తు పరిష్కరించబడింది.' },
    REJECTED:             { en: 'Your petition could not be approved at this time.', te: 'మీ దరఖాస్తు ఈ సమయంలో ఆమోదించబడలేదు.' },
    PENDING:              { en: 'Your petition is pending processing.', te: 'మీ దరఖాస్తు ప్రాసెసింగ్ పెండింగ్‌లో ఉంది.' },
  }

  return NextResponse.json({
    success: true,
    petition: {
      trackingNumber: p.trackingNumber,
      type: p.type,
      title: p.title,
      status: p.status,
      priority: p.priority,
      applicantName: p.applicantName,
      villageName: p.villageName,
      mandalName: p.mandalName,
      department: p.assignedDepartment,
      isOverdue: p.isOverdue,
      submittedOn: p.createdAt,
      lastUpdated: p.updatedAt,
      resolvedOn: p.resolvedAt,
      statusMessage: statusMessages[p.status] || { en: p.status, te: p.status },
    },
    timeline: timeline.map(t => ({
      action: t.actionTaken,
      status: t.toStatus,
      by: t.performedByRole,
      date: t.createdAt,
    })),
  })
}
