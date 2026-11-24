// prisma/seed-modules-part2.js
// Seeds PartyWorkers, Surveys, FundAllocations, Letters, Visitors, AssemblyQuestions, Campaigns

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function seedPartyWorkers(partyPosts, mandals) {
  const mandalPresident = partyPosts.find(p => p.title === 'Mandal President' && p.wing === 'Main Party')
  const villagePresident = partyPosts.find(p => p.title === 'Village President' && p.wing === 'Main Party')
  const youthPresident = partyPosts.find(p => p.title === 'Youth Wing President')
  const womenSecretary = partyPosts.find(p => p.title === 'Women Wing Secretary')
  const manthani = mandals.find(m => m.name === 'Manthani')
  const peddapalli = mandals.find(m => m.name === 'Peddapalli')

  const workers = [
    { name: 'Sri Ravi Kumar',      phone: '9111111101', gender: 'MALE',   level: 'MANDAL',  mandalName: 'Manthani',   villageName: 'Manthani Town', postId: mandalPresident?.id,  postTitle: 'Mandal President',      wing: 'Main Party',   status: 'ACTIVE' },
    { name: 'Sri Suresh Babu',     phone: '9111111102', gender: 'MALE',   level: 'VILLAGE', mandalName: 'Manthani',   villageName: 'Bittupalli',    postId: villagePresident?.id, postTitle: 'Village President',     wing: 'Main Party',   status: 'ACTIVE' },
    { name: 'Sri Mahesh Yadav',    phone: '9111111103', gender: 'MALE',   level: 'VILLAGE', mandalName: 'Manthani',   villageName: 'Raghavapuram',  postId: villagePresident?.id, postTitle: 'Village President',     wing: 'Main Party',   status: 'ACTIVE' },
    { name: 'Sri Anil Reddy',      phone: '9111111104', gender: 'MALE',   level: 'MANDAL',  mandalName: 'Peddapalli', villageName: 'Peddapalli Town',postId: youthPresident?.id,  postTitle: 'Youth Wing President',  wing: 'Youth Wing',   status: 'ACTIVE' },
    { name: 'Smt. Sunitha Rao',    phone: '9111111105', gender: 'FEMALE', level: 'VILLAGE', mandalName: 'Manthani',   villageName: 'Kondapur',      postId: womenSecretary?.id,  postTitle: 'Women Wing Secretary',  wing: 'Women Wing',   status: 'ACTIVE' },
    { name: 'Sri Prasad Goud',     phone: '9111111106', gender: 'MALE',   level: 'VILLAGE', mandalName: 'Peddapalli', villageName: 'Sultanabad',    postId: villagePresident?.id, postTitle: 'Village President',     wing: 'Main Party',   status: 'ACTIVE' },
    { name: 'Smt. Kavitha Devi',   phone: '9111111107', gender: 'FEMALE', level: 'MANDAL',  mandalName: 'Karimnagar', villageName: 'Karimnagar Town',postId: womenSecretary?.id,  postTitle: 'Women Wing Secretary',  wing: 'Women Wing',   status: 'ACTIVE' },
    { name: 'Sri Ramesh Naik',     phone: '9111111108', gender: 'MALE',   level: 'VILLAGE', mandalName: 'Manthani',   villageName: 'Bittupalli',    postId: null,                 postTitle: 'Booth Committee Chair', wing: 'Main Party',   status: 'ACTIVE' },
    { name: 'Sri Venkatesh Kumar', phone: '9111111109', gender: 'MALE',   level: 'MANDAL',  mandalName: 'Jagtial',    villageName: 'Jagtial Town',  postId: mandalPresident?.id,  postTitle: 'Mandal President',      wing: 'Main Party',   status: 'INACTIVE' },
    { name: 'Smt. Padma Latha',    phone: '9111111110', gender: 'FEMALE', level: 'VILLAGE', mandalName: 'Nizamabad',  villageName: 'Bodhan',        postId: womenSecretary?.id,  postTitle: 'Women Wing Secretary',  wing: 'Women Wing',   status: 'ACTIVE' },
    { name: 'Sri Kishore Babu',    phone: '9111111111', gender: 'MALE',   level: 'VILLAGE', mandalName: 'Warangal',   villageName: 'Hanamkonda',    postId: youthPresident?.id,  postTitle: 'Youth Wing President',  wing: 'Youth Wing',   status: 'ACTIVE' },
    { name: 'Sri Nagaraju',        phone: '9111111112', gender: 'MALE',   level: 'VILLAGE', mandalName: 'Manthani',   villageName: 'Raghavapuram',  postId: null,                 postTitle: 'Booth Committee Chair', wing: 'Main Party',   status: 'ACTIVE' },
  ]

  let count = 0
  for (const w of workers) {
    const exists = await prisma.partyWorker.findFirst({ where: { phone: w.phone } })
    if (!exists) {
      const mandal = mandals.find(m => m.name === w.mandalName)
      await prisma.partyWorker.create({
        data: {
          name:         w.name,
          phone:        w.phone,
          gender:       w.gender,
          level:        w.level,
          mandalId:     mandal?.id || null,
          mandalName:   w.mandalName,
          villageName:  w.villageName,
          partyPostId:  w.postId || null,
          postTitle:    w.postTitle,
          wing:         w.wing,
          status:       w.status,
          district:     'Peddapalli',
          addedByName:  'System Seed',
          lastActiveAt: new Date(),
        }
      })
      count++
    }
  }
  console.log(`  PartyWorker: ${count} created`)
}

