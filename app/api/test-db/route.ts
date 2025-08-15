import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function GET() {
  try {
    console.log('🔍 Testing database connection...')
    
    // Test database connection
    const userCount = await prisma.user.count()
    console.log('👥 Total users in database:', userCount)
    
    // Get first few users
    const users = await prisma.user.findMany({
      take: 5,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        passwordHash: true
      }
    })
    
    console.log('📋 Sample users:', users)
    
    // Test password hashing
    const testUser = users.find(u => u.email === 'admin@example.com')
    if (testUser) {
      const passwordTest = await bcrypt.compare('password123', testUser.passwordHash)
      console.log('🔐 Password test for admin@example.com:', passwordTest)
    }
    
    return NextResponse.json({
      success: true,
      userCount,
      sampleUsers: users.map(u => ({
        email: u.email,
        name: u.name,
        role: u.role,
        hasPassword: !!u.passwordHash
      })),
      passwordTest: testUser ? await bcrypt.compare('password123', testUser.passwordHash) : null
    })
    
  } catch (error) {
    console.error('❌ Database test error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}