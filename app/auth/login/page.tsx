"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn, useSession } from "next-auth/react"
import { Shield, Eye, EyeOff, Loader2, Lock, User } from "lucide-react"

const ROLE_ROUTES: Record<string, string> = {
  MINISTER:            "/minister/dashboard",
  PA:                  "/pa/dashboard",
  BACK_OFFICER:        "/back-officer/dashboard",
  FIELD_OFFICER:       "/field-officer/dashboard",
  ADMIN:               "/admin/dashboard",
  OFFICER:             "/dashboard",
  GOVERNMENT_OFFICIAL: "/dashboard",
  LOCAL_LEADER:        "/dashboard",
  PUBLIC:              "/dashboard",
}

export default function LoginPage() {
  const [email, setEmail]     = useState("")
  const [password, setPassword] = useState("")
  const [error, setError]     = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)

  const router       = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const role = (session.user as any).role as string
      const cb   = searchParams.get("callbackUrl")
      router.replace(cb || ROLE_ROUTES[role] || "/dashboard")
    }
  }, [session, status, router, searchParams])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(), password, redirect: false,
      })
      if (result?.error) setError("Invalid email or password. Please try again.")
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading") return null

  return (
    <div style={{ minHeight: "100vh", background: "var(--sidebar)", display: "flex", flexDirection: "column", fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* Top bar */}
      <div style={{ background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "14px 28px", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 9, background: "rgba(47,111,237,0.25)", display: "grid", placeItems: "center", border: "1px solid rgba(255,255,255,0.12)" }}>
          <Shield size={18} color="#7eb3ff" />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: "white" }}>Government of Telangana &amp; Andhra Pradesh</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>Ministerial Office Management System</div>
        </div>
      </div>

      {/* Center card */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ width: "100%", maxWidth: 420 }}>

          {/* Card */}
          <div style={{ background: "white", borderRadius: 14, overflow: "hidden", boxShadow: "0 24px 64px rgba(0,0,0,0.3)" }}>

            {/* Card header */}
            <div style={{ background: "var(--blue)", padding: "32px 32px 28px", textAlign: "center" }}>
              <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(255,255,255,0.18)", display: "grid", placeItems: "center", margin: "0 auto 16px", border: "2px solid rgba(255,255,255,0.3)" }}>
                <Shield size={28} color="white" />
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "white" }}>Secure Login</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>Ministerial Governance Platform</div>
            </div>

            {/* Form */}
            <div style={{ padding: "28px 32px 32px" }}>
              <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                <div>
                  <label className="gov-label">Email Address</label>
                  <div style={{ position: "relative" }}>
                    <User size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--sub)" }} />
                    <input
                      type="email" value={email} onChange={e => setEmail(e.target.value)}
                      className="gov-input" style={{ paddingLeft: 36 }}
                      placeholder="your.email@gov.in" required autoComplete="email"
                    />
                  </div>
                </div>

                <div>
                  <label className="gov-label">Password</label>
                  <div style={{ position: "relative" }}>
                    <Lock size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--sub)" }} />
                    <input
                      type={showPwd ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                      className="gov-input" style={{ paddingLeft: 36, paddingRight: 40 }}
                      placeholder="Enter your password" required autoComplete="current-password"
                    />
                    <button type="button" onClick={() => setShowPwd(!showPwd)}
                      style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--sub)", cursor: "pointer", padding: 0 }}>
                      {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", color: "var(--crit)", fontSize: 13 }}>
                    {error}
                  </div>
                )}

                <button type="submit" disabled={loading} className="gov-btn gov-btn-primary" style={{ width: "100%", padding: "11px", fontSize: 14, marginTop: 4 }}>
                  {loading ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Signing in...</> : "Sign In"}
                </button>
              </form>

              <div style={{ textAlign: "center", fontSize: 12, color: "var(--sub)", marginTop: 20 }}>
                Forgot your password? Contact your system administrator.
              </div>
            </div>
          </div>

          <div style={{ textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 20 }}>
            © {new Date().getFullYear()} Government of Telangana · Secure · Reliable · Transparent
          </div>
        </div>
      </div>
    </div>
  )
}