async function seedSurveys(paUser) {
  const exists = await prisma.survey.findFirst({ where: { title: 'Constituency Satisfaction Survey 2026' } })
  if (exists) { console.log('  Survey: already exists'); return exists }

  const survey = await prisma.survey.create({
    data: {
      title:         'Constituency Satisfaction Survey 2026',
      description:   'Annual survey to assess citizen satisfaction with government schemes and services in Peddapalli constituency',
      status:        'ACTIVE',
      targetLevel:   'BOOTH',
      languages:     ['en', 'te'],
      startsAt:      new Date('2026-01-01'),
      endsAt:        new Date('2026-12-31'),
      createdById:   paUser.id,
      createdByName: paUser.name,
      questions: {
        create: [
          { orderIndex: 0, questionType: 'YES_NO',    questionText: 'Have you received benefits under any government welfare scheme in the last 12 months?', questionTe: 'మీరు గత 12 నెలల్లో ఏదైనా ప్రభుత్వ సంక్షేమ పథకం కింద ప్రయోజనాలు పొందారా?', isRequired: true,  weight: 2.0 },
          { orderIndex: 1, questionType: 'RATING_1_5', questionText: 'How satisfied are you with the road infrastructure in your area?', questionTe: 'మీ ప్రాంతంలో రోడ్డు మౌలిక సదుపాయాలతో మీరు ఎంత సంతృప్తిగా ఉన్నారు?', isRequired: true,  weight: 1.5 },
          { orderIndex: 2, questionType: 'RATING_1_5', questionText: 'How satisfied are you with the drinking water supply in your area?', questionTe: 'మీ ప్రాంతంలో తాగునీటి సరఫరాతో మీరు ఎంత సంతృప్తిగా ఉన్నారు?', isRequired: true,  weight: 1.5 },
          { orderIndex: 3, questionType: 'YES_NO',    questionText: 'Are you aware of the Rythu Bandhu scheme?', questionTe: 'మీకు రైతు బంధు పథకం గురించి తెలుసా?', isRequired: true,  weight: 1.0 },
          { orderIndex: 4, questionType: 'RATING_1_5', questionText: 'How would you rate the responsiveness of local government officials to your complaints?', questionTe: 'మీ ఫిర్యాదులకు స్థానిక ప్రభుత్వ అధికారుల స్పందనను మీరు ఎలా రేట్ చేస్తారు?', isRequired: true,  weight: 2.0 },
          { orderIndex: 5, questionType: 'YES_NO',    questionText: 'Have you submitted a petition or grievance to the Minister\'s office in the last year?', isRequired: false, weight: 1.0 },
          { orderIndex: 6, questionType: 'MULTIPLE_CHOICE', questionText: 'Which government scheme has benefited you the most?', options: ['Rythu Bandhu', 'Aasara Pension', 'KCR Kit', 'Kalyana Lakshmi', 'None'], isRequired: false, weight: 1.0 },
        ]
      }
    },
    include: { questions: true }
  })
  console.log(`  Survey: 1 created with ${survey.questions.length} questions`)
  return survey
}

