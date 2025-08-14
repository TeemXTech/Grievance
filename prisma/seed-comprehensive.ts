import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting comprehensive seed...')

  // Clear existing data
  await prisma.grievanceUpdate.deleteMany()
  await prisma.document.deleteMany()
  await prisma.grievance.deleteMany()
  await prisma.project.deleteMany()
  await prisma.user.deleteMany()
  await prisma.category.deleteMany()

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: { name: 'Infrastructure', description: 'Roads, bridges, buildings' }
    }),
    prisma.category.create({
      data: { name: 'Healthcare', description: 'Medical facilities and services' }
    }),
    prisma.category.create({
      data: { name: 'Education', description: 'Schools and educational facilities' }
    }),
    prisma.category.create({
      data: { name: 'Utilities', description: 'Water, electricity, sanitation' }
    }),
    prisma.category.create({
      data: { name: 'Agriculture', description: 'Farming and irrigation' }
    })
  ])

  // Create users
  const hashedPassword = await bcrypt.hash('password123', 10)
  
  const users = await Promise.all([
    // Officers
    prisma.user.create({
      data: {
        name: 'Eng. Suresh Kumar',
        email: 'suresh.kumar@gov.in',
        password: hashedPassword,
        role: 'OFFICER',
        phone: '+91-9876543220'
      }
    }),
    prisma.user.create({
      data: {
        name: 'Dr. Lakshmi Prasad',
        email: 'lakshmi.prasad@gov.in',
        password: hashedPassword,
        role: 'OFFICER',
        phone: '+91-9876543221'
      }
    }),
    prisma.user.create({
      data: {
        name: 'Arch. Venkat Rao',
        email: 'venkat.rao@gov.in',
        password: hashedPassword,
        role: 'OFFICER',
        phone: '+91-9876543222'
      }
    }),
    // Public users
    prisma.user.create({
      data: {
        name: 'Smt. Kamala Devi',
        email: 'kamala.devi@example.com',
        password: hashedPassword,
        role: 'PUBLIC',
        phone: '+91-9876543210'
      }
    }),
    prisma.user.create({
      data: {
        name: 'Sri. Venkat Reddy',
        email: 'venkat.reddy@example.com',
        password: hashedPassword,
        role: 'PUBLIC',
        phone: '+91-9876543211'
      }
    }),
    prisma.user.create({
      data: {
        name: 'Sri. Ravi Kumar',
        email: 'ravi.kumar@example.com',
        password: hashedPassword,
        role: 'PUBLIC',
        phone: '+91-9876543212'
      }
    }),
    prisma.user.create({
      data: {
        name: 'Smt. Priya Sharma',
        email: 'priya.sharma@example.com',
        password: hashedPassword,
        role: 'PUBLIC',
        phone: '+91-9876543213'
      }
    }),
    prisma.user.create({
      data: {
        name: 'Sri. Rajesh Gupta',
        email: 'rajesh.gupta@example.com',
        password: hashedPassword,
        role: 'PUBLIC',
        phone: '+91-9876543214'
      }
    })
  ])

  const officers = users.filter(u => u.role === 'OFFICER')
  const publicUsers = users.filter(u => u.role === 'PUBLIC')

  // Create projects
  const projects = await Promise.all([
    prisma.project.create({
      data: {
        title: 'Road Construction - NH 563',
        description: 'Construction of 5km stretch of National Highway 563 connecting Manthanani to Ramagundam',
        budget: 25000000, // 2.5 Cr in paise
        village: 'Manthanani Town',
        mandal: 'Manthanani',
        district: 'Peddapalli',
        state: 'Telangana',
        contractor: 'ABC Construction Ltd',
        startDate: new Date('2023-06-15'),
        expectedEndDate: new Date('2024-03-15'),
        status: 'IN_PROGRESS',
        progress: 75,
        categoryId: categories[0].id,
        assignedOfficerId: officers[0].id,
        workOrderNumber: 'WO/2023/MAN/001',
        issues: JSON.stringify(['Monsoon delay', 'Material shortage'])
      }
    }),
    prisma.project.create({
      data: {
        title: 'Primary Health Center Upgrade',
        description: 'Modernization and equipment upgrade of Ramagundam Primary Health Center',
        budget: 12000000, // 1.2 Cr in paise
        village: 'Ramagundam',
        mandal: 'Ramagundam',
        district: 'Peddapalli',
        state: 'Telangana',
        contractor: 'Health Infra Pvt Ltd',
        startDate: new Date('2023-01-10'),
        completedDate: new Date('2023-11-20'),
        status: 'COMPLETED',
        progress: 100,
        categoryId: categories[1].id,
        assignedOfficerId: officers[1].id,
        workOrderNumber: 'WO/2023/RAM/002'
      }
    }),
    prisma.project.create({
      data: {
        title: 'School Building Construction',
        description: 'Construction of new government high school building in Pegadapally',
        budget: 31000000, // 3.1 Cr in paise
        village: 'Pegadapally',
        mandal: 'Pegadapally',
        district: 'Peddapalli',
        state: 'Telangana',
        contractor: 'Edu Build Solutions',
        startDate: new Date('2023-12-01'),
        expectedEndDate: new Date('2024-08-15'),
        status: 'PLANNING',
        progress: 25,
        categoryId: categories[2].id,
        assignedOfficerId: officers[2].id,
        workOrderNumber: 'WO/2023/PEG/003',
        issues: JSON.stringify(['Land acquisition pending'])
      }
    }),
    prisma.project.create({
      data: {
        title: 'Water Supply Pipeline',
        description: 'Installation of new water supply pipeline network in Jaipur village',
        budget: 8500000, // 85 L in paise
        village: 'Jaipur',
        mandal: 'Jaipur',
        district: 'Peddapalli',
        state: 'Telangana',
        contractor: 'Water Works Ltd',
        startDate: new Date('2024-01-05'),
        expectedEndDate: new Date('2024-06-30'),
        status: 'IN_PROGRESS',
        progress: 15,
        categoryId: categories[3].id,
        assignedOfficerId: officers[0].id,
        workOrderNumber: 'WO/2024/JAI/004'
      }
    }),
    prisma.project.create({
      data: {
        title: 'Community Hall Construction',
        description: 'Construction of multipurpose community hall in Godavarikhani',
        budget: 15000000, // 1.5 Cr in paise
        village: 'Godavarikhani',
        mandal: 'Godavarikhani',
        district: 'Peddapalli',
        state: 'Telangana',
        contractor: 'Community Builders',
        startDate: new Date('2023-09-01'),
        expectedEndDate: new Date('2024-04-30'),
        status: 'IN_PROGRESS',
        progress: 60,
        categoryId: categories[0].id,
        assignedOfficerId: officers[2].id,
        workOrderNumber: 'WO/2023/GOD/005'
      }
    })
  ])

  // Create grievances
  const grievances = await Promise.all([
    prisma.grievance.create({
      data: {
        title: 'Water Supply Issue - Irregular Timing',
        description: 'Water supply is irregular, only 2 hours per day instead of promised 6 hours. Affecting 50+ families in the area.',
        village: 'Jaipur',
        mandal: 'Jaipur',
        district: 'Peddapalli',
        state: 'Telangana',
        address: 'H.No 12-34, Jaipur Village',
        status: 'OPEN',
        priority: 'HIGH',
        categoryId: categories[3].id,
        userId: publicUsers[0].id,
        assignedOfficerId: officers[0].id,
        referenceNumber: 'GRV-2024-JAI-001',
        subcategory: 'Water Supply',
        estimatedCost: 250000, // 2.5 L in paise
        affectedCount: 52,
        attachments: JSON.stringify(['water_tank_empty.jpg', 'complaint_letter.jpg'])
      }
    }),
    prisma.grievance.create({
      data: {
        title: 'Road Repair Needed - Potholes',
        description: 'Multiple potholes on main road causing vehicle damage and accidents. Urgent repair needed for 2 KM stretch.',
        village: 'Godavarikhani',
        mandal: 'Godavarikhani',
        district: 'Peddapalli',
        state: 'Telangana',
        address: 'Main Road, Godavarikhani',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        categoryId: categories[0].id,
        userId: publicUsers[1].id,
        assignedOfficerId: officers[0].id,
        referenceNumber: 'GRV-2024-GOD-002',
        subcategory: 'Roads',
        estimatedCost: 120000, // 1.2 L in paise
        attachments: JSON.stringify(['pothole_damage.jpg', 'road_condition.jpg'])
      }
    }),
    prisma.grievance.create({
      data: {
        title: 'Electricity Problem - Frequent Outages',
        description: 'Frequent power cuts lasting 4-6 hours daily. Transformer issues suspected in the colony area.',
        village: 'Sultanabad',
        mandal: 'Sultanabad',
        district: 'Peddapalli',
        state: 'Telangana',
        address: 'Colony Road, Sultanabad',
        status: 'RESOLVED',
        priority: 'LOW',
        categoryId: categories[3].id,
        userId: publicUsers[2].id,
        assignedOfficerId: officers[1].id,
        referenceNumber: 'GRV-2023-SUL-003',
        subcategory: 'Electricity',
        estimatedCost: 85000, // 85k in paise
        resolutionCost: 85000,
        resolution: 'Transformer replaced, power supply stabilized',
        resolvedAt: new Date('2024-01-08'),
        attachments: JSON.stringify(['old_transformer.jpg', 'new_transformer.jpg'])
      }
    }),
    prisma.grievance.create({
      data: {
        title: 'School Infrastructure Issues',
        description: 'Government school building has leaking roof and broken windows. Students unable to attend classes during monsoon.',
        village: 'Manthanani Town',
        mandal: 'Manthanani',
        district: 'Peddapalli',
        state: 'Telangana',
        address: 'Government High School, Manthanani',
        status: 'OPEN',
        priority: 'HIGH',
        categoryId: categories[2].id,
        userId: publicUsers[3].id,
        assignedOfficerId: officers[2].id,
        referenceNumber: 'GRV-2024-MAN-004',
        subcategory: 'School Buildings',
        estimatedCost: 300000, // 3 L in paise
        affectedCount: 200,
        attachments: JSON.stringify(['roof_leak.jpg', 'broken_windows.jpg'])
      }
    }),
    prisma.grievance.create({
      data: {
        title: 'Drainage System Blockage',
        description: 'Main drainage system blocked causing water logging during rains. Health hazard for residents.',
        village: 'Ramagundam',
        mandal: 'Ramagundam',
        district: 'Peddapalli',
        state: 'Telangana',
        address: 'Market Area, Ramagundam',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        categoryId: categories[3].id,
        userId: publicUsers[4].id,
        assignedOfficerId: officers[0].id,
        referenceNumber: 'GRV-2024-RAM-005',
        subcategory: 'Drainage',
        estimatedCost: 150000, // 1.5 L in paise
        affectedCount: 75,
        attachments: JSON.stringify(['blocked_drain.jpg', 'water_logging.jpg'])
      }
    })
  ])

  // Create grievance updates
  await Promise.all([
    // Updates for first grievance
    prisma.grievanceUpdate.create({
      data: {
        grievanceId: grievances[0].id,
        description: 'Grievance registered and assigned to field officer',
        updatedBy: 'PA Srinivas'
      }
    }),
    prisma.grievanceUpdate.create({
      data: {
        grievanceId: grievances[0].id,
        description: 'Site inspection scheduled for tomorrow',
        updatedBy: 'Field Officer Ramesh',
        createdAt: new Date('2024-01-12')
      }
    }),
    // Updates for second grievance
    prisma.grievanceUpdate.create({
      data: {
        grievanceId: grievances[1].id,
        description: 'Grievance registered and assigned to field officer',
        updatedBy: 'PA Rajesh'
      }
    }),
    prisma.grievanceUpdate.create({
      data: {
        grievanceId: grievances[1].id,
        description: 'Site inspected, estimate prepared',
        updatedBy: 'Field Officer Priya',
        createdAt: new Date('2024-01-08')
      }
    }),
    prisma.grievanceUpdate.create({
      data: {
        grievanceId: grievances[1].id,
        description: 'Work order issued to contractor',
        updatedBy: 'PA Rajesh',
        createdAt: new Date('2024-01-12')
      }
    }),
    // Updates for resolved grievance
    prisma.grievanceUpdate.create({
      data: {
        grievanceId: grievances[2].id,
        description: 'Grievance registered',
        updatedBy: 'PA Srinivas',
        createdAt: new Date('2023-12-20')
      }
    }),
    prisma.grievanceUpdate.create({
      data: {
        grievanceId: grievances[2].id,
        description: 'Technical team inspection completed',
        updatedBy: 'Field Officer Madhavi',
        createdAt: new Date('2023-12-22')
      }
    }),
    prisma.grievanceUpdate.create({
      data: {
        grievanceId: grievances[2].id,
        description: 'New transformer ordered',
        updatedBy: 'PA Srinivas',
        createdAt: new Date('2024-01-05')
      }
    }),
    prisma.grievanceUpdate.create({
      data: {
        grievanceId: grievances[2].id,
        description: 'Transformer installed, issue resolved',
        updatedBy: 'Field Officer Madhavi',
        createdAt: new Date('2024-01-08')
      }
    })
  ])

  // Create documents for projects
  await Promise.all([
    prisma.document.create({
      data: {
        fileName: 'Tender_Document.pdf',
        filePath: '/documents/projects/tender_doc_001.pdf',
        fileType: 'application/pdf',
        projectId: projects[0].id
      }
    }),
    prisma.document.create({
      data: {
        fileName: 'Work_Order.pdf',
        filePath: '/documents/projects/work_order_001.pdf',
        fileType: 'application/pdf',
        projectId: projects[0].id
      }
    }),
    prisma.document.create({
      data: {
        fileName: 'Progress_Report_Dec.pdf',
        filePath: '/documents/projects/progress_report_001.pdf',
        fileType: 'application/pdf',
        projectId: projects[0].id
      }
    }),
    prisma.document.create({
      data: {
        fileName: 'Completion_Certificate.pdf',
        filePath: '/documents/projects/completion_cert_002.pdf',
        fileType: 'application/pdf',
        projectId: projects[1].id
      }
    }),
    prisma.document.create({
      data: {
        fileName: 'Quality_Report.pdf',
        filePath: '/documents/projects/quality_report_002.pdf',
        fileType: 'application/pdf',
        projectId: projects[1].id
      }
    })
  ])

  console.log('✅ Comprehensive seed completed!')
  console.log(`📊 Created:`)
  console.log(`   - ${categories.length} categories`)
  console.log(`   - ${users.length} users (${officers.length} officers, ${publicUsers.length} public)`)
  console.log(`   - ${projects.length} projects`)
  console.log(`   - ${grievances.length} grievances`)
  console.log(`   - Multiple updates and documents`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })