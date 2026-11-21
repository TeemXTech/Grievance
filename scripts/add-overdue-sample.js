const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function addOverdue() {
  const twelveDaysAgo = new Date(Date.now() - 12 * 24 * 60 * 60 * 1000)

  await prisma.petitionRequest.upsert({
    where: { trackingNumber: 'REQ-MED-2026-099' },
    update: {},
    create: {
      trackingNumber: 'REQ-MED-2026-099',
      type: 'CMRF_MEDICAL',
      title: 'Urgent Accident Medical Bill Relief (Kamineni Hospital)',
      description: 'Accident emergency trauma treatment bills pending reimbursement. Patient in ICU; family submitted all original hospital bills.',
      priority: 'URGENT',
      status: 'ASSIGNED_TO_OFFICIAL',
      applicantName: 'M. Thirupathi',
      applicantPhone: '+91-9848998877',
      mandalName: 'Manthanani',
      villageName: 'Gaddi Keshapur',
      referredByLeaderName: 'Sarpanch K. Ramesh',
      handlingPaName: 'PA Srinivas',
      assignedDepartment: 'Health & Medical Services (DMHO)',
      assignedOfficialName: 'Dr. K. Sudhakar (DMHO Peddapalli)',
      privateNotes: 'CRITICAL: File pending with DMHO office for 12 days without report! PA must call DMHO immediately.',
      requestedAmount: 180000,
      daysAllowed: 5,
      isOverdue: true,
      createdAt: twelveDaysAgo,
    },
  })

  console.log('✅ Overdue test sample added: REQ-MED-2026-099 (12 days old, flagged OVERDUE)')
}

addOverdue().finally(() => prisma.$disconnect())
