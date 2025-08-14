import { PrismaClient, GrievanceStatus, Priority, GrievanceCategory, Role, ProjectStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Realistic Telangana data
const telanganData = {
  districts: [
    {
      name: 'Hyderabad',
      mandals: [
        {
          name: 'Secunderabad',
          villages: ['Alwal', 'Trimulgherry', 'Bowenpally', 'Karkhana', 'Marredpally']
        },
        {
          name: 'Kukatpally', 
          villages: ['Miyapur', 'Bachupally', 'Nizampet', 'Pragathi Nagar', 'KPHB']
        },
        {
          name: 'LB Nagar',
          villages: ['Vanasthalipuram', 'Hayathnagar', 'Abdullahpurmet', 'Mansoorabad', 'Kothapet']
        }
      ]
    },
    {
      name: 'Warangal',
      mandals: [
        {
          name: 'Hanamkonda',
          villages: ['Kazipet', 'Subedari', 'Elkathurthy', 'Warangal Rural', 'Bheemadevarapally']
        },
        {
          name: 'Narsampet',
          villages: ['Duggondi', 'Nellikuduru', 'Kodakandla', 'Chityal', 'Nallabelly']
        }
      ]
    },
    {
      name: 'Nizamabad',
      mandals: [
        {
          name: 'Bodhan',
          villages: ['Metpally', 'Jukkal', 'Banswada', 'Yellareddy', 'Pitlam']
        },
        {
          name: 'Kamareddy',
          villages: ['Bhiknoor', 'Sadashivnagar', 'Machareddy', 'Domakonda', 'Bichkunda']
        }
      ]
    }
  ]
}

// Realistic grievance templates
const grievanceTemplates = [
  {
    category: GrievanceCategory.HEALTH,
    titles: [
      'Medical equipment shortage at PHC',
      'Doctor unavailable at government hospital',
      'Ambulance service not responding',
      'Medicine stock out at health center',
      'Vaccination drive not conducted'
    ],
    descriptions: [
      'The Primary Health Center lacks basic medical equipment including BP monitors and thermometers',
      'Government hospital has been without a doctor for the past 2 weeks affecting patient care',
      '108 ambulance service is not responding to emergency calls in our area',
      'Essential medicines are out of stock at the local health center for over a month',
      'Scheduled vaccination drive for children has not been conducted as promised'
    ]
  },
  {
    category: GrievanceCategory.INFRASTRUCTURE,
    titles: [
      'Road repair needed urgently',
      'Street lights not working',
      'Water supply irregular',
      'Drainage system blocked',
      'Electricity outage frequent'
    ],
    descriptions: [
      'Main road has multiple potholes causing accidents and vehicle damage',
      'Street lights have been non-functional for 3 months affecting safety',
      'Water supply is irregular - only 2 hours per day instead of promised 6 hours',
      'Drainage system is completely blocked causing water logging during rains',
      'Frequent power cuts lasting 6-8 hours daily affecting daily life and businesses'
    ]
  },
  {
    category: GrievanceCategory.EDUCATION,
    titles: [
      'Teacher shortage in government school',
      'School building needs repair',
      'Mid-day meal quality poor',
      'No proper toilets in school',
      'Textbooks not distributed'
    ],
    descriptions: [
      'Government school has only 2 teachers for 150 students across 5 classes',
      'School building roof is leaking and walls have cracks posing safety risk',
      'Mid-day meal quality is very poor with complaints of stomach issues among children',
      'School lacks proper toilet facilities especially for girl students',
      'New academic year started but textbooks have not been distributed to students'
    ]
  },
  {
    category: GrievanceCategory.JOBS,
    titles: [
      'MGNREGA work not provided',
      'Job card not issued',
      'Wages not paid for completed work',
      'Skill development program needed',
      'Employment exchange not functioning'
    ],
    descriptions: [
      'Applied for MGNREGA work 3 months ago but no work has been provided',
      'Job card application submitted but not issued despite multiple follow-ups',
      'Completed 15 days of MGNREGA work but wages not credited to account',
      'Youth in village need skill development programs for better employment opportunities',
      'Local employment exchange office is closed most of the time'
    ]
  }
]

// Realistic project templates
const projectTemplates = [
  {
    names: [
      'Village Road Construction Project',
      'Primary Health Center Upgrade',
      'Government School Building Construction',
      'Water Supply Pipeline Extension',
      'Street Light Installation Project'
    ],
    descriptions: [
      'Construction of 2km concrete road connecting village to main highway',
      'Upgrading PHC with new equipment, additional rooms and staff quarters',
      'Construction of new school building with 8 classrooms and proper facilities',
      'Extension of water supply pipeline to cover all households in the village',
      'Installation of LED street lights on all major roads and lanes'
    ]
  }
]

async function main() {
  console.log('🌱 Starting realistic seed with dummy data...')

  // Create users
  const users = [
    {
      name: 'Hon. Minister Telangana',
      email: 'minister@telangana.gov.in',
      role: Role.MINISTER,
      phone: '+919876543210',
      passwordHash: await bcrypt.hash('minister123', 10)
    },
    {
      name: 'PA Rajesh Kumar',
      email: 'pa.rajesh@telangana.gov.in',
      role: Role.PA,
      phone: '+919876543211',
      passwordHash: await bcrypt.hash('pa123', 10)
    },
    {
      name: 'Field Officer Hyderabad - Priya Sharma',
      email: 'field.priya@telangana.gov.in',
      role: Role.FIELD_OFFICER,
      phone: '+919876543212',
      passwordHash: await bcrypt.hash('field123', 10)
    },
    {
      name: 'Field Officer Warangal - Ravi Reddy',
      email: 'field.ravi@telangana.gov.in',
      role: Role.FIELD_OFFICER,
      phone: '+919876543213',
      passwordHash: await bcrypt.hash('field123', 10)
    },
    {
      name: 'Back Officer - Sunitha Rao',
      email: 'back.sunitha@telangana.gov.in',
      role: Role.BACK_OFFICER,
      phone: '+919876543214',
      passwordHash: await bcrypt.hash('back123', 10)
    },
    {
      name: 'System Admin - Tech Team',
      email: 'admin@telangana.gov.in',
      role: Role.ADMIN,
      phone: '+919876543215',
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
    { name: 'Employment & Jobs', color: '#3b82f6', description: 'Job and employment related requests' },
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
  }

  // Create realistic grievances
  let grievanceCount = 0
  const statuses = [
    { status: GrievanceStatus.PENDING, weight: 25 },
    { status: GrievanceStatus.ASSIGNED, weight: 20 },
    { status: GrievanceStatus.IN_PROGRESS, weight: 30 },
    { status: GrievanceStatus.RESOLVED, weight: 20 },
    { status: GrievanceStatus.WIP, weight: 5 }
  ]

  const priorities = [
    { priority: Priority.URGENT, weight: 10 },
    { priority: Priority.HIGH, weight: 25 },
    { priority: Priority.MEDIUM, weight: 45 },
    { priority: Priority.LOW, weight: 20 }
  ]

  // Helper function to get weighted random selection
  const getWeightedRandom = (items: any[]) => {
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0)
    let random = Math.random() * totalWeight
    
    for (const item of items) {
      random -= item.weight
      if (random <= 0) return item
    }
    return items[0]
  }

  for (const district of telanganData.districts) {
    for (const mandal of district.mandals) {
      for (const village of mandal.villages) {
        // Create 3-8 grievances per village
        const numGrievances = Math.floor(Math.random() * 6) + 3
        
        for (let i = 0; i < numGrievances; i++) {
          grievanceCount++
          
          // Select template
          const template = grievanceTemplates[Math.floor(Math.random() * grievanceTemplates.length)]
          const titleIndex = Math.floor(Math.random() * template.titles.length)
          
          const statusItem = getWeightedRandom(statuses)
          const priorityItem = getWeightedRandom(priorities)
          
          // Assign user based on status
          let assignedUser = null
          if (statusItem.status !== GrievanceStatus.PENDING) {
            // Assign field officer based on district
            if (district.name === 'Hyderabad') {
              assignedUser = createdUsers.find(u => u.email === 'field.priya@telangana.gov.in')
            } else {
              assignedUser = createdUsers.find(u => u.email === 'field.ravi@telangana.gov.in')
            }
            
            // Sometimes assign to PA or Back Officer
            if (Math.random() > 0.7) {
              assignedUser = createdUsers[Math.floor(Math.random() * (createdUsers.length - 1)) + 1]
            }
          }

          // Generate realistic requester data
          const maleNames = ['Rajesh', 'Suresh', 'Ramesh', 'Mahesh', 'Ganesh', 'Naresh', 'Venkat', 'Ravi', 'Kumar', 'Prasad']
          const femaleNames = ['Priya', 'Sunitha', 'Lakshmi', 'Radha', 'Sita', 'Gita', 'Meera', 'Kavitha', 'Anitha', 'Rekha']
          const lastNames = ['Reddy', 'Rao', 'Sharma', 'Kumar', 'Prasad', 'Naidu', 'Chowdary', 'Goud', 'Yadav', 'Singh']
          
          const isMale = Math.random() > 0.5
          const firstName = isMale ? maleNames[Math.floor(Math.random() * maleNames.length)] : femaleNames[Math.floor(Math.random() * femaleNames.length)]
          const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
          const requesterName = `${firstName} ${lastName}`
          
          const createdDate = new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000) // Last 90 days
          
          const grievance = await prisma.grievance.create({
            data: {
              referenceNumber: `GRV-${new Date().getFullYear()}-${String(grievanceCount).padStart(4, '0')}`,
              title: `${template.titles[titleIndex]} - ${village}`,
              description: `${template.descriptions[titleIndex]}. Location: ${village}, ${mandal.name}, ${district.name}. Reported by local resident seeking immediate attention.`,
              status: statusItem.status,
              priority: priorityItem.priority,
              requesterName,
              requesterPhone: `+919${String(Math.floor(Math.random() * 900000000) + 100000000)}`,
              requesterEmail: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@gmail.com`,
              requesterAddress: `H.No ${Math.floor(Math.random() * 500) + 1}, ${village}, ${mandal.name}`,
              village,
              mandal: mandal.name,
              district: district.name,
              state: 'Telangana',
              pincode: `5${String(Math.floor(Math.random() * 90000) + 10000)}`,
              grievanceCategory: template.category,
              estimatedCost: Math.floor(Math.random() * 200000) + 10000,
              assignedToId: assignedUser?.id,
              assignedAt: assignedUser ? new Date(createdDate.getTime() + Math.floor(Math.random() * 24) * 60 * 60 * 1000) : null,
              categoryId: createdCategories.find(c => c.name.includes(template.category.split('_')[0]))?.id || createdCategories[0].id,
              createdAt: createdDate,
              lastActionDate: assignedUser ? new Date(createdDate.getTime() + Math.floor(Math.random() * 48) * 60 * 60 * 1000) : createdDate
            }
          })

          // Create status updates for non-pending grievances
          if (assignedUser && statusItem.status !== GrievanceStatus.PENDING) {
            await prisma.grievanceStatusUpdate.create({
              data: {
                grievanceId: grievance.id,
                userId: assignedUser.id,
                oldStatus: GrievanceStatus.PENDING,
                newStatus: statusItem.status,
                remarks: `Status updated to ${statusItem.status} by ${assignedUser.name}`,
                createdAt: new Date(grievance.createdAt.getTime() + Math.floor(Math.random() * 24) * 60 * 60 * 1000)
              }
            })
          }
        }
      }
    }
  }

  console.log(`✅ Created ${grievanceCount} realistic grievances`)

  // Create government projects
  let projectCount = 0
  for (const district of telanganData.districts) {
    for (const mandal of district.mandals) {
      // Create 2-3 projects per mandal
      const numProjects = Math.floor(Math.random() * 2) + 2
      
      for (let i = 0; i < numProjects; i++) {
        projectCount++
        
        const projectStatuses = [
          { status: ProjectStatus.IN_PROGRESS, weight: 40 },
          { status: ProjectStatus.COMPLETED, weight: 35 },
          { status: ProjectStatus.YET_TO_COMPLETE, weight: 25 }
        ]
        
        const statusItem = getWeightedRandom(projectStatuses)
        const village = mandal.villages[Math.floor(Math.random() * mandal.villages.length)]
        const template = projectTemplates[0]
        const nameIndex = Math.floor(Math.random() * template.names.length)
        
        const assignedUser = createdUsers[Math.floor(Math.random() * (createdUsers.length - 1)) + 1]
        const startDate = new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000)
        
        await prisma.governmentProject.create({
          data: {
            referenceNumber: `PRJ-${new Date().getFullYear()}-${String(projectCount).padStart(4, '0')}`,
            projectName: `${template.names[nameIndex]} - ${village}`,
            description: `${template.descriptions[nameIndex]} in ${village}, ${mandal.name}, ${district.name}. This project aims to improve the quality of life for local residents.`,
            ministerName: 'Hon. Minister Telangana',
            status: statusItem.status,
            estimatedCost: Math.floor(Math.random() * 10000000) + 1000000, // 10L to 1Cr
            actualCost: statusItem.status === ProjectStatus.COMPLETED ? Math.floor(Math.random() * 10000000) + 1000000 : null,
            startDate,
            completionDate: statusItem.status === ProjectStatus.COMPLETED ? new Date(startDate.getTime() + Math.floor(Math.random() * 180) * 24 * 60 * 60 * 1000) : null,
            expectedCompletionDate: statusItem.status !== ProjectStatus.COMPLETED ? new Date(startDate.getTime() + Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000) : null,
            village,
            mandal: mandal.name,
            district: district.name,
            state: 'Telangana',
            beneficiaries: Math.floor(Math.random() * 2000) + 500,
            assignedToId: assignedUser.id,
            assignedAt: new Date(startDate.getTime() + Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000),
            createdBy: createdUsers[0].id, // Minister
            createdAt: startDate
          }
        })
      }
    }
  }

  console.log(`✅ Created ${projectCount} realistic projects`)

  // Create visitor logs
  const visitorPurposes = [
    'Grievance Follow-up',
    'Project Status Inquiry', 
    'New Complaint Registration',
    'Document Submission',
    'Status Update Meeting',
    'Community Representative Meeting',
    'Welfare Scheme Inquiry'
  ]

  for (let i = 0; i < 50; i++) {
    const visitDate = new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)
    const maleNames = ['Rajesh', 'Suresh', 'Ramesh', 'Mahesh', 'Venkat']
    const femaleNames = ['Priya', 'Sunitha', 'Lakshmi', 'Radha', 'Meera']
    const lastNames = ['Reddy', 'Rao', 'Sharma', 'Kumar', 'Naidu']
    
    const isMale = Math.random() > 0.5
    const firstName = isMale ? maleNames[Math.floor(Math.random() * maleNames.length)] : femaleNames[Math.floor(Math.random() * femaleNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    
    await prisma.visitorLog.create({
      data: {
        visitorName: `${firstName} ${lastName}`,
        visitorPhone: `+919${String(Math.floor(Math.random() * 900000000) + 100000000)}`,
        visitDate,
        purpose: visitorPurposes[Math.floor(Math.random() * visitorPurposes.length)],
        status: Math.random() > 0.1 ? 'Completed' : 'Pending',
        notes: `Meeting completed successfully. Visitor satisfied with the response and follow-up actions discussed.`
      }
    })
  }

  console.log('✅ Created 50 realistic visitor logs')

  // Summary
  const totalGrievances = await prisma.grievance.count()
  const totalProjects = await prisma.governmentProject.count()
  const pendingGrievances = await prisma.grievance.count({ where: { status: 'PENDING' } })
  const resolvedGrievances = await prisma.grievance.count({ where: { status: 'RESOLVED' } })
  const urgentGrievances = await prisma.grievance.count({ where: { priority: 'URGENT' } })

  console.log('🎉 Realistic seed completed successfully!')
  console.log('\n📊 Summary:')
  console.log(`- Users: ${createdUsers.length}`)
  console.log(`- Categories: ${createdCategories.length}`)
  console.log(`- Total Grievances: ${totalGrievances}`)
  console.log(`- Pending Grievances: ${pendingGrievances}`)
  console.log(`- Resolved Grievances: ${resolvedGrievances}`)
  console.log(`- Urgent Grievances: ${urgentGrievances}`)
  console.log(`- Total Projects: ${totalProjects}`)
  console.log(`- Districts: ${telanganData.districts.length}`)
  console.log(`- Total Mandals: ${telanganData.districts.reduce((sum, d) => sum + d.mandals.length, 0)}`)
  console.log(`- Total Villages: ${telanganData.districts.reduce((sum, d) => sum + d.mandals.reduce((sum2, m) => sum2 + m.villages.length, 0), 0)}`)
  
  console.log('\n🔑 Login Credentials:')
  console.log('Minister: minister@telangana.gov.in / minister123')
  console.log('PA: pa.rajesh@telangana.gov.in / pa123')
  console.log('Field Officer (Hyd): field.priya@telangana.gov.in / field123')
  console.log('Field Officer (Warangal): field.ravi@telangana.gov.in / field123')
  console.log('Back Officer: back.sunitha@telangana.gov.in / back123')
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