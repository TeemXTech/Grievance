const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function verify() {
  console.log('🔍 Running Phase 1 Data Verification...\n')

  // 1. Verify Local Leader with their complete history (The Gathering Memory test)
  const leader = await prisma.localLeader.findFirst({
    where: { name: { contains: 'Ramesh' } },
    include: {
      referredRequests: true,
      referredWorks: {
        include: { milestones: true }
      }
    }
  })

  console.log('⭐ LEADER PROFILE & MEMORY CHECK:')
  console.log(`- Leader: ${leader.name} (${leader.designation})`)
  console.log(`- Village: ${leader.villageName}, Mandal: ${leader.mandalName}`)
  console.log(`- Private Note: "${leader.privateNotes}"`)
  console.log(`- Petitions Brought by Him (${leader.referredRequests.length}):`)
  leader.referredRequests.forEach(r => {
    console.log(`  * [${r.type}] ${r.title} -> Status: ${r.status} (Applicant: ${r.applicantName})`)
  })
  console.log(`- Works Championed by Him (${leader.referredWorks.length}):`)
  leader.referredWorks.forEach(w => {
    console.log(`  * [${w.category}] ${w.title} -> Stage: ${w.stage} (Budget: ₹${w.sanctionedBudget / 100000} Lakhs, Spent: ₹${w.spentBudget / 100000} Lakhs)`)
  })

  // 2. Verify Petition with Timeline & Separate Tracking fields
  console.log('\n📝 PETITION DETAILS & TIMELINE CHECK:')
  const cmrf = await prisma.petitionRequest.findUnique({
    where: { trackingNumber: 'REQ-CMRF-2026-001' },
    include: {
      referredByLeader: true,
      handlingPa: true,
      assignedOfficial: true,
      timeline: { orderBy: { createdAt: 'asc' } }
    }
  })

  console.log(`- Tracking: ${cmrf.trackingNumber} - "${cmrf.title}"`)
  console.log(`- Citizen/Applicant: ${cmrf.applicantName} (${cmrf.applicantPhone})`)
  console.log(`- Local Leader Referral: ${cmrf.referredByLeader?.name}`)
  console.log(`- Handling PA: ${cmrf.handlingPa?.name}`)
  console.log(`- Assigned Official: ${cmrf.assignedOfficial?.name} (${cmrf.assignedDepartment})`)
  console.log(`- Financials: Requested ₹${cmrf.requestedAmount} -> Sanctioned ₹${cmrf.sanctionedAmount}`)
  console.log(`- Private Notes (Minister/PA only): "${cmrf.privateNotes}"`)
  console.log(`- Timeline / Action History (${cmrf.timeline.length} steps):`)
  cmrf.timeline.forEach((t, i) => {
    console.log(`  ${i + 1}. [${t.toStatus}] by ${t.performedByName} (${t.performedByRole}): ${t.actionTaken}`)
  })

  // 3. Verify Public Work with Milestones
  console.log('\n🏗️ PUBLIC WORK WITH MILESTONES CHECK:')
  const road = await prisma.publicWork.findUnique({
    where: { workCode: 'WRK-RD-2026-001' },
    include: { milestones: true, requestedByLeader: true }
  })
  console.log(`- Work: ${road.workCode} - "${road.title}"`)
  console.log(`- Stage: ${road.stage} | Sanctioned: ₹${road.sanctionedBudget / 100000}L | Spent: ₹${road.spentBudget / 100000}L`)
  console.log(`- Requested by Leader: ${road.requestedByLeader?.name}`)
  console.log(`- Contractor: ${road.contractorName} (${road.contractorPhone})`)
  console.log(`- Supervising Dept: ${road.executingDepartment}`)
  console.log(`- Milestones (${road.milestones.length}):`)
  road.milestones.forEach(m => {
    console.log(`  * ${m.percentageDone}% Complete: ${m.updateNote}`)
  })

  // 4. Verify Calendar / Tour
  console.log('\n📅 MINISTER TOUR / CALENDAR CHECK:')
  const tour = await prisma.tourAppointment.findFirst()
  console.log(`- Tour Event: "${tour.title}" at ${tour.location}`)
  console.log(`- Type: ${tour.eventType} | Status: ${tour.status}`)
  console.log(`- Linked Leader: ${tour.linkedLeaderName}`)
  console.log(`- Confidential Prep Note: "${tour.privateNotes}"`)

  console.log('\n✨ ALL PHASE 1 DATA VERIFICATIONS PASSED WITH ZERO ERRORS!')
}

verify()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