async function seedFundAllocations(paUser) {
  const funds = [
    { scheme: 'MLACDS', fy: '2025-26', workTitle: 'BT Road from Main Road to Harijanawada, Bittupalli', category: 'Roads', mandal: 'Manthani', village: 'Bittupalli', amount: 2500000, status: 'WORK_IN_PROGRESS', isStuck: false },
    { scheme: 'MLACDS', fy: '2025-26', workTitle: 'Drinking Water Pipeline Extension, Raghavapuram', category: 'Water', mandal: 'Manthani', village: 'Raghavapuram', amount: 1800000, status: 'ADMIN_SANCTION', isStuck: false },
    { scheme: 'MPLADS', fy: '2025-26', workTitle: 'Community Hall Construction, Kondapur', category: 'Community', mandal: 'Manthani', village: 'Kondapur', amount: 5000000, status: 'TENDER_FLOATED', isStuck: false },
    { scheme: 'MLACDS', fy: '2025-26', workTitle: 'Drainage System Improvement, Sultanabad', category: 'Sanitation', mandal: 'Peddapalli', village: 'Sultanabad', amount: 1200000, status: 'RECOMMENDED', isStuck: false },
    { scheme: 'STATE',  fy: '2025-26', workTitle: 'Primary School Building Renovation, Jammikunta', category: 'Education', mandal: 'Karimnagar', village: 'Jammikunta', amount: 3500000, status: 'TECH_SANCTION', isStuck: false },
    { scheme: 'MLACDS', fy: '2024-25', workTitle: 'Street Lighting, Bodhan Main Road', category: 'Electricity', mandal: 'Nizamabad', village: 'Bodhan', amount: 900000, status: 'COMPLETED', isStuck: false },
    { scheme: 'MPLADS', fy: '2024-25', workTitle: 'Bridge Repair over Godavari Canal, Manthani', category: 'Roads', mandal: 'Manthani', village: 'Manthani Town', amount: 8000000, status: 'LETTER_SENT', isStuck: true, stuckReason: 'Forest clearance pending from DFO office' },
    { scheme: 'STATE',  fy: '2025-26', workTitle: 'PHC Equipment Upgrade, Korutla', category: 'Health', mandal: 'Jagtial', village: 'Korutla', amount: 2000000, status: 'ADMIN_SANCTION', isStuck: false },
  ]

  let count = 0
  for (const f of funds) {
    const exists = await prisma.fundAllocation.findFirst({ where: { workTitle: f.workTitle } })
    if (!exists) {
      const year = new Date().getFullYear()
      const prefix = `FUND-${f.scheme}-${year}-`
      const last = await prisma.fundAllocation.findFirst({ where: { referenceNumber: { startsWith: prefix } }, orderBy: { referenceNumber: 'desc' } })
      const seq = last ? parseInt(last.referenceNumber.split('-').pop(), 10) + 1 : count + 1
      const refNum = `${prefix}${String(seq).padStart(4, '0')}`

      await prisma.fundAllocation.create({
        data: {
          referenceNumber:   refNum,
          scheme:            f.scheme,
          financialYear:     f.fy,
          workTitle:         f.workTitle,
          category:          f.category,
          district:          'Peddapalli',
          mandalName:        f.mandal,
          villageName:       f.village,
          recommendedAmount: f.amount,
          sanctionedAmount:  ['ADMIN_SANCTION','TECH_SANCTION','TENDER_FLOATED','WORK_IN_PROGRESS','COMPLETED'].includes(f.status) ? f.amount : null,
          status:            f.status,
          isStuck:           f.isStuck || false,
          stuckReason:       f.stuckReason || null,
          stuckSince:        f.isStuck ? new Date() : null,
          recommendedById:   paUser.id,
          recommendedByName: paUser.name,
          recommendationDate: new Date(),
        }
      })
      count++
    }
  }
  console.log(`  FundAllocation: ${count} created`)
}

