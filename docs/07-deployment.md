# 07 — Deployment

---

## Environment Variables

Create a `.env` file in the project root. Never commit this file.

```env
# ── Database ──────────────────────────────────────────────────────────────────
DATABASE_URL=postgresql://postgres:password@localhost:5432/grievance_db

# ── NextAuth ──────────────────────────────────────────────────────────────────
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate: node scripts/generate-secrets.cjs>

# ── WhatsApp Webhook ──────────────────────────────────────────────────────────
WHATSAPP_WEBHOOK_SECRET=<strong-random-hex>
# Outbound provider: gupshup | twilio | meta | stub
WHATSAPP_PROVIDER=stub

# Gupshup (set if WHATSAPP_PROVIDER=gupshup)
GUPSHUP_API_KEY=
GUPSHUP_APP_NAME=
GUPSHUP_SRC_PHONE=

# Twilio (set if WHATSAPP_PROVIDER=twilio)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# Meta Cloud API (set if WHATSAPP_PROVIDER=meta)
META_WHATSAPP_TOKEN=
META_PHONE_NUMBER_ID=

# ── Overdue Cron ──────────────────────────────────────────────────────────────
CRON_SECRET=<generate: node scripts/generate-secrets.cjs>

# ── AI ────────────────────────────────────────────────────────────────────────
GEMINI_API_KEY=your-gemini-api-key

# ── File Upload (S3 — production only) ────────────────────────────────────────
AWS_S3_BUCKET=
AWS_REGION=ap-south-1
# AWS credentials via IAM role (recommended) or:
# AWS_ACCESS_KEY_ID=
# AWS_SECRET_ACCESS_KEY=

# ── Seed ──────────────────────────────────────────────────────────────────────
SEED_DEFAULT_PASSWORD=GovSeed@2026!

# ── Environment ───────────────────────────────────────────────────────────────
NODE_ENV=development

# ── Public API URL ────────────────────────────────────────────────────────────
NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

## Local Development Setup

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma client
npx prisma generate

# 3. Create database and run migrations
npx prisma db push

# 4. Seed demo data
npm run seed

# 5. Start dev server (runs db check + seed + next dev)
npm run dev
```

App runs at http://localhost:3000

---

## Database Commands

```bash
# Push schema changes without migration (development)
npx prisma db push

# Create a named migration (production-safe)
npx prisma migrate dev --name "describe_your_change"

# Deploy migrations in production
npx prisma migrate deploy

# Open Prisma Studio (DB browser)
npx prisma studio

# Reset database and re-seed (destructive)
npm run uat:reset
```

---

## Production Checklist

### Security
- [ ] `NEXTAUTH_SECRET` is a strong random string — run `node scripts/generate-secrets.cjs` to auto-generate
- [ ] `WHATSAPP_WEBHOOK_SECRET` is a strong random string
- [ ] `CRON_SECRET` is a strong random string
- [ ] `DATABASE_URL` uses a dedicated DB user with least-privilege (not postgres superuser)
- [ ] `.env` is in `.gitignore` — never committed
- [ ] `NODE_ENV=production` is set
- [ ] HTTPS is enforced (SSL certificate on domain)
- [ ] All bypass/demo/debug login routes are blocked (middleware.ts already handles this)
- [ ] `SEED_DEFAULT_PASSWORD` changed from default

### Database
- [ ] PostgreSQL 15+ running
- [ ] Connection pooling configured (PgBouncer recommended for production)
- [ ] Daily automated backups enabled
- [ ] `prisma migrate deploy` run before starting the app

