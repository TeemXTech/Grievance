// scripts/run-cron-overdue.cjs
// Called by: npm run cron:overdue
// Schedule:  Windows Task Scheduler or Linux crontab — daily at 00:05 IST
//
// This script hits the local API endpoint with the CRON_SECRET.
// The app (next start) must be running before this script fires.

const http = require('http')
const https = require('https')

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') })

const BASE_URL  = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
const SECRET    = process.env.CRON_SECRET

if (!SECRET) {
  console.error('[cron] ERROR: CRON_SECRET is not set in .env — aborting.')
  process.exit(1)
}

const url     = new URL('/api/cron/overdue', BASE_URL)
const isHttps = url.protocol === 'https:'
const lib     = isHttps ? https : http

const options = {
  hostname: url.hostname,
  port:     url.port || (isHttps ? 443 : 80),
  path:     url.pathname,
  method:   'POST',
  headers: {
    'Authorization': `Bearer ${SECRET}`,
    'Content-Type':  'application/json',
    'Content-Length': 0,
  },
}

console.log(`[cron] ${new Date().toISOString()} — running overdue escalation...`)

const req = lib.request(options, (res) => {
  let data = ''
  res.on('data', chunk => { data += chunk })
  res.on('end', () => {
    try {
      const json = JSON.parse(data)
      if (json.success) {
        console.log(`[cron] ✅ Done — petitions: ${json.petitionsMarked}, tasks: ${json.tasksMarked}, funds stuck: ${json.fundsMarkedStuck}, overdue letters: ${json.overdueLetters}`)
      } else {
        console.error(`[cron] ❌ API returned error:`, json)
        process.exit(1)
      }
    } catch (e) {
      console.error(`[cron] ❌ Could not parse response:`, data)
      process.exit(1)
    }
  })
})

req.on('error', (err) => {
  console.error(`[cron] ❌ Request failed:`, err.message)
  console.error(`[cron]    Is the app running at ${BASE_URL}?`)
  process.exit(1)
})

req.end()
