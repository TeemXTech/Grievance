const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Creating demo users...')

  // Create Users with different roles
  const hashedPassword = await bcrypt.hash('password123', 10)
  
  const users = [
    {
      email: 'admin@example.com',
      passwordHash: hashedPassword,
      name: 'System Administrator',
      role: 'ADMIN'
    },
    {
      email: 'minister@ap.gov.in',
      passwordHash: hashedPassword,
      name: 'Hon. Minister Rajesh Kumar',
      role: 'MINISTER'
    },
    {
      email: 'pa1@ap.gov.in',
      passwordHash: hashedPassword,
      name: 'PA Officer Priya Sharma',
      role: 'PA'
    },
    {
      email: 'back1@ap.gov.in',
      passwordHash: hashedPassword,
      name: 'Back Officer Lakshmi Devi',
      role: 'BACK_OFFICER'
    },
    {
      email: 'field1@ap.gov.in',
      passwordHash: hashedPassword,
      name: 'Field Officer Ramesh Kumar',
      role: 'FIELD_OFFICER'
    },
    {
      email: 'public1@example.com',
      passwordHash: hashedPassword,
      name: 'Citizen Ravi Teja',
      role: 'PUBLIC'
    }
  ]

  for (const userData of users) {
    try {
      await prisma.user.upsert({
        where: { email: userData.email },
        update: userData,
        create: userData
      })
      console.log(`✅ Created/Updated user: ${userData.email}`)
    } catch (error) {
      console.error(`❌ Failed to create user ${userData.email}:`, error.message)
    }
  }

  // Create some basic categories
  const categories = [
    { name: 'Healthcare', description: 'Medical and health related issues' },
    { name: 'Infrastructure', description: 'Roads, water, electricity issues' },
    { name: 'Education', description: 'School and education related matters' },
    { name: 'Employment', description: 'Job and employment issues' }
  ]

  for (const categoryData of categories) {
    try {
      await prisma.category.upsert({
        where: { name: categoryData.name },
        update: categoryData,
        create: categoryData
      })
      console.log(`✅ Created/Updated category: ${categoryData.name}`)
    } catch (error) {
      console.error(`❌ Failed to create category ${categoryData.name}:`, error.message)
    }
  }

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