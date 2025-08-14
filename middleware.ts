import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    
    // Add security headers
    const response = NextResponse.next()
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    
    // Protect API routes
    if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth')) {
      const token = req.nextauth.token
      if (!token) {
        return new Response('Unauthorized', { status: 401 })
      }
    }
    
    return response
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Allow access to auth pages and public routes
        if (pathname.startsWith('/auth') || pathname === '/') return true
        
        // Protect admin routes
        if (pathname.startsWith('/admin')) {
          return token?.role === 'ADMIN'
        }
        
        // Protect PA routes
        if (pathname.startsWith('/pa')) {
          return token?.role === 'PA'
        }
        
        // Protect back officer routes
        if (pathname.startsWith('/back-officer')) {
          return token?.role === 'BACK_OFFICER'
        }
        
        // Protect minister routes
        if (pathname.startsWith('/minister')) {
          return token?.role === 'MINISTER'
        }
        
        // Protect field officer routes
        if (pathname.startsWith('/field')) {
          return token?.role === 'FIELD_OFFICER'
        }
        
        // Allow access to dashboard for authenticated users
        if (pathname.startsWith('/dashboard')) {
          return !!token
        }
        
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    '/admin/:path*',
    '/pa/:path*', 
    '/back-officer/:path*',
    '/minister/:path*',
    '/field/:path*',
    '/dashboard/:path*',
    '/api/:path*'
  ]
}