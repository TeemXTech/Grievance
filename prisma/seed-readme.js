const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database with README credentials...')

  // Hash the password
  const hashedPassword = await bcrypt.hash('password123', 10)
  
  // Create users as mentioned in README
  const users = [
    {
      email: 'admin@example.com',
      passwordHash: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
      phone: '1234567890'
    },
    {
      email: 'officer@example.com',
      passwordHash: hashedPassword,
      name: 'Officer User',
      role: 'OFFICER',
      phone: '1234567891'
    },
    {
      email: 'public@example.com',
      passwordHash: hashedPassword,
      name: 'Public User',
      role: 'PUBLIC',
      phone: '1234567892'
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

  // Create basic categories
  const categories = [
    { name: 'General', description: 'General grievances' },
    { name: 'Infrastructure', description: 'Infrastructure related issues' },
    { name: 'Healthcare', description: 'Healthcare related issues' },
    { name: 'Education', description: 'Education related issues' }
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

  console.log('\n🔑 Login Credentials (as per README):')
  console.log('   Admin: admin@example.com / password123')
  console.log('   Officer: officer@example.com / password123')
  console.log('   Public: public@example.com / password123')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })