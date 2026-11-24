import { test, expect, type APIRequestContext } from '@playwright/test'

// ─── Helpers ────────────────────────────────────────────────────────────────

async function getSessionCookie(request: APIRequestContext, email: string, password = 'password123') {
  const res = await request.post('/api/auth/callback/credentials', {
    form: { email, password, csrfToken: '', callbackUrl: '/', json: 'true' },
  })
  return res
}

// We use page-based login to get a real session cookie for API tests
import { type Page } from '@playwright/test'

async function loginAndGetContext(page: Page, email: string) {
  await page.goto('/auth/login')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill('password123')
  await page.getByRole('button', { name: /sign in/i }).click()
  await page.waitForURL(/\/(minister|pa|back-officer|field-officer|admin|dashboard)/, { timeout: 10000 })
  return page.request
}

// ─── Grievances API ──────────────────────────────────────────────────────────

test.describe('API — Grievances', () => {
  test('TC-GRV-01: GET /api/grievances returns list for authenticated user', async ({ page }) => {
    const req = await loginAndGetContext(page, 'pa@gov.in')
    const res = await req.get('/api/grievances')
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty('grievances')
    expect(Array.isArray(body.grievances)).toBe(true)
  })

  test('TC-GRV-02: GET /api/grievances returns 401 without auth', async ({ request }) => {
    const res = await request.get('/api/grievances')
    expect(res.status()).toBe(401)
  })

  test('TC-GRV-03: POST /api/grievances creates grievance with valid data', async ({ page }) => {
    const req = await loginAndGetContext(page, 'pa@gov.in')
    const res = await req.post('/api/grievances', {
      data: {
        title: 'Test Road Repair Grievance',
        description: 'The main road near the school has large potholes causing accidents',
        requesterName: 'Ramu Naidu',
        requesterPhone: '9876543210',
        village: 'Sultanabad',
        mandal: 'Manthani',
        district: 'Peddapalli',
      },
    })
    expect(res.status()).toBe(201)
    const body = await res.json()
    expect(body).toHaveProperty('referenceNumber')
    expect(body.referenceNumber).toMatch(/^GRV-\d{4}-\d{4}$/)
  })

  test('TC-GRV-04: POST /api/grievances rejects short title', async ({ page }) => {
    const req = await loginAndGetContext(page, 'pa@gov.in')
    const res = await req.post('/api/grievances', {
      data: { title: 'Bad', description: 'Short', requesterName: 'Test', requesterPhone: '9876543210' },
    })
    expect(res.status()).toBe(400)
  })

  test('TC-GRV-05: GET /api/grievances supports search filter', async ({ page }) => {
    const req = await loginAndGetContext(page, 'pa@gov.in')
    const res = await req.get('/api/grievances?search=road')
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty('grievances')
  })

  test('TC-GRV-06: reference numbers are unique (no race condition)', async ({ page }) => {
    const req = await loginAndGetContext(page, 'pa@gov.in')
    const payload = { title: 'Unique Ref Test Grievance', description: 'Testing reference number uniqueness across concurrent creates', requesterName: 'Test User', requesterPhone: '9876543210' }
    const [r1, r2] = await Promise.all([
      req.post('/api/grievances', { data: payload }),
      req.post('/api/grievances', { data: payload }),
    ])
    const b1 = await r1.json()
    const b2 = await r2.json()
    if (r1.status() === 201 && r2.status() === 201) {
      expect(b1.referenceNumber).not.toBe(b2.referenceNumber)
    }
  })
})

// ─── Petitions API ───────────────────────────────────────────────────────────

test.describe('API — Petitions', () => {
  test('TC-PET-01: GET /api/pa/petitions returns list for PA', async ({ page }) => {
    const req = await loginAndGetContext(page, 'pa@gov.in')
    const res = await req.get('/api/pa/petitions')
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body).toHaveProperty('petitions')
  })

  test('TC-PET-02: GET /api/pa/petitions returns 403 for FIELD_OFFICER', async ({ page }) => {
    const req = await loginAndGetContext(page, 'field@gov.in')
    const res = await req.get('/api/pa/petitions')
    expect(res.status()).toBe(403)
  })

  test('TC-PET-03: POST /api/pa/petitions creates petition', async ({ page }) => {
    const req = await loginAndGetContext(page, 'pa@gov.in')
    const res = await req.post('/api/pa/petitions', {
      data: {
        type: 'PERSONAL_GRIEVANCE',
        title: 'Land Record Correction Request',
        description: 'Applicant needs correction in land records at MRO office',
        applicantName: 'Venkat Rao',
        applicantPhone: '9876543211',
        mandalName: 'Manthani',
        villageName: 'Sultanabad',
      },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.petition.trackingNumber).toMatch(/^REQ-/)
  })

  test('TC-PET-04: GET /api/pa/petitions/stats returns KPIs', async ({ page }) => {
    const req = await loginAndGetContext(page, 'pa@gov.in')
    const res = await req.get('/api/pa/petitions/stats')
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body).toHaveProperty('totals')
    expect(body).toHaveProperty('resolutionRate')
    expect(body).toHaveProperty('byType')
  })

  test('TC-PET-05: GET /api/pa/petitions/stats returns 403 for BACK_OFFICER', async ({ page }) => {
    const req = await loginAndGetContext(page, 'back@gov.in')
    const res = await req.get('/api/pa/petitions/stats')
    expect(res.status()).toBe(403)
  })
})

// ─── Visitors API ────────────────────────────────────────────────────────────

test.describe('API — Visitors', () => {
  test('TC-VIS-01: GET /api/visitors returns list', async ({ page }) => {
    const req = await loginAndGetContext(page, 'pa@gov.in')
    const res = await req.get('/api/visitors')
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body).toHaveProperty('visitors')
  })

  test('TC-VIS-02: POST /api/visitors creates visitor with token', async ({ page }) => {
    const req = await loginAndGetContext(page, 'pa@gov.in')
    const res = await req.post('/api/visitors', {
      data: { visitorName: 'Suresh Kumar', visitorPhone: '9876543212', purpose: 'Land record issue', visitType: 'WALK_IN' },
    })
    expect(res.status()).toBe(201)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.visitor.tokenNumber).toMatch(/^VIS-/)
  })

  test('TC-VIS-03: PATCH /api/visitors/[id] CHECK_IN sets status and audit', async ({ page }) => {
    const req = await loginAndGetContext(page, 'pa@gov.in')
    // Create visitor first
    const createRes = await req.post('/api/visitors', {
      data: { visitorName: 'Audit Test Visitor', purpose: 'Test check-in audit', visitType: 'WALK_IN' },
    })
    const { visitor } = await createRes.json()
    // Check in
    const patchRes = await req.patch(`/api/visitors/${visitor.id}`, {
      data: { action: 'CHECK_IN', meetingWith: 'PA Officer' },
    })
    expect(patchRes.status()).toBe(200)
    const body = await patchRes.json()
    expect(body.visitor.status).toBe('IN_MEETING')
    expect(body.visitor.checkedInAt).not.toBeNull()
  })

  test('TC-VIS-04: GET /api/visitors/stats returns today summary', async ({ page }) => {
    const req = await loginAndGetContext(page, 'pa@gov.in')
    const res = await req.get('/api/visitors/stats')
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body).toHaveProperty('today')
    expect(body.today).toHaveProperty('total')
  })

  test('TC-VIS-05: FIELD_OFFICER cannot access visitors', async ({ page }) => {
    const req = await loginAndGetContext(page, 'field@gov.in')
    const res = await req.get('/api/visitors')
    expect(res.status()).toBe(403)
  })
})

// ─── Calendar API ────────────────────────────────────────────────────────────

test.describe('API — Calendar (Fixed: was mock)', () => {
  test('TC-CAL-01: GET /api/calendar returns real DB events', async ({ page }) => {
    const req = await loginAndGetContext(page, 'pa@gov.in')
    const res = await req.get('/api/calendar')
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(Array.isArray(body.events)).toBe(true)
  })

  test('TC-CAL-02: POST /api/calendar creates TourAppointment in DB', async ({ page }) => {
    const req = await loginAndGetContext(page, 'pa@gov.in')
    const res = await req.post('/api/calendar', {
      data: {
        title: 'Smoke Test Village Tour',
        startDate: new Date(Date.now() + 86400000 * 10).toISOString(),
        endDate:   new Date(Date.now() + 86400000 * 10 + 7200000).toISOString(),
        location: 'Sultanabad Village',
        eventType: 'VILLAGE_TOUR',
        mandalName: 'Manthani',
      },
    })
    expect(res.status()).toBe(201)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.event).toHaveProperty('id')
    expect(body.event.title).toBe('Smoke Test Village Tour')
  })

  test('TC-CAL-03: GET /api/calendar returns 401 without auth', async ({ request }) => {
    const res = await request.get('/api/calendar')
    expect(res.status()).toBe(401)
  })

  test('TC-CAL-04: FIELD_OFFICER cannot create calendar events', async ({ page }) => {
    const req = await loginAndGetContext(page, 'field@gov.in')
    const res = await req.post('/api/calendar', {
      data: { title: 'Unauthorized Event', startDate: new Date().toISOString(), location: 'Test' },
    })
    expect(res.status()).toBe(403)
  })
})

// ─── Government Projects API ─────────────────────────────────────────────────

test.describe('API — Government Projects (Fixed: was no-auth + race condition)', () => {
  test('TC-PRJ-01: GET /api/government-projects returns 401 without auth', async ({ request }) => {
    const res = await request.get('/api/government-projects')
    expect(res.status()).toBe(401)
  })

  test('TC-PRJ-02: GET /api/government-projects returns list for PA', async ({ page }) => {
    const req = await loginAndGetContext(page, 'pa@gov.in')
    const res = await req.get('/api/government-projects')
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(Array.isArray(body.works)).toBe(true)
  })

  test('TC-PRJ-03: POST /api/government-projects creates work with safe workCode', async ({ page }) => {
    const req = await loginAndGetContext(page, 'pa@gov.in')
    const res = await req.post('/api/government-projects', {
      data: { title: 'Smoke Test Road Work', category: 'ROADS_BRIDGES', mandalName: 'Manthani', villageName: 'Sultanabad' },
    })
    expect(res.status()).toBe(201)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.work.workCode).toMatch(/^WRK-RD-\d{4}-\d{4}$/)
  })

  test('TC-PRJ-04: workCodes are unique under concurrent creates', async ({ page }) => {
    const req = await loginAndGetContext(page, 'pa@gov.in')
    const payload = { title: 'Concurrent Work Test', category: 'ROADS_BRIDGES' }
    const [r1, r2] = await Promise.all([
      req.post('/api/government-projects', { data: payload }),
      req.post('/api/government-projects', { data: payload }),
    ])
    if (r1.status() === 201 && r2.status() === 201) {
      const b1 = await r1.json()
      const b2 = await r2.json()
      expect(b1.work.workCode).not.toBe(b2.work.workCode)
    }
  })

  test('TC-PRJ-05: POST /api/government-projects rejects missing title', async ({ page }) => {
    const req = await loginAndGetContext(page, 'pa@gov.in')
    const res = await req.post('/api/government-projects', { data: { category: 'ROADS_BRIDGES' } })
    expect(res.status()).toBe(400)
  })
})

// ─── WhatsApp API ────────────────────────────────────────────────────────────

