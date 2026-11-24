"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { LayoutDashboard, FileText, Building2, Settings, RefreshCw, Bell, ChevronDown, Plus, Search, X, Send, AlertTriangle, CheckCircle2, Clock, Users } from "lucide-react"
import { GovSidebar, type NavItem } from "@/components/GovSidebar"

interface Grievance { id: string; trackingId: string; title: string; category: string; status: string; priority: string; citizenName: string; citizenPhone: string; location: string; description: string; createdAt: string }
interface Work { id: string; workCode: string; title: string; stage: string; category: string; mandalName?: string; villageName?: string; estimatedBudget?: number; sanctionedBudget?: number }

const NAV: NavItem[] = [
  { key: "overview",   label: "Overview",     Icon: LayoutDashboard },
  { key: "grievances", label: "Grievances",   Icon: FileText },
  { key: "works",      label: "Public Works", Icon: Building2 },
  { key: "visitors",   label: "Visitors",     Icon: Users },
  { key: "settings",   label: "Settings",     Icon: Settings },
]

const STATUS_COLOR: Record<string, { color: string; bg: string }> = {
  PENDING:     { color: "#92400e", bg: "#fef3c7" },
  OPEN:        { color: "#92400e", bg: "#fef3c7" },
  IN_PROGRESS: { color: "#1e40af", bg: "#dbeafe" },
  RESOLVED:    { color: "#065f46", bg: "#d1fae5" },
  CLOSED:      { color: "#065f46", bg: "#d1fae5" },
  REJECTED:    { color: "#991b1b", bg: "#fee2e2" },
}
const STAGE_COLOR: Record<string, { color: string; bg: string }> = {
  PLANNED:       { color: "#64748b", bg: "#f1f5f9" },
  IN_PROGRESS:   { color: "#1d4ed8", bg: "#dbeafe" },
  COMPLETED:     { color: "#065f46", bg: "#d1fae5" },
  STUCK_DELAYED: { color: "#991b1b", bg: "#fee2e2" },
  SANCTIONED:    { color: "#5b21b6", bg: "#ede9fe" },
}

function Badge({ label, color, bg }: { label: string; color: string; bg: string }) {
  return <span className="gov-badge" style={{ color, background: bg }}>{label}</span>
}

export default function BackOfficerDashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const name = (session?.user as any)?.name || "Back Officer"
  const initials = name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()

  const [activeNav, setActiveNav]   = useState("overview")
  const [grievances, setGrievances] = useState<Grievance[]>([])
  const [works, setWorks]           = useState<Work[]>([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState("")
  const [showAdd, setShowAdd]       = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [newForm, setNewForm] = useState({ title: "", category: "INFRASTRUCTURE", requesterName: "", requesterPhone: "", village: "", description: "", priority: "MEDIUM" })

  const stats = {
    total:    grievances.length,
    pending:  grievances.filter(g => g.status === "PENDING" || g.status === "OPEN").length,
    resolved: grievances.filter(g => g.status === "RESOLVED" || g.status === "CLOSED").length,
    works:    works.length,
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const [gRes, wRes] = await Promise.all([fetch("/api/grievances", { credentials: "include" }), fetch("/api/minister/projects", { credentials: "include" })])
      if (gRes.ok) {
        const d = await gRes.json()
        setGrievances((d.grievances || []).map((g: any) => ({ id: g.id, trackingId: g.referenceNumber || g.id.slice(0,8).toUpperCase(), title: g.title || "Untitled", category: g.category?.name || g.grievanceCategory || "General", status: g.status || "PENDING", priority: g.priority || "MEDIUM", citizenName: g.requesterName || "Unknown", citizenPhone: g.requesterPhone || "", location: g.village || g.mandal || "", description: g.description || "", createdAt: g.createdAt })))
      }
      if (wRes.ok) {
        const d = await wRes.json()
        setWorks((d.works || []).map((w: any) => ({ id: w.id, workCode: w.workCode, title: w.title, stage: w.stage, category: w.category, mandalName: w.mandalName, villageName: w.villageName, estimatedBudget: w.estimatedBudget, sanctionedBudget: w.sanctionedBudget })))
      }
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true)
    try {
      const res = await fetch("/api/grievances", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: newForm.title, description: newForm.description, requesterName: newForm.requesterName, requesterPhone: newForm.requesterPhone, village: newForm.village, grievanceCategory: newForm.category, priority: newForm.priority }) })
      const d = await res.json()
      if (res.ok && (d.success || d.id || d.grievance)) { setShowAdd(false); setNewForm({ title: "", category: "INFRASTRUCTURE", requesterName: "", requesterPhone: "", village: "", description: "", priority: "MEDIUM" }); fetchData() }
    } finally { setSubmitting(false) }
  }

  const filtered = grievances.filter(g => !search || g.title.toLowerCase().includes(search.toLowerCase()) || g.citizenName.toLowerCase().includes(search.toLowerCase()) || g.trackingId.toLowerCase().includes(search.toLowerCase()))
  const now = new Date()
  const todayStr = now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })

  return (
    <div className="gov-app">
      <GovSidebar items={NAV} active={activeNav} onNav={(key) => {
        if (key === "visitors") { router.push("/visitors/dashboard"); return }
        setActiveNav(key)
      }} role="BACK_OFFICER" userName={name} />

      <div className="gov-main">
        <header className="gov-header">
          <div>
            <div className="gov-header-title">Back Officer Dashboard</div>
            <div className="gov-header-sub">Data Entry &amp; Management · {todayStr}</div>
          </div>
          <div className="gov-header-actions">
            <button onClick={fetchData} className="gov-header-btn"><RefreshCw size={15} className={loading ? "animate-spin" : ""} /></button>
            <button className="gov-header-btn"><Bell size={15} /></button>
            <div className="gov-header-profile">
              <div className="gov-avatar">{initials}</div>
              <div><div className="gov-avatar-name">{name}</div><div className="gov-avatar-role">Back Officer</div></div>
              <ChevronDown size={13} color="var(--sub)" />
            </div>
          </div>
        </header>

        <div className="gov-body">
          {/* KPI */}
          <div className="gov-kpi-grid">
            {[
              { label: "Total Grievances",  value: stats.total,    accent: "#2F6FED", Icon: FileText },
              { label: "Pending",           value: stats.pending,  accent: "#F59E0B", Icon: Clock },
              { label: "Resolved",          value: stats.resolved, accent: "#16A34A", Icon: CheckCircle2 },
              { label: "Public Works",      value: stats.works,    accent: "#7c3aed", Icon: Building2 },
            ].map(({ label, value, accent, Icon: Ic }) => (
              <div key={label} className="gov-kpi">
                <div className="gov-kpi-top"><div className="gov-kpi-icon" style={{ background: `${accent}18` }}><Ic size={17} color={accent} /></div></div>
                <div className="gov-kpi-value">{loading ? <div className="gov-skel gov-kpi-skel" /> : value}</div>
                <div className="gov-kpi-label">{label}</div>
              </div>
            ))}
          </div>

          {/* Overview */}
          {activeNav === "overview" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div className="gov-card gov-card-p">
                <div className="gov-card-header">
                  <div className="gov-card-title"><div className="gov-card-icon" style={{ background: "#eff6ff" }}><FileText size={14} color="#2F6FED" /></div>Recent Grievances</div>
                  <button className="gov-card-action" onClick={() => setActiveNav("grievances")}>View all <ChevronDown size={12} /></button>
                </div>
                {grievances.slice(0,5).map(g => {
                  const sc = STATUS_COLOR[g.status] || { color: "#475569", bg: "#f1f5f9" }
                  return (
                    <div key={g.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid var(--border)" }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--navy)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.title}</div>
                        <div style={{ fontSize: 11, color: "var(--sub)" }}>{g.citizenName} · {g.category}</div>
                      </div>
                      <Badge label={g.status} color={sc.color} bg={sc.bg} />
                    </div>
                  )
                })}
                {grievances.length === 0 && !loading && <div className="gov-empty">No grievances found</div>}
              </div>
              <div className="gov-card gov-card-p">
                <div className="gov-card-header">
                  <div className="gov-card-title"><div className="gov-card-icon" style={{ background: "#f5f3ff" }}><Building2 size={14} color="#7c3aed" /></div>Public Works</div>
                  <button className="gov-card-action" onClick={() => setActiveNav("works")}>View all <ChevronDown size={12} /></button>
                </div>
                {works.slice(0,5).map(w => {
                  const sc = STAGE_COLOR[w.stage] || { color: "#475569", bg: "#f1f5f9" }
                  return (
                    <div key={w.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid var(--border)" }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--navy)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{w.title}</div>
                        <div style={{ fontSize: 11, color: "var(--sub)" }}>{w.workCode} · {w.mandalName || w.villageName || ""}</div>
                      </div>
                      <Badge label={w.stage.replace(/_/g," ")} color={sc.color} bg={sc.bg} />
                    </div>
                  )
                })}
                {works.length === 0 && !loading && <div className="gov-empty">No works found</div>}
              </div>
            </div>
          )}

          {/* Grievances */}
          {activeNav === "grievances" && (
            <div className="gov-card gov-card-p">
              <div className="gov-card-header">
                <div className="gov-card-title"><div className="gov-card-icon" style={{ background: "#eff6ff" }}><FileText size={14} color="#2F6FED" /></div>Grievances <span style={{ fontSize: 12, color: "var(--sub)", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 5, padding: "1px 8px" }}>{filtered.length}</span></div>
                <div style={{ display: "flex", gap: 8 }}>
                  <div className="gov-search" style={{ width: 220 }}>
                    <Search size={14} color="var(--sub)" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." />
                    {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", color: "var(--sub)", padding: 0 }}><X size={13} /></button>}
                  </div>
                  <button onClick={() => setShowAdd(true)} className="gov-btn gov-btn-primary gov-btn-sm"><Plus size={13} />Add Grievance</button>
                </div>
              </div>
              {loading ? <div className="gov-empty">Loading...</div> : filtered.length === 0 ? <div className="gov-empty">No grievances found</div> : (
                <div style={{ overflowX: "auto" }}>
                  <table className="gov-table">
                    <thead><tr>{["Tracking ID","Title","Citizen","Category","Priority","Status","Date"].map(h => <th key={h}>{h}</th>)}</tr></thead>
                    <tbody>
                      {filtered.map(g => {
                        const sc = STATUS_COLOR[g.status] || { color: "#475569", bg: "#f1f5f9" }
                        return (
                          <tr key={g.id}>
                            <td style={{ fontFamily: "monospace", fontWeight: 700, color: "#1e40af" }}>{g.trackingId}</td>
                            <td style={{ fontWeight: 600, maxWidth: 200 }}><div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.title}</div></td>
                            <td>{g.citizenName}</td>
                            <td style={{ color: "var(--sub)" }}>{g.category}</td>
                            <td><Badge label={g.priority} color={g.priority === "HIGH" || g.priority === "URGENT" ? "var(--crit)" : "var(--sub)"} bg={g.priority === "HIGH" || g.priority === "URGENT" ? "#fef2f2" : "var(--bg)"} /></td>
                            <td><Badge label={g.status} color={sc.color} bg={sc.bg} /></td>
                            <td style={{ color: "var(--sub)", fontSize: 12 }}>{new Date(g.createdAt).toLocaleDateString("en-IN")}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Works */}
          {activeNav === "works" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {loading ? <div className="gov-empty">Loading...</div> : works.length === 0 ? <div className="gov-card gov-card-p gov-empty">No public works found</div> : works.map(w => {
                const sc = STAGE_COLOR[w.stage] || { color: "#475569", bg: "#f1f5f9" }
                const budget = w.sanctionedBudget || w.estimatedBudget
                return (
                  <div key={w.id} className="gov-card gov-card-p" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 700, color: "#1e40af" }}>{w.workCode}</span>
                        <Badge label={w.stage.replace(/_/g," ")} color={sc.color} bg={sc.bg} />
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--navy)" }}>{w.title}</div>
                      <div style={{ fontSize: 12, color: "var(--sub)", marginTop: 2 }}>{w.category} · {[w.mandalName, w.villageName].filter(Boolean).join(", ")}</div>
                    </div>
                    {budget && <div style={{ textAlign: "right", flexShrink: 0 }}><div style={{ fontSize: 15, fontWeight: 800, color: "var(--navy)" }}>₹{(budget/100000).toFixed(1)}L</div><div style={{ fontSize: 11, color: "var(--sub)" }}>{w.sanctionedBudget ? "sanctioned" : "estimated"}</div></div>}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add Grievance Modal */}
      {showAdd && (
        <div className="gov-modal-wrap" onClick={e => { if (e.target === e.currentTarget) setShowAdd(false) }}>
          <div className="gov-modal">
            <div className="gov-modal-header">
              <div className="gov-modal-title">Log New Grievance</div>
              <button className="gov-drawer-close" onClick={() => setShowAdd(false)}><X size={14} /></button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="gov-modal-body">
                <div className="gov-form-grid gov-form-grid-2">
                  <div style={{ gridColumn: "1/-1" }}><label className="gov-label">Title *</label><input required className="gov-input" value={newForm.title} onChange={e => setNewForm(p => ({ ...p, title: e.target.value }))} placeholder="Brief subject of grievance" /></div>
                  <div><label className="gov-label">Citizen Name *</label><input required className="gov-input" value={newForm.requesterName} onChange={e => setNewForm(p => ({ ...p, requesterName: e.target.value }))} placeholder="Full name" /></div>
                  <div><label className="gov-label">Phone</label><input className="gov-input" value={newForm.requesterPhone} onChange={e => setNewForm(p => ({ ...p, requesterPhone: e.target.value }))} placeholder="+91-XXXXXXXXXX" /></div>
                  <div><label className="gov-label">Category</label><select className="gov-select" value={newForm.category} onChange={e => setNewForm(p => ({ ...p, category: e.target.value }))}>{["INFRASTRUCTURE","HEALTH","EDUCATION","AGRICULTURE","SOCIAL_WELFARE","PUBLIC_SERVICES","OTHER"].map(c => <option key={c} value={c}>{c.replace(/_/g," ")}</option>)}</select></div>
                  <div><label className="gov-label">Priority</label><select className="gov-select" value={newForm.priority} onChange={e => setNewForm(p => ({ ...p, priority: e.target.value }))}>{["LOW","MEDIUM","HIGH","URGENT"].map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                  <div style={{ gridColumn: "1/-1" }}><label className="gov-label">Village / Location</label><input className="gov-input" value={newForm.village} onChange={e => setNewForm(p => ({ ...p, village: e.target.value }))} placeholder="Village name" /></div>
                  <div style={{ gridColumn: "1/-1" }}><label className="gov-label">Description</label><textarea rows={3} className="gov-textarea" value={newForm.description} onChange={e => setNewForm(p => ({ ...p, description: e.target.value }))} placeholder="Describe the grievance..." /></div>
                </div>
              </div>
              <div className="gov-modal-footer">
                <button type="button" onClick={() => setShowAdd(false)} className="gov-btn gov-btn-outline">Cancel</button>
                <button type="submit" disabled={submitting} className="gov-btn gov-btn-primary"><Send size={13} />{submitting ? "Saving..." : "Submit Grievance"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
