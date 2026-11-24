"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import {
  LayoutDashboard, FileText, Calendar, Settings, Bell, RefreshCw,
  ChevronDown, AlertTriangle, CheckCircle2, Clock, Plus, Search,
  X, Send, Lock, HeartPulse, ArrowRightLeft, Briefcase, Layers,
  ChevronRight, History, Sparkles, Phone, MapPin, User, Building, Users, Mail,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { GovSidebar, type NavItem } from "@/components/GovSidebar"

interface Petition {
  id: string; trackingNumber: string; type: string; title: string
  description: string; priority: string; status: string
  applicantName: string; applicantPhone: string
  mandalName?: string; villageName?: string
  referredByLeaderName?: string; handlingPaName?: string
  assignedDepartment?: string; privateNotes?: string
  hospitalName?: string; medicalCondition?: string
  requestedAmount?: number; sanctionedAmount?: number
  currentPosting?: string; requestedPosting?: string
  isOverdue?: boolean; daysPassed?: number; createdAt: string
  referredByLeader?: { id: string; name: string; phone: string; designation: string }
  timeline?: Array<{ id: string; actionTaken: string; remarks?: string; toStatus: string; performedByName: string; performedByRole: string; isPrivateNote: boolean; createdAt: string }>
}
interface Metadata {
  leaders: Array<{ id: string; name: string; designation: string; mandalName: string; villageName: string }>
  mandals: Array<{ id: string; name: string }>
  departments: string[]
}

const NAV: NavItem[] = [
  { key: "petitions",  label: "All Petitions",  Icon: FileText },
  { key: "new",        label: "New Petition",    Icon: Plus },
  { key: "visitors",   label: "Visitors",        Icon: Users },
  { key: "letters",    label: "Letters",         Icon: Mail },
  { key: "calendar",   label: "Calendar",        Icon: Calendar },
  { key: "settings",   label: "Settings",        Icon: Settings },
]

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:              { label: "Pending",       color: "#92400e", bg: "#fef3c7" },
  SUBMITTED_TO_PA:      { label: "With PA",       color: "#1e40af", bg: "#dbeafe" },
  ASSIGNED_TO_OFFICIAL: { label: "With Official", color: "#5b21b6", bg: "#ede9fe" },
  UNDER_REVIEW:         { label: "Under Review",  color: "#6b21a8", bg: "#fae8ff" },
  SANCTIONED:           { label: "Sanctioned",    color: "#065f46", bg: "#d1fae5" },
  RESOLVED:             { label: "Resolved",      color: "#065f46", bg: "#d1fae5" },
  REJECTED:             { label: "Rejected",      color: "#991b1b", bg: "#fee2e2" },
}

function Badge({ label, color, bg }: { label: string; color: string; bg: string }) {
  return <span className="gov-badge" style={{ color, background: bg }}>{label}</span>
}