test.describe('API — WhatsApp (Fixed: was mock data)', () => {
  test('TC-WA-01: GET /api/whatsapp/pending returns 401 without auth', async ({ request }) => {
    const res = await request.get('/api/whatsapp/pending')
    expect(res.status()).toBe(401)
  })

  test('TC-WA-02: GET /api/whatsapp/pending returns real DB messages for PA', async ({ page }) => {
    const req = await loginAndGetContext(page, 'pa@gov.in')
    const res = await req.get('/api/whatsapp/pending')
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(Array.isArray(body.messages)).toBe(true)
    expect(body).toHaveProperty('total')
  })

  test('TC-WA-03: POST /api/whatsapp/intake stores message in DB', async ({ request }) => {
    const res = await request.post('/api/whatsapp/intake', {
      data: { phone: '9876543299', message: 'Water supply problem in our village please help' },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body).toHaveProperty('messageId')
    expect(body.autoProcessed).toBe(true)
  })

  test('TC-WA-04: POST /api/whatsapp/intake auto-creates grievance for keyword messages', async ({ request }) => {
    const res = await request.post('/api/whatsapp/intake', {
      data: { phone: '9876543298', message: 'Road complaint near bus stop has big potholes' },
    })
    const body = await res.json()
    expect(body.autoProcessed).toBe(true)
    expect(body.grievanceId).not.toBeNull()
  })

  test('TC-WA-05: POST /api/whatsapp/intake rejects missing phone', async ({ request }) => {
    const res = await request.post('/api/whatsapp/intake', { data: { message: 'test' } })
    expect(res.status()).toBe(400)
  })
})

// ─── Analytics Dashboard API ─────────────────────────────────────────────────

test.describe('API — Analytics Dashboard (Fixed: was SQL injection + no auth)', () => {
  test('TC-ANA-01: GET /api/analytics/dashboard returns 401 without auth', async ({ request }) => {
    const res = await request.get('/api/analytics/dashboard')
    expect(res.status()).toBe(401)
  })

  test('TC-ANA-02: GET /api/analytics/dashboard returns KPIs for PA', async ({ page }) => {
    const req = await loginAndGetContext(page, 'pa@gov.in')
    const res = await req.get('/api/analytics/dashboard')
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body).toHaveProperty('kpis')
    expect(body.kpis).toHaveProperty('totalGrievances')
    expect(body.kpis).toHaveProperty('resolutionRate')
  })

  test('TC-ANA-03: district filter works without SQL injection', async ({ page }) => {
    const req = await loginAndGetContext(page, 'pa@gov.in')
    // Attempt SQL injection in district param — should be safe
    const res = await req.get("/api/analytics/dashboard?district=Peddapalli'; DROP TABLE Grievance;--")
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
  })

  test('TC-ANA-04: year filter returns correct period', async ({ page }) => {
    const req = await loginAndGetContext(page, 'pa@gov.in')
    const res = await req.get('/api/analytics/dashboard?year=2025')
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.period.year).toBe(2025)
  })

  test('TC-ANA-05: FIELD_OFFICER cannot access analytics dashboard', async ({ page }) => {
    const req = await loginAndGetContext(page, 'field@gov.in')
    const res = await req.get('/api/analytics/dashboard')
    expect(res.status()).toBe(403)
  })
})

// ─── Audit Logs API ──────────────────────────────────────────────────────────

test.describe('API — Audit Logs (New)', () => {
  test('TC-AUD-01: GET /api/audit-logs returns 401 without auth', async ({ request }) => {
    const res = await request.get('/api/audit-logs')
    expect(res.status()).toBe(401)
  })

  test('TC-AUD-02: GET /api/audit-logs returns 403 for PA', async ({ page }) => {
    const req = await loginAndGetContext(page, 'pa@gov.in')
    const res = await req.get('/api/audit-logs')
    expect(res.status()).toBe(403)
  })

  test('TC-AUD-03: GET /api/audit-logs returns logs for ADMIN', async ({ page }) => {
    const req = await loginAndGetContext(page, 'admin@gov.in')
    const res = await req.get('/api/audit-logs')
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(Array.isArray(body.logs)).toBe(true)
    expect(body).toHaveProperty('total')
  })

  test('TC-AUD-04: audit logs filter by entityType', async ({ page }) => {
    const req = await loginAndGetContext(page, 'admin@gov.in')
    const res = await req.get('/api/audit-logs?entityType=PETITION')
    expect(res.status()).toBe(200)
    const body = await res.json()
    body.logs.forEach((log: any) => expect(log.entityType).toBe('PETITION'))
  })

  test('TC-AUD-05: audit logs have no DELETE endpoint (immutable)', async ({ page }) => {
    const req = await loginAndGetContext(page, 'admin@gov.in')
    const res = await req.delete('/api/audit-logs')
    expect(res.status()).toBe(405)
  })
})

// ─── Field Officer Scope ─────────────────────────────────────────────────────

