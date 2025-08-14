const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function testLogin() {
  try {
    console.log('🔍 Testing database connection...')
    
    // Check if users exist
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true }
    })
    
    console.log('👥 Found users:', users.length)
    users.forEach(user => {
      console.log(`  - ${user.email} (${user.role})`)
    })
    
    // Test specific login
    const testEmail = 'minister@ap.gov.in'
    const testPassword = 'password123'
    
    console.log(`\n🔐 Testing login for: ${testEmail}`)
    
    const user = await prisma.user.findUnique({ 
      where: { email: testEmail } 
    })
    
    if (!user) {
      console.log('❌ User not found')
      return
    }
    
    console.log('✅ User found:', user.name, user.role)
    
    const valid = await bcrypt.compare(testPassword, user.passwordHash)
    console.log('🔑 Password valid:', valid)
    
    if (valid) {
      console.log('✅ Login should work!')
    } else {
      console.log('❌ Password mismatch')
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

testLogin()