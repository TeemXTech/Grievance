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

// Middleware to protect API routes
export async function withAuth(
  request: NextRequest,
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string
      email: string
      role: string
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
      },
    })

    if (!user || user.status !== 'active') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Inject user info into request headers
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', user.id)
    requestHeaders.set('x-user-role', user.role)
    requestHeaders.set('x-user-email', user.email)

    // Create new request with updated headers
    const newRequest = new NextRequest(request.url, {
      method: request.method,
      headers: requestHeaders,
      body: request.body,
    })

    // Call the handler with authenticated request
    return handler(newRequest)
  } catch (error) {
    console.error('Auth middleware error:', error)
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}

// Middleware to restrict routes by role
export function withRole(roles: string[]) {
  return async function(
    request: NextRequest,
    handler: (request: NextRequest) => Promise<NextResponse>
  ) {
    const userRole = headers().get('x-user-role')
    
    if (!userRole || !roles.includes(userRole)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

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