export default function PADashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const paName = (session?.user as any)?.name || "PA"
  const initials = paName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()

  const [activeNav, setActiveNav]     = useState("petitions")
  const [petitions, setPetitions]     = useState<Petition[]>([])
  const [metadata, setMetadata]       = useState<Metadata | null>(null)
  const [loading, setLoading]         = useState(true)
  const [summary, setSummary]         = useState({ total: 0, overdueCount: 0, cmrfCount: 0, transferCount: 0, jobCount: 0, resolvedCount: 0 })
  const [search, setSearch]           = useState("")
  const [selectedType, setSelectedType]     = useState("ALL")
  const [selectedStatus, setSelectedStatus] = useState("ALL")
  const [overdueOnly, setOverdueOnly]       = useState(false)
  const [activePetition, setActivePetition] = useState<Petition | null>(null)
  const [submitting, setSubmitting]         = useState(false)
  const [actionForm, setActionForm] = useState({ newStatus: "", actionTaken: "", remarks: "", sanctionedAmount: "", privateNotes: "", isPrivate: false })
  const [newForm, setNewForm] = useState({
    type: "CMRF_MEDICAL", title: "", description: "", priority: "HIGH",
    applicantName: "", applicantPhone: "", mandalName: "Manthanani", villageName: "",
    referredByLeaderId: "", assignedDepartment: "Health & Medical Services (DMHO)",
    privateNotes: "", hospitalName: "", medicalCondition: "", requestedAmount: "",
    currentPosting: "", requestedPosting: "", daysAllowed: "7",
  })

  const fetchPetitions = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedType !== "ALL") params.append("type", selectedType)
      if (selectedStatus !== "ALL") params.append("status", selectedStatus)
      if (overdueOnly) params.append("overdue", "true")
      if (search.trim()) params.append("search", search.trim())
      const res = await fetch(`/api/pa/petitions?${params}`, { credentials: "include" })
      const d = await res.json()
      if (d.success) { setPetitions(d.petitions); setSummary(d.summary) }
    } finally { setLoading(false) }
  }, [selectedType, selectedStatus, overdueOnly, search])

  useEffect(() => { fetch("/api/pa/metadata", { credentials: "include" }).then(r => r.json()).then(d => { if (d.success) setMetadata(d) }) }, [])
  useEffect(() => { const t = setTimeout(fetchPetitions, 250); return () => clearTimeout(t) }, [fetchPetitions])

  const openPetition = (p: Petition) => {
    setActivePetition(p)
    setActionForm({ newStatus: p.status, actionTaken: "", remarks: "", sanctionedAmount: p.sanctionedAmount ? String(p.sanctionedAmount) : "", privateNotes: p.privateNotes || "", isPrivate: false })
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activePetition) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/pa/petitions/${activePetition.id}`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: actionForm.newStatus, actionTaken: actionForm.actionTaken || `Status updated to ${actionForm.newStatus}`, actionRemarks: actionForm.remarks, sanctionedAmount: actionForm.sanctionedAmount || undefined, privateNotes: actionForm.privateNotes, performedByName: paName, performedByRole: "PA", isPrivateNote: actionForm.isPrivate }),
      })
      const d = await res.json()
      if (d.success) { setActivePetition(d.petition); fetchPetitions(); setActionForm(p => ({ ...p, actionTaken: "", remarks: "" })) }
    } finally { setSubmitting(false) }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const leader = metadata?.leaders.find(l => l.id === newForm.referredByLeaderId)
      const res = await fetch("/api/pa/petitions", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newForm, referredByLeaderName: leader?.name }),
      })
      const d = await res.json()
      if (d.success) {
        setActiveNav("petitions")
        setNewForm({ type: "CMRF_MEDICAL", title: "", description: "", priority: "HIGH", applicantName: "", applicantPhone: "", mandalName: "Manthanani", villageName: "", referredByLeaderId: "", assignedDepartment: "Health & Medical Services (DMHO)", privateNotes: "", hospitalName: "", medicalCondition: "", requestedAmount: "", currentPosting: "", requestedPosting: "", daysAllowed: "7" })
        fetchPetitions()
      }
    } finally { setSubmitting(false) }
  }

  const now = new Date()
  const todayStr = now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })

  return (
    <div className="gov-app">
      <GovSidebar items={NAV} active={activeNav} onNav={(key) => {
        if (key === "visitors") { router.push("/visitors/dashboard"); return }
        if (key === "letters")  { router.push("/letters/dashboard");  return }
        setActiveNav(key)
      }} role="PA" userName={paName} />

      <div className="gov-main">
        {/* Header */}
        <header className="gov-header">
          <div>
            <div className="gov-header-title">PA Command Center</div>
            <div className="gov-header-sub">Personal Assistant · {paName} · {todayStr}</div>
          </div>
          <div className="gov-header-actions">
            <button onClick={fetchPetitions} className="gov-header-btn"><RefreshCw size={15} /></button>
            <div className="gov-notif-wrap">
              <button className="gov-header-btn"><Bell size={15} /></button>
              {summary.overdueCount > 0 && <span className="gov-notif-dot">{summary.overdueCount}</span>}
            </div>
            <div className="gov-header-profile">
              <div className="gov-avatar">{initials}</div>
              <div><div className="gov-avatar-name">{paName}</div><div className="gov-avatar-role">PA Office</div></div>
              <ChevronDown size={13} color="var(--sub)" />
            </div>
          </div>
        </header>

        <div className="gov-body">

          {/* KPI Row */}
          <div className="gov-kpi-grid">
            {[
              { label: "Total Petitions",  value: summary.total,         accent: "#2F6FED", Icon: FileText },
              { label: "Overdue",          value: summary.overdueCount,  accent: "#DC2626", Icon: AlertTriangle },
              { label: "CMRF / Medical",   value: summary.cmrfCount,     accent: "#e11d48", Icon: HeartPulse },
              { label: "Sanctioned",       value: summary.resolvedCount, accent: "#16A34A", Icon: CheckCircle2 },
            ].map(({ label, value, accent, Icon: Ic }) => (
              <div key={label} className="gov-kpi">
                <div className="gov-kpi-top">
                  <div className="gov-kpi-icon" style={{ background: `${accent}18` }}><Ic size={17} color={accent} /></div>
                </div>
                <div className="gov-kpi-value">{loading ? <div className="gov-skel gov-kpi-skel" /> : value}</div>
                <div className="gov-kpi-label">{label}</div>
              </div>
            ))}
          </div>

          {/* Petitions View */}
          {activeNav === "petitions" && (
            <div className="gov-card gov-card-p">
              <div className="gov-card-header">
                <div className="gov-card-title">
                  <div className="gov-card-icon" style={{ background: "#eff6ff" }}><FileText size={15} color="#2F6FED" /></div>
                  Petitions
                  <span style={{ fontSize: 12, color: "var(--sub)", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 5, padding: "1px 8px" }}>{petitions.length}</span>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div className="gov-search" style={{ width: 240 }}>
                    <Search size={14} color="var(--sub)" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search citizen, phone, tracking..." />
                    {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", color: "var(--sub)", padding: 0 }}><X size={13} /></button>}
                  </div>
                  <select className="gov-select" style={{ width: "auto" }} value={selectedType} onChange={e => setSelectedType(e.target.value)}>
                    <option value="ALL">All Types</option>
                    <option value="CMRF_MEDICAL">CMRF Medical</option>
                    <option value="EMPLOYEE_TRANSFER">Transfer</option>
                    <option value="JOB_EMPLOYMENT">Job</option>
                    <option value="PERSONAL_GRIEVANCE">Grievance</option>
                  </select>
                  <select className="gov-select" style={{ width: "auto" }} value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
                    <option value="ALL">All Statuses</option>
                    <option value="SUBMITTED_TO_PA">With PA</option>
                    <option value="ASSIGNED_TO_OFFICIAL">With Official</option>
                    <option value="UNDER_REVIEW">Under Review</option>
                    <option value="SANCTIONED">Sanctioned</option>
                  </select>
                  <button onClick={() => setOverdueOnly(!overdueOnly)} className="gov-btn gov-btn-sm" style={{ background: overdueOnly ? "#fef2f2" : "var(--bg)", color: overdueOnly ? "var(--crit)" : "var(--sub)", border: `1px solid ${overdueOnly ? "#fecaca" : "var(--border)"}` }}>
                    <AlertTriangle size={13} /> Overdue
                  </button>
                  <button onClick={() => setActiveNav("new")} className="gov-btn gov-btn-primary gov-btn-sm">
                    <Plus size={13} /> New Petition
                  </button>
                </div>
              </div>

              {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[1,2,3,4].map(i => <div key={i} className="gov-skel" style={{ height: 48, borderRadius: 8 }} />)}
                </div>
              ) : petitions.length === 0 ? (
                <div className="gov-empty">No petitions found. Try adjusting filters.</div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table className="gov-table">
                    <thead>
                      <tr>
                        {["Tracking & Type","Citizen","Location","Referred By","Department","Status",""].map(h => <th key={h}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {petitions.map(p => {
                        const sm = STATUS_META[p.status] || { label: p.status, color: "#475569", bg: "#f1f5f9" }
                        return (
                          <tr key={p.id} onClick={() => openPetition(p)} className={p.isOverdue ? "gov-table-overdue" : ""}>
                            <td>
                              <div style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 700, color: "#1e40af", background: "#eff6ff", padding: "2px 7px", borderRadius: 4, display: "inline-block", marginBottom: 3 }}>{p.trackingNumber}</div>
                              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--navy)" }}>{p.title}</div>
                              {p.isOverdue && <span style={{ fontSize: 10, fontWeight: 800, color: "var(--crit)" }}>OVERDUE</span>}
                            </td>
                            <td>
                              <div style={{ fontWeight: 600 }}>{p.applicantName}</div>
                              <div style={{ fontSize: 11, color: "var(--sub)", display: "flex", alignItems: "center", gap: 3 }}><Phone size={10} />{p.applicantPhone}</div>
                            </td>
                            <td style={{ fontSize: 12 }}>{p.villageName || "—"}<br /><span style={{ color: "var(--sub)", fontSize: 11 }}>{p.mandalName}</span></td>
                            <td style={{ fontSize: 12 }}>{p.referredByLeaderName ? <span style={{ background: "#eff6ff", color: "#1e40af", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600 }}>{p.referredByLeaderName}</span> : <span style={{ color: "var(--sub)", fontSize: 11, fontStyle: "italic" }}>Direct</span>}</td>
                            <td style={{ fontSize: 12 }}>{p.assignedDepartment || "—"}</td>
                            <td><Badge label={sm.label} color={sm.color} bg={sm.bg} /></td>
                            <td><button onClick={e => { e.stopPropagation(); openPetition(p) }} className="gov-btn gov-btn-outline gov-btn-sm">Manage <ChevronRight size={12} /></button></td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* New Petition Form */}
          {activeNav === "new" && (
            <div className="gov-card gov-card-p" style={{ maxWidth: 760 }}>
              <div className="gov-card-header">
                <div className="gov-card-title"><div className="gov-card-icon" style={{ background: "#eff6ff" }}><Plus size={15} color="#2F6FED" /></div>Log New Petition</div>
              </div>
              <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {/* Type */}
                <div>
                  <label className="gov-label">Petition Category *</label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
                    {[{ id: "CMRF_MEDICAL", label: "CMRF / Medical", Icon: HeartPulse }, { id: "EMPLOYEE_TRANSFER", label: "Govt Transfer", Icon: ArrowRightLeft }, { id: "JOB_EMPLOYMENT", label: "Job Request", Icon: Briefcase }, { id: "PERSONAL_GRIEVANCE", label: "Land / Grievance", Icon: FileText }].map(cat => (
                      <button type="button" key={cat.id} onClick={() => setNewForm(p => ({ ...p, type: cat.id }))}
                        style={{ padding: "10px 8px", borderRadius: 9, border: `1px solid ${newForm.type === cat.id ? "var(--blue)" : "var(--border)"}`, background: newForm.type === cat.id ? "#eff6ff" : "var(--bg)", color: newForm.type === cat.id ? "var(--blue)" : "var(--sub)", fontWeight: newForm.type === cat.id ? 700 : 400, fontSize: 12, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                        <cat.Icon size={14} />{cat.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="gov-form-grid gov-form-grid-2">
                  <div><label className="gov-label">Title *</label><input required className="gov-input" value={newForm.title} onChange={e => setNewForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Heart surgery assistance at NIMS" /></div>
                  <div><label className="gov-label">Priority</label><select className="gov-select" value={newForm.priority} onChange={e => setNewForm(p => ({ ...p, priority: e.target.value }))}><option value="URGENT">Urgent</option><option value="HIGH">High</option><option value="MEDIUM">Medium</option><option value="LOW">Low</option></select></div>
                  <div><label className="gov-label">Applicant Name *</label><input required className="gov-input" value={newForm.applicantName} onChange={e => setNewForm(p => ({ ...p, applicantName: e.target.value }))} placeholder="Full name" /></div>
                  <div><label className="gov-label">Phone *</label><input required className="gov-input" value={newForm.applicantPhone} onChange={e => setNewForm(p => ({ ...p, applicantPhone: e.target.value }))} placeholder="+91-XXXXXXXXXX" /></div>
                  <div><label className="gov-label">Mandal</label><select className="gov-select" value={newForm.mandalName} onChange={e => setNewForm(p => ({ ...p, mandalName: e.target.value }))}>{metadata?.mandals.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}</select></div>
                  <div><label className="gov-label">Village</label><input className="gov-input" value={newForm.villageName} onChange={e => setNewForm(p => ({ ...p, villageName: e.target.value }))} placeholder="Village name" /></div>
                  <div><label className="gov-label">Referred by Leader</label><select className="gov-select" value={newForm.referredByLeaderId} onChange={e => setNewForm(p => ({ ...p, referredByLeaderId: e.target.value }))}><option value="">Direct Citizen</option>{metadata?.leaders.map(l => <option key={l.id} value={l.id}>{l.name} ({l.designation})</option>)}</select></div>
                  <div><label className="gov-label">Department</label><select className="gov-select" value={newForm.assignedDepartment} onChange={e => setNewForm(p => ({ ...p, assignedDepartment: e.target.value }))}>{metadata?.departments.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
                </div>
                <div><label className="gov-label">Description</label><textarea className="gov-textarea" rows={3} value={newForm.description} onChange={e => setNewForm(p => ({ ...p, description: e.target.value }))} placeholder="Describe the citizen's request..." /></div>
                {newForm.type === "CMRF_MEDICAL" && (
                  <div className="gov-form-grid gov-form-grid-2">
                    <div><label className="gov-label">Hospital</label><input className="gov-input" value={newForm.hospitalName} onChange={e => setNewForm(p => ({ ...p, hospitalName: e.target.value }))} placeholder="e.g. NIMS Hyderabad" /></div>
                    <div><label className="gov-label">Medical Condition</label><input className="gov-input" value={newForm.medicalCondition} onChange={e => setNewForm(p => ({ ...p, medicalCondition: e.target.value }))} placeholder="e.g. Cardiac Surgery" /></div>
                    <div><label className="gov-label">Requested Amount (₹)</label><input type="number" className="gov-input" value={newForm.requestedAmount} onChange={e => setNewForm(p => ({ ...p, requestedAmount: e.target.value }))} placeholder="200000" /></div>
                  </div>
                )}
                <div>
                  <label className="gov-label" style={{ color: "#b45309" }}><Lock size={12} style={{ display: "inline", marginRight: 4 }} />Private Notes (Minister &amp; PA only)</label>
                  <textarea className="gov-textarea" rows={2} value={newForm.privateNotes} onChange={e => setNewForm(p => ({ ...p, privateNotes: e.target.value }))} placeholder="Confidential notes..." style={{ background: "#fffbeb", borderColor: "#fde68a" }} />
                </div>
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <button type="button" onClick={() => setActiveNav("petitions")} className="gov-btn gov-btn-outline">Cancel</button>
                  <button type="submit" disabled={submitting} className="gov-btn gov-btn-primary"><Send size={14} />{submitting ? "Submitting..." : "Submit Petition"}</button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>

      {/* Petition Detail Drawer */}
      {activePetition && (
        <>
          <div className="gov-overlay" onClick={() => setActivePetition(null)} />
          <div className="gov-drawer">
            <div className="gov-drawer-header">
              <div>
                <div className="gov-drawer-title">{activePetition.applicantName}</div>
                <div className="gov-drawer-sub">{activePetition.trackingNumber}</div>
              </div>
              <button className="gov-drawer-close" onClick={() => setActivePetition(null)}><X size={14} /></button>
            </div>
            <div className="gov-drawer-body">
              {(() => { const sm = STATUS_META[activePetition.status] || { label: activePetition.status, color: "#475569", bg: "#f1f5f9" }; return <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}><Badge label={sm.label} color={sm.color} bg={sm.bg} />{activePetition.isOverdue && <Badge label="OVERDUE" color="var(--crit)" bg="#fef2f2" />}</div> })()}
              <div className="gov-info-grid">
                {([["Phone", activePetition.applicantPhone], ["Mandal", activePetition.mandalName], ["Village", activePetition.villageName], ["Referred by", activePetition.referredByLeaderName], ["Department", activePetition.assignedDepartment], ["Handling PA", activePetition.handlingPaName], ["Submitted", new Date(activePetition.createdAt).toLocaleDateString("en-IN")]] as [string, string|undefined][]).filter(([,v]) => v).map(([l, v]) => (
                  <div key={l} className="gov-info-box"><div className="gov-info-label">{l}</div><div className="gov-info-value">{v}</div></div>
                ))}
              </div>
              {activePetition.description && <div><div style={{ fontSize: 11, color: "var(--sub)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 5 }}>Description</div><div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.7 }}>{activePetition.description}</div></div>}
              {activePetition.privateNotes && <div className="gov-private-box"><div className="gov-private-label"><Lock size={11} style={{ display: "inline", marginRight: 4 }} />Private Notes</div><div className="gov-private-text">{activePetition.privateNotes}</div></div>}

              {/* Timeline */}
              {activePetition.timeline && activePetition.timeline.length > 0 && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--navy)", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}><History size={14} />Timeline ({activePetition.timeline.length})</div>
                  <div className="gov-timeline">
                    {activePetition.timeline.map((item, i) => (
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

              {/* Update form */}
              <form onSubmit={handleUpdate} style={{ background: "#f0f7ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)", display: "flex", alignItems: "center", gap: 6 }}><Sparkles size={14} />Update File</div>
                <div className="gov-form-grid gov-form-grid-2">
                  <div><label className="gov-label">New Status</label><select className="gov-select" value={actionForm.newStatus} onChange={e => setActionForm(p => ({ ...p, newStatus: e.target.value }))}><option value="SUBMITTED_TO_PA">With PA</option><option value="ASSIGNED_TO_OFFICIAL">With Official</option><option value="UNDER_REVIEW">Under Review</option><option value="SANCTIONED">Sanctioned</option><option value="RESOLVED">Resolved</option><option value="REJECTED">Rejected</option></select></div>
                  {activePetition.type === "CMRF_MEDICAL" && <div><label className="gov-label">Sanctioned Amount (₹)</label><input type="number" className="gov-input" value={actionForm.sanctionedAmount} onChange={e => setActionForm(p => ({ ...p, sanctionedAmount: e.target.value }))} placeholder="150000" /></div>}
                </div>
                <div><label className="gov-label">Action Taken *</label><input required className="gov-input" value={actionForm.actionTaken} onChange={e => setActionForm(p => ({ ...p, actionTaken: e.target.value }))} placeholder="e.g. Spoke to MRO, instructed to complete by Friday" /></div>
                <div><label className="gov-label">Remarks</label><input className="gov-input" value={actionForm.remarks} onChange={e => setActionForm(p => ({ ...p, remarks: e.target.value }))} placeholder="Follow-up notes..." /></div>
                <div><label className="gov-label" style={{ color: "#b45309" }}>Update Private Notes</label><textarea className="gov-textarea" rows={2} value={actionForm.privateNotes} onChange={e => setActionForm(p => ({ ...p, privateNotes: e.target.value }))} style={{ background: "#fffbeb", borderColor: "#fde68a" }} /></div>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button type="submit" disabled={submitting} className="gov-btn gov-btn-primary gov-btn-sm"><Send size={13} />{submitting ? "Saving..." : "Save Update"}</button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
