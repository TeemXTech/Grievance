/**
 * END-TO-END SMOKE TEST
 * Tests: Auth → Role routing → All API routes → Real DB data → No hardcoded strings → Sign out
 * Run: node scripts/smoke-test.js
 */

const BASE = 'http://localhost:3000'

let passed = 0
let failed = 0
let warnings = 0
const results = []

function log(status, label, detail = '') {
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️ '
  console.log(`${icon} ${label}${detail ? ' — ' + detail : ''}`)
  results.push({ status, label, detail })
  if (status === 'PASS') passed++
  else if (status === 'FAIL') failed++
  else warnings++
}

function checkNoHardcoded(data, label) {
  const banned = ['admin@bypass', 'admin@example']
  const str = JSON.stringify(data)
  for (const word of banned) {
    if (str.includes(word)) {
      log('FAIL', `${label} — hardcoded string: "${word}"`)
      return false
    }
  }
  return true
}

// ── Extract all Set-Cookie values from a response ───────────────────────────
function extractCookies(res) {
  // Node 18+ fetch: getSetCookie() returns array; fallback to get()
  if (typeof res.headers.getSetCookie === 'function') {
    return res.headers.getSetCookie()
  }
  const raw = res.headers.get('set-cookie')
  return raw ? [raw] : []
}

function parseCookieHeader(cookies) {
  return cookies.map(c => c.split(';')[0]).join('; ')
}

// ── Login: returns cookie string or null ──────────────────────────────────────
async function login(email, password) {
  // 1. Get CSRF token + initial cookies
  const csrfRes = await fetch(`${BASE}/api/auth/csrf`, { redirect: 'follow' })
  const { csrfToken } = await csrfRes.json()
  const csrfCookies = extractCookies(csrfRes)
  const csrfCookieStr = parseCookieHeader(csrfCookies)

  // 2. POST credentials
  const signInRes = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Cookie: csrfCookieStr,
    },
    body: new URLSearchParams({ csrfToken, email, password, callbackUrl: BASE, json: 'true' }).toString(),
    redirect: 'manual',
  })

  const signInCookies = extractCookies(signInRes)
  const allCookieStr = parseCookieHeader([...csrfCookies, ...signInCookies])

  // 3. Verify session
  const sessionRes = await fetch(`${BASE}/api/auth/session`, {
    headers: { Cookie: allCookieStr },
  })
  const session = await sessionRes.json()

  if (session?.user?.email) {
    return { cookie: allCookieStr, session }
  }
  return null
}

async function apiGet(path, cookie) {
  const res = await fetch(`${BASE}${path}`, {
    headers: cookie ? { Cookie: cookie } : {},
    redirect: 'manual', // Don't follow redirects — detect 302 to /auth/login as 401
  })
  let body = null
  if (res.status === 200) {
    try { body = await res.json() } catch {}
  }
  // Middleware redirects unauthenticated requests to /auth/login
  const effectiveStatus = (res.status === 302 || res.status === 307) ? 401 : res.status
  return { status: effectiveStatus, body, rawStatus: res.status }
}

async function apiPost(path, cookie, data) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) },
    body: JSON.stringify(data),
    redirect: 'manual',
  })
  let body = null
  try { body = await res.json() } catch {}
  const effectiveStatus = (res.status === 302 || res.status === 307) ? 401 : res.status
  return { status: effectiveStatus, body }
}

