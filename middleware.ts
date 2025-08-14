// Authentication temporarily disabled
// import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export function middleware(req: any) {
  // Add security headers only
  const response = NextResponse.next()
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ]
}