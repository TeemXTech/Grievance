const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function testLogin() {
  console.log('🔍 Testing login with known credentials...')
  
  const testEmail = 'admin@example.com'
  const testPassword = 'password123'
  
  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: testEmail }
    })
    
    if (!user) {
      console.log('❌ User not found in database')
      return
    }
    
    console.log('✅ User found:', {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      passwordHash: user.passwordHash.substring(0, 20) + '...'
    })
    
    // Test password verification
    const isValid = await bcrypt.compare(testPassword, user.passwordHash)
    console.log('🔐 Password verification result:', isValid)
    
    if (isValid) {
      console.log('✅ Login should work - credentials are valid')
    } else {
      console.log('❌ Password verification failed')
    }
    
  } catch (error) {
    console.error('❌ Error during test:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testLogin()