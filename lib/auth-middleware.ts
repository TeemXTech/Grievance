import { PrismaClient } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { headers } from 'next/headers'

const prisma = new PrismaClient()

// Function to extract token from request
function getTokenFromRequest(request: NextRequest) {
  // Try Authorization header first
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  // Then try cookie
  const token = request.cookies.get('token')?.value
  if (token) {
    return token
  }

  return null
}

// BYPASS: Middleware bypassed - all requests allowed
export async function withAuth(
  request: NextRequest,
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  console.log('🔓 BYPASS: Auth middleware bypassed')
  
  // BYPASS: Always inject admin user headers
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-user-id', '1')
  requestHeaders.set('x-user-role', 'ADMIN')
  requestHeaders.set('x-user-email', 'admin@bypass.com')

  // Create new request with admin headers
  const newRequest = new NextRequest(request.url, {
    method: request.method,
    headers: requestHeaders,
    body: request.body,
  })

  // Always call handler with admin privileges
  return handler(newRequest)
}

// BYPASS: Role restrictions bypassed - all roles allowed
export function withRole(roles: string[]) {
  return async function(
    request: NextRequest,
    handler: (request: NextRequest) => Promise<NextResponse>
  ) {
    console.log('🔓 BYPASS: Role check bypassed')
    // BYPASS: Always allow access regardless of role
    return handler(request)
  }
}

// Combined middleware for auth and role checks
export function withProtected(roles?: string[]) {
  return async function(
    request: NextRequest,
    handler: (request: NextRequest) => Promise<NextResponse>
  ) {
    const authResponse = await withAuth(request, async (req) => {
      if (roles) {
        return withRole(roles)(req, handler)
      }
      return handler(req)
    })

    return authResponse
  }
}
