"use client"
import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import {
  Mail, Plus, Search, X, RefreshCw, Bell, ChevronDown,
  Send, FileText, Inbox, CheckCircle2, Clock, AlertTriangle,
  ChevronRight, History, Lock, ArrowUpRight, ArrowDownLeft,
} from "lucide-react"
import { GovSidebar, type NavItem } from "@/components/GovSidebar"

interface Letter {
  id: string
  letterNumber: string
  direction: string
  letterType: string
  status: string
  subject: string
  body?: string
  priority: string
  fromName: string
  fromDesignation?: string
  fromDepartment?: string
  toName: string
  toDesignation?: string
  toDepartment?: string
  letterDate: string
  dueDate?: string
  dispatchedAt?: string
  privateNotes?: string
  draftedByName: string
  approvedByName?: string
  createdAt: string
  timeline?: Array<{
    id: string
    fromStatus?: string
    toStatus: string
    actionTaken: string
    remarks?: string
    performedByName: string
    performedByRole: string
    createdAt: string
  }>
}

interface Stats {
  total: number
  drafts: number
  dispatched: number
  pending: number
  overdue: number
  inbound: number
  outbound: number
}

const NAV: NavItem[] = [
  { key: "all",      label: "All Letters",    Icon: Mail },
  { key: "inbound",  label: "Inbound",        Icon: Inbox },
  { key: "outbound", label: "Outbound",       Icon: Send },
  { key: "compose",  label: "Compose Letter", Icon: Plus },
]

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  DRAFT:            { label: "Draft",            color: "#64748b", bg: "#f1f5f9" },
  PENDING_APPROVAL: { label: "Pending Approval", color: "#92400e", bg: "#fef3c7" },
  APPROVED:         { label: "Approved",         color: "#1e40af", bg: "#dbeafe" },
  DISPATCHED:       { label: "Dispatched",       color: "#065f46", bg: "#d1fae5" },
  RECEIVED:         { label: "Received",         color: "#5b21b6", bg: "#ede9fe" },
  ACKNOWLEDGED:     { label: "Acknowledged",     color: "#065f46", bg: "#d1fae5" },
  FILED:            { label: "Filed",            color: "#374151", bg: "#f3f4f6" },
  CANCELLED:        { label: "Cancelled",        color: "#991b1b", bg: "#fee2e2" },
}

const TYPE_META: Record<string, string> = {
  DO_LETTER:       "D.O. Letter",
  OFFICIAL_LETTER: "Official Letter",
  RECOMMENDATION:  "Recommendation",
  REPRESENTATION:  "Representation",
  NOTICE:          "Notice",
  CIRCULAR:        "Circular",
  MEMO:            "Memo",
  OTHER:           "Other",
}

const NEXT_STATUSES: Record<string, string[]> = {
  DRAFT:            ["PENDING_APPROVAL", "APPROVED", "CANCELLED"],
  PENDING_APPROVAL: ["APPROVED", "CANCELLED"],
  APPROVED:         ["DISPATCHED", "CANCELLED"],
  DISPATCHED:       ["RECEIVED", "ACKNOWLEDGED", "FILED"],
  RECEIVED:         ["ACKNOWLEDGED", "FILED"],
  ACKNOWLEDGED:     ["FILED"],
  FILED:            [],
  CANCELLED:        [],
}

function Badge({ label, color, bg }: { label: string; color: string; bg: string }) {
  return <span className="gov-badge" style={{ color, background: bg }}>{label}</span>
}

const EMPTY_FORM = {
  direction: "OUTBOUND", letterType: "OFFICIAL_LETTER", subject: "",
  body: "", priority: "MEDIUM",
  fromName: "", fromDesignation: "", fromDepartment: "",
  toName: "", toDesignation: "", toDepartment: "", toAddress: "",
  letterDate: new Date().toISOString().slice(0, 10),
  dueDate: "", privateNotes: "",
}

