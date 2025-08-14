import { PrismaClient, GrievanceStatus, Priority, GrievanceCategory, Role, ProjectStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const districts = ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam']
const mandals = {
  'Hyderabad': ['Secunderabad', 'Kukatpally', 'LB Nagar', 'Charminar'],
  'Warangal': ['Hanamkonda', 'Kazipet', 'Narsampet', 'Jangaon'],
  'Nizamabad': ['Bodhan', 'Kamareddy', 'Banswada', 'Yellareddy'],
  'Karimnagar': ['Huzurabad', 'Manakondur', 'Choppadandi', 'Vemulawada'],
  'Khammam': ['Kothagudem', 'Yellandu', 'Burgampahad', 'Aswaraopeta']
}

const villages = {
  'Secunderabad': ['Alwal', 'Trimulgherry', 'Bowenpally'],
  'Kukatpally': ['Miyapur', 'Bachupally', 'Nizampet'],
  'LB Nagar': ['Vanasthalipuram', 'Hayathnagar', 'Abdullahpurmet'],
  'Charminar': ['Yakutpura', 'Dabeerpura', 'Falaknuma'],
  'Hanamkonda': ['Kazipet', 'Subedari', 'Elkathurthy'],
  'Kazipet': ['Warangal Rural', 'Nallabelly', 'Atmakur'],
  'Narsampet': ['Duggondi', 'Nellikuduru', 'Kodakandla'],
  'Jangaon': ['Ghanpur', 'Lingalaghanpur', 'Raghunathpally']
}

async function main() {
  console.log('🌱 Starting enhanced seed...')

  // Create users with different roles
  const users = [
    {
      name: 'Minister Admin',
      email: 'minister@telangana.gov.in',
      role: Role.MINISTER,
      passwordHash: await bcrypt.hash('minister123', 10)
    },
    {
      name: 'PA Officer',
      email: 'pa@telangana.gov.in',
      role: Role.PA,
      passwordHash: await bcrypt.hash('pa123', 10)
    },
    {
      name: 'Field Officer Hyderabad',
      email: 'field.hyd@telangana.gov.in',
      role: Role.FIELD_OFFICER,
      passwordHash: await bcrypt.hash('field123', 10)
    },
    {
      name: 'Back Officer',
      email: 'back@telangana.gov.in',
      role: Role.BACK_OFFICER,
      passwordHash: await bcrypt.hash('back123', 10)
    },
    {
      name: 'System Admin',
      email: 'admin@telangana.gov.in',
      role: Role.ADMIN,
      passwordHash: await bcrypt.hash('admin123', 10)
    }
  ]

  const createdUsers = []
  for (const user of users) {
    const created = await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user
    })
    createdUsers.push(created)
    console.log(`✅ Created user: ${user.name}`)
  }

  // Create categories
  const categories = [
    { name: 'Health Services', color: '#ef4444', description: 'Medical and health related issues' },
    { name: 'Employment', color: '#3b82f6', description: 'Job and employment related requests' },
    { name: 'Infrastructure', color: '#10b981', description: 'Roads, water, electricity issues' },
    { name: 'Education', color: '#f59e0b', description: 'School and education related matters' },
    { name: 'Agriculture', color: '#84cc16', description: 'Farming and agriculture support' },
    { name: 'Social Welfare', color: '#8b5cf6', description: 'Welfare schemes and benefits' }
  ]

  const createdCategories = []
  for (const category of categories) {
    const created = await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category
    })
    createdCategories.push(created)
    console.log(`✅ Created category: ${category.name}`)
  }

  // Create grievances with proper hierarchy
  const grievanceCategories = Object.values(GrievanceCategory)
  const statuses = Object.values(GrievanceStatus)
  const priorities = Object.values(Priority)

  let grievanceCount = 0
  for (const district of districts) {
    const districtMandals = mandals[district] || []
    
    for (const mandal of districtMandals) {
      const mandalVillages = villages[mandal] || [`${mandal} Village 1`, `${mandal} Village 2`]
      
      for (const village of mandalVillages) {
        // Create 2-5 grievances per village
        const numGrievances = Math.floor(Math.random() * 4) + 2
        
        for (let i = 0; i < numGrievances; i++) {
          grievanceCount++
          const category = grievanceCategories[Math.floor(Math.random() * grievanceCategories.length)]
          const status = statuses[Math.floor(Math.random() * statuses.length)]
          const priority = priorities[Math.floor(Math.random() * priorities.length)]
          const assignedUser = Math.random() > 0.3 ? createdUsers[Math.floor(Math.random() * createdUsers.length)] : null
          
          const grievance = await prisma.grievance.create({
            data: {
              referenceNumber: `GRV-${String(grievanceCount).padStart(4, '0')}`,
              title: `${category} issue in ${village}`,
              description: `Detailed description of ${category.toLowerCase()} related issue reported from ${village}, ${mandal}, ${district}`,
              status,
              priority,
              requesterName: `Citizen ${grievanceCount}`,
              requesterPhone: `+919${String(Math.floor(Math.random() * 900000000) + 100000000)}`,
              requesterEmail: `citizen${grievanceCount}@example.com`,
              requesterAddress: `House ${Math.floor(Math.random() * 500) + 1}, ${village}`,
              village,
              mandal,
              district,
              state: 'Telangana',
              pincode: `5${String(Math.floor(Math.random() * 90000) + 10000)}`,
              grievanceCategory: category,
              estimatedCost: Math.floor(Math.random() * 100000) + 5000,
              assignedToId: assignedUser?.id,
              assignedAt: assignedUser ? new Date() : null,
              categoryId: createdCategories[Math.floor(Math.random() * createdCategories.length)].id,
              createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000) // Random date within last 30 days
            }
          })

          // Create status updates for assigned grievances
          if (assignedUser && status !== 'PENDING') {
            await prisma.grievanceStatusUpdate.create({
              data: {
                grievanceId: grievance.id,
                userId: assignedUser.id,
                oldStatus: 'PENDING',
                newStatus: status,
                remarks: `Status updated to ${status}`,
                createdAt: new Date(grievance.createdAt.getTime() + Math.floor(Math.random() * 24) * 60 * 60 * 1000)
              }
            })
          }
        }
      }
    }
  }

  console.log(`✅ Created ${grievanceCount} grievances`)

  // Create government projects
  let projectCount = 0
  for (const district of districts) {
    const districtMandals = mandals[district] || []
    
    for (const mandal of districtMandals) {
      const mandalVillages = villages[mandal] || [`${mandal} Village 1`]
      
      for (const village of mandalVillages.slice(0, 2)) { // 2 projects per mandal
        projectCount++
        const projectStatuses = Object.values(ProjectStatus)
        const status = projectStatuses[Math.floor(Math.random() * projectStatuses.length)]
        const assignedUser = Math.random() > 0.4 ? createdUsers[Math.floor(Math.random() * createdUsers.length)] : null
        
        await prisma.governmentProject.create({
          data: {
            referenceNumber: `PRJ-${String(projectCount).padStart(4, '0')}`,
            projectName: `${['Road Construction', 'Water Supply', 'School Building', 'Hospital Upgrade', 'Drainage System'][Math.floor(Math.random() * 5)]} - ${village}`,
            description: `Government project for infrastructure development in ${village}, ${mandal}, ${district}`,
            ministerName: 'Hon. Minister',
            status,
            estimatedCost: Math.floor(Math.random() * 5000000) + 500000,
            actualCost: status === 'COMPLETED' ? Math.floor(Math.random() * 5000000) + 500000 : null,
            startDate: new Date(Date.now() - Math.floor(Math.random() * 180) * 24 * 60 * 60 * 1000),
            completionDate: status === 'COMPLETED' ? new Date() : null,
            village,
            mandal,
            district,
            state: 'Telangana',
            beneficiaries: Math.floor(Math.random() * 1000) + 100,
            assignedToId: assignedUser?.id,
            assignedAt: assignedUser ? new Date() : null,
            createdBy: createdUsers[0].id, // Minister
            createdAt: new Date(Date.now() - Math.floor(Math.random() * 60) * 24 * 60 * 60 * 1000)
          }
        })
      }
    }
  }

  console.log(`✅ Created ${projectCount} projects`)

  // Create some visitor logs
  for (let i = 0; i < 20; i++) {
    await prisma.visitorLog.create({
      data: {
        visitorName: `Visitor ${i + 1}`,
        visitorPhone: `+919${String(Math.floor(Math.random() * 900000000) + 100000000)}`,
        visitDate: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000),
        purpose: ['Grievance Follow-up', 'Project Inquiry', 'General Meeting', 'Status Update'][Math.floor(Math.random() * 4)],
        status: 'Completed',
        notes: `Meeting completed successfully`
      }
    })
  }

  console.log('✅ Created visitor logs')

  console.log('🎉 Enhanced seed completed successfully!')
  console.log('\n📊 Summary:')
  console.log(`- Users: ${createdUsers.length}`)
  console.log(`- Categories: ${createdCategories.length}`)
  console.log(`- Grievances: ${grievanceCount}`)
  console.log(`- Projects: ${projectCount}`)
  console.log(`- Districts: ${districts.length}`)
  console.log(`- Total Mandals: ${Object.values(mandals).flat().length}`)
  console.log('\n🔑 Login Credentials:')
  console.log('Minister: minister@telangana.gov.in / minister123')
  console.log('PA: pa@telangana.gov.in / pa123')
  console.log('Field Officer: field.hyd@telangana.gov.in / field123')
  console.log('Back Officer: back@telangana.gov.in / back123')
  console.log('Admin: admin@telangana.gov.in / admin123')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })