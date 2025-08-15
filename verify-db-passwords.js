const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function verifyPasswords() {
  console.log('🔍 Verifying password storage in database...')
  
  try {
    const users = await prisma.user.findMany({
      select: {
        email: true,
        passwordHash: true,
        name: true,
        role: true
      }
    })
    
    console.log(`Found ${users.length} users in database:`)
    
    for (const user of users) {
      console.log(`\n👤 User: ${user.email}`)
      console.log(`   Name: ${user.name}`)
      console.log(`   Role: ${user.role}`)
      console.log(`   Password Hash: ${user.passwordHash}`)
      console.log(`   Hash starts with: ${user.passwordHash.substring(0, 7)}`)
      
      // Test if it's bcrypt hash (should start with $2a$, $2b$, or $2y$)
      const isBcryptHash = /^\$2[aby]\$/.test(user.passwordHash)
      console.log(`   Is bcrypt hash: ${isBcryptHash}`)
      
      // Test password verification
      try {
        const testResult = await bcrypt.compare('password123', user.passwordHash)
        console.log(`   Password 'password123' matches: ${testResult}`)
      } catch (error) {
        console.log(`   Password verification error: ${error.message}`)
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyPasswords()