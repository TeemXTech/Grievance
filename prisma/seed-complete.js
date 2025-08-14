const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Creating comprehensive test data with Indian names...')

  const hashedPassword = await bcrypt.hash('password123', 10)

  // Create Users
  const users = [
    { email: 'admin@example.com', passwordHash: hashedPassword, name: 'Rajesh Kumar', role: 'ADMIN', phone: '9876543210' },
    { email: 'minister@ap.gov.in', passwordHash: hashedPassword, name: 'Hon. Chandrababu Naidu', role: 'MINISTER', phone: '9876543211' },
    { email: 'pa1@ap.gov.in', passwordHash: hashedPassword, name: 'Priya Lakshmi', role: 'PA', phone: '9876543212' },
    { email: 'pa2@ap.gov.in', passwordHash: hashedPassword, name: 'Suresh Reddy', role: 'PA', phone: '9876543213' },
    { email: 'back1@ap.gov.in', passwordHash: hashedPassword, name: 'Lakshmi Devi', role: 'BACK_OFFICER', phone: '9876543214' },
    { email: 'back2@ap.gov.in', passwordHash: hashedPassword, name: 'Venkat Rao', role: 'BACK_OFFICER', phone: '9876543215' },
    { email: 'field1@ap.gov.in', passwordHash: hashedPassword, name: 'Ramesh Kumar', role: 'FIELD_OFFICER', phone: '9876543216' },
    { email: 'field2@ap.gov.in', passwordHash: hashedPassword, name: 'Anjali Patel', role: 'FIELD_OFFICER', phone: '9876543217' },
    { email: 'field3@ap.gov.in', passwordHash: hashedPassword, name: 'Kiran Babu', role: 'FIELD_OFFICER', phone: '9876543218' }
  ]

  for (const userData of users) {
    await prisma.user.upsert({
      where: { email: userData.email },
      update: userData,
      create: userData
    })
    console.log(`✅ User: ${userData.name} (${userData.role})`)
  }

  // Create Categories
  const categories = [
    { name: 'Healthcare', description: 'Medical and health related issues', color: '#10B981' },
    { name: 'Infrastructure', description: 'Roads, water, electricity issues', color: '#3B82F6' },
    { name: 'Education', description: 'School and education related matters', color: '#8B5CF6' },
    { name: 'Employment', description: 'Job and employment issues', color: '#F59E0B' },
    { name: 'Agriculture', description: 'Farming and agriculture support', color: '#059669' },
    { name: 'Social Welfare', description: 'Pension, subsidies, welfare schemes', color: '#DC2626' }
  ]

  for (const categoryData of categories) {
    await prisma.category.upsert({
      where: { name: categoryData.name },
      update: categoryData,
      create: categoryData
    })
  }

  // Get created users and categories
  const createdUsers = await prisma.user.findMany()
  const createdCategories = await prisma.category.findMany()
  
  const minister = createdUsers.find(u => u.role === 'MINISTER')
  const backOfficers = createdUsers.filter(u => u.role === 'BACK_OFFICER')
  const fieldOfficers = createdUsers.filter(u => u.role === 'FIELD_OFFICER')

  // Create Government Projects
  const projects = [
    {
      referenceNumber: 'PROJ-2024-001',
      projectName: 'Hyderabad Metro Phase 2',
      description: 'Extension of metro rail to Shamshabad Airport and surrounding areas',
      ministerName: 'Hon. Chandrababu Naidu',
      status: 'IN_PROGRESS',
      estimatedCost: 250000000,
      actualCost: 180000000,
      startDate: new Date('2024-01-15'),
      completionDate: new Date('2025-12-31'),
      village: 'Shamshabad',
      mandal: 'Shamshabad',
      district: 'Hyderabad',
      beneficiaries: 500000,
      createdBy: backOfficers[0].id,
      assignedToId: fieldOfficers[0].id
    },
    {
      referenceNumber: 'PROJ-2024-002',
      projectName: 'Godavari Lift Irrigation Scheme',
      description: 'Major irrigation project to provide water to drought-prone areas',
      ministerName: 'Hon. Chandrababu Naidu',
      status: 'COMPLETED',
      estimatedCost: 500000000,
      actualCost: 485000000,
      startDate: new Date('2023-03-01'),
      completionDate: new Date('2024-08-31'),
      village: 'Multiple Villages',
      mandal: 'Karimnagar',
      district: 'Karimnagar',
      beneficiaries: 200000,
      createdBy: backOfficers[1].id,
      assignedToId: fieldOfficers[1].id
    },
    {
      referenceNumber: 'PROJ-2024-003',
      projectName: 'Digital Telangana Initiative',
      description: 'Digitization of government services and rural connectivity',
      ministerName: 'Hon. Chandrababu Naidu',
      status: 'YET_TO_COMPLETE',
      estimatedCost: 100000000,
      startDate: new Date('2024-06-01'),
      expectedCompletionDate: new Date('2025-05-31'),
      village: 'All Villages',
      mandal: 'Statewide',
      district: 'All Districts',
      beneficiaries: 3500000,
      createdBy: backOfficers[0].id
    }
  ]

  for (const projectData of projects) {
    await prisma.governmentProject.upsert({
      where: { referenceNumber: projectData.referenceNumber },
      update: projectData,
      create: projectData
    })
    console.log(`✅ Project: ${projectData.projectName}`)
  }

  // Create Grievances with South Indian names
  const grievanceData = [
    {
      title: 'Water Supply Issue in Kondapur',
      description: 'No water supply for the past 15 days in our locality. Residents are facing severe hardship.',
      requesterName: 'Srinivas Reddy',
      requesterPhone: '+919876543201',
      requesterEmail: 'srinivas.reddy@gmail.com',
      village: 'Kondapur',
      mandal: 'Serilingampally',
      district: 'Hyderabad',
      grievanceCategory: 'INFRASTRUCTURE',
      priority: 'HIGH',
      status: 'PENDING'
    },
    {
      title: 'School Building Repair Required',
      description: 'Government school building has damaged roof and walls. Children safety is at risk during monsoon.',
      requesterName: 'Padmavathi Devi',
      requesterPhone: '+919876543202',
      requesterEmail: 'padmavathi.devi@gmail.com',
      village: 'Gachibowli',
      mandal: 'Serilingampally', 
      district: 'Hyderabad',
      grievanceCategory: 'EDUCATION',
      priority: 'URGENT',
      status: 'ASSIGNED',
      assignedToId: fieldOfficers[0].id
    },
    {
      title: 'Medical Equipment Shortage',
      description: 'Primary Health Center lacks basic medical equipment and medicines for treating patients.',
      requesterName: 'Dr. Ramesh Chandra',
      requesterPhone: '+919876543203',
      requesterEmail: 'ramesh.chandra@gmail.com',
      village: 'Madhapur',
      mandal: 'Serilingampally',
      district: 'Hyderabad',
      grievanceCategory: 'HEALTH',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      assignedToId: fieldOfficers[1].id
    },
    {
      title: 'Road Connectivity Problem',
      description: 'Village road is completely damaged making it impossible for vehicles to pass. Affecting daily life.',
      requesterName: 'Krishnamurthy Rao',
      requesterPhone: '+919876543204',
      village: 'Miyapur',
      mandal: 'Balanagar',
      district: 'Hyderabad',
      grievanceCategory: 'INFRASTRUCTURE',
      priority: 'MEDIUM',
      status: 'RESOLVED',
      assignedToId: fieldOfficers[2].id
    },
    {
      title: 'Employment Scheme Registration',
      description: 'Unable to register for MGNREGA scheme. Local officials are not providing proper guidance.',
      requesterName: 'Lakshmi Narayana',
      requesterPhone: '+919876543205',
      village: 'Kukatpally',
      mandal: 'Balanagar',
      district: 'Hyderabad',
      grievanceCategory: 'JOBS',
      priority: 'MEDIUM',
      status: 'PENDING'
    }
  ]

  for (let i = 0; i < grievanceData.length; i++) {
    const data = grievanceData[i]
    const category = createdCategories.find(c => 
      c.name.toLowerCase().includes(data.grievanceCategory.toLowerCase()) ||
      (data.grievanceCategory === 'HEALTH' && c.name === 'Healthcare') ||
      (data.grievanceCategory === 'JOBS' && c.name === 'Employment')
    )
    
    const refNumber = `GRV-2024-${String(i + 1).padStart(3, '0')}`
    await prisma.grievance.upsert({
      where: { referenceNumber: refNumber },
      update: {
        ...data,
        categoryId: category?.id,
        qrCode: `QR-${Date.now()}-${i}`,
        intakeMethod: 'BACK_OFFICE',
        requestOrigin: 'VILLAGE',
        lastActionDate: new Date()
      },
      create: {
        ...data,
        referenceNumber: refNumber,
        categoryId: category?.id,
        qrCode: `QR-${Date.now()}-${i}`,
        intakeMethod: 'BACK_OFFICE',
        requestOrigin: 'VILLAGE',
        lastActionDate: new Date()
      }
    })
    console.log(`✅ Grievance: ${data.title}`)
  }

  // Create Patient Grievances
  const patientData = [
    {
      referenceNumber: 'PAT-2024-001',
      patientName: 'Venkatesh Sharma',
      patientPhone: '+919876543301',
      village: 'Nizampet',
      caretakerName: 'Sudha Sharma',
      caretakerPhone: '+919876543302',
      issue: 'Patient requires immediate surgery but hospital lacks specialist doctor',
      hospital: 'Gandhi Hospital',
      doctor: 'Dr. Prasad',
      status: 'NEW',
      createdBy: backOfficers[0].id
    },
    {
      referenceNumber: 'PAT-2024-002', 
      patientName: 'Meera Devi',
      patientPhone: '+919876543303',
      village: 'Bachupally',
      caretakerName: 'Ravi Kumar',
      caretakerPhone: '+919876543304',
      issue: 'Dialysis machine not working properly, patient condition critical',
      hospital: 'Osmania Hospital',
      doctor: 'Dr. Sunitha',
      status: 'NEW',
      createdBy: backOfficers[1].id
    }
  ]

  for (const patient of patientData) {
    await prisma.patientGrievance.upsert({
      where: { referenceNumber: patient.referenceNumber },
      update: patient,
      create: patient
    })
    console.log(`✅ Patient: ${patient.patientName}`)
  }

  // Create Individual Grievances
  const individualData = [
    {
      name: 'Rajesh Babu',
      mobileNumber: '+919876543401',
      village: 'Kompally',
      contactName: 'Sita Devi',
      contactNumber: '+919876543402',
      office: 'Tehsildar Office',
      subject: 'Land records correction required for property registration',
      createdBy: backOfficers[0].id
    },
    {
      name: 'Anitha Reddy',
      mobileNumber: '+919876543403',
      village: 'Quthbullapur',
      contactName: 'Mahesh Reddy',
      contactNumber: '+919876543404',
      office: 'Revenue Office',
      subject: 'Pension scheme application pending for elderly mother',
      createdBy: backOfficers[1].id
    }
  ]

  for (const individual of individualData) {
    await prisma.individualGrievance.create({ data: individual })
    console.log(`✅ Individual: ${individual.name}`)
  }

  // Create Job Requests
  const jobData = [
    {
      name: 'Suresh Kumar',
      mobileNumber: '+919876543501',
      village: 'Alwal',
      contactName: 'Priya Kumar',
      contactNumber: '+919876543502',
      office: 'Employment Exchange',
      subject: 'Government job recommendation for engineering graduate',
      createdBy: backOfficers[0].id
    },
    {
      name: 'Kavitha Rani',
      mobileNumber: '+919876543503',
      village: 'Bollaram',
      contactName: 'Ramesh Rani',
      contactNumber: '+919876543504',
      office: 'District Collector Office',
      subject: 'Teaching position in government school',
      createdBy: backOfficers[1].id
    }
  ]

  for (const job of jobData) {
    await prisma.jobRequest.create({ data: job })
    console.log(`✅ Job Request: ${job.name}`)
  }

  // Create TTD Requests (if table exists)
  try {
    const ttdData = [
      {
        darshanDate: new Date('2024-12-25'),
        darshanType: 'SARVA_DARSHAN',
        accommodationFrom: new Date('2024-12-24'),
        accommodationTo: new Date('2024-12-26'),
        guests: JSON.stringify([
          { name: 'Venkateswara Rao', age: 45, gender: 'MALE' },
          { name: 'Lakshmi Devi', age: 42, gender: 'FEMALE' },
          { name: 'Sai Kumar', age: 18, gender: 'MALE' }
        ]),
        referenceName: 'Narayana Swamy',
        referenceNumber: '+919876543601',
        referenceVillage: 'Tirupati',
        referenceMandal: 'Tirupati',
        createdBy: backOfficers[0].id
      }
    ]

    for (const ttd of ttdData) {
      await prisma.ttdRequest.create({ data: ttd })
      console.log(`✅ TTD Request created`)
    }
  } catch (error) {
    console.log('⚠️ TTD Request table not available, skipping...')
  }

  // Create Visitor Logs (if table exists)
  try {
    const visitorData = [
      {
        visitorName: 'Srinivasa Rao',
        visitorPhone: '+919876543701',
        visitDate: new Date(),
        purpose: 'Discussed water supply issue in Kondapur',
        status: 'DISCUSSED',
        notes: 'Minister assured action within 7 days'
      },
      {
        visitorName: 'Padmavathi Devi',
        visitorPhone: '+919876543702',
        visitDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        purpose: 'School building repair follow-up',
        status: 'RESOLVED',
        notes: 'Repair work sanctioned, contractor assigned'
      }
    ]

    for (const visitor of visitorData) {
      await prisma.visitorLog.create({ data: visitor })
      console.log(`✅ Visitor: ${visitor.visitorName}`)
    }
  } catch (error) {
    console.log('⚠️ Visitor Log table not available, skipping...')
  }

  console.log('\n🎉 Complete test data created successfully!')
  console.log('\n🔑 Login Credentials:')
  console.log('   Minister: minister@ap.gov.in / password123')
  console.log('   PA Officer: pa1@ap.gov.in / password123') 
  console.log('   Back Officer: back1@ap.gov.in / password123')
  console.log('   Field Officer: field1@ap.gov.in / password123')
  console.log('   Admin: admin@example.com / password123')
  
  console.log('\n📊 Data Summary:')
  console.log(`   - ${users.length} Users created`)
  console.log(`   - ${categories.length} Categories created`)
  console.log(`   - ${projects.length} Government Projects`)
  console.log(`   - ${grievanceData.length} Regular Grievances`)
  console.log(`   - ${patientData.length} Patient Grievances`)
  console.log(`   - ${individualData.length} Individual Grievances`)
  console.log(`   - ${jobData.length} Job Requests`)
  console.log(`   - TTD Requests (skipped - table not available)`)
  console.log(`   - 2 Visitor Logs`)
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })