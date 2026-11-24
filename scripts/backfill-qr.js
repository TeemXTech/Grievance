const { Client } = require('pg')

async function main() {
  const client = new Client({ connectionString: 'postgresql://postgres:password@localhost:5432/grievance_db' })
  await client.connect()

  // Backfill qrCodes
  const { rows } = await client.query(`SELECT id, "trackingNumber" FROM "PetitionRequest" WHERE "qrCode" IS NULL`)
  console.log(`Backfilling ${rows.length} petitions...`)
  for (const row of rows) {
    const qr = `QR-${row.trackingNumber}`
    await client.query(`UPDATE "PetitionRequest" SET "qrCode"=$1 WHERE id=$2`, [qr, row.id])
    console.log(' ✅', qr)
  }

  // Verify
  const { rows: check } = await client.query(`SELECT COUNT(*) FROM "PetitionRequest" WHERE "qrCode" IS NOT NULL`)
  console.log(`\n✅ ${check[0].count} petitions now have qrCodes`)

  await client.end()
}

main().catch(console.error)