async function seedLetters(paUser) {
  const letters = [
    { dir: 'OUTBOUND', type: 'RECOMMENDATION', subject: 'Recommendation for CMRF Medical Assistance — Sri Ramaiah, Bittupalli', fromName: "Minister's Office", fromDept: "Minister's Secretariat", toName: 'District Collector', toDept: 'Revenue Department, Peddapalli', status: 'DISPATCHED' },
    { dir: 'OUTBOUND', type: 'DO_LETTER',       subject: 'D.O. Letter regarding Road Repair — Manthani to Bittupalli Road', fromName: "Minister's Office", fromDept: "Minister's Secretariat", toName: 'Executive Engineer', toDept: 'Roads & Buildings Department', status: 'APPROVED' },
    { dir: 'INBOUND',  type: 'OFFICIAL_LETTER', subject: 'Status Report on MLACDS Works — Q3 2025-26', fromName: 'District Collector', fromDept: 'Revenue Department, Peddapalli', toName: "Minister's Office", toDept: "Minister's Secretariat", status: 'RECEIVED' },
    { dir: 'OUTBOUND', type: 'REPRESENTATION',  subject: 'Representation to DMHO regarding Medicine Shortage at Manthani PHC', fromName: "Minister's Office", fromDept: "Minister's Secretariat", toName: 'District Medical & Health Officer', toDept: 'Health Department, Peddapalli', status: 'DRAFT' },
    { dir: 'INBOUND',  type: 'OFFICIAL_LETTER', subject: 'Approval of Technical Sanction — Community Hall, Kondapur', fromName: 'Superintending Engineer', fromDept: 'Panchayat Raj Engineering', toName: "Minister's Office", toDept: "Minister's Secretariat", status: 'ACKNOWLEDGED' },
  ]

  let count = 0
  for (const l of letters) {
    const exists = await prisma.letter.findFirst({ where: { subject: l.subject } })
    if (!exists) {
      const year = new Date().getFullYear()
      const dir = l.dir === 'INBOUND' ? 'IN' : 'OUT'
      const prefix = `LTR-${dir}-${year}-`
      const last = await prisma.letter.findFirst({ where: { letterNumber: { startsWith: prefix } }, orderBy: { letterNumber: 'desc' } })
      const seq = last ? parseInt(last.letterNumber.split('-').pop(), 10) + 1 : count + 1
      const letterNumber = `${prefix}${String(seq).padStart(4, '0')}`

      await prisma.letter.create({
        data: {
          letterNumber,
          direction:       l.dir,
          letterType:      l.type,
          status:          l.status,
          subject:         l.subject,
          priority:        'MEDIUM',
          fromName:        l.fromName,
          fromDepartment:  l.fromDept,
          toName:          l.toName,
          toDepartment:    l.toDept,
          letterDate:      new Date(),
          draftedById:     paUser.id,
          draftedByName:   paUser.name,
          dispatchedAt:    l.status === 'DISPATCHED' ? new Date() : null,
          receivedAt:      l.status === 'RECEIVED' || l.status === 'ACKNOWLEDGED' ? new Date() : null,
          acknowledgedAt:  l.status === 'ACKNOWLEDGED' ? new Date() : null,
        }
      })
      count++
    }
  }
  console.log(`  Letter: ${count} created`)
}

