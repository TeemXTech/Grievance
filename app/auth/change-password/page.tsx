"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Shield, Lock, Loader2, Eye, EyeOff } from "lucide-react"

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

export default function ChangePasswordPage() {
  const { data: session } = useSession()
  const router = useRouter()

  const [current, setCurrent]   = useState("")
  const [next, setNext]         = useState("")
  const [confirm, setConfirm]   = useState("")
  const [showCur, setShowCur]   = useState(false)
  const [showNew, setShowNew]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (next !== confirm) { setError("New passwords do not match."); return }
    if (next.length < 10) { setError("New password must be at least 10 characters."); return }
    if (current === next)  { setError("New password must differ from current password."); return }

    setLoading(true)
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || "Failed to change password."); return }

      // Sign out so the JWT is refreshed without mustChangePassword flag
      await signOut({ redirect: false })
      router.replace("/auth/login?changed=1")
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const user = session?.user as any

  return (
    <div style={{ minHeight: "100vh", background: "var(--sidebar)", display: "flex", flexDirection: "column", fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* Top bar */}
      <div style={{ background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "14px 28px", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 9, background: "rgba(47,111,237,0.25)", display: "grid", placeItems: "center", border: "1px solid rgba(255,255,255,0.12)" }}>
          <Shield size={18} color="#7eb3ff" />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: "white" }}>Government of Telangana</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>Ministerial Office Management System</div>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ width: "100%", maxWidth: 440 }}>

          <div style={{ background: "white", borderRadius: 14, overflow: "hidden", boxShadow: "0 24px 64px rgba(0,0,0,0.3)" }}>

            <div style={{ background: "var(--blue)", padding: "28px 32px 24px", textAlign: "center" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(255,255,255,0.18)", display: "grid", placeItems: "center", margin: "0 auto 14px", border: "2px solid rgba(255,255,255,0.3)" }}>
                <Lock size={26} color="white" />
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "white" }}>Password Change Required</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", marginTop: 6 }}>
                {user?.name ? `Welcome, ${user.name}.` : "Welcome."} Your account requires a new password before you can continue.
              </div>
            </div>

            <div style={{ padding: "28px 32px 32px" }}>
              <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                <div>
                  <label className="gov-label">Current Password</label>
                  <div style={{ position: "relative" }}>
                    <Lock size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--sub)" }} />
                    <input
                      type={showCur ? "text" : "password"} value={current} onChange={e => setCurrent(e.target.value)}
                      className="gov-input" style={{ paddingLeft: 36, paddingRight: 40 }}
                      placeholder="Your current password" required autoComplete="current-password"
                    />
                    <button type="button" onClick={() => setShowCur(!showCur)}
                      style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--sub)", cursor: "pointer", padding: 0 }}>
                      {showCur ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="gov-label">New Password <span style={{ color: "var(--sub)", fontWeight: 400 }}>(min 10 characters)</span></label>
                  <div style={{ position: "relative" }}>
                    <Lock size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--sub)" }} />
                    <input
                      type={showNew ? "text" : "password"} value={next} onChange={e => setNext(e.target.value)}
                      className="gov-input" style={{ paddingLeft: 36, paddingRight: 40 }}
                      placeholder="Choose a strong new password" required autoComplete="new-password"
                    />
                    <button type="button" onClick={() => setShowNew(!showNew)}
                      style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--sub)", cursor: "pointer", padding: 0 }}>
                      {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="gov-label">Confirm New Password</label>
                  <div style={{ position: "relative" }}>
                    <Lock size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--sub)" }} />
                    <input
                      type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                      className="gov-input" style={{ paddingLeft: 36 }}
                      placeholder="Repeat new password" required autoComplete="new-password"
                    />
                  </div>
                </div>

                {error && (
                  <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", color: "var(--crit)", fontSize: 13 }}>
                    {error}
                  </div>
                )}

                <button type="submit" disabled={loading} className="gov-btn gov-btn-primary" style={{ width: "100%", padding: "11px", fontSize: 14, marginTop: 4 }}>
                  {loading ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Changing password...</> : "Set New Password"}
                </button>
              </form>

              <div style={{ textAlign: "center", fontSize: 12, color: "var(--sub)", marginTop: 16 }}>
                Need help? Contact your system administrator.
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
