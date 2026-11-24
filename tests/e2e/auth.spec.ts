import { test, expect, type Page } from '@playwright/test'

// ─── Helpers ────────────────────────────────────────────────────────────────

async function loginAs(page: Page, email: string, password = 'password123') {
  await page.goto('/auth/login')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: /sign in/i }).click()
  await page.waitForURL(/\/(minister|pa|back-officer|field-officer|admin|dashboard)/, { timeout: 10000 })
}

// ─── Auth: Login Page ────────────────────────────────────────────────────────

test.describe('Auth — Login Page', () => {
  test('TC-AUTH-01: login page renders all required fields', async ({ page }) => {
    await page.goto('/auth/login')
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
  })

  test('TC-AUTH-02: empty form submission shows validation', async ({ page }) => {
    await page.goto('/auth/login')
    await page.getByRole('button', { name: /sign in/i }).click()
    // Should not navigate away
    await expect(page).toHaveURL(/\/auth\/login/)
  })

  test('TC-AUTH-03: wrong password shows error', async ({ page }) => {
    await page.goto('/auth/login')
    await page.getByLabel('Email').fill('pa@gov.in')
    await page.getByLabel('Password').fill('wrongpassword')
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page.getByText(/invalid|incorrect|error/i)).toBeVisible({ timeout: 5000 })
  })

  test('TC-AUTH-04: non-existent email shows error', async ({ page }) => {
    await page.goto('/auth/login')
    await page.getByLabel('Email').fill('nobody@nowhere.com')
    await page.getByLabel('Password').fill('password123')
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page.getByText(/invalid|incorrect|error/i)).toBeVisible({ timeout: 5000 })
  })

  test('TC-AUTH-05: MINISTER login redirects to /minister/dashboard', async ({ page }) => {
    await loginAs(page, 'minister@gov.in')
    await expect(page).toHaveURL(/\/minister\/dashboard/)
  })

  test('TC-AUTH-06: PA login redirects to /pa/dashboard', async ({ page }) => {
    await loginAs(page, 'pa@gov.in')
    await expect(page).toHaveURL(/\/pa\/dashboard/)
  })

  test('TC-AUTH-07: BACK_OFFICER login redirects to /back-officer/dashboard', async ({ page }) => {
    await loginAs(page, 'back@gov.in')
    await expect(page).toHaveURL(/\/back-officer\/dashboard/)
  })

  test('TC-AUTH-08: FIELD_OFFICER login redirects to /field-officer/dashboard', async ({ page }) => {
    await loginAs(page, 'field@gov.in')
    await expect(page).toHaveURL(/\/field-officer\/dashboard/)
  })

  test('TC-AUTH-09: ADMIN login redirects to /admin/dashboard', async ({ page }) => {
    await loginAs(page, 'admin@gov.in')
    await expect(page).toHaveURL(/\/admin\/dashboard/)
  })
})

// ─── Auth: Route Protection ──────────────────────────────────────────────────

test.describe('Auth — Route Protection', () => {
  test('TC-AUTH-10: unauthenticated access to /minister/dashboard redirects to login', async ({ page }) => {
    await page.goto('/minister/dashboard')
    await expect(page).toHaveURL(/\/auth\/login/)
  })

  test('TC-AUTH-11: unauthenticated access to /pa/dashboard redirects to login', async ({ page }) => {
    await page.goto('/pa/dashboard')
    await expect(page).toHaveURL(/\/auth\/login/)
  })

  test('TC-AUTH-12: unauthenticated API call returns 401', async ({ request }) => {
    const res = await request.get('/api/pa/petitions')
    expect(res.status()).toBe(401)
  })

  test('TC-AUTH-13: FIELD_OFFICER cannot access /minister/dashboard', async ({ page }) => {
    await loginAs(page, 'field@gov.in')
    await page.goto('/minister/dashboard')
    // Should redirect to their own dashboard
    await expect(page).toHaveURL(/\/field-officer\/dashboard/)
  })

  test('TC-AUTH-14: BACK_OFFICER cannot access /minister/dashboard', async ({ page }) => {
    await loginAs(page, 'back@gov.in')
    await page.goto('/minister/dashboard')
    await expect(page).toHaveURL(/\/back-officer\/dashboard/)
  })

  test('TC-AUTH-15: bypass-login route is blocked', async ({ page }) => {
    await page.goto('/bypass-login')
    await expect(page).toHaveURL(/\/auth\/login/)
  })

  test('TC-AUTH-16: demo-login route is blocked', async ({ page }) => {
    await page.goto('/demo-login')
    await expect(page).toHaveURL(/\/auth\/login/)
  })

  test('TC-AUTH-17: debug-login route is blocked', async ({ page }) => {
    await page.goto('/debug-login')
    await expect(page).toHaveURL(/\/auth\/login/)
  })
})

// ─── Auth: Session & Security Headers ───────────────────────────────────────

test.describe('Auth — Session & Security', () => {
  test('TC-AUTH-18: security headers present on login page', async ({ request }) => {
    const res = await request.get('/auth/login')
    expect(res.headers()['x-frame-options']).toBe('DENY')
    expect(res.headers()['x-content-type-options']).toBe('nosniff')
  })

  test('TC-AUTH-19: root path redirects to login when unauthenticated', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/auth\/login/)
  })

  test('TC-AUTH-20: session persists across page navigation after login', async ({ page }) => {
    await loginAs(page, 'pa@gov.in')
    await page.goto('/pa/dashboard')
    await expect(page).toHaveURL(/\/pa\/dashboard/)
    // Navigate away and back
    await page.goto('/api/pa/metadata')
    const body = await page.textContent('body')
    expect(body).toContain('"success":true')
  })
})
