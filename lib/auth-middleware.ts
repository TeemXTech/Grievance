import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"
import { authOptions } from "@/lib/auth-options"

export interface AuthenticatedUser {
  id: string
  name: string
  email: string
  role: string
  phone?: string
}

/**
 * Extracts the authenticated user from the NextAuth session.
 * Returns null if not authenticated.
 */
export async function getAuthUser(req?: NextRequest): Promise<AuthenticatedUser | null> {
  const session = await getServerSession(authOptions)
  if (!session?.user) return null

  const user = session.user as any
  if (!user.id || !user.role) return null

  return {
    id: user.id,
    name: user.name ?? "",
    email: user.email ?? "",
    role: user.role,
    phone: user.phone ?? "",
  }
}

/**
 * Wraps an API handler with authentication.
 * Injects the authenticated user into the handler.
 * Returns 401 if not authenticated.
 */
export function withAuth(
  handler: (req: NextRequest, user: AuthenticatedUser) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }
    return handler(req, user)
  }
}

/**
 * Wraps an API handler with authentication + role enforcement.
 * Returns 403 if the user's role is not in the allowed list.
 */
export function withRole(allowedRoles: string[]) {
  return function (
    handler: (req: NextRequest, user: AuthenticatedUser) => Promise<NextResponse>
  ) {
    return async (req: NextRequest): Promise<NextResponse> => {
      const user = await getAuthUser(req)
      if (!user) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
      }
      if (!allowedRoles.includes(user.role)) {
        return NextResponse.json(
          { success: false, error: `Forbidden: requires one of [${allowedRoles.join(", ")}]` },
          { status: 403 }
        )
      }
      return handler(req, user)
    }
  }
}

/**
 * Convenience: checks if a user has a specific role.
 */
export function hasRole(user: AuthenticatedUser, ...roles: string[]): boolean {
  return roles.includes(user.role)
}

/**
 * Strips private/confidential fields from petition data
 * for roles that must not see them (FIELD_OFFICER, PUBLIC, etc.)
 */
export function stripPrivateFields<T extends Record<string, any>>(
  data: T,
  user: AuthenticatedUser
): T {
  const sensitiveRoles = ["MINISTER", "PA", "ADMIN"]
  if (sensitiveRoles.includes(user.role)) return data

  const stripped = { ...data }
  delete stripped.privateNotes
  return stripped as T
}
