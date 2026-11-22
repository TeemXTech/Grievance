const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function hashPassword(plain) {
  return bcrypt.hash(plain, 12)
}

async function main() {
  console.log('🌱 Seeding production users...')

  const password = await hashPassword('password123')

  const users = [
    {
      email: 'minister@gov.in',
      name: 'D. Sridhar Babu',
      role: 'MINISTER',
      phone: '+919848000001',
      status: 'active',
    },
    {
      email: 'pa@gov.in',
      name: 'PA Srinivas',
      role: 'PA',
      phone: '+919848000002',
      status: 'active',
    },
    {
      email: 'pa2@gov.in',
      name: 'PA Ramesh',
      role: 'PA',
      phone: '+919848000003',
      status: 'active',
    },
    {
      email: 'back@gov.in',
      name: 'Back Officer Suresh',
      role: 'BACK_OFFICER',
      phone: '+919848000004',
      status: 'active',
    },
    {
      email: 'back2@gov.in',
      name: 'Back Officer Kavitha',
      role: 'BACK_OFFICER',
      phone: '+919848000005',
      status: 'active',
    },
    {
      email: 'field@gov.in',
      name: 'Field Officer Raju',
      role: 'FIELD_OFFICER',
      phone: '+919848000006',
      status: 'active',
    },
    {
      email: 'field2@gov.in',
      name: 'Field Officer Anitha',
      role: 'FIELD_OFFICER',
      phone: '+919848000007',
      status: 'active',
    },
    {
      email: 'admin@gov.in',
      name: 'System Administrator',
      role: 'ADMIN',
      phone: '+919848000008',
      status: 'active',
    },
    {
      email: 'officer@gov.in',
      name: 'District Officer Kumar',
      role: 'OFFICER',
      phone: '+919848000009',
      status: 'active',
    },
  ]

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, role: u.role, phone: u.phone, status: u.status },
      create: { ...u, passwordHash: password },
    })
    console.log(`  ✅ ${u.role.padEnd(16)} → ${u.email}`)
  }

  // Seed base mandals for Manthanani constituency
  const mandalNames = ['Manthanani', 'Ramagundam', 'Manthani', 'Kataram', 'Srirampur']
  for (const name of mandalNames) {
    await prisma.mandal.upsert({
      where: { name },
      update: {},
      create: { name, district: 'Peddapalli' },
    })
  }
  console.log('  ✅ Mandals seeded')

  console.log('\n✅ Seed complete.')
  console.log('\n📋 Login credentials (all use password: password123)')
  console.log('   minister@gov.in  → Minister Dashboard')
  console.log('   pa@gov.in        → PA Command Center')
  console.log('   back@gov.in      → Back Officer Dashboard')
  console.log('   field@gov.in     → Field Officer Dashboard')
  console.log('   admin@gov.in     → Admin Dashboard')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
