const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()

async function main() {
  // Check columns
  const cols = await p.$queryRaw`SELECT column_name FROM information_schema.columns WHERE table_name='PetitionRequest' ORDER BY column_name`
  console.log('PetitionRequest columns:')
  cols.forEach(c => console.log(' ', c.column_name))

  // Try raw update
  const fieldId = 'cmgq5hvn2000k11ctn40lwuka'
  const ids = ['cmwqk6tfx000icd7x41cvk9h6', 'cmwqk6tgg000ncd7xnfpu9aby', 'cmwqk6tgk000pcd7x35q24ge6']
  
  for (const id of ids) {
    const result = await p.$executeRaw`UPDATE "PetitionRequest" SET "assignedOfficialId"=${fieldId}, "assignedOfficialName"='Field Officer Raju', status='ASSIGNED_TO_OFFICIAL' WHERE id=${id}`
    console.log('Updated rows for', id, ':', result)
  }

  const check = await p.petitionRequest.findMany({
    where: { assignedOfficialId: fieldId },
    select: { title: true, status: true }
  })
  console.log('Assigned to field officer:', check.length)
  check.forEach(x => console.log(' -', x.title.substring(0, 50)))
}

main().catch(console.error).finally(() => p.$disconnect())