async function seedVisitors(backOfficerUser) {
  const visitors = [
    { name: 'Sri Ramaiah Goud',   phone: '9876543201', org: 'Bittupalli Village Committee', type: 'WALK_IN',     purpose: 'Petition for CMRF medical assistance for daughter surgery', status: 'COMPLETED', priority: false },
    { name: 'Smt. Lakshmi Bai',   phone: '9876543210', org: null,                           type: 'WALK_IN',     purpose: 'Enquiry about Kalyana Lakshmi scheme application status',   status: 'COMPLETED', priority: false },
    { name: 'Sri Venkat Reddy',   phone: '9876543211', org: 'Farmers Association',          type: 'APPOINTMENT', purpose: 'Delegation regarding Rythu Bandhu payment delays',           status: 'COMPLETED', priority: false },
    { name: 'Sri MLA Karimnagar', phone: '9876543212', org: 'Telangana Legislature',        type: 'VIP',         purpose: 'Official meeting regarding constituency development funds',   status: 'COMPLETED', priority: true  },
    { name: 'Smt. Padmavathi',    phone: '9876543213', org: null,                           type: 'WALK_IN',     purpose: 'Request for transfer of husband (government teacher)',       status: 'WAITING',   priority: false },
    { name: 'Sri Press Reporter', phone: '9876543214', org: 'Eenadu Newspaper',             type: 'MEDIA',       purpose: 'Interview request regarding constituency development works',  status: 'WAITING',   priority: false },
  ]

  let count = 0
  for (const v of visitors) {
    const exists = await prisma.visitorLog.findFirst({ where: { visitorPhone: v.phone } })
    if (!exists) {
      const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
      const prefix = `VIS-${today}-`
      const last = await prisma.visitorLog.findFirst({ where: { tokenNumber: { startsWith: prefix } }, orderBy: { tokenNumber: 'desc' } })
      const seq = last ? parseInt(last.tokenNumber.split('-').pop(), 10) + 1 : count + 1
      const tokenNumber = `${prefix}${String(seq).padStart(4, '0')}`

      await prisma.visitorLog.create({
        data: {
          tokenNumber,
          visitorName:     v.name,
          visitorPhone:    v.phone,
          organization:    v.org,
          visitType:       v.type,
          purpose:         v.purpose,
          status:          v.status,
          priorityFlag:    v.priority,
          appointmentDate: new Date(),
          checkedInAt:     v.status !== 'WAITING' ? new Date() : null,
          checkedOutAt:    v.status === 'COMPLETED' ? new Date() : null,
          meetingWith:     v.status !== 'WAITING' ? 'PA' : null,
          loggedById:      backOfficerUser.id,
        }
      })
      count++
    }
  }
  console.log(`  VisitorLog: ${count} created`)
}

async function seedAssemblyQuestions(paUser) {
  const questions = [
    {
      num: 'LAQ-2026-0142', session: 'Budget Session 2026', type: 'STARRED',
      subject: 'Status of MLACDS works in Peddapalli constituency',
      text: 'Will the Hon. Minister be pleased to state the total number of works sanctioned under MLACDS in Peddapalli constituency during 2024-25 and 2025-26, the amount sanctioned, amount released, and the current status of each work?',
      mla: 'Sri Ramachandra Rao', constituency: 'Karimnagar', ministry: 'Finance & Planning',
      status: 'UNDER_REVIEW',
    },
    {
      num: 'LCQ-2026-0089', session: 'Budget Session 2026', type: 'UNSTARRED',
      subject: 'Drinking water supply issues in Manthani mandal',
      text: 'What steps has the government taken to address the persistent drinking water supply issues in Manthani mandal, Peddapalli district? When will the pipeline extension work be completed?',
      mla: 'Smt. Vijaya Lakshmi', constituency: 'Manthani', ministry: 'Municipal Administration',
      status: 'SENT_TO_DEPT',
    },
    {
      num: 'LAQ-2026-0198', session: 'Budget Session 2026', type: 'STARRED',
      subject: 'Teacher vacancies in government schools — Peddapalli district',
      text: 'How many teacher posts are vacant in government schools in Peddapalli district? What is the government\'s plan to fill these vacancies and when will recruitment be completed?',
      mla: 'Sri Narasimha Reddy', constituency: 'Peddapalli', ministry: 'Education',
      status: 'RECEIVED',
    },
  ]

  let count = 0
  for (const q of questions) {
    const exists = await prisma.assemblyQuestion.findFirst({ where: { questionNumber: q.num } })
    if (!exists) {
      await prisma.assemblyQuestion.create({
        data: {
          questionNumber:      q.num,
          sessionName:         q.session,
          questionType:        q.type,
          status:              q.status,
          subject:             q.subject,
          questionText:        q.text,
          askedByMLA:          q.mla,
          askedByConstituency: q.constituency,
          ministry:            q.ministry,
          receivedDate:        new Date(),
          answerDueDate:       new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          handledById:         paUser.id,
          handledByName:       paUser.name,
          talkingPoints:       '• Review department records\n• Prepare factual data\n• Highlight government achievements\n• Mention upcoming initiatives\n• Assure timely action',
        }
      })
      count++
    }
  }
  console.log(`  AssemblyQuestion: ${count} created`)
}