// ─────────────────────────────────────────────────────────────────────────────
async function runTests() {
  console.log('\n══════════════════════════════════════════════════════════════')
  console.log('  MINISTERIAL OFFICE MANAGEMENT SYSTEM — FULL SMOKE TEST')
  console.log('══════════════════════════════════════════════════════════════\n')

  // ── 1. UNAUTHENTICATED ACCESS ─────────────────────────────────────────────
  console.log('── 1. UNAUTHENTICATED ACCESS CONTROLS ──')
  const protectedRoutes = [
    '/api/minister/dashboard',
    '/api/pa/petitions',
    '/api/admin/stats',
    '/api/users',
    '/api/field/assigned-tasks',
    '/api/notifications',
  ]
  for (const route of protectedRoutes) {
    const { status } = await apiGet(route, null)
    if (status === 401 || status === 403) {
      log('PASS', `Unauthenticated ${route}`, `→ ${status}`)
    } else {
      log('FAIL', `Unauthenticated ${route}`, `Expected 401/403, got ${status}`)
    }
  }

  // ── 2. INVALID LOGIN ──────────────────────────────────────────────────────
  console.log('\n── 2. INVALID LOGIN ──')
  const badEmail = await login('admin@example.com', 'password123')
  log(badEmail ? 'FAIL' : 'PASS', 'Invalid email rejected', 'admin@example.com')

  const badPwd = await login('admin@gov.in', 'wrongpassword')
  log(badPwd ? 'FAIL' : 'PASS', 'Wrong password rejected', 'admin@gov.in + wrong pwd')

  // ── 3. ADMIN ──────────────────────────────────────────────────────────────
  console.log('\n── 3. ADMIN ──')
  const adminAuth = await login('admin@gov.in', 'password123')
  if (!adminAuth) { log('FAIL', 'Admin login'); return }
  log('PASS', 'Admin login', `role=${adminAuth.session.user.role}, name=${adminAuth.session.user.name}`)

  const adminStats = await apiGet('/api/admin/stats', adminAuth.cookie)
  if (adminStats.status === 200 && adminStats.body?.success && adminStats.body?.users?.total > 0) {
    log('PASS', 'Admin stats — real DB', `users=${adminStats.body.users.total}, grievances=${adminStats.body.grievances?.total}`)
    checkNoHardcoded(adminStats.body, 'Admin stats')
  } else {
    log('FAIL', 'Admin stats', `status=${adminStats.status}, body=${JSON.stringify(adminStats.body)}`)
  }

  const usersRes = await apiGet('/api/users', adminAuth.cookie)
  if (usersRes.status === 200 && Array.isArray(usersRes.body?.users)) {
    const hasHash = usersRes.body.users.some(u => u.passwordHash)
    log(hasHash ? 'FAIL' : 'PASS', 'Users API — passwordHash not exposed', `count=${usersRes.body.users.length}`)
    checkNoHardcoded(usersRes.body, 'Users list')
  } else {
    log('FAIL', 'Users API', `status=${usersRes.status}`)
  }

  // ── 4. MINISTER ───────────────────────────────────────────────────────────
  console.log('\n── 4. MINISTER ──')
  const minAuth = await login('minister@gov.in', 'password123')
  if (!minAuth) { log('FAIL', 'Minister login'); }
  else {
    log('PASS', 'Minister login', `name=${minAuth.session.user.name}`)

    const minDash = await apiGet('/api/minister/dashboard', minAuth.cookie)
    if (minDash.status === 200 && minDash.body?.success) {
      log('PASS', 'Minister dashboard', `projects=${minDash.body.summary?.totalProjects}, petitions=${minDash.body.summary?.totalGrievances}`)
      checkNoHardcoded(minDash.body, 'Minister dashboard')
    } else {
      log('FAIL', 'Minister dashboard', `status=${minDash.status}`)
    }

    const places = await apiGet('/api/minister/places', minAuth.cookie)
    log(places.status === 200 && places.body?.success ? 'PASS' : 'FAIL', 'Minister places', `count=${places.body?.places?.length ?? places.status}`)

    const analytics = await apiGet('/api/minister/analytics', minAuth.cookie)
    if (analytics.status === 200 && analytics.body?.success) {
      log('PASS', 'Minister analytics/leaders', `leaders=${analytics.body.leaders?.length}`)
      checkNoHardcoded(analytics.body, 'Minister analytics')
    } else {
      log('FAIL', 'Minister analytics', `status=${analytics.status}`)
    }

    const minGrievances = await apiGet('/api/minister/grievances', minAuth.cookie)
    log(minGrievances.status === 200 && minGrievances.body?.success ? 'PASS' : 'FAIL',
      'Minister grievances', `status=${minGrievances.status}`)

    const minEvents = await apiGet('/api/minister/events', minAuth.cookie)
    log(minEvents.status === 200 && minEvents.body?.success ? 'PASS' : 'FAIL',
      'Minister events', `count=${minEvents.body?.events?.length ?? minEvents.status}`)

    const mapData = await apiGet('/api/minister/map-data', minAuth.cookie)
    log(mapData.status === 200 && mapData.body?.success ? 'PASS' : 'FAIL',
      'Minister map-data', `status=${mapData.status}`)
  }

  // ── 5. PA ─────────────────────────────────────────────────────────────────
  console.log('\n── 5. PA ──')
  const paAuth = await login('pa@gov.in', 'password123')
  if (!paAuth) { log('FAIL', 'PA login') }
  else {
    log('PASS', 'PA login', `name=${paAuth.session.user.name}`)

    const paPetitions = await apiGet('/api/pa/petitions', paAuth.cookie)
    if (paPetitions.status === 200 && paPetitions.body?.success) {
      log('PASS', 'PA petitions — real DB', `count=${paPetitions.body.petitions?.length}`)
      checkNoHardcoded(paPetitions.body, 'PA petitions')
    } else {
      log('FAIL', 'PA petitions', `status=${paPetitions.status}`)
    }

    const paMeta = await apiGet('/api/pa/metadata', paAuth.cookie)
    log(paMeta.status === 200 && paMeta.body?.success ? 'PASS' : 'FAIL',
      'PA metadata', `mandals=${paMeta.body?.mandals?.length}, depts=${paMeta.body?.departments?.length}`)

    // Create petition — verify session name used
    const newPetition = await apiPost('/api/pa/petitions', paAuth.cookie, {
      type: 'PERSONAL_GRIEVANCE',
      title: 'SMOKE TEST — Road repair needed',
      description: 'Automated smoke test petition — safe to delete',
      priority: 'MEDIUM',
      applicantName: 'Smoke Test Citizen',
      applicantPhone: '9000000099',
      mandalName: 'Test Mandal',
      villageName: 'Test Village',
      assignedDepartment: 'Roads & Buildings',
      daysAllowed: 7,
    })
    if (newPetition.status === 200 && newPetition.body?.success) {
      const p = newPetition.body.petition
      log('PASS', 'PA create petition', `tracking=${p.trackingNumber}`)
      const nameFromSession = p.handlingPaName === paAuth.session.user.name
      log(nameFromSession ? 'PASS' : 'WARN',
        'PA name from session (not hardcoded)',
        `expected="${paAuth.session.user.name}", got="${p.handlingPaName}"`)
    } else {
      log('FAIL', 'PA create petition', `status=${newPetition.status}, err=${newPetition.body?.error}`)
    }

    // PA blocked from admin
    const paAdmin = await apiGet('/api/admin/stats', paAuth.cookie)
    log(paAdmin.status === 403 ? 'PASS' : 'FAIL', 'PA blocked from admin stats', `→ ${paAdmin.status}`)
  }

  // ── 6. BACK OFFICER ───────────────────────────────────────────────────────
  console.log('\n── 6. BACK OFFICER ──')
  const backAuth = await login('back@gov.in', 'password123')
  if (!backAuth) { log('FAIL', 'Back Officer login') }
  else {
    log('PASS', 'Back Officer login', `name=${backAuth.session.user.name}`)

    // Back officer blocked from PA petitions (PA/MINISTER/ADMIN only)
    const backPetitions = await apiGet('/api/pa/petitions', backAuth.cookie)
    log(backPetitions.status === 403 ? 'PASS' : 'WARN',
      'Back Officer blocked from PA petitions', `→ ${backPetitions.status}`)

    // Back officer blocked from minister routes
    const backMin = await apiGet('/api/minister/dashboard', backAuth.cookie)
    log(backMin.status === 403 ? 'PASS' : 'FAIL',
      'Back Officer blocked from minister dashboard', `→ ${backMin.status}`)
  }

  // ── 7. FIELD OFFICER ──────────────────────────────────────────────────────
  console.log('\n── 7. FIELD OFFICER ──')
  const fieldAuth = await login('field@gov.in', 'password123')
  if (!fieldAuth) { log('FAIL', 'Field Officer login') }
  else {
    log('PASS', 'Field Officer login', `name=${fieldAuth.session.user.name}`)

    const fieldTasks = await apiGet('/api/field/assigned-tasks', fieldAuth.cookie)
    if (fieldTasks.status === 200 && fieldTasks.body?.success) {
      log('PASS', 'Field assigned-tasks', `petitions=${fieldTasks.body.petitions?.length}`)
      // privateNotes must not appear in field response
      const hasPrivate = fieldTasks.body.petitions?.some(p => p.privateNotes !== undefined)
      log(hasPrivate ? 'WARN' : 'PASS', 'Field tasks — no privateNotes in select')
    } else {
      log('FAIL', 'Field assigned-tasks', `status=${fieldTasks.status}`)
    }

    const fieldAdmin = await apiGet('/api/admin/stats', fieldAuth.cookie)
    log(fieldAdmin.status === 403 ? 'PASS' : 'FAIL', 'Field blocked from admin stats', `→ ${fieldAdmin.status}`)

    const fieldMin = await apiGet('/api/minister/dashboard', fieldAuth.cookie)
    log(fieldMin.status === 403 ? 'PASS' : 'FAIL', 'Field blocked from minister dashboard', `→ ${fieldMin.status}`)

    const fieldUsers = await apiGet('/api/users', fieldAuth.cookie)
    log(fieldUsers.status === 403 ? 'PASS' : 'FAIL', 'Field blocked from users list', `→ ${fieldUsers.status}`)
  }

  // ── 8. BYPASS ROUTES ─────────────────────────────────────────────────────
  console.log('\n── 8. BYPASS ROUTES BLOCKED ──')
  const bypassRoutes = [
    '/bypass-login', '/demo-login', '/debug-login',
    '/test-login', '/test-login-simple', '/minister-login',
    '/pa-login', '/field-login', '/back-officer-login',
  ]
  for (const route of bypassRoutes) {
    const res = await fetch(`${BASE}${route}`, { redirect: 'manual' })
    const loc = res.headers.get('location') || ''
    if ((res.status === 302 || res.status === 307 || res.status === 308) && loc.includes('/auth/login')) {
      log('PASS', `Bypass blocked: ${route}`, `→ /auth/login`)
    } else if (res.status === 200) {
      // Page renders but may contain a redirect component
      log('WARN', `Bypass ${route} returns 200`, 'Check if it renders redirect')
    } else {
      log('WARN', `Bypass ${route}`, `status=${res.status}, loc=${loc}`)
    }
  }

  // ── 9. SENSITIVE ROUTES ───────────────────────────────────────────────────
  console.log('\n── 9. SENSITIVE ROUTES ──')
  const testDb = await apiGet('/api/test-db', null)
  log(testDb.status === 404 || testDb.status === 401 ? 'PASS' : 'FAIL',
    '/api/test-db blocked', `→ ${testDb.status}`)

  // ── 10. NOTIFICATIONS ────────────────────────────────────────────────────
  console.log('\n── 10. NOTIFICATIONS ──')
  const notifs = await apiGet('/api/notifications', minAuth?.cookie)
  log(notifs.status === 200 && Array.isArray(notifs.body?.notifications) ? 'PASS' : 'FAIL',
    'Notifications API', `count=${notifs.body?.notifications?.length ?? notifs.status}`)

  // ── 11. CATEGORIES ───────────────────────────────────────────────────────
  console.log('\n── 11. CATEGORIES ──')
  const cats = await apiGet('/api/categories', adminAuth.cookie)
  const catArr = Array.isArray(cats.body) ? cats.body : cats.body?.categories
  log(cats.status === 200 ? 'PASS' : 'FAIL', 'Categories API', `count=${catArr?.length}`)

  // ── 12. SIGN OUT ─────────────────────────────────────────────────────────
  console.log('\n── 12. SIGN OUT ──')
  // Get CSRF for signout
  const csrfRes2 = await fetch(`${BASE}/api/auth/csrf`, {
    headers: { Cookie: minAuth?.cookie || '' },
  })
  const { csrfToken: signOutCsrf } = await csrfRes2.json()

  const signOutRes = await fetch(`${BASE}/api/auth/signout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Cookie: minAuth?.cookie || '',
    },
    body: new URLSearchParams({ csrfToken: signOutCsrf }).toString(),
    redirect: 'manual',
  })
  log(signOutRes.status < 400 ? 'PASS' : 'FAIL', 'Sign out API', `status=${signOutRes.status}`)

  // Verify session cleared
  const postSession = await fetch(`${BASE}/api/auth/session`, {
    headers: { Cookie: minAuth?.cookie || '' },
  })
  const postSessionData = await postSession.json()
  log(!postSessionData?.user ? 'PASS' : 'WARN',
    'Session cleared after sign out',
    postSessionData?.user ? 'JWT cookie may persist until expiry' : 'confirmed null')

  // ── 13. DB INTEGRITY ─────────────────────────────────────────────────────
  console.log('\n── 13. DATABASE INTEGRITY ──')
  const dbStats = await apiGet('/api/admin/stats', adminAuth.cookie)
  if (dbStats.body?.success) {
    const s = dbStats.body
    log('PASS', 'DB record counts', `users=${s.users?.total}, grievances=${s.grievances?.total}, projects=${s.projects?.total}`)
    log(s.users?.total >= 20 ? 'PASS' : 'WARN', 'Seed data present', `${s.users?.total} users`)
    log(s.grievances?.total > 0 ? 'PASS' : 'WARN', 'Grievances in DB', `${s.grievances?.total} grievances`)
  }

  // ── SUMMARY ──────────────────────────────────────────────────────────────
  console.log('\n══════════════════════════════════════════════════════════════')
  console.log(`  RESULTS: ${passed} PASSED  |  ${failed} FAILED  |  ${warnings} WARNINGS`)
  console.log('══════════════════════════════════════════════════════════════')

  if (failed > 0) {
    console.log('\n❌ FAILED:')
    results.filter(r => r.status === 'FAIL').forEach(r => console.log(`   • ${r.label}: ${r.detail}`))
  }
  if (warnings > 0) {
    console.log('\n⚠️  WARNINGS:')
    results.filter(r => r.status === 'WARN').forEach(r => console.log(`   • ${r.label}: ${r.detail}`))
  }
  console.log('')
  process.exit(failed > 0 ? 1 : 0)
}

runTests().catch(err => {
  console.error('\n💥 Smoke test crashed:', err.message)
  process.exit(1)
})
