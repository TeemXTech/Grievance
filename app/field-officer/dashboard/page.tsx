"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { ClipboardList, CheckCircle2, Clock, AlertTriangle, RefreshCw, Bell, ChevronDown, X, Send, MapPin, Phone, ChevronRight } from "lucide-react"
import { GovSidebar, type NavItem } from "@/components/GovSidebar"

interface Task {
  id: string; trackingNumber: string; type: string; title: string
  status: string; priority: string; applicantName: string; applicantPhone: string
  villageName?: string; mandalName?: string; assignedDepartment?: string
  dueDate?: string; isOverdue: boolean; createdAt: string
}
interface Work {
  id: string; workCode: string; title: string; category: string; stage: string
  villageName?: string; mandalName?: string; targetCompletionDate?: string
}

const NAV: NavItem[] = [
  { key: "tasks",    label: "My Tasks",    Icon: ClipboardList },
  { key: "works",    label: "Field Works", Icon: MapPin },
  { key: "history",  label: "History",     Icon: CheckCircle2 },
]

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:              { label: "Pending",       color: "#92400e", bg: "#fef3c7" },
  SUBMITTED_TO_PA:      { label: "With PA",       color: "#1e40af", bg: "#dbeafe" },
  ASSIGNED_TO_OFFICIAL: { label: "Assigned",      color: "#5b21b6", bg: "#ede9fe" },
  UNDER_REVIEW:         { label: "Under Review",  color: "#6b21a8", bg: "#fae8ff" },
  SANCTIONED:           { label: "Sanctioned",    color: "#065f46", bg: "#d1fae5" },
  RESOLVED:             { label: "Resolved",      color: "#065f46", bg: "#d1fae5" },
  REJECTED:             { label: "Rejected",      color: "#991b1b", bg: "#fee2e2" },
}

function Badge({ label, color, bg }: { label: string; color: string; bg: string }) {
  return <span className="gov-badge" style={{ color, background: bg }}>{label}</span>
}

