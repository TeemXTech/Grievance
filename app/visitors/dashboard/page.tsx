"use client"
import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import {
  Users, Plus, Search, X, RefreshCw, Bell, ChevronDown,
  CheckCircle2, Clock, AlertTriangle, UserCheck, UserX,
  Phone, MapPin, Building, Send, ChevronRight, Flag,
  LogIn, LogOut, BarChart2,
} from "lucide-react"
import { GovSidebar, type NavItem } from "@/components/GovSidebar"

interface Visitor {
  id: string
  tokenNumber: string
  visitorName: string
  visitorPhone?: string
  visitorAddress?: string
  organization?: string
  visitType: string
  purpose: string
  appointmentDate: string
  checkedInAt?: string
  checkedOutAt?: string
  meetingWith?: string
  status: string
  outcomeNotes?: string
  priorityFlag: boolean
  notes?: string
  createdAt: string
}

interface TodaySummary {
  total: number
  waiting: number
  inMeeting: number
  completed: number
  noShow: number
}

interface Stats {
  today: TodaySummary
  weekTotal: number
  monthTotal: number
  byType: { name: string; value: number }[]
  byStatus: { name: string; value: number }[]
  dailyTrend: { day: string; count: number }[]
  recentVIP: Visitor[]
}

const NAV: NavItem[] = [
  { key: "today",    label: "Today's Visitors", Icon: Users },
  { key: "register", label: "Register Visitor",  Icon: Plus },
  { key: "all",      label: "All Visitors",      Icon: BarChart2 },
]

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  WAITING:    { label: "Waiting",    color: "#92400e", bg: "#fef3c7" },
  IN_MEETING: { label: "In Meeting", color: "#1e40af", bg: "#dbeafe" },
  COMPLETED:  { label: "Completed",  color: "#065f46", bg: "#d1fae5" },
  CANCELLED:  { label: "Cancelled",  color: "#6b7280", bg: "#f3f4f6" },
  NO_SHOW:    { label: "No Show",    color: "#991b1b", bg: "#fee2e2" },
}

const TYPE_META: Record<string, { label: string; color: string }> = {
  WALK_IN:     { label: "Walk-in",     color: "#2F6FED" },
  APPOINTMENT: { label: "Appointment", color: "#7c3aed" },
  VIP:         { label: "VIP",         color: "#b45309" },
  DELEGATION:  { label: "Delegation",  color: "#0f766e" },
  MEDIA:       { label: "Media",       color: "#be185d" },
  OFFICIAL:    { label: "Official",    color: "#1e40af" },
}

function Badge({ label, color, bg }: { label: string; color: string; bg: string }) {
  return <span className="gov-badge" style={{ color, background: bg }}>{label}</span>
}

const EMPTY_FORM = {
  visitorName: "", visitorPhone: "", visitorAddress: "", organization: "",
  visitType: "WALK_IN", purpose: "", appointmentDate: "",
  meetingWith: "", priorityFlag: false, notes: "",
}

