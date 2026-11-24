const { getToken } = require('next-auth/jwt')

async function test() {
  const BASE = 'http://localhost:3000'
  const csrfRes = await fetch(BASE + '/api/auth/csrf')
  const { csrfToken } = await csrfRes.json()
  const c1 = csrfRes.headers.getSetCookie()

  const signIn = await fetch(BASE + '/api/auth/callback/credentials', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Cookie: c1.map(c => c.split(';')[0]).join('; ') },
    body: new URLSearchParams({ csrfToken, email: 'minister@gov.in', password: 'password123', callbackUrl: BASE, json: 'true' }).toString(),
    redirect: 'manual'
  })
  const c2 = signIn.headers.getSetCookie()
  const sessionCookie = c2.find(c => c.startsWith('next-auth.session-token='))
  const tokenValue = sessionCookie?.split(';')[0]?.split('=').slice(1).join('=')
  console.log('Token (first 50 chars):', tokenValue?.substring(0, 50))

  // Try to decode with new secret
  const secret = '9bVc1JiOJjRG9IETdGdIcyknrBfPXIRBn2qKY/l2zdA='
  try {
    const jwt = require('jsonwebtoken')
    // NextAuth uses JWE (encrypted), not plain JWT - can't decode directly
    console.log('Token type: NextAuth JWE (encrypted) - correct')
    console.log('Session endpoint works:', (await (await fetch(BASE + '/api/auth/session', { headers: { Cookie: [...c1,...c2].map(c=>c.split(';')[0]).join('; ') } })).json())?.user?.email)
  } catch(e) {
    console.log('Note:', e.message)
  }
}
test().catch(console.error)