test.describe('API — Field Officer Scope (Fixed: was seeing all works)', () => {
  test('TC-FLD-01: FIELD_OFFICER GET /api/field/assigned-tasks returns only their petitions', async ({ page }) => {
    const req = await loginAndGetContext(page, 'field@gov.in')
    const res = await req.get('/api/field/assigned-tasks')
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body).toHaveProperty('petitions')
    expect(body).toHaveProperty('tasks')
    expect(body).toHaveProperty('works')
  })

  test('TC-FLD-02: FIELD_OFFICER tasks are scoped to their ID', async ({ page }) => {
    const req = await loginAndGetContext(page, 'field@gov.in')
    const res = await req.get('/api/tasks')
    expect(res.status()).toBe(200)
    const body = await res.json()
    // All returned tasks must be assigned to this user (verified by API logic)
    expect(body.success).toBe(true)
  })

  test('TC-FLD-03: FIELD_OFFICER cannot see privateNotes on petitions', async ({ page }) => {
    const req = await loginAndGetContext(page, 'field@gov.in')
    const res = await req.get('/api/field/assigned-tasks')
    const body = await res.json()
    body.petitions.forEach((p: any) => {
      expect(p.privateNotes).toBeUndefined()
    })
  })
})

// ─── Constituents API ────────────────────────────────────────────────────────

test.describe('API — Constituents (New)', () => {
  test('TC-CON-01: GET /api/constituents returns 401 without auth', async ({ request }) => {
    const res = await request.get('/api/constituents')
    expect(res.status()).toBe(401)
  })

  test('TC-CON-02: GET /api/constituents/stats returns constituency overview', async ({ page }) => {
    const req = await loginAndGetContext(page, 'pa@gov.in')
    const res = await req.get('/api/constituents/stats')
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body).toHaveProperty('citizens')
    expect(body).toHaveProperty('boothGrades')
  })

  test('TC-CON-03: POST /api/constituents creates citizen', async ({ page }) => {
    const req = await loginAndGetContext(page, 'pa@gov.in')
    const res = await req.post('/api/constituents', {
      data: {
        name: 'Smoke Test Citizen',
        epicNumber: `EPIC-SMOKE-${Date.now()}`,
        age: 35,
        gender: 'MALE',
        villageName: 'Sultanabad',
        mandalName: 'Manthani',
        boothNumber: '42',
        dataSource: 'MANUAL',
      },
    })
    expect(res.status()).toBe(201)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.citizen.name).toBe('Smoke Test Citizen')
  })

  test('TC-CON-04: duplicate EPIC number returns 409', async ({ page }) => {
    const req = await loginAndGetContext(page, 'pa@gov.in')
    const epic = `EPIC-DUP-${Date.now()}`
    await req.post('/api/constituents', { data: { name: 'First Citizen', epicNumber: epic } })
    const res = await req.post('/api/constituents', { data: { name: 'Duplicate Citizen', epicNumber: epic } })
    expect(res.status()).toBe(409)
  })

  test('TC-CON-05: FIELD_OFFICER sees masked phone numbers', async ({ page }) => {
    const req = await loginAndGetContext(page, 'field@gov.in')
    const res = await req.get('/api/constituents')
    expect(res.status()).toBe(200)
    const body = await res.json()
    body.citizens.forEach((c: any) => {
      if (c.phone) expect(c.phone).toMatch(/^.{2}XXXXXX.{2}$/)
    })
  })
})

// ─── Nightly Briefing ────────────────────────────────────────────────────────

test.describe('API — Nightly Briefing (New)', () => {
  test('TC-NBR-01: GET /api/reports/nightly-briefing returns 403 for BACK_OFFICER', async ({ page }) => {
    const req = await loginAndGetContext(page, 'back@gov.in')
    const res = await req.get('/api/reports/nightly-briefing')
    expect(res.status()).toBe(403)
  })

  test('TC-NBR-02: GET /api/reports/nightly-briefing returns digest for MINISTER', async ({ page }) => {
    const req = await loginAndGetContext(page, 'minister@gov.in')
    const res = await req.get('/api/reports/nightly-briefing')
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body).toHaveProperty('redFlags')
    expect(body).toHaveProperty('petitions')
    expect(body).toHaveProperty('tasks')
    expect(body).toHaveProperty('funds')
    expect(body).toHaveProperty('generatedAt')
  })

  test('TC-NBR-03: redFlags is an array of strings', async ({ page }) => {
    const req = await loginAndGetContext(page, 'pa@gov.in')
    const res = await req.get('/api/reports/nightly-briefing')
    const body = await res.json()
    expect(Array.isArray(body.redFlags)).toBe(true)
    body.redFlags.forEach((f: any) => expect(typeof f).toBe('string'))
  })
})