export default function VisitorsDashboard() {
  const { data: session } = useSession()
  const userName = (session?.user as any)?.name || "Staff"
  const userRole = (session?.user as any)?.role || ""

  const [activeNav, setActiveNav]     = useState("today")
  const [visitors, setVisitors]       = useState<Visitor[]>([])
  const [stats, setStats]             = useState<Stats | null>(null)
  const [loading, setLoading]         = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [search, setSearch]           = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [filterType, setFilterType]   = useState("")
  const [selected, setSelected]       = useState<Visitor | null>(null)
  const [submitting, setSubmitting]   = useState(false)
  const [form, setForm]               = useState({ ...EMPTY_FORM })
  const [actionForm, setActionForm]   = useState({ meetingWith: "", outcomeNotes: "" })
  const [toast, setToast]             = useState("")

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3500) }

  const todayStr = new Date().toISOString().slice(0, 10)

  const fetchVisitors = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search)       params.set("search", search)
      if (filterStatus) params.set("status", filterStatus)
      if (filterType)   params.set("type", filterType)
      if (activeNav === "today") params.set("date", todayStr)
      const res = await fetch(`/api/visitors?${params}`, { credentials: "include" })
      const d = await res.json()
      if (d.success) setVisitors(d.visitors)
    } finally { setLoading(false) }
  }, [search, filterStatus, filterType, activeNav, todayStr])

  const fetchStats = useCallback(async () => {
    setStatsLoading(true)
    try {
      const res = await fetch("/api/visitors/stats", { credentials: "include" })
      const d = await res.json()
      if (d.success) setStats(d)
    } finally { setStatsLoading(false) }
  }, [])

  useEffect(() => {
    const t = setTimeout(fetchVisitors, 200)
    return () => clearTimeout(t)
  }, [fetchVisitors])

  useEffect(() => { fetchStats() }, [fetchStats])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch("/api/visitors", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          appointmentDate: form.appointmentDate || new Date().toISOString(),
        }),
      })
      const d = await res.json()
      if (d.success) {
        showToast(`✅ Visitor registered — Token: ${d.visitor.tokenNumber}`)
        setForm({ ...EMPTY_FORM })
        setActiveNav("today")
        fetchVisitors()
        fetchStats()
      } else {
        showToast(`❌ ${d.error}`)
      }
    } finally { setSubmitting(false) }
  }

  const handleAction = async (id: string, action: string, extra?: object) => {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/visitors/${id}`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      })
      const d = await res.json()
      if (d.success) {
        setSelected(d.visitor)
        fetchVisitors()
        fetchStats()
        showToast(`✅ Updated`)
      }
    } finally { setSubmitting(false) }
  }

  const canWrite = ["PA", "ADMIN", "BACK_OFFICER"].includes(userRole)
  const now = new Date()
  const displayDate = now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })

  return (
    <div className="gov-app">
      <GovSidebar items={NAV} active={activeNav} onNav={setActiveNav} role={userRole} userName={userName} />

      <div className="gov-main">
        <header className="gov-header">
          <div>
            <div className="gov-header-title">Visitors Management</div>
            <div className="gov-header-sub">Office Reception · {displayDate}</div>
          </div>
          <div className="gov-header-actions">
            <button onClick={() => { fetchVisitors(); fetchStats() }} className="gov-header-btn">
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            </button>
            <div className="gov-notif-wrap">
              <button className="gov-header-btn"><Bell size={15} /></button>
              {stats && stats.today.waiting > 0 && (
                <span className="gov-notif-dot">{stats.today.waiting}</span>
              )}
            </div>
            <div className="gov-header-profile">
              <div className="gov-avatar">{userName.slice(0, 2).toUpperCase()}</div>
              <div>
                <div className="gov-avatar-name">{userName}</div>
                <div className="gov-avatar-role">{userRole}</div>
              </div>
              <ChevronDown size={13} color="var(--sub)" />
            </div>
          </div>
        </header>

        <div className="gov-body">

          {/* KPI Row */}
          <div className="gov-kpi-grid">
            {[
              { label: "Today Total",   value: stats?.today.total    ?? 0, accent: "#2F6FED", Icon: Users },
              { label: "Waiting",       value: stats?.today.waiting  ?? 0, accent: "#F59E0B", Icon: Clock },
              { label: "In Meeting",    value: stats?.today.inMeeting?? 0, accent: "#7c3aed", Icon: UserCheck },
              { label: "Completed",     value: stats?.today.completed?? 0, accent: "#16A34A", Icon: CheckCircle2 },
            ].map(({ label, value, accent, Icon: Ic }) => (
              <div key={label} className="gov-kpi">
                <div className="gov-kpi-top">
                  <div className="gov-kpi-icon" style={{ background: `${accent}18` }}>
                    <Ic size={17} color={accent} />
                  </div>
                </div>
                <div className="gov-kpi-value">
                  {statsLoading ? <div className="gov-skel gov-kpi-skel" /> : value}
                </div>
                <div className="gov-kpi-label">{label}</div>
              </div>
            ))}
          </div>

          {/* VIP Alert Banner */}
          {stats && stats.recentVIP.length > 0 && (
            <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "12px 18px", display: "flex", alignItems: "center", gap: 10 }}>
              <Flag size={15} color="#b45309" />
              <span style={{ fontSize: 13, fontWeight: 700, color: "#92400e" }}>
                {stats.recentVIP.length} VIP / Priority visitor{stats.recentVIP.length > 1 ? "s" : ""} waiting:{" "}
                {stats.recentVIP.map(v => v.visitorName).join(", ")}
              </span>
            </div>
          )}

          {/* TODAY'S VISITORS */}
          {(activeNav === "today" || activeNav === "all") && (
            <div className="gov-card gov-card-p">
              <div className="gov-card-header">
                <div className="gov-card-title">
                  <div className="gov-card-icon" style={{ background: "#eff6ff" }}>
                    <Users size={15} color="#2F6FED" />
                  </div>
                  {activeNav === "today" ? "Today's Visitors" : "All Visitors"}
                  <span style={{ fontSize: 12, color: "var(--sub)", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 5, padding: "1px 8px" }}>
                    {visitors.length}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <div className="gov-search" style={{ width: 220 }}>
                    <Search size={14} color="var(--sub)" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Name, phone, token..." />
                    {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", color: "var(--sub)", padding: 0 }}><X size={13} /></button>}
                  </div>
                  <select className="gov-select" style={{ width: "auto" }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    <option value="">All Statuses</option>
                    {Object.entries(STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                  <select className="gov-select" style={{ width: "auto" }} value={filterType} onChange={e => setFilterType(e.target.value)}>
                    <option value="">All Types</option>
                    {Object.entries(TYPE_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                  {canWrite && (
                    <button onClick={() => setActiveNav("register")} className="gov-btn gov-btn-primary gov-btn-sm">
                      <Plus size={13} /> Register
                    </button>
                  )}
                </div>
              </div>

              {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[1,2,3,4].map(i => <div key={i} className="gov-skel" style={{ height: 48, borderRadius: 8 }} />)}
                </div>
              ) : visitors.length === 0 ? (
                <div className="gov-empty">
                  <Users size={32} style={{ margin: "0 auto 8px", display: "block", opacity: 0.3 }} />
                  No visitors found.{canWrite && <> <button onClick={() => setActiveNav("register")} style={{ color: "var(--blue)", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Register one →</button></>}
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table className="gov-table">
                    <thead>
                      <tr>
                        {["Token", "Visitor", "Purpose", "Type", "Meeting With", "Status", "Time", ""].map(h => <th key={h}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {visitors.map(v => {
                        const sm = STATUS_META[v.status] || { label: v.status, color: "#475569", bg: "#f1f5f9" }
                        const tm = TYPE_META[v.visitType] || { label: v.visitType, color: "#475569" }
                        const time = new Date(v.appointmentDate).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
                        return (
                          <tr key={v.id} onClick={() => setSelected(v)} style={{ cursor: "pointer" }}>
                            <td>
                              <div style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 700, color: "#1e40af", background: "#eff6ff", padding: "2px 7px", borderRadius: 4, display: "inline-block" }}>
                                {v.tokenNumber}
                              </div>
                              {v.priorityFlag && <span style={{ marginLeft: 4, fontSize: 10, color: "#b45309" }}>⚑ VIP</span>}
                            </td>
                            <td>
                              <div style={{ fontWeight: 600 }}>{v.visitorName}</div>
                              {v.visitorPhone && <div style={{ fontSize: 11, color: "var(--sub)", display: "flex", alignItems: "center", gap: 3 }}><Phone size={10} />{v.visitorPhone}</div>}
                              {v.organization && <div style={{ fontSize: 11, color: "var(--sub)", display: "flex", alignItems: "center", gap: 3 }}><Building size={10} />{v.organization}</div>}
                            </td>
                            <td style={{ fontSize: 12, maxWidth: 180 }}>
                              <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.purpose}</div>
                            </td>
                            <td>
                              <span style={{ fontSize: 11, fontWeight: 600, color: tm.color, background: `${tm.color}15`, padding: "2px 8px", borderRadius: 4 }}>
                                {tm.label}
                              </span>
                            </td>
                            <td style={{ fontSize: 12, color: "var(--sub)" }}>{v.meetingWith || "—"}</td>
                            <td><Badge label={sm.label} color={sm.color} bg={sm.bg} /></td>
                            <td style={{ fontSize: 12, color: "var(--sub)" }}>{time}</td>
                            <td>
                              <button onClick={e => { e.stopPropagation(); setSelected(v) }} className="gov-btn gov-btn-outline gov-btn-sm">
                                Manage <ChevronRight size={12} />
                              </button>
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

          {/* REGISTER FORM */}
          {activeNav === "register" && (
            <div className="gov-card gov-card-p" style={{ maxWidth: 720 }}>
              <div className="gov-card-header">
                <div className="gov-card-title">
                  <div className="gov-card-icon" style={{ background: "#eff6ff" }}><Plus size={15} color="#2F6FED" /></div>
                  Register New Visitor
                </div>
              </div>
              <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Visit Type */}
                <div>
                  <label className="gov-label">Visit Type *</label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                    {Object.entries(TYPE_META).map(([k, v]) => (
                      <button type="button" key={k} onClick={() => setForm(p => ({ ...p, visitType: k }))}
                        style={{ padding: "9px 8px", borderRadius: 8, border: `1px solid ${form.visitType === k ? "var(--blue)" : "var(--border)"}`, background: form.visitType === k ? "#eff6ff" : "var(--bg)", color: form.visitType === k ? "var(--blue)" : "var(--sub)", fontWeight: form.visitType === k ? 700 : 400, fontSize: 12, cursor: "pointer" }}>
                        {v.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="gov-form-grid gov-form-grid-2">
                  <div>
                    <label className="gov-label">Visitor Name *</label>
                    <input required className="gov-input" value={form.visitorName} onChange={e => setForm(p => ({ ...p, visitorName: e.target.value }))} placeholder="Full name" />
                  </div>
                  <div>
                    <label className="gov-label">Phone</label>
                    <input className="gov-input" value={form.visitorPhone} onChange={e => setForm(p => ({ ...p, visitorPhone: e.target.value }))} placeholder="+91-XXXXXXXXXX" />
                  </div>
                  <div>
                    <label className="gov-label">Organization / Party</label>
                    <input className="gov-input" value={form.organization} onChange={e => setForm(p => ({ ...p, organization: e.target.value }))} placeholder="e.g. BRS Mandal Committee" />
                  </div>
                  <div>
                    <label className="gov-label">Meeting With</label>
                    <input className="gov-input" value={form.meetingWith} onChange={e => setForm(p => ({ ...p, meetingWith: e.target.value }))} placeholder="e.g. PA, Minister, Back Officer" />
                  </div>
                  <div>
                    <label className="gov-label">Appointment Date & Time</label>
                    <input type="datetime-local" className="gov-input" value={form.appointmentDate} onChange={e => setForm(p => ({ ...p, appointmentDate: e.target.value }))} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 20 }}>
                    <input type="checkbox" id="vip" checked={form.priorityFlag} onChange={e => setForm(p => ({ ...p, priorityFlag: e.target.checked }))} style={{ width: 16, height: 16 }} />
                    <label htmlFor="vip" className="gov-label" style={{ margin: 0, cursor: "pointer", color: "#b45309" }}>⚑ Mark as VIP / Priority</label>
                  </div>
                </div>

                <div>
                  <label className="gov-label">Purpose of Visit *</label>
                  <textarea required className="gov-textarea" rows={2} value={form.purpose} onChange={e => setForm(p => ({ ...p, purpose: e.target.value }))} placeholder="e.g. Petition for CMRF medical assistance, land dispute, job request..." />
                </div>
                <div>
                  <label className="gov-label">Address</label>
                  <input className="gov-input" value={form.visitorAddress} onChange={e => setForm(p => ({ ...p, visitorAddress: e.target.value }))} placeholder="Village, Mandal, District" />
                </div>
                <div>
                  <label className="gov-label">Internal Notes</label>
                  <input className="gov-input" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Any notes for staff..." />
                </div>

                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <button type="button" onClick={() => setActiveNav("today")} className="gov-btn gov-btn-outline">Cancel</button>
                  <button type="submit" disabled={submitting} className="gov-btn gov-btn-primary">
                    <Send size={14} />{submitting ? "Registering..." : "Register Visitor"}
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>

      {/* VISITOR DETAIL DRAWER */}
      {selected && (
        <>
          <div className="gov-overlay" onClick={() => setSelected(null)} />
          <div className="gov-drawer">
            <div className="gov-drawer-header">
              <div>
                <div className="gov-drawer-title">{selected.visitorName}</div>
                <div className="gov-drawer-sub" style={{ fontFamily: "monospace", color: "#1e40af" }}>{selected.tokenNumber}</div>
              </div>
              <button className="gov-drawer-close" onClick={() => setSelected(null)}><X size={14} /></button>
            </div>
            <div className="gov-drawer-body">
              {/* Status + Type badges */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {(() => { const sm = STATUS_META[selected.status] || { label: selected.status, color: "#475569", bg: "#f1f5f9" }; return <Badge label={sm.label} color={sm.color} bg={sm.bg} /> })()}
                {(() => { const tm = TYPE_META[selected.visitType] || { label: selected.visitType, color: "#475569" }; return <span style={{ fontSize: 11, fontWeight: 600, color: tm.color, background: `${tm.color}15`, padding: "3px 9px", borderRadius: 5 }}>{tm.label}</span> })()}
                {selected.priorityFlag && <span style={{ fontSize: 11, fontWeight: 700, color: "#b45309", background: "#fef3c7", padding: "3px 9px", borderRadius: 5 }}>⚑ VIP / Priority</span>}
              </div>

              {/* Info grid */}
              <div className="gov-info-grid">
                {([
                  ["Phone",        selected.visitorPhone],
                  ["Organization", selected.organization],
                  ["Address",      selected.visitorAddress],
                  ["Meeting With", selected.meetingWith],
                  ["Checked In",   selected.checkedInAt ? new Date(selected.checkedInAt).toLocaleTimeString("en-IN") : null],
                  ["Checked Out",  selected.checkedOutAt ? new Date(selected.checkedOutAt).toLocaleTimeString("en-IN") : null],
                  ["Registered",   new Date(selected.createdAt).toLocaleString("en-IN")],
                ] as [string, string | null | undefined][]).filter(([, v]) => v).map(([l, v]) => (
                  <div key={l} className="gov-info-box">
                    <div className="gov-info-label">{l}</div>
                    <div className="gov-info-value">{v}</div>
                  </div>
                ))}
              </div>

              {/* Purpose */}
              <div>
                <div style={{ fontSize: 11, color: "var(--sub)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 5 }}>Purpose</div>
                <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.7, background: "var(--bg)", borderRadius: 8, padding: "10px 14px" }}>{selected.purpose}</div>
              </div>

              {/* Outcome notes */}
              {selected.outcomeNotes && (
                <div>
                  <div style={{ fontSize: 11, color: "var(--sub)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 5 }}>Outcome / Action Taken</div>
                  <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.7, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 14px" }}>{selected.outcomeNotes}</div>
                </div>
              )}

              {/* Action buttons — only for writable roles */}
              {canWrite && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12, background: "#f0f7ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)" }}>Actions</div>

                  {selected.status === "WAITING" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <div>
                        <label className="gov-label">Meeting With</label>
                        <input className="gov-input" value={actionForm.meetingWith} onChange={e => setActionForm(p => ({ ...p, meetingWith: e.target.value }))} placeholder="Officer / staff name" />
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button disabled={submitting} onClick={() => handleAction(selected.id, "CHECK_IN", { meetingWith: actionForm.meetingWith })} className="gov-btn gov-btn-primary gov-btn-sm" style={{ flex: 1 }}>
                          <LogIn size={13} /> Check In
                        </button>
                        <button disabled={submitting} onClick={() => handleAction(selected.id, "CANCEL")} className="gov-btn gov-btn-outline gov-btn-sm">
                          <X size={13} /> Cancel
                        </button>
                        <button disabled={submitting} onClick={() => handleAction(selected.id, "NO_SHOW")} className="gov-btn gov-btn-outline gov-btn-sm">
                          <UserX size={13} /> No Show
                        </button>
                      </div>
                    </div>
                  )}

                  {selected.status === "IN_MEETING" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <div>
                        <label className="gov-label">Outcome / Action Taken</label>
                        <textarea className="gov-textarea" rows={2} value={actionForm.outcomeNotes} onChange={e => setActionForm(p => ({ ...p, outcomeNotes: e.target.value }))} placeholder="What was decided or promised..." />
                      </div>
                      <button disabled={submitting} onClick={() => handleAction(selected.id, "CHECK_OUT", { outcomeNotes: actionForm.outcomeNotes })} className="gov-btn gov-btn-primary gov-btn-sm">
                        <LogOut size={13} /> Check Out & Complete
                      </button>
                    </div>
                  )}

                  {(selected.status === "COMPLETED" || selected.status === "CANCELLED" || selected.status === "NO_SHOW") && (
                    <div style={{ fontSize: 13, color: "var(--sub)", fontStyle: "italic" }}>This visit is closed. No further actions available.</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Toast */}
      {toast && (
        <div className="gov-toast">
          <CheckCircle2 size={16} color="var(--success)" />
          {toast}
        </div>
      )}
    </div>
  )
}