export default function LettersDashboard() {
  const { data: session } = useSession()
  const userName = (session?.user as any)?.name || "Staff"
  const userRole = (session?.user as any)?.role || ""
  const canSeePrivate = ["MINISTER", "PA", "ADMIN"].includes(userRole)
  const canWrite      = ["PA", "ADMIN", "BACK_OFFICER"].includes(userRole)

  const [activeNav, setActiveNav]   = useState("all")
  const [letters, setLetters]       = useState<Letter[]>([])
  const [stats, setStats]           = useState<Stats | null>(null)
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [filterType, setFilterType]     = useState("")
  const [selected, setSelected]     = useState<Letter | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm]             = useState({ ...EMPTY_FORM })
  const [actionForm, setActionForm] = useState({ status: "", actionTaken: "", remarks: "" })
  const [toast, setToast]           = useState("")

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3500) }

  const fetchLetters = useCallback(async () => {
    setLoading(true)
    try {
      const p = new URLSearchParams()
      if (search)       p.set("search", search)
      if (filterStatus) p.set("status", filterStatus)
      if (filterType)   p.set("type", filterType)
      if (activeNav === "inbound")  p.set("direction", "INBOUND")
      if (activeNav === "outbound") p.set("direction", "OUTBOUND")
      const res = await fetch(`/api/letters?${p}`, { credentials: "include" })
      const d = await res.json()
      if (d.success) setLetters(d.letters)
    } finally { setLoading(false) }
  }, [search, filterStatus, filterType, activeNav])

  const fetchStats = useCallback(async () => {
    const res = await fetch("/api/letters/stats", { credentials: "include" })
    const d = await res.json()
    if (d.success) setStats(d)
  }, [])

  useEffect(() => { const t = setTimeout(fetchLetters, 200); return () => clearTimeout(t) }, [fetchLetters])
  useEffect(() => { fetchStats() }, [fetchStats])

  const handleCompose = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch("/api/letters", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const d = await res.json()
      if (d.success) {
        showToast(`✅ Letter created — ${d.letter.letterNumber}`)
        setForm({ ...EMPTY_FORM })
        setActiveNav("all")
        fetchLetters(); fetchStats()
      } else { showToast(`❌ ${d.error}`) }
    } finally { setSubmitting(false) }
  }

  const handleAction = async (id: string) => {
    if (!actionForm.status) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/letters/${id}`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(actionForm),
      })
      const d = await res.json()
      if (d.success) {
        setSelected(d.letter)
        setActionForm({ status: "", actionTaken: "", remarks: "" })
        fetchLetters(); fetchStats()
        showToast("✅ Letter updated")
      }
    } finally { setSubmitting(false) }
  }

  const openLetter = (l: Letter) => {
    setSelected(l)
    setActionForm({ status: "", actionTaken: "", remarks: "" })
  }

  const now = new Date()
  const displayDate = now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })

  return (
    <div className="gov-app">
      <GovSidebar items={NAV} active={activeNav} onNav={setActiveNav} role={userRole} userName={userName} />

      <div className="gov-main">
        <header className="gov-header">
          <div>
            <div className="gov-header-title">Letters Management</div>
            <div className="gov-header-sub">Official Correspondence · {displayDate}</div>
          </div>
          <div className="gov-header-actions">
            <button onClick={() => { fetchLetters(); fetchStats() }} className="gov-header-btn">
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            </button>
            <div className="gov-notif-wrap">
              <button className="gov-header-btn"><Bell size={15} /></button>
              {stats && stats.overdue > 0 && <span className="gov-notif-dot">{stats.overdue}</span>}
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
              { label: "Total Letters", value: stats?.total     ?? 0, accent: "#2F6FED", Icon: Mail },
              { label: "Drafts",        value: stats?.drafts    ?? 0, accent: "#F59E0B", Icon: Clock },
              { label: "Dispatched",    value: stats?.dispatched?? 0, accent: "#16A34A", Icon: CheckCircle2 },
              { label: "Overdue",       value: stats?.overdue   ?? 0, accent: "#DC2626", Icon: AlertTriangle },
            ].map(({ label, value, accent, Icon: Ic }) => (
              <div key={label} className="gov-kpi">
                <div className="gov-kpi-top">
                  <div className="gov-kpi-icon" style={{ background: `${accent}18` }}>
                    <Ic size={17} color={accent} />
                  </div>
                </div>
                <div className="gov-kpi-value">{value}</div>
                <div className="gov-kpi-label">{label}</div>
              </div>
            ))}
          </div>

          {/* Inbound / Outbound split */}
          {stats && (
            <div style={{ display: "flex", gap: 12 }}>
              <div className="gov-card gov-card-p" style={{ flex: 1, display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 38, height: 38, borderRadius: 9, background: "#ede9fe", display: "grid", placeItems: "center" }}>
                  <ArrowDownLeft size={18} color="#7c3aed" />
                </div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "var(--navy)" }}>{stats.inbound}</div>
                  <div style={{ fontSize: 12, color: "var(--sub)" }}>Inbound Letters</div>
                </div>
              </div>
              <div className="gov-card gov-card-p" style={{ flex: 1, display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 38, height: 38, borderRadius: 9, background: "#d1fae5", display: "grid", placeItems: "center" }}>
                  <ArrowUpRight size={18} color="#065f46" />
                </div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "var(--navy)" }}>{stats.outbound}</div>
                  <div style={{ fontSize: 12, color: "var(--sub)" }}>Outbound Letters</div>
                </div>
              </div>
            </div>
          )}

          {/* Letters List */}
          {(activeNav === "all" || activeNav === "inbound" || activeNav === "outbound") && (
            <div className="gov-card gov-card-p">
              <div className="gov-card-header">
                <div className="gov-card-title">
                  <div className="gov-card-icon" style={{ background: "#eff6ff" }}><Mail size={15} color="#2F6FED" /></div>
                  {activeNav === "inbound" ? "Inbound Letters" : activeNav === "outbound" ? "Outbound Letters" : "All Letters"}
                  <span style={{ fontSize: 12, color: "var(--sub)", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 5, padding: "1px 8px" }}>
                    {letters.length}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <div className="gov-search" style={{ width: 220 }}>
                    <Search size={14} color="var(--sub)" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Subject, name, dept..." />
                    {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", color: "var(--sub)", padding: 0 }}><X size={13} /></button>}
                  </div>
                  <select className="gov-select" style={{ width: "auto" }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    <option value="">All Statuses</option>
                    {Object.entries(STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                  <select className="gov-select" style={{ width: "auto" }} value={filterType} onChange={e => setFilterType(e.target.value)}>
                    <option value="">All Types</option>
                    {Object.entries(TYPE_META).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                  {canWrite && (
                    <button onClick={() => setActiveNav("compose")} className="gov-btn gov-btn-primary gov-btn-sm">
                      <Plus size={13} /> Compose
                    </button>
                  )}
                </div>
              </div>

              {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[1,2,3,4].map(i => <div key={i} className="gov-skel" style={{ height: 48, borderRadius: 8 }} />)}
                </div>
              ) : letters.length === 0 ? (
                <div className="gov-empty">
                  <Mail size={32} style={{ margin: "0 auto 8px", display: "block", opacity: 0.3 }} />
                  No letters found.
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table className="gov-table">
                    <thead>
                      <tr>
                        {["Ref No.", "Direction", "Subject", "From", "To", "Type", "Status", "Date", ""].map(h => <th key={h}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {letters.map(l => {
                        const sm = STATUS_META[l.status] || { label: l.status, color: "#475569", bg: "#f1f5f9" }
                        const isOverdue = l.dueDate && new Date(l.dueDate) < now && !["FILED","CANCELLED","ACKNOWLEDGED"].includes(l.status)
                        return (
                          <tr key={l.id} onClick={() => openLetter(l)} style={{ cursor: "pointer" }}>
                            <td>
                              <div style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 700, color: "#1e40af", background: "#eff6ff", padding: "2px 7px", borderRadius: 4, display: "inline-block" }}>
                                {l.letterNumber}
                              </div>
                            </td>
                            <td>
                              {l.direction === "INBOUND"
                                ? <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: "#7c3aed" }}><ArrowDownLeft size={12} />Inbound</span>
                                : <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: "#065f46" }}><ArrowUpRight size={12} />Outbound</span>
                              }
                            </td>
                            <td>
                              <div style={{ fontWeight: 600, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.subject}</div>
                              {isOverdue && <span style={{ fontSize: 10, fontWeight: 800, color: "var(--crit)" }}>OVERDUE</span>}
                            </td>
                            <td style={{ fontSize: 12 }}>
                              <div style={{ fontWeight: 600 }}>{l.fromName}</div>
                              {l.fromDepartment && <div style={{ fontSize: 11, color: "var(--sub)" }}>{l.fromDepartment}</div>}
                            </td>
                            <td style={{ fontSize: 12 }}>
                              <div style={{ fontWeight: 600 }}>{l.toName}</div>
                              {l.toDepartment && <div style={{ fontSize: 11, color: "var(--sub)" }}>{l.toDepartment}</div>}
                            </td>
                            <td style={{ fontSize: 11, color: "var(--sub)" }}>{TYPE_META[l.letterType] || l.letterType}</td>
                            <td><Badge label={sm.label} color={sm.color} bg={sm.bg} /></td>
                            <td style={{ fontSize: 12, color: "var(--sub)" }}>{new Date(l.letterDate).toLocaleDateString("en-IN")}</td>
                            <td>
                              <button onClick={e => { e.stopPropagation(); openLetter(l) }} className="gov-btn gov-btn-outline gov-btn-sm">
                                View <ChevronRight size={12} />
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

          {/* Compose Form */}
          {activeNav === "compose" && canWrite && (
            <div className="gov-card gov-card-p" style={{ maxWidth: 760 }}>
              <div className="gov-card-header">
                <div className="gov-card-title">
                  <div className="gov-card-icon" style={{ background: "#eff6ff" }}><Plus size={15} color="#2F6FED" /></div>
                  Compose New Letter
                </div>
              </div>
              <form onSubmit={handleCompose} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                {/* Direction toggle */}
                <div>
                  <label className="gov-label">Direction *</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    {[["OUTBOUND", "Outbound (Sending)"], ["INBOUND", "Inbound (Received)"]].map(([val, lbl]) => (
                      <button type="button" key={val} onClick={() => setForm(p => ({ ...p, direction: val }))}
                        style={{ flex: 1, padding: "9px 8px", borderRadius: 8, border: `1px solid ${form.direction === val ? "var(--blue)" : "var(--border)"}`, background: form.direction === val ? "#eff6ff" : "var(--bg)", color: form.direction === val ? "var(--blue)" : "var(--sub)", fontWeight: form.direction === val ? 700 : 400, fontSize: 13, cursor: "pointer" }}>
                        {lbl}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="gov-form-grid gov-form-grid-2">
                  <div>
                    <label className="gov-label">Letter Type *</label>
                    <select className="gov-select" value={form.letterType} onChange={e => setForm(p => ({ ...p, letterType: e.target.value }))}>
                      {Object.entries(TYPE_META).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="gov-label">Priority</label>
                    <select className="gov-select" value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}>
                      <option value="URGENT">Urgent</option>
                      <option value="HIGH">High</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="LOW">Low</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="gov-label">Subject *</label>
                  <input required className="gov-input" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} placeholder="e.g. Recommendation for CMRF assistance to Sri Ramaiah, Manthanani" />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--navy)", borderBottom: "1px solid var(--border)", paddingBottom: 6 }}>FROM</div>
                    <div><label className="gov-label">Name *</label><input required className="gov-input" value={form.fromName} onChange={e => setForm(p => ({ ...p, fromName: e.target.value }))} placeholder="e.g. Minister's Office" /></div>
                    <div><label className="gov-label">Designation</label><input className="gov-input" value={form.fromDesignation} onChange={e => setForm(p => ({ ...p, fromDesignation: e.target.value }))} placeholder="e.g. Hon. Minister" /></div>
                    <div><label className="gov-label">Department</label><input className="gov-input" value={form.fromDepartment} onChange={e => setForm(p => ({ ...p, fromDepartment: e.target.value }))} placeholder="e.g. Minister's Secretariat" /></div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--navy)", borderBottom: "1px solid var(--border)", paddingBottom: 6 }}>TO</div>
                    <div><label className="gov-label">Name *</label><input required className="gov-input" value={form.toName} onChange={e => setForm(p => ({ ...p, toName: e.target.value }))} placeholder="e.g. District Collector" /></div>
                    <div><label className="gov-label">Designation</label><input className="gov-input" value={form.toDesignation} onChange={e => setForm(p => ({ ...p, toDesignation: e.target.value }))} placeholder="e.g. IAS, District Collector" /></div>
                    <div><label className="gov-label">Department / Office</label><input className="gov-input" value={form.toDepartment} onChange={e => setForm(p => ({ ...p, toDepartment: e.target.value }))} placeholder="e.g. Revenue Department, Peddapalli" /></div>
                  </div>
                </div>

                <div className="gov-form-grid gov-form-grid-2">
                  <div><label className="gov-label">Letter Date</label><input type="date" className="gov-input" value={form.letterDate} onChange={e => setForm(p => ({ ...p, letterDate: e.target.value }))} /></div>
                  <div><label className="gov-label">Response Due By</label><input type="date" className="gov-input" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} /></div>
                </div>

                <div>
                  <label className="gov-label">Letter Body / Draft</label>
                  <textarea className="gov-textarea" rows={5} value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} placeholder="Type the full letter content here..." />
                </div>

                {canSeePrivate && (
                  <div>
                    <label className="gov-label" style={{ color: "#b45309" }}><Lock size={12} style={{ display: "inline", marginRight: 4 }} />Private Notes (Minister &amp; PA only)</label>
                    <textarea className="gov-textarea" rows={2} value={form.privateNotes} onChange={e => setForm(p => ({ ...p, privateNotes: e.target.value }))} style={{ background: "#fffbeb", borderColor: "#fde68a" }} placeholder="Confidential context..." />
                  </div>
                )}

                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <button type="button" onClick={() => setActiveNav("all")} className="gov-btn gov-btn-outline">Cancel</button>
                  <button type="submit" disabled={submitting} className="gov-btn gov-btn-primary">
                    <Send size={14} />{submitting ? "Saving..." : "Save as Draft"}
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>

      {/* Letter Detail Drawer */}
      {selected && (
        <>
          <div className="gov-overlay" onClick={() => setSelected(null)} />
          <div className="gov-drawer">
            <div className="gov-drawer-header">
              <div>
                <div className="gov-drawer-title">{selected.subject}</div>
                <div className="gov-drawer-sub" style={{ fontFamily: "monospace", color: "#1e40af" }}>{selected.letterNumber}</div>
              </div>
              <button className="gov-drawer-close" onClick={() => setSelected(null)}><X size={14} /></button>
            </div>
            <div className="gov-drawer-body">

              {/* Badges */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {(() => { const sm = STATUS_META[selected.status] || { label: selected.status, color: "#475569", bg: "#f1f5f9" }; return <Badge label={sm.label} color={sm.color} bg={sm.bg} /> })()}
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--sub)", background: "var(--bg)", padding: "3px 9px", borderRadius: 5 }}>{TYPE_META[selected.letterType] || selected.letterType}</span>
                {selected.direction === "INBOUND"
                  ? <span style={{ fontSize: 11, fontWeight: 700, color: "#7c3aed", background: "#ede9fe", padding: "3px 9px", borderRadius: 5 }}>↙ Inbound</span>
                  : <span style={{ fontSize: 11, fontWeight: 700, color: "#065f46", background: "#d1fae5", padding: "3px 9px", borderRadius: 5 }}>↗ Outbound</span>
                }
              </div>

              {/* Info grid */}
              <div className="gov-info-grid">
                {([
                  ["From",        `${selected.fromName}${selected.fromDesignation ? `, ${selected.fromDesignation}` : ""}`],
                  ["From Dept",   selected.fromDepartment],
                  ["To",          `${selected.toName}${selected.toDesignation ? `, ${selected.toDesignation}` : ""}`],
                  ["To Dept",     selected.toDepartment],
                  ["Letter Date", new Date(selected.letterDate).toLocaleDateString("en-IN")],
                  ["Due By",      selected.dueDate ? new Date(selected.dueDate).toLocaleDateString("en-IN") : null],
                  ["Dispatched",  selected.dispatchedAt ? new Date(selected.dispatchedAt).toLocaleDateString("en-IN") : null],
                  ["Drafted By",  selected.draftedByName],
                  ["Approved By", selected.approvedByName],
                ] as [string, string | null | undefined][]).filter(([, v]) => v).map(([l, v]) => (
                  <div key={l} className="gov-info-box">
                    <div className="gov-info-label">{l}</div>
                    <div className="gov-info-value">{v}</div>
                  </div>
                ))}
              </div>

              {/* Body */}
              {selected.body && (
                <div>
                  <div style={{ fontSize: 11, color: "var(--sub)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 5 }}>Letter Content</div>
                  <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.8, background: "var(--bg)", borderRadius: 8, padding: "12px 16px", whiteSpace: "pre-wrap" }}>{selected.body}</div>
                </div>
              )}

              {/* Private notes */}
              {canSeePrivate && selected.privateNotes && (
                <div className="gov-private-box">
                  <div className="gov-private-label"><Lock size={11} style={{ display: "inline", marginRight: 4 }} />Private Notes</div>
                  <div className="gov-private-text">{selected.privateNotes}</div>
                </div>
              )}

              {/* Timeline */}
              {selected.timeline && selected.timeline.length > 0 && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--navy)", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                    <History size={14} />Timeline ({selected.timeline.length})
                  </div>
                  <div className="gov-timeline">
                    {selected.timeline.map((item, i) => (
                      <div key={item.id || i} className="gov-timeline-item">
                        <div className="gov-timeline-num">{i + 1}</div>
                        <div style={{ flex: 1 }}>
                          <div className="gov-timeline-action">{item.actionTaken}</div>
                          {item.remarks && <div style={{ fontSize: 12, color: "var(--sub)", fontStyle: "italic", marginTop: 2 }}>"{item.remarks}"</div>}
                          <div className="gov-timeline-meta">By {item.performedByName} · {new Date(item.createdAt).toLocaleDateString("en-IN")}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action panel */}
              {canWrite && NEXT_STATUSES[selected.status]?.length > 0 && (
                <div style={{ background: "#f0f7ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)" }}>Update Status</div>
                  <div className="gov-form-grid gov-form-grid-2">
                    <div>
                      <label className="gov-label">New Status</label>
                      <select className="gov-select" value={actionForm.status} onChange={e => setActionForm(p => ({ ...p, status: e.target.value }))}>
                        <option value="">— Select —</option>
                        {NEXT_STATUSES[selected.status].map(s => {
                          const sm = STATUS_META[s] || { label: s }
                          return <option key={s} value={s}>{sm.label}</option>
                        })}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="gov-label">Action Taken *</label>
                    <input className="gov-input" value={actionForm.actionTaken} onChange={e => setActionForm(p => ({ ...p, actionTaken: e.target.value }))} placeholder="e.g. Sent via speed post, tracking no. SP123456" />
                  </div>
                  <div>
                    <label className="gov-label">Remarks</label>
                    <input className="gov-input" value={actionForm.remarks} onChange={e => setActionForm(p => ({ ...p, remarks: e.target.value }))} placeholder="Any additional notes..." />
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button disabled={submitting || !actionForm.status || !actionForm.actionTaken} onClick={() => handleAction(selected.id)} className="gov-btn gov-btn-primary gov-btn-sm">
                      <Send size={13} />{submitting ? "Saving..." : "Save Update"}
                    </button>
                  </div>
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
