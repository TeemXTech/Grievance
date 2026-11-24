# 01 — System Architecture

## Overview

Single Next.js 14 App Router monolith. No separate backend process. Everything — API routes, auth, DB access, UI — runs inside one Next.js application.

```
Browser / WhatsApp Webhook / Flutter App
              │
              ▼
        Next.js 14 (App Router)
        ┌─────────────────────────────────────┐
        │  middleware.ts  ← JWT auth + RBAC   │
        │                                     │
        │  app/                               │
        │  ├── (pages)   ← React UI           │
        │  └── api/      ← API Route handlers │
        │                                     │
        │  lib/                               │
        │  ├── prisma.ts      ← DB singleton  │
        │  ├── auth-options.ts← NextAuth cfg  │
        │  ├── auth-middleware.ts ← getAuthUser│
        │  ├── audit-log.ts   ← audit writes  │
        │  └── input-sanitizer.ts ← XSS guard │
        └─────────────────────────────────────┘
              │
              ▼
        PostgreSQL (via Prisma ORM)
```

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js App Router | 14.x |
| Language | TypeScript | 5.9 |
| Database | PostgreSQL | 15+ |
| ORM | Prisma | 5.x |
| Auth | NextAuth v4 (JWT sessions) | 4.x |
| UI Components | shadcn/ui + Radix UI | latest |
| Styling | Tailwind CSS | 3.x |
| Validation | Zod | 3.x |
| Charts | Recharts + Chart.js | latest |
| Maps | Leaflet + React-Leaflet | latest |
| PDF | jsPDF + PDFKit | latest |
| AI | Google Gemini API | latest |
| Testing | Playwright | 1.x |
| Password hashing | bcryptjs (cost 12) | 2.x |

---

## Folder Structure

```
d:\Grievance\
│
├── app/                          ← Next.js App Router root
│   ├── api/                      ← All API route handlers
│   │   ├── auth/                 ← NextAuth endpoints
│   │   ├── grievances/           ← Grievance CRUD
│   │   ├── pa/petitions/         ← PA petition management
│   │   ├── minister/             ← Minister dashboard APIs
│   │   ├── field/                ← Field officer APIs
│   │   ├── visitors/             ← Visitor management
│   │   ├── letters/              ← Letters + Peshi/Secretariat
│   │   ├── assembly-questions/   ← LAQ/LCQ Assembly Questions
│   │   ├── party-workers/        ← Party worker registry
│   │   ├── party-posts/          ← Party post definitions
│   │   ├── surveys/              ← Constituency surveys + booth grading
│   │   ├── constituents/         ← Citizen/voter database + booths + households
│   │   ├── funds/                ← MLACDS/MPLADS fund tracking
│   │   ├── campaigns/            ← WhatsApp/SMS campaigns
│   │   ├── tasks/                ← Task management (multi-office)
│   │   ├── offices/              ← Multi-office management
│   │   ├── calendar/             ← Tour appointments
│   │   ├── analytics/            ← Dashboard analytics
│   │   ├── audit-logs/           ← Immutable audit trail
│   │   ├── reports/              ← Nightly briefing, reports
│   │   ├── whatsapp/             ← WhatsApp intake + pending + approve
│   │   ├── government-projects/  ← Public works (PublicWork model)
│   │   ├── notifications/        ← In-app notifications
│   │   ├── documents/            ← Document management
│   │   ├── upload/               ← File upload (local dev / S3 prod)
│   │   ├── cron/overdue/         ← Overdue escalation cron endpoint
│   │   ├── ai/                   ← Voice intake, duplicate check, morning briefing, visit brief
│   │   ├── assistant/            ← Gemini AI assistant + health check
│   │   └── track/[qrCode]/       ← Public QR tracking (no auth)
│   │
│   ├── minister/                 ← Minister UI pages
│   ├── pa/                       ← PA UI pages
│   ├── back-officer/             ← Back Officer UI pages
│   ├── field-officer/            ← Field Officer UI pages
│   ├── admin/                    ← Admin UI pages
│   ├── visitors/                 ← Visitor management UI
│   ├── letters/                  ← Letters UI
│   ├── auth/login/               ← Login page
│   └── track/[qrCode]/           ← Public tracking page
│
├── components/                   ← Shared React components
│   ├── ui/                       ← shadcn/ui primitives
│   ├── forms/                    ← Form components
│   ├── layout/                   ← Navigation, sidebar
│   └── GovSidebar.tsx            ← Main sidebar component
│
├── lib/                          ← Server-side utilities
│   ├── prisma.ts                 ← Prisma singleton
│   ├── auth-options.ts           ← NextAuth configuration
│   ├── auth-middleware.ts        ← getAuthUser, hasRole, stripPrivateFields
│   ├── audit-log.ts              ← createAuditLog helper
│   ├── input-sanitizer.ts        ← XSS sanitization
│   ├── overdue-escalation.ts     ← Cron: petitions, tasks, letters, funds
│   ├── whatsapp-sender.ts        ← Provider-agnostic WhatsApp outbound
│   ├── gemini.ts                 ← Google Gemini AI wrapper
│   ├── notifications.ts          ← Notification helpers
│   └── reports.ts                ← Report generation
│
├── prisma/
│   ├── schema.prisma             ← Single source of truth for all models
│   ├── migrations/               ← Migration history
│   └── seed-demo.js              ← Demo data seed
│
├── scripts/
│   ├── run-cron-overdue.cjs      ← Node script for Windows Task Scheduler
│   └── generate-secrets.cjs      ← Auto-generates NEXTAUTH_SECRET + CRON_SECRET
│
├── setup-cron.bat                ← Registers Windows Task Scheduler job (run as Admin)
├── vercel.json                   ← Vercel cron: 35 18 * * * (00:05 IST)
├── middleware.ts                 ← Edge middleware: JWT check + RBAC
├── docs/                         ← This documentation folder
└── tests/e2e/                    ← Playwright end-to-end tests
```

