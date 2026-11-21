const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Seeding Phase 1: Real-World Constituency & Grievance Data...')

  // 1. Password hash for test accounts
  const defaultPasswordHash = await bcrypt.hash('password123', 10)

  // 2. Core Users (Minister, PAs, Government Officials)
  const minister = await prisma.user.upsert({
    where: { email: 'minister@gov.in' },
    update: {},
    create: {
      name: "Hon'ble Minister D. Sridhar Babu",
      email: 'minister@gov.in',
      passwordHash: defaultPasswordHash,
      role: 'MINISTER',
      phone: '+91-9988776655',
      status: 'active',
    },
  })

  const paSrinivas = await prisma.user.upsert({
    where: { email: 'pa.srinivas@gov.in' },
    update: {},
    create: {
      name: 'PA Srinivas',
      email: 'pa.srinivas@gov.in',
      passwordHash: defaultPasswordHash,
      role: 'PA',
      phone: '+91-9849012345',
      status: 'active',
    },
  })

  const paPriya = await prisma.user.upsert({
    where: { email: 'pa.priya@gov.in' },
    update: {},
    create: {
      name: 'PA Priya Sharma',
      email: 'pa.priya@gov.in',
      passwordHash: defaultPasswordHash,
      role: 'PA',
      phone: '+91-9849023456',
      status: 'active',
    },
  })

  const officialMro = await prisma.user.upsert({
    where: { email: 'mro.manthanani@gov.in' },
    update: {},
    create: {
      name: 'Tahsildar / MRO Manthanani',
      email: 'mro.manthanani@gov.in',
      passwordHash: defaultPasswordHash,
      role: 'GOVERNMENT_OFFICIAL',
      phone: '+91-9849034567',
      status: 'active',
    },
  })

  const officialDmho = await prisma.user.upsert({
    where: { email: 'dmho.health@gov.in' },
    update: {},
    create: {
      name: 'Dr. K. Sudhakar (DMHO Peddapalli)',
      email: 'dmho.health@gov.in',
      passwordHash: defaultPasswordHash,
      role: 'GOVERNMENT_OFFICIAL',
      phone: '+91-9849045678',
      status: 'active',
    },
  })

  const officialEeRoads = await prisma.user.upsert({
    where: { email: 'ee.roads@gov.in' },
    update: {},
    create: {
      name: 'Executive Engineer Ramana (PR Roads)',
      email: 'ee.roads@gov.in',
      passwordHash: defaultPasswordHash,
      role: 'GOVERNMENT_OFFICIAL',
      phone: '+91-9849056789',
      status: 'active',
    },
  })

  console.log('✅ Core Users verified (Minister, PAs, Department Officials)')

  // 3. Mandals and Villages
  const mandalManthanani = await prisma.mandal.upsert({
    where: { name: 'Manthanani' },
    update: {},
    create: {
      name: 'Manthanani',
      district: 'Peddapalli',
      code: 'MNT',
    },
  })

  const mandalRamagundam = await prisma.mandal.upsert({
    where: { name: 'Ramagundam' },
    update: {},
    create: {
      name: 'Ramagundam',
      district: 'Peddapalli',
      code: 'RGD',
    },
  })

  const mandalKamanpur = await prisma.mandal.upsert({
    where: { name: 'Kamanpur' },
    update: {},
    create: {
      name: 'Kamanpur',
      district: 'Peddapalli',
      code: 'KMP',
    },
  })

  // Villages in Manthanani
  const villageBittupalli = await prisma.village.upsert({
    where: { name_mandalId: { name: 'Bittupalli', mandalId: mandalManthanani.id } },
    update: {},
    create: {
      name: 'Bittupalli',
      mandalId: mandalManthanani.id,
      pincode: '505184',
      population: 3200,
    },
  })

  const villageArenda = await prisma.village.upsert({
    where: { name_mandalId: { name: 'Arenda', mandalId: mandalManthanani.id } },
    update: {},
    create: {
      name: 'Arenda',
      mandalId: mandalManthanani.id,
      pincode: '505184',
      population: 2450,
    },
  })

  const villageTown = await prisma.village.upsert({
    where: { name_mandalId: { name: 'Manthanani Town', mandalId: mandalManthanani.id } },
    update: {},
    create: {
      name: 'Manthanani Town',
      mandalId: mandalManthanani.id,
      pincode: '505184',
      population: 18500,
    },
  })

  // Village in Ramagundam
  const villageMalkapur = await prisma.village.upsert({
    where: { name_mandalId: { name: 'Malkapur', mandalId: mandalRamagundam.id } },
    update: {},
    create: {
      name: 'Malkapur',
      mandalId: mandalRamagundam.id,
      pincode: '505209',
      population: 4100,
    },
  })

  console.log('✅ Mandals & Villages created')

  // 4. Local Leaders (The Quick-Glance Memory Feature)
  const leaderRamesh = await prisma.localLeader.upsert({
    where: { id: 'leader-ramesh-bittupalli' },
    update: {},
    create: {
      id: 'leader-ramesh-bittupalli',
      name: 'Sarpanch K. Ramesh',
      phone: '+91-9848011223',
      email: 'ramesh.sarpanch@gmail.com',
      designation: 'Sarpanch & Village President',
      partyRole: 'Senior Constituency Leader',
      mandalId: mandalManthanani.id,
      villageId: villageBittupalli.id,
      mandalName: 'Manthanani',
      villageName: 'Bittupalli',
      notes: 'Key community pillar. Strongly supported village drinking water and school modernization.',
      privateNotes: 'Very loyal and responsive. Follow up quickly on any request he brings; influential with 600+ families.',
      isActive: true,
    },
  })

  const leaderLakshmi = await prisma.localLeader.upsert({
    where: { id: 'leader-lakshmi-arenda' },
    update: {},
    create: {
      id: 'leader-lakshmi-arenda',
      name: 'Smt. Lakshmi Devi',
      phone: '+91-9848033445',
      designation: 'MPTC Member',
      partyRole: 'Women Wing Coordinator',
      mandalId: mandalManthanani.id,
      villageId: villageArenda.id,
      mandalName: 'Manthanani',
      villageName: 'Arenda',
      notes: 'Active with DWACRA women self-help groups. Strong voice for healthcare and Anganwadi centers.',
      privateNotes: 'Follow up on primary health center staff vacancy in Arenda.',
      isActive: true,
    },
  })

  const leaderRaju = await prisma.localLeader.upsert({
    where: { id: 'leader-raju-town' },
    update: {},
    create: {
      id: 'leader-raju-town',
      name: 'V. Raju',
      phone: '+91-9848055667',
      designation: 'Constituency Youth President',
      partyRole: 'Youth Coordinator',
      mandalId: mandalManthanani.id,
      villageId: villageTown.id,
      mandalName: 'Manthanani',
      villageName: 'Manthanani Town',
      notes: 'Organizes career counseling and sports tournaments for local college students.',
      privateNotes: 'Coordinates with ITI and Polytechnic colleges for local youth jobs.',
      isActive: true,
    },
  })

  console.log('✅ Local Leaders created (with political notes & contact details)')

  // 5. Petitions & Requests (CMRF, Job, Transfer, Grievance)
  // Request 1: CMRF Heart Surgery
  const reqCmrf = await prisma.petitionRequest.upsert({
    where: { trackingNumber: 'REQ-CMRF-2026-001' },
    update: {},
    create: {
      trackingNumber: 'REQ-CMRF-2026-001',
      type: 'CMRF_MEDICAL',
      title: 'Urgent Heart Surgery Aid at NIMS Hospital',
      description: 'Patient Katta Mallesh requires urgent open-heart surgery at NIMS Hyderabad. Family is below poverty line and unable to afford the ₹2.5 Lakh estimation.',
      priority: 'URGENT',
      status: 'SANCTIONED',
      applicantName: 'Katta Mallesh',
      applicantPhone: '+91-9701123456',
      applicantAadhar: 'XXXX-XXXX-4589',
      applicantAddress: 'H.No 3-45, SC Colony, Bittupalli Village',
      district: 'Peddapalli',
      mandalId: mandalManthanani.id,
      villageId: villageBittupalli.id,
      mandalName: 'Manthanani',
      villageName: 'Bittupalli',
      referredByLeaderId: leaderRamesh.id,
      referredByLeaderName: leaderRamesh.name,
      leaderEndorsementNote: 'Sarpanch Ramesh personally accompanied the family to Praja Darbar.',
      handlingPaId: paSrinivas.id,
      handlingPaName: paSrinivas.name,
      assignedOfficialId: officialDmho.id,
      assignedOfficialName: officialDmho.name,
      assignedDepartment: 'Health & Medical Services (DMHO)',
      privateNotes: 'Minister personally instructed urgent letter to Chief Minister Relief Fund. Sanction letter generated within 48 hours.',
      hospitalName: 'NIMS Hospital, Hyderabad',
      medicalCondition: 'Severe Cardiac Valve Replacement',
      requestedAmount: 250000,
      sanctionedAmount: 150000,
      daysAllowed: 3,
      isOverdue: false,
      resolvedAt: new Date(),
    },
  })

  // Timeline for CMRF Request
  await prisma.requestTimeline.deleteMany({ where: { petitionRequestId: reqCmrf.id } })
  await prisma.requestTimeline.createMany({
    data: [
      {
        petitionRequestId: reqCmrf.id,
        actionTaken: 'Petition received with hospital estimate letter during Praja Darbar',
        fromStatus: 'PENDING',
        toStatus: 'SUBMITTED_TO_PA',
        remarks: 'Verified BPL white ration card and NIMS estimate quotation',
        performedByName: 'PA Srinivas',
        performedByRole: 'PA',
        isPrivateNote: false,
      },
      {
        petitionRequestId: reqCmrf.id,
        actionTaken: 'Minister signed CMRF recommendation letter addressed to CM Office',
        fromStatus: 'SUBMITTED_TO_PA',
        toStatus: 'UNDER_REVIEW',
        remarks: 'Dispatched via special messenger to CMO Secretariat',
        performedByName: "Hon'ble Minister D. Sridhar Babu",
        performedByRole: 'MINISTER',
        isPrivateNote: false,
      },
      {
        petitionRequestId: reqCmrf.id,
        actionTaken: 'CMRF LOC (Letter of Credit) issued for ₹1,50,000 to NIMS Hospital',
        fromStatus: 'UNDER_REVIEW',
        toStatus: 'SANCTIONED',
        remarks: 'Informed family and hospital superintendent. Patient admitted for surgery.',
        performedByName: 'PA Srinivas',
        performedByRole: 'PA',
        isPrivateNote: false,
      },
    ],
  })

  // Request 2: Employee Transfer (Teacher)
  const reqTransfer = await prisma.petitionRequest.upsert({
    where: { trackingNumber: 'REQ-TRF-2026-002' },
    update: {},
    create: {
      trackingNumber: 'REQ-TRF-2026-002',
      type: 'EMPLOYEE_TRANSFER',
      title: 'School Teacher Transfer Request on Spouse Grounds',
      description: 'Smt. Sunitha Rao (SGT Mathematics) requesting transfer from ZPHS Kaleshwaram to ZPHS Manthanani Town to join husband who is working in Manthanani Sub-Registrar Office.',
      priority: 'MEDIUM',
      status: 'UNDER_REVIEW',
      applicantName: 'Smt. Sunitha Rao',
      applicantPhone: '+91-9701234567',
      district: 'Peddapalli',
      mandalId: mandalManthanani.id,
      villageId: villageArenda.id,
      mandalName: 'Manthanani',
      villageName: 'Arenda',
      referredByLeaderId: leaderLakshmi.id,
      referredByLeaderName: leaderLakshmi.name,
      leaderEndorsementNote: 'MPTC Lakshmi Devi recommended considering genuine hardship on spouse grounds.',
      handlingPaId: paPriya.id,
      handlingPaName: paPriya.name,
      assignedDepartment: 'School Education Department / DEO',
      privateNotes: 'Genuine spouse case. Vacancy exists at Manthanani Girl High School. Endorsement letter drafted for DEO.',
      currentPosting: 'ZPHS Kaleshwaram',
      requestedPosting: 'ZPHS Manthanani Girl High School',
      employeeDesignation: 'SGT Teacher (Mathematics)',
      daysAllowed: 14,
      isOverdue: false,
    },
  })

  // Request 3: Youth Job Request
  const reqJob = await prisma.petitionRequest.upsert({
    where: { trackingNumber: 'REQ-JOB-2026-003' },
    update: {},
    create: {
      trackingNumber: 'REQ-JOB-2026-003',
      type: 'JOB_EMPLOYMENT',
      title: 'Technical Job Assistance for Polytechnic Diploma Graduate',
      description: 'Candidate completed Diploma in Mechanical Engineering with 78%. Belongs to agricultural family; seeking technical apprenticeship or private sector placement.',
      priority: 'MEDIUM',
      status: 'ASSIGNED_TO_OFFICIAL',
      applicantName: 'G. Naveen Kumar',
      applicantPhone: '+91-9701345678',
      district: 'Peddapalli',
      mandalId: mandalManthanani.id,
      villageId: villageTown.id,
      mandalName: 'Manthanani',
      villageName: 'Manthanani Town',
      referredByLeaderId: leaderRaju.id,
      referredByLeaderName: leaderRaju.name,
      handlingPaId: paSrinivas.id,
      handlingPaName: paSrinivas.name,
      assignedDepartment: 'Telangana Academy for Skill and Knowledge (TASK)',
      privateNotes: 'Forwarded resume to NTPC Ramagundam contractor coordinator and upcoming District Job Mela.',
      qualification: 'Diploma in Mechanical Engineering (2024)',
      skillsOrResumeNotes: 'AutoCAD, CNC machine operations, industrial safety basics.',
      daysAllowed: 10,
      isOverdue: false,
    },
  })

  // Request 4: Land Passbook Grievance
  const reqLand = await prisma.petitionRequest.upsert({
    where: { trackingNumber: 'REQ-GRV-2026-004' },
    update: {},
    create: {
      trackingNumber: 'REQ-GRV-2026-004',
      type: 'PERSONAL_GRIEVANCE',
      title: 'Pattadar Passbook Boundary Rectification in Sy.No. 142',
      description: 'Elderly farmer P. Venkataiah cultivating 2.2 acres in Bittupalli; neighboring plot boundary entered erroneously during Dharani portal digitization.',
      priority: 'HIGH',
      status: 'ASSIGNED_TO_OFFICIAL',
      applicantName: 'P. Venkataiah',
      applicantPhone: '+91-9701456789',
      district: 'Peddapalli',
      mandalId: mandalManthanani.id,
      villageId: villageBittupalli.id,
      mandalName: 'Manthanani',
      villageName: 'Bittupalli',
      referredByLeaderId: leaderRamesh.id,
      referredByLeaderName: leaderRamesh.name,
      handlingPaId: paSrinivas.id,
      handlingPaName: paSrinivas.name,
      assignedOfficialId: officialMro.id,
      assignedOfficialName: officialMro.name,
      assignedDepartment: 'Revenue Department / Tahsildar Office',
      privateNotes: 'MRO instructed to conduct joint field survey with Mandal Surveyor next Tuesday.',
      daysAllowed: 7,
      isOverdue: false,
    },
  })

  console.log('✅ Petitions created (CMRF Sanctioned, Teacher Transfer, Youth Job, Land Passbook)')

  // 6. Public Works & Constituency Projects
  // Work 1: Road Project (Requested by Sarpanch Ramesh)
  const workRoad = await prisma.publicWork.upsert({
    where: { workCode: 'WRK-RD-2026-001' },
    update: {},
    create: {
      workCode: 'WRK-RD-2026-001',
      title: 'Laying of Blacktop (BT) Road from Bittupalli Gate to SC Colony',
      description: 'Widening and metal-topping of 2.4 km stretch connecting agricultural fields and residential colony to main state highway.',
      category: 'ROADS_BRIDGES',
      stage: 'IN_PROGRESS',
      district: 'Peddapalli',
      mandalId: mandalManthanani.id,
      villageId: villageBittupalli.id,
      mandalName: 'Manthanani',
      villageName: 'Bittupalli',
      estimatedBudget: 4500000,
      sanctionedBudget: 4500000,
      spentBudget: 2800000,
      requestedByLeaderId: leaderRamesh.id,
      requestedByLeaderName: leaderRamesh.name,
      handlingPaId: paSrinivas.id,
      handlingPaName: paSrinivas.name,
      supervisingOfficial: 'Executive Engineer Ramana',
      executingDepartment: 'Panchayat Raj Engineering Department',
      contractorName: 'Sri Sai Infra Constructions',
      contractorPhone: '+91-9440123456',
      privateNotes: 'Contractor warned regarding gravel quality. 60% physical progress achieved; final blacktopping in progress.',
    },
  })

  await prisma.workTimeline.deleteMany({ where: { publicWorkId: workRoad.id } })
  await prisma.workTimeline.createMany({
    data: [
      {
        publicWorkId: workRoad.id,
        stage: 'SANCTIONED',
        percentageDone: 10,
        updateNote: 'Administrative and financial sanction granted for ₹45.00 Lakhs',
        updatedByName: 'PA Srinivas',
        updatedByRole: 'PA',
      },
      {
        publicWorkId: workRoad.id,
        stage: 'IN_PROGRESS',
        percentageDone: 40,
        updateNote: 'Earth widening and double-pipe culvert completed',
        updatedByName: 'Executive Engineer Ramana',
        updatedByRole: 'GOVERNMENT_OFFICIAL',
      },
      {
        publicWorkId: workRoad.id,
        stage: 'IN_PROGRESS',
        percentageDone: 60,
        updateNote: 'Wet Mix Macadam (WMM) layer completed. Bitumen laying scheduled this week.',
        updatedByName: 'Executive Engineer Ramana',
        updatedByRole: 'GOVERNMENT_OFFICIAL',
      },
    ],
  })

  // Work 2: Drinking Water Tank (Requested by MPTC Lakshmi)
  const workWater = await prisma.publicWork.upsert({
    where: { workCode: 'WRK-WTR-2026-002' },
    update: {},
    create: {
      workCode: 'WRK-WTR-2026-002',
      title: 'Construction of 50,000 Liter Overhead Water Tank & Pipeline Extension',
      description: 'Provides clean tap drinking water connection to 420 households in Arenda village under Mission Bhagiratha augmentation scheme.',
      category: 'DRINKING_WATER',
      stage: 'COMPLETED',
      district: 'Peddapalli',
      mandalId: mandalManthanani.id,
      villageId: villageArenda.id,
      mandalName: 'Manthanani',
      villageName: 'Arenda',
      estimatedBudget: 2200000,
      sanctionedBudget: 2200000,
      spentBudget: 2200000,
      requestedByLeaderId: leaderLakshmi.id,
      requestedByLeaderName: leaderLakshmi.name,
      handlingPaId: paPriya.id,
      handlingPaName: paPriya.name,
      supervisingOfficial: 'AEE Mission Bhagiratha',
      executingDepartment: 'Rural Water Supply (RWS)',
      privateNotes: 'Completed on schedule. Invaluable goodwill in village; water pressure tested successfully.',
    },
  })

  // Work 3: School Additional Classrooms (Delayed - Requested by Sarpanch Ramesh)
  const workSchool = await prisma.publicWork.upsert({
    where: { workCode: 'WRK-SCH-2026-003' },
    update: {},
    create: {
      workCode: 'WRK-SCH-2026-003',
      title: 'Construction of 4 Additional Classrooms & Science Lab at ZPHS Bittupalli',
      description: 'Upgrading village high school infrastructure for 320 enrolled students.',
      category: 'EDUCATION_SCHOOLS',
      stage: 'STUCK_DELAYED',
      district: 'Peddapalli',
      mandalId: mandalManthanani.id,
      villageId: villageBittupalli.id,
      mandalName: 'Manthanani',
      villageName: 'Bittupalli',
      estimatedBudget: 3500000,
      sanctionedBudget: 3500000,
      spentBudget: 950000,
      requestedByLeaderId: leaderRamesh.id,
      requestedByLeaderName: leaderRamesh.name,
      handlingPaId: paSrinivas.id,
      handlingPaName: paSrinivas.name,
      supervisingOfficial: 'Executive Engineer (TSEWIDC)',
      executingDepartment: 'Education Infrastructure Corp',
      stuckReason: 'Original contractor stopped work citing cost escalation. Notice issued.',
      privateNotes: 'Collector instructed to forfeit contractor deposit and initiate fresh fast-track tender.',
    },
  })

  console.log('✅ Public Works created (Bittupalli Road, Arenda Water Tank, School Upgrade)')

  // 7. Tour Appointments (Calendar)
  const tour1 = await prisma.tourAppointment.upsert({
    where: { id: 'tour-bittupalli-2026' },
    update: {},
    create: {
      id: 'tour-bittupalli-2026',
      title: 'Village Tour & Praja Darbar in Bittupalli',
      description: 'Minister will review BT road progress, meet local farmers regarding paddy procurement, and address Gram Sabha.',
      eventType: 'VILLAGE_TOUR',
      startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // in 2 days
      endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
      location: 'Gram Panchayat Office, Bittupalli Village',
      mandalName: 'Manthanani',
      villageName: 'Bittupalli',
      linkedLeaderId: leaderRamesh.id,
      linkedLeaderName: leaderRamesh.name,
      status: 'CONFIRMED',
      notes: 'Arrangements by Sarpanch Ramesh. Expected gathering: 350-400 citizens.',
      privateNotes: 'Brief the Minister before arrival: Road is 60% done, CMRF for Mallesh was approved, school contractor issue needs to be addressed with parents committee.',
    },
  })

  console.log('✅ Tour Calendar event created (linked to village & local leader)')
  console.log('🎉 Phase 1 Seeding Complete! All data models populated.')
}

main()
  .catch((e) => {
    console.error('❌ Phase 1 Seed Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