async function seedCampaigns(paUser) {
  const campaigns = [
    {
      title:           'Rythu Bandhu Payment Notification — Kharif 2026',
      messageTemplate: 'Dear {{Citizen_Name}}, your Rythu Bandhu payment for Kharif 2026 has been processed. Please check your bank account. For queries contact 1800-XXX-XXXX. — Minister\'s Office, Peddapalli',
      channel:         'WHATSAPP',
      status:          'SENT',
      segmentLabel:    'All farmers in Peddapalli constituency',
      recipientCount:  1250,
      sentCount:       1198,
      failedCount:     52,
    },
    {
      title:           'Grievance Day Announcement — 15th January 2026',
      messageTemplate: 'Dear {{Citizen_Name}}, Hon. Minister will hold a public grievance day on 15th January 2026 at Peddapalli Camp Office, 10 AM to 1 PM. Bring your petition and Aadhar card. — Minister\'s Office',
      channel:         'BOTH',
      status:          'APPROVED',
      segmentLabel:    'All registered citizens — Peddapalli constituency',
      recipientCount:  3400,
      sentCount:       0,
      failedCount:     0,
    },
    {
      title:           'Welfare Scheme Awareness — Aasara Pension',
      messageTemplate: 'Dear {{Citizen_Name}}, if you are above 57 years and not receiving Aasara pension, please visit your nearest MeeSeva center with Aadhar card to apply. — Minister\'s Office, Peddapalli',
      channel:         'SMS',
      status:          'DRAFT',
      segmentLabel:    'Senior citizens above 57 years',
      recipientCount:  0,
      sentCount:       0,
      failedCount:     0,
    },
  ]

  let count = 0
  for (const c of campaigns) {
    const exists = await prisma.campaign.findFirst({ where: { title: c.title } })
    if (!exists) {
      await prisma.campaign.create({
        data: {
          title:           c.title,
          messageTemplate: c.messageTemplate,
          channel:         c.channel,
          status:          c.status,
          segmentLabel:    c.segmentLabel,
          recipientCount:  c.recipientCount,
          sentCount:       c.sentCount,
          failedCount:     c.failedCount,
          createdById:     paUser.id,
          createdByName:   paUser.name,
          approvedById:    c.status === 'APPROVED' || c.status === 'SENT' ? paUser.id : null,
          approvedByName:  c.status === 'APPROVED' || c.status === 'SENT' ? paUser.name : null,
          approvedAt:      c.status === 'APPROVED' || c.status === 'SENT' ? new Date() : null,
          sentAt:          c.status === 'SENT' ? new Date() : null,
        }
      })
      count++
    }
  }
  console.log(`  Campaign: ${count} created`)
}

module.exports = { seedPartyWorkers, seedSurveys, seedFundAllocations, seedLetters, seedVisitors, seedAssemblyQuestions, seedCampaigns }
