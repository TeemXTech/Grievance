// Ensures the Postgres database from DATABASE_URL exists; creates if missing
// Compatible with Windows PowerShell without prompts
const { Client } = require('pg')

function parseDatabaseUrl(url) {
  // postgres://user:pass@host:port/db
  const u = new URL(url)
  return {
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    host: u.hostname,
    port: Number(u.port || 5432),
    database: u.pathname.replace(/^\//, ''),
  }
}

async function ensureDatabase() {
  const url = process.env.DATABASE_URL
  if (!url) {
    console.log('DATABASE_URL not set; skipping ensure-db')
    return
  }
  const cfg = parseDatabaseUrl(url)
  const adminClient = new Client({
    host: cfg.host,
    port: cfg.port,
    user: cfg.user,
    password: cfg.password,
    database: 'postgres',
  })

  await adminClient.connect()
  const dbName = cfg.database
  const res = await adminClient.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName])
  if (res.rowCount === 0) {
    console.log(`Creating database ${dbName}...`)
    await adminClient.query(`CREATE DATABASE "${dbName}"`)
  } else {
    console.log(`Database ${dbName} exists`)
  }
  await adminClient.end()
}

ensureDatabase()
  .then(() => {
    console.log('DB ensure complete')
  })
  .catch((e) => {
    console.error('ensure-db error:', e)
  })


