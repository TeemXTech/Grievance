const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testAuth() {
  console.log('🔍 Testing authentication...');
  
  // Check if users exist
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      passwordHash: true
    }
  });
  
  console.log('📋 Users in database:', users.length);
  users.forEach(user => {
    console.log(`- ${user.email} (${user.role})`);
  });
  
  // Test password verification
  const testEmail = 'admin@example.com';
  const testPassword = 'password123';
  
  const user = await prisma.user.findUnique({
    where: { email: testEmail }
  });
  
  if (user) {
    console.log(`\n🔐 Testing login for ${testEmail}:`);
    console.log('Password hash:', user.passwordHash);
    
    const isValid = await bcrypt.compare(testPassword, user.passwordHash);
    console.log('Password valid:', isValid);
    
    // Test with different password
    const wrongPassword = 'wrongpassword';
    const isWrong = await bcrypt.compare(wrongPassword, user.passwordHash);
    console.log('Wrong password test:', isWrong);
    
    // Generate new hash for comparison
    const newHash = await bcrypt.hash(testPassword, 10);
    console.log('New hash would be:', newHash);
    const newHashValid = await bcrypt.compare(testPassword, newHash);
    console.log('New hash valid:', newHashValid);
  } else {
    console.log(`❌ User ${testEmail} not found`);
  }
  
  await prisma.$disconnect();
}

testAuth().catch(console.error);