# 03 — Auth and Roles

## Authentication Stack

```
User submits email + password
        │
NextAuth Credentials Provider (lib/auth-options.ts)
        │
prisma.user.findUnique({ where: { email } })
        │
bcrypt.compare(password, user.passwordHash)   ← cost factor 12
        │
Returns user object → NextAuth creates JWT
        │
JWT stored in httpOnly cookie (8-hour session)
        │
Every subsequent request: middleware.ts reads JWT via getToken()
```

---

## JWT Payload

```typescript
{
  id:    string   // User.id (cuid)
  role:  string   // User.role enum value
  phone: string   // User.phone
  name:  string   // User.name
  email: string   // User.email
  iat:   number   // Issued at
  exp:   number   // Expires at (8 hours)
}
```

---

## Role Hierarchy

```
MINISTER        ← Read-only executive. Sees everything including privateNotes.
    │
    PA           ← Full operational control. Creates/edits petitions, letters, campaigns.
    │
    ADMIN        ← Full access + user management + audit logs.
    │
    BACK_OFFICER ← Data entry. Creates grievances, petitions, visitors. Cannot see privateNotes.
    │
    OFFICER      ← Can read/update grievances assigned to them.
    │
    FIELD_OFFICER← Geo-scoped. Sees only their assigned petitions/tasks/works.
    │
    LOCAL_LEADER ← Dashboard only.
    │
    PUBLIC       ← Submit grievances + track their own by phone number.
```

---

## Middleware Route Guards (middleware.ts)

The Edge middleware runs on every request before it reaches any route handler.

### ROLE_ROUTES — what each role can access

| Role | Allowed Prefixes |
|------|-----------------|
| MINISTER | /minister, /visitors, /letters, /api/minister, /api/pa, /api/analytics, /api/categories, /api/notifications, /api/ai, /api/users, /api/dashboard, /api/visitors, /api/letters, /api/party-workers, /api/party-posts, /api/offices, /api/tasks, /api/surveys, /api/funds, /api/constituents, /api/documents, /api/campaigns, /api/reports, /api/audit-logs, /api/government-projects, /api/calendar, /api/assembly-questions, /api/cron, /api/whatsapp |
| PA | /pa, /visitors, /letters, /api/pa, /api/minister, /api/categories, /api/notifications, /api/ai, /api/analytics, /api/visitors, /api/letters, /api/party-workers, /api/party-posts, /api/offices, /api/tasks, /api/surveys, /api/funds, /api/constituents, /api/documents, /api/campaigns, /api/reports, /api/users, /api/government-projects, /api/calendar, /api/assembly-questions, /api/cron, /api/upload, /api/whatsapp |
| BACK_OFFICER | /back-officer, /visitors, /letters, /api/grievances, /api/requests, /api/minister/projects, /api/categories, /api/notifications, /api/ai/voice-intake, /api/ai/duplicate-check, /api/dashboard, /api/visitors, /api/letters, /api/party-workers, /api/party-posts, /api/offices, /api/tasks, /api/surveys, /api/funds, /api/constituents, /api/documents, /api/pa/metadata, /api/government-projects, /api/calendar, /api/assembly-questions, /api/upload, /api/whatsapp |
| FIELD_OFFICER | /field, /field-officer, /api/field, /api/notifications, /api/tasks, /api/surveys, /api/constituents, /api/minister/projects, /api/upload |
| ADMIN | /admin, /visitors, /api/admin, /api/users, /api/grievances, /api/categories, /api/requests, /api/minister, /api/pa, /api/field, /api/analytics, /api/notifications, /api/ai, /api/visitors, /api/letters, /api/party-workers, /api/party-posts, /api/offices, /api/tasks, /api/surveys, /api/funds, /api/constituents, /api/documents, /api/campaigns, /api/reports, /api/audit-logs, /api/government-projects, /api/calendar, /api/assembly-questions, /api/cron, /api/upload, /api/whatsapp |
| OFFICER | /dashboard, /api/grievances, /api/categories, /api/notifications |
| PUBLIC | /dashboard, /api/grievances/create, /api/track |

### PUBLIC_PATHS — no auth required
`/auth/login`, `/api/auth`, `/api/track`, `/track`, `/_next`, static assets

### BLOCKED_PATHS — always redirect to login
`/bypass-login`, `/demo-login`, `/debug-login`, `/test-login`, `/minister-login`, `/pa-login`, `/field-login`, `/back-officer-login`

---

## API Route Auth Pattern

Every API route handler follows this exact pattern:

```typescript
export async function GET(req: NextRequest) {
  // 1. Get authenticated user from session
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // 2. Role check
  if (!["MINISTER", "PA", "ADMIN"].includes(user.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  // 3. Business logic
  const data = await prisma.someModel.findMany({ ... })

  // 4. Strip private fields for lower roles
  const result = canSeePrivate ? data : data.map(d => ({ ...d, privateNotes: undefined }))

  return NextResponse.json({ success: true, data: result })
}
```

---

## getAuthUser()

Defined in `lib/auth-middleware.ts`. Reads the NextAuth session server-side.

```typescript
export async function getAuthUser(): Promise<AuthenticatedUser | null> {
  const session = await getServerSession(authOptions)
  if (!session?.user) return null
  const user = session.user as any
  if (!user.id || !user.role) return null
  return { id, name, email, role, phone }
}
```

Returns `null` if not authenticated. Routes must check for null and return 401.

---

## Private Data Rules

| Field | Visible to |
|-------|-----------|
| `privateNotes` on any model | MINISTER, PA, ADMIN only |
| `endorsementText` on Letter | MINISTER, PA, ADMIN only (BACK_OFFICER gets 403 on write) |
| `draftAnswerText` on AssemblyQuestion | MINISTER, PA, ADMIN only |
| `applicantAadhar` on PetitionRequest | MINISTER, PA, ADMIN only |
| `voterId` on PartyWorker / Citizen | MINISTER, PA, ADMIN only |
| `aadharLast4` on PartyWorker / Citizen | MINISTER, PA, ADMIN only |
| `phone` on Citizen | MINISTER, PA, ADMIN, BACK_OFFICER (FIELD_OFFICER sees masked: `91XXXXXX10`) |
| `epicNumber` on Citizen | MINISTER, PA, ADMIN, BACK_OFFICER (FIELD_OFFICER sees `ABCXXXXX`) |

`stripPrivateFields()` in `lib/auth-middleware.ts` handles automatic stripping.

---

## Security Headers

Set on every response by `addSecurityHeaders()` in middleware:

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(self)
```

---

## Default Login Credentials (Development Only)

| Email | Role | Dashboard |
|-------|------|-----------|
| minister@gov.in | MINISTER | /minister/dashboard |
| pa@gov.in | PA | /pa/dashboard |
| pa2@gov.in | PA | /pa/dashboard |
| back@gov.in | BACK_OFFICER | /back-officer/dashboard |
| field@gov.in | FIELD_OFFICER | /field-officer/dashboard |
| admin@gov.in | ADMIN | /admin/dashboard |

All passwords: `GovSeed@2026!` (configurable via `SEED_DEFAULT_PASSWORD` env var)

> MINISTER role cannot be created via `/api/users` — seed only. This is enforced in the users POST handler.