---

## Request Lifecycle

Every HTTP request goes through this exact chain:

```
1. Browser sends request
        │
2. middleware.ts (Edge Runtime)
   ├── Is path in BLOCKED_PATHS?  → redirect /auth/login
   ├── Is path in PUBLIC_PATHS?   → allow through
   ├── getToken() from JWT cookie
   ├── No token?                  → redirect /auth/login (pages)
   │                              → 401 JSON (API routes)
   ├── Token exists, check ROLE_ROUTES[role]
   └── Role not allowed?          → redirect to role dashboard (pages)
                                  → 403 JSON (API routes)
        │
3. API Route Handler (app/api/...)
   ├── getAuthUser()              ← reads NextAuth session
   ├── Role check (hasRole / includes)
   ├── Input validation (Zod or manual)
   ├── sanitizeInput() on all string inputs
   ├── Prisma query (parameterized — no SQL injection possible)
   ├── stripPrivateFields() for lower roles
   ├── createAuditLog() for sensitive writes
   └── Return JSON response
        │
4. PostgreSQL via Prisma
```

---

## Prisma Singleton Pattern

All routes import from `lib/prisma.ts`. Never `new PrismaClient()` directly.

```typescript
// lib/prisma.ts
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }
export const prisma = globalForPrisma.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

This prevents connection pool exhaustion during Next.js hot reloads in development.

---

## Reference Number Generation Pattern

All reference numbers use `findFirst + increment` — never `count + N`.

```typescript
// Safe pattern used everywhere
const prefix = `GRV-${year}-`
const last = await prisma.grievance.findFirst({
  where:   { referenceNumber: { startsWith: prefix } },
  orderBy: { referenceNumber: "desc" },
})
const seq = last ? parseInt(last.referenceNumber.split("-").pop()!, 10) + 1 : 1
return `${prefix}${String(seq).padStart(4, "0")}`
```

Reference number formats:
| Entity | Format | Example |
|--------|--------|---------|
| Grievance | `GRV-YYYY-NNNN` | `GRV-2025-0042` |
| Petition | `REQ-{TYPE}-YYYY-NNNN` | `REQ-CMRF-2025-0007` |
| Public Work | `WRK-{CAT}-YYYY-NNNN` | `WRK-RD-2025-0015` |
| Letter | `LTR-{DIR}-YYYY-NNNN` | `LTR-OUT-2025-0003` |
| Fund | `FUND-{SCHEME}-YYYY-NNNN` | `FUND-MLACDS-2025-0001` |
| Visitor Token | `VIS-YYYYMMDD-NNNN` | `VIS-20250812-0034` |
| Assembly Question (Starred) | `LAQ-YYYY-NNNN` | `LAQ-2026-0142` |
| Assembly Question (Unstarred) | `LCQ-YYYY-NNNN` | `LCQ-2026-0055` |
| Assembly Question (Other) | `AQ-YYYY-NNNN` | `AQ-2026-0010` |
