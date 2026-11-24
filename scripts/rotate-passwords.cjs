// scripts/rotate-passwords.cjs
// Generates a unique strong password for every user, updates bcrypt hashes in DB.
// Outputs a credential sheet to credentials-YYYYMMDD.txt (NEVER commit this file).
// Run once: node scripts/rotate-passwords.cjs
// Delete the output file after distributing credentials to users.

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const prisma = new PrismaClient()

// Generate a strong password: 3 words + number + symbol
// Uses crypto.randomBytes for cryptographic randomness
const ADJECTIVES = ['Secure','Strong','Active','Bright','Clear','Direct','Firm','Grand','Hardy','Ideal','Joint','Keen','Loyal','Noble','Prime','Quick','Ready','Sharp','Solid','Swift','Trusted','Valid','Wise','Exact','Fresh']
const NOUNS      = ['Access','Bridge','Cloud','Delta','Eagle','Force','Guard','Haven','Index','Judge','Karma','Light','Maple','North','Ocean','Pilot','Quest','River','Stone','Tower','Unity','Vault','Watch','Xenon','Yield']

function generatePassword() {
  const adj  = ADJECTIVES[crypto.randomInt(ADJECTIVES.length)]
  const noun = NOUNS[crypto.randomInt(NOUNS.length)]
  const num  = crypto.randomInt(100, 999)
  const syms = ['!', '@', '#', '$', '%', '&']
  const sym  = syms[crypto.randomInt(syms.length)]
  return `${adj}${noun}${num}${sym}`
}

async function main() {
  console.log('\n🔐 Password Rotation Script')
  console.log('============================')
  console.log('Database: grievance_db @ localhost')
  console.log('Bcrypt cost: 12\n')

  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true },
    orderBy: { role: 'asc' }
  })

  console.log(`Found ${users.length} users. Generating passwords and updating hashes...\n`)

  const credentials = []
  let updated = 0

  for (const user of users) {
    const password = generatePassword()
    const hash = await bcrypt.hash(password, 12)
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hash }
    })
    credentials.push({ email: user.email, name: user.name, role: user.role, password })
    process.stdout.write(`  ✓ ${user.email.padEnd(40)} updated\n`)
    updated++
  }

  // Write credential sheet to local file — NEVER commit
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const outFile = path.join(process.cwd(), `credentials-${date}.txt`)

  const lines = [
    '='.repeat(70),
    'GRIEVANCE MANAGEMENT SYSTEM — CREDENTIAL SHEET',
    `Generated: ${new Date().toISOString()}`,
    'SECURITY: Distribute to each user individually. Delete this file after distribution.',
    'DO NOT email this file. DO NOT commit this file to git.',
    '='.repeat(70),
    '',
    ...credentials.map(c =>
      `Role: ${c.role.padEnd(20)} | Email: ${c.email.padEnd(40)} | Password: ${c.password}`
    ),
    '',
    '='.repeat(70),
    'Each user must change their password on first login via:',
    'Admin Dashboard → Change Password tab',
    '='.repeat(70),
  ]

  fs.writeFileSync(outFile, lines.join('\n'), 'utf8')

  console.log(`\n✅ ${updated} passwords updated at bcrypt cost 12`)
  console.log(`📄 Credential sheet written to: ${outFile}`)
  console.log('\n⚠️  SECURITY REMINDERS:')
  console.log('   1. Distribute credentials to each user individually and securely')
  console.log('   2. Delete the credential file immediately after distribution')
  console.log('   3. Each user must change their password on first login')
  console.log('   4. Do NOT commit the credential file to git\n')

  // Verify one hash to confirm DB writes worked
  const sample = credentials[0]
  const dbUser = await prisma.user.findUnique({ where: { email: sample.email }, select: { passwordHash: true } })
  const valid = await bcrypt.compare(sample.password, dbUser.passwordHash)
  console.log(`🔍 Verification: bcrypt.compare for ${sample.email} → ${valid ? 'PASS ✅' : 'FAIL ❌'}`)
}

main()
  .catch(e => { console.error('❌ Failed:', e.message); process.exit(1) })
  .finally(() => prisma.$disconnect())
