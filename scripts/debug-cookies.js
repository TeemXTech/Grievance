async function test() {
  const BASE = 'http://localhost:3000'
  const csrfRes = await fetch(BASE + '/api/auth/csrf')
  const { csrfToken } = await csrfRes.json()
  const c1 = csrfRes.headers.getSetCookie ? csrfRes.headers.getSetCookie() : []
  console.log('CSRF cookies:', c1.length, c1.map(c => c.split(';')[0].split('=')[0]))

  const signIn = await fetch(BASE + '/api/auth/callback/credentials', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Cookie: c1.map(c => c.split(';')[0]).join('; ') },
    body: new URLSearchParams({ csrfToken, email: 'minister@gov.in', password: 'password123', callbackUrl: BASE, json: 'true' }).toString(),
    redirect: 'manual'
  })
  console.log('SignIn status:', signIn.status)
  const c2 = signIn.headers.getSetCookie ? signIn.headers.getSetCookie() : []
  console.log('SignIn cookies:', c2.length, c2.map(c => c.split(';')[0].split('=')[0]))

  const allCookies = [...c1, ...c2]
  const cookieStr = allCookies.map(c => c.split(';')[0]).join('; ')
  console.log('Cookie names being sent:', cookieStr.split('; ').map(c => c.split('=')[0]))

  const s = await (await fetch(BASE + '/api/auth/session', { headers: { Cookie: cookieStr } })).json()
  console.log('Session:', s?.user?.email, s?.user?.role)

  // Try the API
  const r = await fetch(BASE + '/api/minister/dashboard', { headers: { Cookie: cookieStr }, redirect: 'manual' })
  console.log('Dashboard:', r.status, r.headers.get('location'))
}
test().catch(e => console.error(e.message))
