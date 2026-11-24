// prisma/seed-modules.js
// Orchestrator — seeds all 14 empty module tables.
// Requires users to already exist (run seed-demo.js first).
// Safe to re-run — all operations use findFirst guards.

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const { seedPartyPosts, seedOffices, seedMandalsAndVillages, seedLocalLeaders } = require('./seed-modules-part1.js')
const { seedPartyWorkers, seedSurveys, seedFundAllocations, seedLetters, seedVisitors, seedAssemblyQuestions, seedCampaigns } = require('./seed-modules-part2.js')

async function main() {
  console.log('\n🌱 Seeding module tables...\n')

  // Resolve required users
  const paUser = await prisma.user.findFirst({ where: { role: 'PA' } })
  if (!paUser) throw new Error('No PA user found — run seed-demo.js first')

  const backOfficerUser = await prisma.user.findFirst({ where: { role: 'BACK_OFFICER' } })
  if (!backOfficerUser) throw new Error('No BACK_OFFICER user found — run seed-demo.js first')

  // Seed in dependency order
  const partyPosts = await seedPartyPosts()
  await seedOffices()
  const mandals = await seedMandalsAndVillages()
  await seedLocalLeaders(mandals)
  await seedPartyWorkers(partyPosts, mandals)
  await seedSurveys(paUser)
  await seedFundAllocations(paUser)
  await seedLetters(paUser)
  await seedVisitors(backOfficerUser)
  await seedAssemblyQuestions(paUser)
  await seedCampaigns(paUser)

  // Final row counts
  console.log('\n📊 Final row counts:')
  const tables = [
    'partyPost', 'office', 'mandal', 'village', 'localLeader',
    'partyWorker', 'survey', 'fundAllocation', 'letter',
    'visitorLog', 'assemblyQuestion', 'campaign'
  ]
  for (const t of tables) {
    const count = await prisma[t].count()
    console.log(`   ${t}: ${count}`)
  }

  console.log('\n✅ Module seeding complete.\n')
}

main()
  .catch(e => { console.error('❌ Seed failed:', e.message); process.exit(1) })
  .finally(() => prisma.$disconnect())