export default function FieldOfficerDashboard() {
  const { data: session } = useSession()
  const name = (session?.user as any)?.name || "Field Officer"
  const initials = name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()

  const [activeNav, setActiveNav] = useState("tasks")
  const [tasks, setTasks]         = useState<Task[]>([])
  const [works, setWorks]         = useState<Work[]>([])
  const [loading, setLoading]     = useState(true)
  const [summary, setSummary]     = useState({ totalPetitions: 0, overdue: 0, pending: 0, resolved: 0 })
  const [selected, setSelected]   = useState<Task | null>(null)
  const [updating, setUpdating]   = useState(false)
  const [updateForm, setUpdateForm] = useState({ newStatus: "", notes: "" })

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/field/assigned-tasks", { credentials: "include" })
      const d = await res.json()
      if (d.success) {
        setTasks(d.petitions || [])
        setWorks(d.works || [])
        setSummary(d.summary || { totalPetitions: 0, overdue: 0, pending: 0, resolved: 0 })
      }
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  const openTask = (t: Task) => { setSelected(t); setUpdateForm({ newStatus: t.status, notes: "" }) }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selected) return
    setUpdating(true)
    try {
      const res = await fetch("/api/field/update-status", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ petitionId: selected.id, status: updateForm.newStatus, remarks: updateForm.notes, performedByName: name, performedByRole: "FIELD_OFFICER" }),
      })
      const d = await res.json()
      if (d.success) { setSelected(null); fetchData() }
    } finally { setUpdating(false) }
  }

  const activeTasks   = tasks.filter(t => t.status !== "RESOLVED" && t.status !== "SANCTIONED" && t.status !== "REJECTED")
  const resolvedTasks = tasks.filter(t => t.status === "RESOLVED" || t.status === "SANCTIONED")
  const now = new Date()
  const todayStr = now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })

  return (
    <div className="gov-app">
      <GovSidebar items={NAV} active={activeNav} onNav={setActiveNav} role="FIELD_OFFICER" userName={name} />

      <div className="gov-main">
        <header className="gov-header">
          <div>
            <div className="gov-header-title">Field Officer Dashboard</div>
            <div className="gov-header-sub">Field Operations · {todayStr}</div>
          </div>
          <div className="gov-header-actions">
            <button onClick={fetchData} className="gov-header-btn"><RefreshCw size={15} /></button>
            <div className="gov-notif-wrap">
              <button className="gov-header-btn"><Bell size={15} /></button>
              {summary.overdue > 0 && <span className="gov-notif-dot">{summary.overdue}</span>}
            </div>
            <div className="gov-header-profile">
              <div className="gov-avatar">{initials}</div>
              <div><div className="gov-avatar-name">{name}</div><div className="gov-avatar-role">Field Officer</div></div>
              <ChevronDown size={13} color="var(--sub)" />
            </div>
          </div>
        </header>

        <div className="gov-body">
          {/* KPI */}
          <div className="gov-kpi-grid">
            {[
              { label: "Assigned to Me", value: summary.totalPetitions, accent: "#2F6FED", Icon: ClipboardList },
              { label: "Pending Visit",  value: summary.pending,        accent: "#F59E0B", Icon: Clock },
              { label: "Overdue",        value: summary.overdue,        accent: "#DC2626", Icon: AlertTriangle },
              { label: "Resolved",       value: summary.resolved,       accent: "#16A34A", Icon: CheckCircle2 },
            ].map(({ label, value, accent, Icon: Ic }) => (
              <div key={label} className="gov-kpi">
                <div className="gov-kpi-top"><div className="gov-kpi-icon" style={{ background: `${accent}18` }}><Ic size={17} color={accent} /></div></div>
                <div className="gov-kpi-value">{loading ? <div className="gov-skel gov-kpi-skel" /> : value}</div>
                <div className="gov-kpi-label">{label}</div>
              </div>
            ))}
          </div>

          {/* Tasks */}
          {activeNav === "tasks" && (
            <div className="gov-card gov-card-p">
              <div className="gov-card-header">
                <div className="gov-card-title"><div className="gov-card-icon" style={{ background: "#eff6ff" }}><ClipboardList size={14} color="#2F6FED" /></div>My Assigned Tasks <span style={{ fontSize: 12, color: "var(--sub)", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 5, padding: "1px 8px" }}>{activeTasks.length}</span></div>
              </div>
              {loading ? <div className="gov-empty">Loading tasks...</div> : activeTasks.length === 0 ? <div className="gov-empty">No active tasks assigned to you.</div> : (
                <div style={{ overflowX: "auto" }}>
                  <table className="gov-table">
                    <thead><tr>{["#","Petition","Location","Due","Status",""].map(h => <th key={h}>{h}</th>)}</tr></thead>
                    <tbody>
                      {activeTasks.map((t, i) => {
                        const sm = STATUS_META[t.status] || { label: t.status, color: "#475569", bg: "#f1f5f9" }
                        const due = t.dueDate ? new Date(t.dueDate).toLocaleDateString("en-IN") : "—"
                        return (
                          <tr key={t.id} onClick={() => openTask(t)} className={t.isOverdue ? "gov-table-overdue" : ""}>
                            <td style={{ color: "var(--sub)", fontWeight: 600 }}>{i + 1}</td>
                            <td>
                              <div style={{ fontWeight: 600, color: "var(--navy)" }}>{t.title || t.applicantName}</div>
                              <div style={{ fontSize: 11, color: "var(--sub)", display: "flex", alignItems: "center", gap: 3 }}><Phone size={10} />{t.applicantPhone}</div>
                              {t.isOverdue && <span style={{ fontSize: 10, fontWeight: 800, color: "var(--crit)" }}>OVERDUE</span>}
                            </td>
                            <td style={{ fontSize: 12 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 4 }}><MapPin size={11} color="var(--sub)" />{t.villageName || "—"}</div>
                              <div style={{ fontSize: 11, color: "var(--sub)" }}>{t.mandalName}</div>
                            </td>
                            <td style={{ fontSize: 12, color: t.isOverdue ? "var(--crit)" : "var(--sub)", fontWeight: t.isOverdue ? 700 : 400 }}>{due}</td>
                            <td><Badge label={sm.label} color={sm.color} bg={sm.bg} /></td>
                            <td><button onClick={e => { e.stopPropagation(); openTask(t) }} className="gov-btn gov-btn-outline gov-btn-sm">Update <ChevronRight size={12} /></button></td>
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
            <div className="gov-card gov-card-p">
              <div className="gov-card-header">
                <div className="gov-card-title"><div className="gov-card-icon" style={{ background: "#f5f3ff" }}><MapPin size={14} color="#7c3aed" /></div>Field Works <span style={{ fontSize: 12, color: "var(--sub)", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 5, padding: "1px 8px" }}>{works.length}</span></div>
              </div>
              {loading ? <div className="gov-empty">Loading...</div> : works.length === 0 ? <div className="gov-empty">No field works assigned.</div> : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {works.map(w => (
                    <div key={w.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "var(--bg)", borderRadius: 9, border: "1px solid var(--border)" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                          <span style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 700, color: "#1e40af" }}>{w.workCode}</span>
                          <Badge label={w.stage.replace(/_/g," ")} color="#5b21b6" bg="#ede9fe" />
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--navy)" }}>{w.title}</div>
                        <div style={{ fontSize: 11, color: "var(--sub)", marginTop: 2 }}>{w.category} · {[w.mandalName, w.villageName].filter(Boolean).join(", ")}</div>
                      </div>
                      {w.targetCompletionDate && <div style={{ fontSize: 12, color: "var(--sub)", flexShrink: 0 }}>Due: {new Date(w.targetCompletionDate).toLocaleDateString("en-IN")}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* History */}
          {activeNav === "history" && (
            <div className="gov-card gov-card-p">
              <div className="gov-card-header">
                <div className="gov-card-title"><div className="gov-card-icon" style={{ background: "#f0fdf4" }}><CheckCircle2 size={14} color="#16A34A" /></div>Resolved Tasks <span style={{ fontSize: 12, color: "var(--sub)", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 5, padding: "1px 8px" }}>{resolvedTasks.length}</span></div>
              </div>
              {resolvedTasks.length === 0 ? <div className="gov-empty">No resolved tasks yet.</div> : (
                <div style={{ overflowX: "auto" }}>
                  <table className="gov-table">
                    <thead><tr>{["Petition","Location","Status","Date"].map(h => <th key={h}>{h}</th>)}</tr></thead>
                    <tbody>
                      {resolvedTasks.map(t => {
                        const sm = STATUS_META[t.status] || { label: t.status, color: "#475569", bg: "#f1f5f9" }
                        return (
                          <tr key={t.id}>
                            <td><div style={{ fontWeight: 600 }}>{t.title || t.applicantName}</div><div style={{ fontSize: 11, color: "var(--sub)" }}>{t.trackingNumber}</div></td>
                            <td style={{ fontSize: 12 }}>{t.villageName || "—"}, {t.mandalName}</td>
                            <td><Badge label={sm.label} color={sm.color} bg={sm.bg} /></td>
                            <td style={{ fontSize: 12, color: "var(--sub)" }}>{new Date(t.createdAt).toLocaleDateString("en-IN")}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Update Status Drawer */}
      {selected && (
        <>
          <div className="gov-overlay" onClick={() => setSelected(null)} />
          <div className="gov-drawer">
            <div className="gov-drawer-header">
              <div>
                <div className="gov-drawer-title">{selected.title || selected.applicantName}</div>
                <div className="gov-drawer-sub">{selected.trackingNumber}</div>
              </div>
              <button className="gov-drawer-close" onClick={() => setSelected(null)}><X size={14} /></button>
            </div>
            <div className="gov-drawer-body">
              {(() => { const sm = STATUS_META[selected.status] || { label: selected.status, color: "#475569", bg: "#f1f5f9" }; return <div style={{ display: "flex", gap: 6 }}><Badge label={sm.label} color={sm.color} bg={sm.bg} />{selected.isOverdue && <Badge label="OVERDUE" color="var(--crit)" bg="#fef2f2" />}</div> })()}
              <div className="gov-info-grid">
                {([["Citizen", selected.applicantName], ["Phone", selected.applicantPhone], ["Village", selected.villageName], ["Mandal", selected.mandalName], ["Department", selected.assignedDepartment], ["Due Date", selected.dueDate ? new Date(selected.dueDate).toLocaleDateString("en-IN") : undefined]] as [string, string|undefined][]).filter(([,v]) => v).map(([l, v]) => (
                  <div key={l} className="gov-info-box"><div className="gov-info-label">{l}</div><div className="gov-info-value">{v}</div></div>
                ))}
              </div>
              <form onSubmit={handleUpdate} style={{ display: "flex", flexDirection: "column", gap: 12, background: "#f0f7ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)" }}>Update Status</div>
                <div><label className="gov-label">New Status</label>
                  <select className="gov-select" value={updateForm.newStatus} onChange={e => setUpdateForm(p => ({ ...p, newStatus: e.target.value }))}>
                    <option value="ASSIGNED_TO_OFFICIAL">Assigned</option>
                    <option value="UNDER_REVIEW">Under Review</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
                <div><label className="gov-label">Field Notes</label><textarea className="gov-textarea" rows={3} value={updateForm.notes} onChange={e => setUpdateForm(p => ({ ...p, notes: e.target.value }))} placeholder="Describe what was done in the field..." /></div>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button type="submit" disabled={updating} className="gov-btn gov-btn-primary gov-btn-sm"><Send size={13} />{updating ? "Saving..." : "Submit Update"}</button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
