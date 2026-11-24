// scripts/generate-secrets.cjs
// Run ONCE: node scripts/generate-secrets.cjs
// Replaces all placeholder secrets in .env with real cryptographic values.

const crypto = require('crypto')
const fs     = require('fs')
const path   = require('path')

const ENV_PATH = path.join(__dirname, '..', '.env')

if (!fs.existsSync(ENV_PATH)) {
  console.error('❌ .env file not found. Create it first from .env.example')
  process.exit(1)
}

let env = fs.readFileSync(ENV_PATH, 'utf8')

let changed = 0

function replaceIfPlaceholder(content, key, placeholder, generator) {
  const regex = new RegExp(`(${key}=)(${placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`)
  if (regex.test(content)) {
    const newVal = generator()
    console.log(`✅ Generated new ${key}`)
    changed++
    return content.replace(regex, `$1${newVal}`)
  }
  return content
}

// NEXTAUTH_SECRET
env = replaceIfPlaceholder(env, 'NEXTAUTH_SECRET', 'REPLACE_WITH_STRONG_RANDOM_SECRET',
  () => crypto.randomBytes(32).toString('base64'))

// WHATSAPP_WEBHOOK_SECRET
env = replaceIfPlaceholder(env, 'WHATSAPP_WEBHOOK_SECRET', 'wa-secret-change-in-production',
  () => 'wa-' + crypto.randomBytes(24).toString('hex'))

// CRON_SECRET
env = replaceIfPlaceholder(env, 'CRON_SECRET', 'cron-secret-change-in-production',
  () => 'cron-' + crypto.randomBytes(24).toString('hex'))

if (changed === 0) {
  console.log('ℹ️  All secrets already look non-default. No changes made.')
} else {
  fs.writeFileSync(ENV_PATH, env, 'utf8')
  console.log(`\n✅ ${changed} secret(s) updated in .env`)
  console.log('⚠️  Restart the app for changes to take effect: npm run dev')
}
