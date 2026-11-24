"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Shield, Users, FileText, Building2, Activity, Settings, RefreshCw, Bell, ChevronDown, X, KeyRound, CheckCircle2, UserPlus, Filter } from "lucide-react"
import { GovSidebar, type NavItem } from "@/components/GovSidebar"

const NAV: NavItem[] = [
  { key: "overview",  label: "Overview",        Icon: Activity },
  { key: "users",     label: "User Management", Icon: Users },
  { key: "create",    label: "Create User",     Icon: UserPlus },
  { key: "roles",     label: "Roles & Access",  Icon: Shield },
  { key: "logs",      label: "Audit Logs",      Icon: FileText },
  { key: "settings",  label: "Settings",        Icon: Settings },
]

const ROLE_META: Record<string, { color: string; bg: string }> = {
  MINISTER:      { color: "#991b1b", bg: "#fee2e2" },
  PA:            { color: "#1e40af", bg: "#dbeafe" },
  ADMIN:         { color: "#5b21b6", bg: "#ede9fe" },
  BACK_OFFICER:  { color: "#92400e", bg: "#fef3c7" },
  FIELD_OFFICER: { color: "#065f46", bg: "#d1fae5" },
  OFFICER:       { color: "#0369a1", bg: "#e0f2fe" },
}

function Badge({ label, color, bg }: { label: string; color: string; bg: string }) {
  return <span className="gov-badge" style={{ color, background: bg }}>{label}</span>
}

export default function AdminDashboard() {
  const { data: session } = useSession()
  const name = (session?.user as any)?.name || "Admin"
  const initials = name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()

  const [activeNav, setActiveNav] = useState("overview")
  const [stats, setStats]         = useState<any>(null)
  const [users, setUsers]         = useState<any[]>([])
  const [logs, setLogs]           = useState<any[]>([])
  const [loading, setLoading]     = useState(true)
  const [resetTarget, setResetTarget] = useState<any>(null)
  const [newPassword, setNewPassword] = useState("")
  const [resetMsg, setResetMsg]       = useState("")
  const [resetting, setResetting]     = useState(false)

  // Create user form
  const [createForm, setCreateForm] = useState({ name: "", email: "", password: "", role: "BACK_OFFICER", phone: "" })
  const [creating, setCreating]     = useState(false)
  const [createMsg, setCreateMsg]   = useState("")

  // Audit log filters
  const [logFilters, setLogFilters] = useState({ entityType: "", action: "", from: "", to: "" })
  const [allLogs, setAllLogs]       = useState<any[]>([])
  const [logTotal, setLogTotal]     = useState(0)
  const [logLoading, setLogLoading] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const [sRes, uRes] = await Promise.all([fetch("/api/admin/stats", { credentials: "include" }), fetch("/api/users", { credentials: "include" })])
      if (sRes.ok) { const d = await sRes.json(); setStats(d); setLogs(d.recentActivity || []) }
      if (uRes.ok) { const d = await uRes.json(); setUsers(d.users ?? []) }
    } finally { setLoading(false) }
  }

  const loadAuditLogs = async () => {
    setLogLoading(true)
    const params = new URLSearchParams()
    if (logFilters.entityType) params.set("entityType", logFilters.entityType)
    if (logFilters.action)     params.set("action",     logFilters.action)
    if (logFilters.from)       params.set("from",       logFilters.from)
    if (logFilters.to)         params.set("to",         logFilters.to)
    const res = await fetch(`/api/audit-logs?${params}`, { credentials: "include" })
    const d = await res.json()
    if (d.success) { setAllLogs(d.logs); setLogTotal(d.total) }
    setLogLoading(false)
  }

  const handleCreate = async () => {
    setCreating(true); setCreateMsg("")
    try {
      const res = await fetch("/api/users", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      })
      const d = await res.json()
      if (d.success) {
        setCreateMsg(`User ${d.user.name} created successfully`)
        setCreateForm({ name: "", email: "", password: "", role: "BACK_OFFICER", phone: "" })
        loadData()
      } else setCreateMsg(d.error || "Failed")
    } catch { setCreateMsg("Network error") } finally { setCreating(false) }
  }

  useEffect(() => { loadData() }, [])
  useEffect(() => { if (activeNav === "logs") loadAuditLogs() }, [activeNav])

  const handleReset = async () => {
    if (!resetTarget || newPassword.length < 8) { setResetMsg("Password must be at least 8 characters"); return }
    setResetting(true); setResetMsg("")
    try {
      const res = await fetch(`/api/users/${resetTarget.id}`, { method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ newPassword }) })
      const d = await res.json()
      if (d.success) { setResetMsg("Password reset successfully"); setNewPassword(""); setTimeout(() => { setResetTarget(null); setResetMsg("") }, 1500) }
      else setResetMsg(d.error || "Failed")
    } finally { setResetting(false) }
  }

  const handleToggle = async (user: any) => {
    await fetch(`/api/users/${user.id}`, { method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: user.status === "active" ? "inactive" : "active" }) })
    loadData()
  }

  const now = new Date()
  const todayStr = now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })

  return (
    <div className="gov-app">
      <GovSidebar items={NAV} active={activeNav} onNav={setActiveNav} role="ADMIN" userName={name} />

      <div className="gov-main">
        <header className="gov-header">
          <div>
            <div className="gov-header-title">System Administration</div>
            <div className="gov-header-sub">Government of Telangana · {todayStr}</div>
          </div>
          <div className="gov-header-actions">
            <button onClick={loadData} className="gov-header-btn"><RefreshCw size={15} /></button>
            <button className="gov-header-btn"><Bell size={15} /></button>
            <div className="gov-header-profile">
              <div className="gov-avatar">{initials}</div>
              <div><div className="gov-avatar-name">{name}</div><div className="gov-avatar-role">Administrator</div></div>
              <ChevronDown size={13} color="var(--sub)" />
            </div>
          </div>
        </header>

        <div className="gov-body">
          {/* KPI */}
          <div className="gov-kpi-grid">
            {[
              { label: "Total Users",    value: stats?.users?.total,              sub: `${stats?.users?.active ?? 0} active`,       accent: "#2F6FED", Icon: Users },
              { label: "Grievances",     value: stats?.grievances?.total,         sub: `${stats?.grievances?.pending ?? 0} pending`,  accent: "#F59E0B", Icon: FileText },
              { label: "Public Works",   value: stats?.projects?.total,           sub: `${stats?.projects?.completed ?? 0} completed`, accent: "#7c3aed", Icon: Building2 },
              { label: "System Health",  value: "99.8%",                          sub: "JWT · bcrypt-12",                             accent: "#16A34A", Icon: CheckCircle2 },
            ].map(({ label, value, sub, accent, Icon: Ic }) => (
              <div key={label} className="gov-kpi">
                <div className="gov-kpi-top"><div className="gov-kpi-icon" style={{ background: `${accent}18` }}><Ic size={17} color={accent} /></div></div>
                <div className="gov-kpi-value">{loading && label !== "System Health" ? <div className="gov-skel gov-kpi-skel" /> : value ?? "—"}</div>
                <div className="gov-kpi-label">{label}</div>
                <div style={{ fontSize: 11, color: "var(--sub)" }}>{sub}</div>
              </div>
            ))}
          </div>

          {/* Overview */}
          {activeNav === "overview" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div className="gov-card gov-card-p">
                <div className="gov-card-header">
                  <div className="gov-card-title"><div className="gov-card-icon" style={{ background: "#eff6ff" }}><Users size={14} color="#2F6FED" /></div>Recent Users</div>
                  <button className="gov-card-action" onClick={() => setActiveNav("users")}>View all</button>
                </div>
                {users.slice(0,5).map(u => {
                  const rm = ROLE_META[u.role] || { color: "#475569", bg: "#f1f5f9" }
                  return (
                    <div key={u.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid var(--border)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--bg)", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 700, color: "var(--navy)", border: "1px solid var(--border)" }}>{u.name?.charAt(0)}</div>
                        <div><div style={{ fontSize: 13, fontWeight: 600, color: "var(--navy)" }}>{u.name}</div><div style={{ fontSize: 11, color: "var(--sub)" }}>{u.email}</div></div>
                      </div>
                      <Badge label={u.role} color={rm.color} bg={rm.bg} />
                    </div>
                  )
                })}
              </div>
              <div className="gov-card gov-card-p">
                <div className="gov-card-header">
                  <div className="gov-card-title"><div className="gov-card-icon" style={{ background: "#f0fdf4" }}><Activity size={14} color="#16A34A" /></div>System Stats</div>
                </div>
                {[
                  { label: "Petitions Total",   value: stats?.grievances?.total ?? "—" },
                  { label: "Petitions Pending",  value: stats?.grievances?.pending ?? "—" },
                  { label: "Petitions Resolved", value: stats?.grievances?.resolved ?? "—" },
                  { label: "Works In Progress",  value: stats?.projects?.ongoing ?? "—" },
                  { label: "Works Completed",    value: stats?.projects?.completed ?? "—" },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid var(--border)" }}>
                    <span style={{ fontSize: 13, color: "var(--sub)" }}>{label}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)" }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Users */}
          {activeNav === "users" && (
            <div className="gov-card gov-card-p">
              <div className="gov-card-header">
                <div className="gov-card-title"><div className="gov-card-icon" style={{ background: "#eff6ff" }}><Users size={14} color="#2F6FED" /></div>System Users <span style={{ fontSize: 12, color: "var(--sub)", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 5, padding: "1px 8px" }}>{users.length}</span></div>
              </div>
              {loading ? <div className="gov-empty">Loading...</div> : (
                <div style={{ overflowX: "auto" }}>
                  <table className="gov-table">
                    <thead><tr>{["Name","Email","Role","Status","Actions"].map(h => <th key={h}>{h}</th>)}</tr></thead>
                    <tbody>
                      {users.map(u => {
                        const rm = ROLE_META[u.role] || { color: "#475569", bg: "#f1f5f9" }
                        return (
                          <tr key={u.id}>
                            <td style={{ fontWeight: 600 }}>{u.name}</td>
                            <td style={{ color: "var(--sub)", fontSize: 12 }}>{u.email}</td>
                            <td><Badge label={u.role} color={rm.color} bg={rm.bg} /></td>
                            <td><Badge label={u.status || "active"} color={u.status === "inactive" ? "#991b1b" : "#065f46"} bg={u.status === "inactive" ? "#fee2e2" : "#d1fae5"} /></td>
                            <td>
                              <div style={{ display: "flex", gap: 6 }}>
                                <button onClick={() => { setResetTarget(u); setNewPassword(""); setResetMsg("") }} className="gov-btn gov-btn-outline gov-btn-sm"><KeyRound size={12} />Reset</button>
                                <button onClick={() => handleToggle(u)} className="gov-btn gov-btn-sm" style={{ background: u.status === "active" ? "#fef2f2" : "#f0fdf4", color: u.status === "active" ? "var(--crit)" : "var(--success)", border: `1px solid ${u.status === "active" ? "#fecaca" : "#bbf7d0"}` }}>{u.status === "active" ? "Deactivate" : "Activate"}</button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Roles */}
          {activeNav === "roles" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div className="gov-card gov-card-p">
                <div className="gov-card-header"><div className="gov-card-title"><div className="gov-card-icon" style={{ background: "#f5f3ff" }}><Shield size={14} color="#7c3aed" /></div>Role Hierarchy</div></div>
                {[
                  { role: "MINISTER",      desc: "Full access — all data, private notes, all petitions" },
                  { role: "PA",            desc: "Manage petitions, calendar, promise tracker" },
                  { role: "ADMIN",         desc: "User management, system stats, password resets" },
                  { role: "BACK_OFFICER",  desc: "Data entry — log new petitions, view all" },
                  { role: "FIELD_OFFICER", desc: "View assigned tasks only, update status" },
                  { role: "OFFICER",       desc: "General dashboard access" },
                ].map(({ role, desc }) => {
                  const rm = ROLE_META[role] || { color: "#475569", bg: "#f1f5f9" }
                  return (
                    <div key={role} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                      <Badge label={role} color={rm.color} bg={rm.bg} />
                      <span style={{ fontSize: 12, color: "var(--sub)" }}>{desc}</span>
                    </div>
                  )
                })}
              </div>
              <div className="gov-card gov-card-p">
                <div className="gov-card-header"><div className="gov-card-title"><div className="gov-card-icon" style={{ background: "#f0fdf4" }}><CheckCircle2 size={14} color="#16A34A" /></div>Security Settings</div></div>
                {[
                  { label: "Session Timeout",  value: "8 hours" },
                  { label: "Password Hashing", value: "bcrypt cost-12" },
                  { label: "JWT Secret",       value: "Env variable only" },
                  { label: "Bypass Routes",    value: "All blocked at edge" },
                  { label: "Private Notes",    value: "MINISTER/PA/ADMIN only" },
                  { label: "Audit Logging",    value: "Every sensitive action" },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                    <span style={{ fontSize: 13, color: "var(--text)" }}>{label}</span>
                    <Badge label={value} color="#065f46" bg="#d1fae5" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Create User */}
          {activeNav === "create" && (
            <div className="gov-card gov-card-p" style={{ maxWidth: 520 }}>
              <div className="gov-card-header"><div className="gov-card-title"><div className="gov-card-icon" style={{ background: "#eff6ff" }}><UserPlus size={14} color="#2F6FED" /></div>Create New User</div></div>
              <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div><label className="gov-label">Full Name *</label><input className="gov-input" value={createForm.name} onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Ravi Kumar" /></div>
                  <div><label className="gov-label">Email *</label><input className="gov-input" type="email" value={createForm.email} onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))} placeholder="ravi@gov.in" /></div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label className="gov-label">Role *</label>
                    <select className="gov-select" value={createForm.role} onChange={e => setCreateForm(f => ({ ...f, role: e.target.value }))}>
                      {["PA","ADMIN","BACK_OFFICER","FIELD_OFFICER","OFFICER","GOVERNMENT_OFFICIAL"].map(r => <option key={r} value={r}>{r.replace(/_/g, " ")}</option>)}
                    </select>
                  </div>
                  <div><label className="gov-label">Phone</label><input className="gov-input" type="tel" value={createForm.phone} onChange={e => setCreateForm(f => ({ ...f, phone: e.target.value }))} /></div>
                </div>
                <div><label className="gov-label">Password * (min 8 chars)</label><input className="gov-input" type="password" value={createForm.password} onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))} /></div>
                {createMsg && <div style={{ fontSize: 13, fontWeight: 600, color: createMsg.includes("success") ? "var(--success)" : "var(--crit)" }}>{createMsg}</div>}
                <button className="gov-btn gov-btn-primary" style={{ width: "fit-content" }} disabled={creating || !createForm.name || !createForm.email || !createForm.password} onClick={handleCreate}>
                  <UserPlus size={14} />{creating ? "Creating…" : "Create User"}
                </button>
              </div>
            </div>
          )}

          {/* Audit Logs */}
          {activeNav === "logs" && (
            <div className="gov-card gov-card-p">
              <div className="gov-card-header">
                <div className="gov-card-title"><div className="gov-card-icon" style={{ background: "#eff6ff" }}><FileText size={14} color="#2F6FED" /></div>Audit Log <span style={{ fontSize: 12, color: "var(--sub)", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 5, padding: "1px 8px" }}>{logTotal}</span></div>
                <button className="gov-btn gov-btn-outline gov-btn-sm" onClick={loadAuditLogs}><RefreshCw size={13} />Refresh</button>
              </div>
              {/* Filters */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                <select className="gov-select" style={{ width: 160 }} value={logFilters.entityType} onChange={e => setLogFilters(f => ({ ...f, entityType: e.target.value }))}>
                  <option value="">All Entity Types</option>
                  {["USER","CAMPAIGN","PARTY_WORKER","FUND_ALLOCATION","SURVEY","CITIZEN","ATTACHMENT","GRIEVANCE","PETITION"].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select className="gov-select" style={{ width: 130 }} value={logFilters.action} onChange={e => setLogFilters(f => ({ ...f, action: e.target.value }))}>
                  <option value="">All Actions</option>
                  {["CREATE","UPDATE","DELETE","STATUS_CHANGE","APPROVE","DISPATCH","GRADE_COMPUTE"].map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                <input className="gov-input" type="date" style={{ width: 140 }} value={logFilters.from} onChange={e => setLogFilters(f => ({ ...f, from: e.target.value }))} />
                <input className="gov-input" type="date" style={{ width: 140 }} value={logFilters.to} onChange={e => setLogFilters(f => ({ ...f, to: e.target.value }))} />
                <button className="gov-btn gov-btn-primary gov-btn-sm" onClick={loadAuditLogs}><Filter size={13} />Apply</button>
              </div>
              {logLoading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{[1,2,3,4,5].map(i => <div key={i} className="gov-skel" style={{ height: 44, borderRadius: 7 }} />)}</div>
              ) : allLogs.length === 0 ? <div className="gov-empty">No audit log entries match the filters.</div> : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {allLogs.map((log: any, i: number) => (
                    <div key={log.id || i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: "var(--bg)", borderRadius: 8, border: "1px solid var(--border)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--blue)", flexShrink: 0 }} />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--navy)" }}>{log.action} <span style={{ fontSize: 11, color: "var(--sub)", fontWeight: 400 }}>on {log.entityType}</span></div>
                          <div style={{ fontSize: 11, color: "var(--sub)" }}>{log.user?.name || log.userId} · {log.entityId?.slice(0, 8)}…</div>
                        </div>
                      </div>
                      <div style={{ fontSize: 11, color: "var(--sub)", flexShrink: 0 }}>{new Date(log.createdAt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Password Reset Modal */}
      {resetTarget && (
        <div className="gov-modal-wrap" onClick={e => { if (e.target === e.currentTarget) setResetTarget(null) }}>
          <div className="gov-modal" style={{ maxWidth: 400 }}>
            <div className="gov-modal-header">
              <div className="gov-modal-title">Reset Password</div>
              <button className="gov-drawer-close" onClick={() => setResetTarget(null)}><X size={14} /></button>
            </div>
            <div className="gov-modal-body">
              <div style={{ fontSize: 13, color: "var(--sub)" }}>Resetting password for <strong style={{ color: "var(--navy)" }}>{resetTarget.name}</strong> ({resetTarget.email})</div>
              <div><label className="gov-label">New Password (min 8 chars)</label><input type="password" className="gov-input" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Enter new password" /></div>
              {resetMsg && <div style={{ fontSize: 13, color: resetMsg.includes("success") ? "var(--success)" : "var(--crit)", fontWeight: 600 }}>{resetMsg}</div>}
            </div>
            <div className="gov-modal-footer">
              <button onClick={() => setResetTarget(null)} className="gov-btn gov-btn-outline">Cancel</button>
              <button onClick={handleReset} disabled={resetting} className="gov-btn gov-btn-primary"><KeyRound size={13} />{resetting ? "Resetting..." : "Reset Password"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
