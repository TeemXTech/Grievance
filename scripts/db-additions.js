const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()

async function main() {
  // Add qrCode to PetitionRequest
  await p.$executeRaw`ALTER TABLE "PetitionRequest" ADD COLUMN IF NOT EXISTS "qrCode" TEXT`
  console.log('✅ qrCode added to PetitionRequest')

  // Add language preference to User
  await p.$executeRaw`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "language" TEXT DEFAULT 'en'`
  console.log('✅ language added to User')

  // Backfill qrCodes for existing petitions
  const petitions = await p.petitionRequest.findMany({ select: { id: true, trackingNumber: true, qrCode: true } })
  for (const pet of petitions) {
    if (!pet.qrCode) {
      const qr = `QR-${pet.trackingNumber}-${Date.now()}`
      await p.$executeRaw`UPDATE "PetitionRequest" SET "qrCode"=${qr} WHERE id=${pet.id}`
    }
  }
  console.log(`✅ Backfilled qrCodes for ${petitions.length} petitions`)

  console.log('\n✅ DB schema additions complete')
}

main().catch(console.error).finally(() => p.$disconnect())
