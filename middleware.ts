import { getToken } from "next-auth/jwt"
import { NextRequest, NextResponse } from "next/server"
// v2 — recompiled after secret rotation

// Role → allowed route prefixes
const ROLE_ROUTES: Record<string, string[]> = {
  MINISTER:           ["/minister", "/visitors", "/letters", "/api/minister", "/api/pa", "/api/analytics", "/api/categories", "/api/notifications", "/api/ai", "/api/users", "/api/dashboard", "/api/visitors", "/api/letters", "/api/party-workers", "/api/party-posts", "/api/offices", "/api/tasks", "/api/surveys", "/api/funds", "/api/constituents", "/api/documents", "/api/campaigns", "/api/reports", "/api/audit-logs", "/api/government-projects", "/api/calendar", "/api/assembly-questions", "/api/cron", "/api/whatsapp"],
  PA:                 ["/pa", "/visitors", "/letters", "/api/pa", "/api/minister", "/api/categories", "/api/notifications", "/api/ai", "/api/analytics", "/api/visitors", "/api/letters", "/api/party-workers", "/api/party-posts", "/api/offices", "/api/tasks", "/api/surveys", "/api/funds", "/api/constituents", "/api/documents", "/api/campaigns", "/api/reports", "/api/users", "/api/government-projects", "/api/calendar", "/api/assembly-questions", "/api/cron", "/api/upload", "/api/whatsapp"],
  BACK_OFFICER:       ["/back-officer", "/visitors", "/letters", "/api/grievances", "/api/requests", "/api/minister/projects", "/api/categories", "/api/notifications", "/api/ai/voice-intake", "/api/ai/duplicate-check", "/api/dashboard", "/api/visitors", "/api/letters", "/api/party-workers", "/api/party-posts", "/api/offices", "/api/tasks", "/api/surveys", "/api/funds", "/api/constituents", "/api/documents", "/api/pa/metadata", "/api/government-projects", "/api/calendar", "/api/assembly-questions", "/api/upload", "/api/whatsapp"],
  FIELD_OFFICER:      ["/field", "/field-officer", "/api/field", "/api/notifications", "/api/tasks", "/api/surveys", "/api/constituents", "/api/minister/projects", "/api/upload"],
  ADMIN:              ["/admin", "/visitors", "/api/admin", "/api/users", "/api/grievances", "/api/categories", "/api/requests", "/api/minister", "/api/pa", "/api/field", "/api/analytics", "/api/notifications", "/api/ai", "/api/visitors", "/api/letters", "/api/party-workers", "/api/party-posts", "/api/offices", "/api/tasks", "/api/surveys", "/api/funds", "/api/constituents", "/api/documents", "/api/campaigns", "/api/reports", "/api/audit-logs", "/api/government-projects", "/api/calendar", "/api/assembly-questions", "/api/cron", "/api/upload", "/api/whatsapp"],
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

  // API routes: return 401 if not authenticated, 403 if wrong role
  if (pathname.startsWith("/api/")) {
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }
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