### Application
- [ ] `npm run build` completes with zero errors
- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] `NEXT_PUBLIC_API_URL` set to production domain
- [ ] `GEMINI_API_KEY` set (AI features degrade gracefully without it but won't work)
- [ ] `WHATSAPP_PROVIDER` set to real provider (`gupshup`/`twilio`/`meta`) with credentials
- [ ] `AWS_S3_BUCKET` + `AWS_REGION` set for file uploads in production

### Cron
- [ ] Vercel: `vercel.json` cron block present (`35 18 * * *` = 00:05 IST)
- [ ] Windows: run `setup-cron.bat` as Administrator to register Task Scheduler job
- [ ] Verify `CRON_SECRET` matches what `scripts/run-cron-overdue.cjs` uses

---

## npm Scripts

| Script | What it does |
|--------|-------------|
| `npm run dev` | Ensure DB exists → run migrations → seed → start Next.js dev server |
| `npm run build` | Build production bundle |
| `npm run start` | Start production server |
| `npm run seed` | Run demo seed (seed-demo.js) |
| `npm run seed:realistic` | Run realistic data seed |
| `npm run uat:setup` | Set up UAT environment |
| `npm run uat:reset` | Force-reset DB and re-run UAT setup |
| `npm run test` | Run Playwright e2e tests |
| `npm run test:ui` | Run Playwright with UI mode |
| `npx tsc --noEmit` | TypeScript type check (no output files) |

---

## Cron Setup

### Vercel (automatic)
`vercel.json` already contains:
```json
{
  "crons": [{ "path": "/api/cron/overdue", "schedule": "35 18 * * *" }]
}
```
Runs daily at 18:35 UTC = 00:05 IST.

### Windows (Task Scheduler)
Run once as Administrator:
```bat
setup-cron.bat
```
Registers a daily Task Scheduler job at 00:05 AM that runs `scripts/run-cron-overdue.cjs`.

### Manual trigger
```bash
curl -X POST https://yourdomain.com/api/cron/overdue \
  -H "Authorization: Bearer <CRON_SECRET>"
```
Or log in as MINISTER/PA/ADMIN and POST without the header — result is audit-logged.

---

## Generating Secrets

```bash
node scripts/generate-secrets.cjs
```
Auto-generates `NEXTAUTH_SECRET` and `CRON_SECRET` and writes them to `.env`.

---

## Docker (Optional)

A `Dockerfile` and `docker-compose.yml` are in the project root.

```bash
# Build and start with Docker Compose
docker-compose up --build

# Production compose
docker-compose -f docker-compose.production.yml up -d
```

---

## Migrations — Important Rules

1. **Never use `prisma migrate dev` on production** — use `prisma migrate deploy`
2. **Never rename existing columns** — it's a destructive migration
3. **Never rename existing API routes** — clients may depend on them
4. **Additive changes only** — add new fields/models, never remove
5. After any schema change: run `npx prisma generate` to update the client

---

## Module Status

| Module | Status | Coverage |
|--------|--------|----------|
| Grievances Management | ✅ Done | ~95% |
| PA Petition Command Center | ✅ Done | ~95% |
| Minister Dashboard | ✅ Done | ~90% |
| Visitors Management | ✅ Done | ~90% |
| Letters Management + Peshi | ✅ Done | ~90% |
| Assembly Questions (LAQ/LCQ) | ✅ Done | ~90% |
| Party Workers Management | ✅ Done | ~85% |
| Party Post Management | ✅ Done | ~85% |
| Multiple Office Management | ✅ Done | ~80% |
| Tasks Management | ✅ Done | ~85% |
| Fund Tracking (MLACDS/MPLADS) | ✅ Done | ~85% |
| Constituency Survey + Booth Grading | ✅ Done | ~80% |
| Constituent (Citizen) Database | ✅ Done | ~80% |
| WhatsApp Inbound (AI Multilingual) | ✅ Done | ~95% |
| WhatsApp Media Storage | ✅ Done | ~95% |
| Bulk WhatsApp/SMS Campaigns | ✅ Done | ~85% |
| Overdue Escalation Cron | ✅ Done | ~95% |
| File Upload (local + S3) | ✅ Done | ~90% |
| AI Assistant (Gemini) | ✅ Done | ~80% |
| AI Morning Briefing | ✅ Done | ~85% |
| AI Visit Brief (bilingual) | ✅ Done | ~85% |
| Field Officer Module | ✅ Done | ~85% |
| Analytics Dashboard | ✅ Done | ~80% |
| Audit Logs | ✅ Done | ~100% |
| Document Management | ⚠️ Partial | ~40% |
| Mobile App (Flutter) | ⚠️ Partial | ~20% |
| Multi-language UI (Telugu/Urdu) | ❌ Missing | ~5% |
| Voice Input (browser mic) | ❌ Missing | ~0% |
