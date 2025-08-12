import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ZodError, ZodSchema } from 'zod'
import { headers } from 'next/headers'
import { Role } from '@prisma/client'

export async function validateRequest<T>(
  request: NextRequest,
  schema: ZodSchema<T>,
  allowedRoles?: Role[]
): Promise<
  | { success: true; data: T }
  | { success: false; error: string; status: number }
> {
  try {
    // Check authentication if roles are specified
    if (allowedRoles) {
      const userRole = headers().get('x-user-role') as Role | null

      if (!userRole || !allowedRoles.includes(userRole)) {
        return {
          success: false,
          error: 'Unauthorized',
          status: 403,
        }
      }
    }

    // Parse and validate request body
    const body = await request.json()
    const data = await schema.parseAsync(body)

    return { success: true, data }
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        error: 'Validation failed',
        status: 400,
      }
    }

    console.error('Request validation error:', error)
    return {
      success: false,
      error: 'Internal server error',
      status: 500,
    }
  }
}

export function errorResponse(error: string, status: number = 400) {
  return NextResponse.json(
    { error },
    { status }
  )
}

export function successResponse<T>(data: T, status: number = 200) {
  return NextResponse.json(data, { status })
}
