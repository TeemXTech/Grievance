const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting comprehensive seeding...')

  // Clear existing data
  await prisma.patientGrievance.deleteMany()
  await prisma.individualGrievance.deleteMany()
  await prisma.jobRequest.deleteMany()
  await prisma.ttdRequest.deleteMany()
  await prisma.governmentProject.deleteMany()
  await prisma.grievance.deleteMany()
  await prisma.category.deleteMany()
  await prisma.user.deleteMany()

  // Create Categories
  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'Healthcare', description: 'Medical and health related issues' } }),
    prisma.category.create({ data: { name: 'Infrastructure', description: 'Roads, water, electricity issues' } }),
    prisma.category.create({ data: { name: 'Education', description: 'School and education related matters' } }),
    prisma.category.create({ data: { name: 'Employment', description: 'Job and employment issues' } }),
    prisma.category.create({ data: { name: 'Social Welfare', description: 'Pension, subsidies, welfare schemes' } }),
    prisma.category.create({ data: { name: 'Agriculture', description: 'Farming and agriculture support' } }),
    prisma.category.create({ data: { name: 'TTD Services', description: 'Tirumala temple related services' } }),
    prisma.category.create({ data: { name: 'Public Services', description: 'Government office services' } })
  ])

  // Create Users with different roles
  const hashedPassword = await bcrypt.hash('password123', 10)
  
  const users = await Promise.all([
    // Admin
    prisma.user.create({
      data: {
        email: 'admin@example.com',
        passwordHash: hashedPassword,
        name: 'System Administrator',
        role: 'ADMIN'
      }
    }),
    
    // Minister
    prisma.user.create({
      data: {
        email: 'minister@ap.gov.in',
        passwordHash: hashedPassword,
        name: 'Hon. Minister Rajesh Kumar',
        role: 'MINISTER'
      }
    }),

    // PA Officers
    prisma.user.create({
      data: {
        email: 'pa1@ap.gov.in',
        passwordHash: hashedPassword,
        name: 'PA Officer Priya Sharma',
        role: 'PA'
      }
    }),
    prisma.user.create({
      data: {
        email: 'pa2@ap.gov.in',
        passwordHash: hashedPassword,
        name: 'PA Officer Suresh Reddy',
        role: 'PA'
      }
    }),

    // Back Officers
    prisma.user.create({
      data: {
        email: 'back1@ap.gov.in',
        passwordHash: hashedPassword,
        name: 'Back Officer Lakshmi Devi',
        role: 'BACK_OFFICER'
      }
    }),
    prisma.user.create({
      data: {
        email: 'back2@ap.gov.in',
        passwordHash: hashedPassword,
        name: 'Back Officer Venkat Rao',
        role: 'BACK_OFFICER'
      }
    }),

    // Field Officers
    prisma.user.create({
      data: {
        email: 'field1@ap.gov.in',
        passwordHash: hashedPassword,
        name: 'Field Officer Ramesh Kumar',
        role: 'FIELD_OFFICER'
      }
    }),
    prisma.user.create({
      data: {
        email: 'field2@ap.gov.in',
        passwordHash: hashedPassword,
        name: 'Field Officer Anjali Patel',
        role: 'FIELD_OFFICER'
      }
    }),
    prisma.user.create({
      data: {
        email: 'field3@ap.gov.in',
        passwordHash: hashedPassword,
        name: 'Field Officer Kiran Babu',
        role: 'FIELD_OFFICER'
      }
    }),

    // Public Users
    prisma.user.create({
      data: {
        email: 'public1@example.com',
        passwordHash: hashedPassword,
        name: 'Citizen Ravi Teja',
        role: 'PUBLIC'
      }
    }),
    prisma.user.create({
      data: {
        email: 'public2@example.com',
        passwordHash: hashedPassword,
        name: 'Citizen Meera Devi',
        role: 'PUBLIC'
      }
    })
  ])

  const [admin, minister, pa1, pa2, back1, back2, field1, field2, field3, public1, public2] = users

  // Create Government Projects
  const projects = await Promise.all([
    prisma.governmentProject.create({
      data: {
        referenceNumber: 'PROJ-2024-001',
        projectName: 'Rural Road Development - Phase 1',
        description: 'Construction of 50km rural roads connecting 15 villages',
        ministerName: 'Hon. Minister Rajesh Kumar',
        estimatedCost: 25000000,
        startDate: new Date('2024-01-15'),
        completionDate: new Date('2024-12-31'),
        status: 'IN_PROGRESS',
        district: 'Chittoor',
        village: 'Multiple Villages',
        createdBy: back1.id,
        assignedToId: field1.id
      }
    }),
    prisma.governmentProject.create({
      data: {
        referenceNumber: 'PROJ-2024-002',
        projectName: 'Primary Health Center Upgrade',
        description: 'Modernization of PHC with new equipment and facilities',
        ministerName: 'Hon. Minister Rajesh Kumar',
        estimatedCost: 15000000,
        startDate: new Date('2024-02-01'),
        completionDate: new Date('2024-08-31'),
        status: 'COMPLETED',
        district: 'Tirupati',
        village: 'Chandragiri',
        createdBy: back2.id,
        assignedToId: field2.id
      }
    }),
    prisma.governmentProject.create({
      data: {
        referenceNumber: 'PROJ-2024-003',
        projectName: 'Digital Literacy Program',
        description: 'Computer training for rural youth and women',
        ministerName: 'Hon. Minister Rajesh Kumar',
        estimatedCost: 5000000,
        startDate: new Date('2024-03-01'),
        completionDate: new Date('2024-11-30'),
        status: 'YET_TO_COMPLETE',
        district: 'Chittoor',
        village: 'Palamaner',
        createdBy: back1.id,
        assignedToId: field3.id
      }
    })
  ])

  // Create Regular Grievances
  const grievances = []
  const statuses = ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED']
  const priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']
  const districts = ['Chittoor', 'Tirupati', 'Anantapur', 'Kurnool']
  const villages = ['Chandragiri', 'Palamaner', 'Madanapalle', 'Srikalahasti', 'Puttur']

  for (let i = 1; i <= 25; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const priority = priorities[Math.floor(Math.random() * priorities.length)]
    const category = categories[Math.floor(Math.random() * categories.length)]
    const district = districts[Math.floor(Math.random() * districts.length)]
    const village = villages[Math.floor(Math.random() * villages.length)]
    const submittedBy = Math.random() > 0.5 ? public1.id : public2.id
    const assignedTo = status !== 'PENDING' ? [field1.id, field2.id, field3.id][Math.floor(Math.random() * 3)] : null

    const grievance = await prisma.grievance.create({
      data: {
        referenceNumber: `GRV-2024-${String(i).padStart(3, '0')}`,
        title: `Grievance ${i}: ${category.name} Issue in ${village}`,
        description: `Detailed description of ${category.name.toLowerCase()} related issue reported by citizen in ${village}, ${district} district. This requires immediate attention from the concerned department.`,
        status,
        priority,
        categoryId: category.id,
        // submittedById: submittedBy, // This field doesn't exist in schema
        assignedToId: assignedTo,
        requesterName: Math.random() > 0.5 ? 'Ravi Teja' : 'Meera Devi',
        requesterPhone: `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        requesterEmail: Math.random() > 0.5 ? 'ravi@example.com' : 'meera@example.com',
        district,
        village,
        requesterAddress: `${Math.floor(Math.random() * 999) + 1}, Main Street, ${village}, ${district}`,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      }
    })
    grievances.push(grievance)
  }

  // Create Patient Grievances
  for (let i = 1; i <= 10; i++) {
    await prisma.patientGrievance.create({
      data: {
        referenceNumber: `PAT-2024-${String(i).padStart(3, '0')}`,
        patientName: `Patient ${i}`,
        patientPhone: `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        village: villages[Math.floor(Math.random() * villages.length)],
        caretakerName: `Caretaker ${i}`,
        caretakerPhone: `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        issue: `Medical issue ${i} - Patient complaint regarding treatment and facilities`,
        hospital: `Government Hospital ${Math.floor(Math.random() * 5) + 1}`,
        doctor: `Dr. ${['Sharma', 'Reddy', 'Kumar', 'Patel'][Math.floor(Math.random() * 4)]}`,
        status: 'NEW',
        createdBy: back1.id
      }
    })
  }

  // Create Individual Grievances
  for (let i = 1; i <= 8; i++) {
    await prisma.individualGrievance.create({
      data: {
        name: `Applicant ${i}`,
        mobileNumber: `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        village: villages[Math.floor(Math.random() * villages.length)],
        contactName: `Contact ${i}`,
        contactNumber: `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        office: `Government Office ${Math.floor(Math.random() * 3) + 1}`,
        subject: `Individual issue ${i} - Personal grievance requiring government intervention`,
        createdBy: back2.id
      }
    })
  }

  // Create Job Requests
  for (let i = 1; i <= 12; i++) {
    await prisma.jobRequest.create({
      data: {
        name: `Job Seeker ${i}`,
        mobileNumber: `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        village: villages[Math.floor(Math.random() * villages.length)],
        contactName: `Contact ${i}`,
        contactNumber: `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        office: `Employment Office ${Math.floor(Math.random() * 3) + 1}`,
        subject: `Job request ${i} - Seeking employment opportunities`,
        createdBy: back1.id
      }
    })
  }

  // Create TTD Requests
  for (let i = 1; i <= 6; i++) {
    await prisma.ttdRequest.create({
      data: {
        darshanDate: new Date(Date.now() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
        darshanType: ['SARVA_DARSHAN', 'SPECIAL_ENTRY', 'SEEGHRA_DARSHAN'][Math.floor(Math.random() * 3)],
        accommodationFrom: new Date(Date.now() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
        accommodationTo: new Date(Date.now() + Math.floor(Math.random() * 35) * 24 * 60 * 60 * 1000),
        guests: JSON.stringify([{name: `Devotee ${i}`, age: Math.floor(Math.random() * 60) + 15, gender: 'MALE'}]),
        referenceName: `Reference ${i}`,
        referenceNumber: `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        referenceVillage: villages[Math.floor(Math.random() * villages.length)],
        referenceMandal: 'Tirupati',
        createdBy: back2.id
      }
    })
  }

  // Note: WhatsApp messages table doesn't exist in current schema

  console.log('✅ Comprehensive seeding completed!')
  console.log(`📊 Created:`)
  console.log(`   - ${users.length} users (all roles)`)
  console.log(`   - ${categories.length} categories`)
  console.log(`   - ${grievances.length} regular grievances`)
  console.log(`   - 10 patient grievances`)
  console.log(`   - 8 individual grievances`)
  console.log(`   - 12 job requests`)
  console.log(`   - 6 TTD requests`)
  console.log(`   - ${projects.length} government projects`)
  console.log(`   - WhatsApp messages (table not in schema)`)
  
  console.log('\n🔑 Login Credentials:')
  console.log('   Minister: minister@ap.gov.in / password123')
  console.log('   PA Officer: pa1@ap.gov.in / password123')
  console.log('   Back Officer: back1@ap.gov.in / password123')
  console.log('   Field Officer: field1@ap.gov.in / password123')
  console.log('   Admin: admin@example.com / password123')
  console.log('   Public: public1@example.com / password123')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })