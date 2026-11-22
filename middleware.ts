import { getToken } from "next-auth/jwt"
import { NextRequest, NextResponse } from "next/server"
// v2 — recompiled after secret rotation

// Role → allowed route prefixes
const ROLE_ROUTES: Record<string, string[]> = {
  MINISTER:           ["/minister", "/api/minister", "/api/pa", "/api/analytics", "/api/categories", "/api/notifications", "/api/ai", "/api/users"],
  PA:                 ["/pa", "/api/pa", "/api/minister", "/api/categories", "/api/notifications", "/api/ai"],
  BACK_OFFICER:       ["/back-officer", "/api/grievances", "/api/requests", "/api/minister/projects", "/api/categories", "/api/notifications", "/api/ai/voice-intake", "/api/ai/duplicate-check"],
  FIELD_OFFICER:      ["/field", "/field-officer", "/api/field", "/api/notifications"],
  ADMIN:              ["/admin", "/api/admin", "/api/users", "/api/grievances", "/api/categories", "/api/requests", "/api/minister", "/api/pa", "/api/field", "/api/analytics", "/api/notifications", "/api/ai"],
  OFFICER:            ["/dashboard", "/api/grievances", "/api/categories", "/api/notifications"],
  GOVERNMENT_OFFICIAL:["/dashboard", "/api/grievances", "/api/categories"],
  LOCAL_LEADER:       ["/dashboard"],
  PUBLIC:             ["/dashboard", "/api/grievances/create", "/api/track"],
}

// Routes that never require auth
const PUBLIC_PATHS = [
  "/auth/login",
  "/auth",
  "/api/auth",
  "/api/track",
  "/track",
  "/_next",
  "/favicon.ico",
  "/telangana-logo.png",
  "/minister-photo.jpg",
  "/one-rise-logo.png",
  "/placeholder",
  "/geojson",
]

// Routes that must ALWAYS redirect to login — no exceptions
const BLOCKED_PATHS = [
  "/bypass-login",
  "/demo-login",
  "/debug-login",
  "/test-login",
  "/test-login-simple",
  "/minister-login",
  "/pa-login",
  "/field-login",
  "/back-officer-login",
]

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Block all bypass/test/demo routes — redirect to real login
  if (BLOCKED_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL("/auth/login", req.url))
  }

  // Always allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return addSecurityHeaders(NextResponse.next())
  }

  // Allow root — it redirects to login in page.tsx
  if (pathname === "/") {
    return addSecurityHeaders(NextResponse.next())
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  // Not authenticated → redirect to login
  if (!token) {
    const loginUrl = new URL("/auth/login", req.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  const role = token.role as string

  // API routes: return 403 if role not allowed
  if (pathname.startsWith("/api/")) {
    const allowed = ROLE_ROUTES[role] ?? []
    const canAccess = allowed.some((prefix) => pathname.startsWith(prefix))
    if (!canAccess) {
      return NextResponse.json(
        { success: false, error: "Forbidden: insufficient role" },
        { status: 403 }
      )
    }
    return addSecurityHeaders(NextResponse.next())
  }

  // Page routes: redirect to correct dashboard if accessing wrong role area
  const allowed = ROLE_ROUTES[role] ?? []
  const canAccess = allowed.some((prefix) => pathname.startsWith(prefix))

  if (!canAccess) {
    return NextResponse.redirect(new URL(getDefaultRoute(role), req.url))
  }

  return addSecurityHeaders(NextResponse.next())
}

function getDefaultRoute(role: string): string {
  switch (role) {
    case "MINISTER":    return "/minister/dashboard"
    case "PA":          return "/pa/dashboard"
    case "BACK_OFFICER":return "/back-officer/dashboard"
    case "FIELD_OFFICER":return "/field-officer/dashboard"
    case "ADMIN":       return "/admin/dashboard"
    default:            return "/dashboard"
  }
}

function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(self)")
  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
