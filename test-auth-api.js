const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function testAuthFlow() {
  console.log('🔍 Testing complete auth flow...')
  
  const testCredentials = {
    email: 'admin@example.com',
    password: 'password123'
  }
  
  try {
    // Step 1: Check if user exists
    console.log('\n1️⃣ Checking if user exists...')
    const user = await prisma.user.findUnique({
      where: { email: testCredentials.email }
    })
    
    if (!user) {
      console.log('❌ User not found')
      return
    }
    
    console.log('✅ User found:', {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    })
    
    // Step 2: Test password verification
    console.log('\n2️⃣ Testing password verification...')
    const isValidPassword = await bcrypt.compare(testCredentials.password, user.passwordHash)
    console.log('Password valid:', isValidPassword)
    
    if (!isValidPassword) {
      console.log('❌ Password verification failed')
      return
    }
    
    // Step 3: Test what NextAuth authorize function would return
    console.log('\n3️⃣ Testing NextAuth return object...')
    const authResult = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
    console.log('✅ Auth result:', authResult)
    
    // Step 4: Test environment variables
    console.log('\n4️⃣ Checking environment variables...')
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)
    console.log('NEXTAUTH_SECRET exists:', !!process.env.NEXTAUTH_SECRET)
    console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL)
    
    console.log('\n✅ All tests passed! Login should work.')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAuthFlow()