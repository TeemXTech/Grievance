import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Role } from '@prisma/client'

// Middleware function to verify JWT token and user role
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for public paths
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/auth') ||            // Skip ALL auth pages
    pathname === '/' ||
    pathname === '/login'
  ) {
    return NextResponse.next()
  }

  return NextResponse.next()

  console.log("Cookies are", request.cookies)

  // Use the actual next-auth session token cookie name here
  const token = request.cookies.get('next-auth.session-token')?.value

  if (!token) {
    console.log("No token")
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  console.log("Middlewear", request.url)

  try {
    // Verify JWT token and get user role from your backend
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    // console.log("Rqst", request);
    const body = await response.text();

    console.log("Rsponse", body);
    if (!response.ok) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    const { role } = await response.json()

    // Role-based path restrictions
    const path = pathname

    if (path.startsWith('/minister') && role !== Role.MINISTER && role !== Role.PA) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    if (path.startsWith('/admin') && role !== Role.ADMIN) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Add user info to request headers for downstream use
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-role', role)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  } catch (error) {
    console.error('Auth middleware error:', error)
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
}

export const config = {
  matcher: [
    // Skip /api/auth, /auth/*, _next, favicon.ico
    '/((?!api/auth|auth|_next/static|_next/image|favicon.ico).*)',
  ],
}