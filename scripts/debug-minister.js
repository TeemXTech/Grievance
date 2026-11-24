async function test() {
  const BASE = 'http://localhost:3000'
  const csrfRes = await fetch(BASE + '/api/auth/csrf')
  const { csrfToken } = await csrfRes.json()
  const c1 = csrfRes.headers.getSetCookie ? csrfRes.headers.getSetCookie() : []
  
  const signIn = await fetch(BASE + '/api/auth/callback/credentials', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Cookie: c1.map(c=>c.split(';')[0]).join('; ') },
    body: new URLSearchParams({ csrfToken, email: 'minister@gov.in', password: 'password123', callbackUrl: BASE, json: 'true' }).toString(),
    redirect: 'manual'
  })
  const c2 = signIn.headers.getSetCookie ? signIn.headers.getSetCookie() : []
  const allC = [...c1,...c2].map(c=>c.split(';')[0]).join('; ')
  
  const s = await (await fetch(BASE + '/api/auth/session', {headers:{Cookie:allC}})).json()
  console.log('Session user:', s?.user?.email, s?.user?.role)
  
  const r = await fetch(BASE + '/api/minister/dashboard', {headers:{Cookie:allC}, redirect:'manual'})
  console.log('Dashboard status:', r.status, 'location:', r.headers.get('location'))
  if (r.status === 200) {
    const b = await r.json()
    console.log('success:', b.success, 'projects:', b.summary?.totalProjects)
  } else if (r.status !== 307 && r.status !== 302) {
    const t = await r.text()
    console.log('body:', t.substring(0, 300))
  }
}
test().catch(e => console.error('Error:', e.message))
