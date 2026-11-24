"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
  Bell, Calendar, ChevronDown, FileText, Mail, MessageCircle,
  Plus, RefreshCw, Settings, Users, X, Megaphone, BarChart3,
  AlertTriangle, CheckCircle2, ClipboardList,
} from "lucide-react"
import { GovSidebar, type NavItem } from "@/components/GovSidebar"

// ─── Types ────────────────────────────────────────────────────────────────────
interface Survey {
  id: string
  title: string
  description: string | null
  status: string
  targetLevel: string
  languages: string[]
  startsAt: string | null
  endsAt: string | null
  createdByName: string
  createdAt: string
  _count: { questions: number; responses: number }
}

interface BoothGrade {
  boothNumber: string
  villageName: string | null
  mandalName: string | null
  totalScore: number
  grade: string
  gradeDrop: boolean
}

interface Stats {
  totalSurveys: number; activeSurveys: number; totalResponses: number
  gradeDistribution: { A: number; B: number; C: number; D: number }
  criticalBooths: BoothGrade[]
}

// ─── Constants ────────────────────────────────────────────────────────────────
const READ_ROLES  = ["MINISTER", "PA", "ADMIN", "BACK_OFFICER", "FIELD_OFFICER"]
const WRITE_ROLES = ["PA", "ADMIN"]

const NAV: NavItem[] = [
  { key: "petitions", label: "All Petitions",  Icon: FileText },
  { key: "whatsapp",  label: "WhatsApp Inbox", Icon: MessageCircle },
  { key: "campaigns", label: "Bulk Campaigns", Icon: Megaphone },
  { key: "workers",   label: "Party Workers",  Icon: Users },
  { key: "surveys",   label: "Surveys",        Icon: ClipboardList },
  { key: "calendar",  label: "Calendar",       Icon: Calendar },
  { key: "settings",  label: "Settings",       Icon: Settings },
]

const STATUS_COLORS: Record<string, { color: string; bg: string }> = {
  DRAFT:     { color: "#475569", bg: "#f1f5f9" },
  ACTIVE:    { color: "#065f46", bg: "#d1fae5" },
  CLOSED:    { color: "#1e40af", bg: "#dbeafe" },
  ARCHIVED:  { color: "#92400e", bg: "#fef3c7" },
}

const GRADE_COLORS: Record<string, { color: string; bg: string }> = {
  A: { color: "#065f46", bg: "#d1fae5" },
  B: { color: "#1e40af", bg: "#dbeafe" },
  C: { color: "#92400e", bg: "#fef3c7" },
  D: { color: "#991b1b", bg: "#fee2e2" },
}

function fmtDate(d: string | null) {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
}

function Badge({ label, color, bg }: { label: string; color: string; bg: string }) {
  return <span className="gov-badge" style={{ color, background: bg }}>{label}</span>
}

// ─── Survey Drawer ────────────────────────────────────────────────────────────
function SurveyDrawer({
  survey, canWrite, onClose, onRefresh,
}: {
  survey: Survey; canWrite: boolean; onClose: () => void; onRefresh: () => void
}) {
  const [grading, setGrading] = useState(false)
  const [msg, setMsg] = useState("")
  const [editStatus, setEditStatus] = useState(survey.status)
  const [saving, setSaving] = useState(false)

  const computeGrades = async () => {
    setGrading(true); setMsg("")
    const res = await fetch(`/api/surveys/${survey.id}/grade`, { method: "POST", credentials: "include" })
    const d = await res.json()
    setGrading(false)
    if (d.success) { setMsg(`Computed grades for ${d.gradesComputed} booths`); onRefresh() }
    else setMsg(d.error || "Failed")
  }

  const saveStatus = async () => {
    setSaving(true)
    const res = await fetch(`/api/surveys/${survey.id}`, {
      method: "PATCH", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: editStatus }),
    })
    const d = await res.json()
    setSaving(false)
    if (d.success) { setMsg("Status updated"); onRefresh() }
    else setMsg(d.error || "Failed")
  }

  const sc = STATUS_COLORS[survey.status] || STATUS_COLORS.DRAFT

  return (
    <>
      <button className="gov-overlay" onClick={onClose} />
      <aside className="gov-drawer">
        <header className="gov-drawer-header">
          <div>
            <div className="gov-drawer-title">{survey.title}</div>
            <div className="gov-drawer-sub">Created {fmtDate(survey.createdAt)} by {survey.createdByName}</div>
          </div>
          <button className="gov-drawer-close" onClick={onClose}><X size={15} /></button>
        </header>
        <div className="gov-drawer-body">
          <Badge label={survey.status} color={sc.color} bg={sc.bg} />

          <div className="gov-info-grid">
            <div className="gov-info-box"><div className="gov-label">Questions</div><div style={{ fontSize: 22, fontWeight: 700, color: "var(--navy)" }}>{survey._count.questions}</div></div>
            <div className="gov-info-box"><div className="gov-label">Responses</div><div style={{ fontSize: 22, fontWeight: 700, color: "var(--navy)" }}>{survey._count.responses}</div></div>
          </div>

          {survey.description && <div><div className="gov-label">Description</div><div style={{ fontSize: 13, color: "var(--sub)" }}>{survey.description}</div></div>}
          <div><div className="gov-label">Target Level</div><div style={{ fontSize: 13 }}>{survey.targetLevel}</div></div>
          <div><div className="gov-label">Languages</div><div style={{ fontSize: 13 }}>{survey.languages.join(", ")}</div></div>
          {survey.startsAt && <div><div className="gov-label">Starts</div><div style={{ fontSize: 13 }}>{fmtDate(survey.startsAt)}</div></div>}
          {survey.endsAt && <div><div className="gov-label">Ends</div><div style={{ fontSize: 13 }}>{fmtDate(survey.endsAt)}</div></div>}

          {msg && <div style={{ padding: "10px 14px", borderRadius: 8, background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", fontSize: 13 }}>{msg}</div>}

          {canWrite && (
            <>
              <div>
                <div className="gov-label">Update Status</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <select className="gov-select" value={editStatus} onChange={e => setEditStatus(e.target.value)}>
                    <option value="DRAFT">Draft</option>
                    <option value="ACTIVE">Active</option>
                    <option value="CLOSED">Closed</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                  <button className="gov-btn gov-btn-primary" disabled={saving || editStatus === survey.status} onClick={saveStatus}>
                    {saving ? "Saving…" : "Save"}
                  </button>
                </div>
              </div>
              {survey._count.responses > 0 && (
                <button className="gov-btn gov-btn-outline" disabled={grading} onClick={computeGrades}>
                  <BarChart3 size={14} />{grading ? "Computing…" : "Compute Booth Grades"}
                </button>
              )}
            </>
          )}
        </div>
      </aside>
    </>
  )
}

// ─── New Survey Form ──────────────────────────────────────────────────────────
function NewSurveyDrawer({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [targetLevel, setTargetLevel] = useState("BOOTH")
  const [questionText, setQuestionText] = useState("")
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState("")

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setErr("")
    try {
      const res = await fetch("/api/surveys", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title, description: description || null, targetLevel,
          questions: [{ questionText, questionType: "YES_NO", isRequired: true, weight: 1.0 }],
        }),
      })
      const d = await res.json()
      if (!d.success) { setErr(d.error || "Failed"); return }
      onCreated()
    } catch { setErr("Network error") } finally { setSaving(false) }
  }

  return (
    <>
      <button className="gov-overlay" onClick={onClose} />
      <aside className="gov-drawer">
        <header className="gov-drawer-header">
          <div><div className="gov-drawer-title">New Survey</div></div>
          <button className="gov-drawer-close" onClick={onClose}><X size={15} /></button>
        </header>
        <div className="gov-drawer-body">
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 13 }}>
            <div><label className="gov-label">Title *</label><input className="gov-input" required value={title} onChange={e => setTitle(e.target.value)} /></div>
            <div><label className="gov-label">Description</label><textarea className="gov-textarea" rows={2} value={description} onChange={e => setDescription(e.target.value)} /></div>
            <div>
              <label className="gov-label">Target Level</label>
              <select className="gov-select" value={targetLevel} onChange={e => setTargetLevel(e.target.value)}>
                {["BOOTH","VILLAGE","MANDAL","DISTRICT","CONSTITUENCY"].map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div><label className="gov-label">First Question *</label><input className="gov-input" required value={questionText} onChange={e => setQuestionText(e.target.value)} placeholder="e.g. Are you satisfied with road conditions?" /></div>
            <div style={{ fontSize: 12, color: "var(--sub)" }}>More questions can be added after creation.</div>
            {err && <div style={{ color: "var(--crit)", fontSize: 13 }}>{err}</div>}
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" className="gov-btn gov-btn-outline" onClick={onClose}>Cancel</button>
              <button type="submit" className="gov-btn gov-btn-primary" disabled={saving}><Plus size={14} />{saving ? "Creating…" : "Create Survey"}</button>
            </div>
          </form>
        </div>
      </aside>
    </>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SurveysPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const user = session?.user as any
  const role = user?.role || ""
  const userName = user?.name || "Staff"

  const canRead  = READ_ROLES.includes(role)
  const canWrite = WRITE_ROLES.includes(role)

  const [surveys, setSurveys]   = useState<Survey[]>([])
  const [stats, setStats]       = useState<Stats | null>(null)
  const [loading, setLoading]   = useState(true)
  const [filterStatus, setFilterStatus] = useState("")
  const [selected, setSelected] = useState<Survey | null>(null)
  const [showNew, setShowNew]   = useState(false)
  const [activeTab, setActiveTab] = useState<"surveys" | "booths">("surveys")

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filterStatus) params.set("status", filterStatus)
    const [sRes, stRes] = await Promise.all([
      fetch(`/api/surveys?${params}`, { credentials: "include" }),
      fetch("/api/surveys/stats", { credentials: "include" }),
    ])
    const sd = await sRes.json(); const std = await stRes.json()
    if (sd.success)  setSurveys(sd.surveys)
    if (std.success) setStats(std)
    setLoading(false)
  }, [filterStatus])

  useEffect(() => { if (canRead) load() }, [canRead, load])

  const handleNav = (key: string) => {
    const routes: Record<string, string> = {
      petitions: "/pa/dashboard", whatsapp: "/pa/whatsapp",
      campaigns: "/pa/campaigns", workers: "/pa/party-workers",
      calendar: "/minister/calendar", settings: "/minister/settings",
    }
    if (key in routes) router.push(routes[key])
  }

  if (!canRead) return <div style={{ padding: 40, color: "var(--crit)" }}>Access denied.</div>

  const gd = stats?.gradeDistribution

  return (
    <div className="gov-app">
      <GovSidebar items={NAV} active="surveys" onNav={handleNav} role={role} userName={userName} />
      <main className="gov-main">
        <header className="gov-header">
          <div>
            <div className="gov-header-title">Surveys &amp; Booth Grading</div>
            <div className="gov-header-sub">Constituency sentiment surveys and booth-level grading</div>
          </div>
          <div className="gov-header-actions">
            <button className="gov-header-btn" onClick={load}><RefreshCw size={15} /></button>
            <button className="gov-header-btn"><Bell size={15} /></button>
            {canWrite && (
              <button className="gov-btn gov-btn-primary" onClick={() => setShowNew(true)}>
                <Plus size={14} />New Survey
              </button>
            )}
            <div className="gov-header-profile">
              <div className="gov-avatar">{userName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}</div>
              <div><div className="gov-avatar-name">{userName}</div><div className="gov-avatar-role">{role.replace(/_/g, " ")}</div></div>
              <ChevronDown size={13} color="var(--sub)" />
            </div>
          </div>
        </header>

        <div className="gov-body">
          {/* KPIs */}
          <div className="gov-kpi-grid">
            {[
              { label: "Total Surveys",   value: stats?.totalSurveys,   accent: "#2F6FED", Icon: ClipboardList },
              { label: "Active Surveys",  value: stats?.activeSurveys,  accent: "#16A34A", Icon: CheckCircle2 },
              { label: "Total Responses", value: stats?.totalResponses, accent: "#7c3aed", Icon: BarChart3 },
              { label: "Critical Booths", value: gd?.D ?? 0,            accent: "#991b1b", Icon: AlertTriangle },
            ].map(({ label, value, accent, Icon: Ic }) => (
              <div key={label} className="gov-kpi">
                <div className="gov-kpi-top"><div className="gov-kpi-icon" style={{ background: `${accent}18` }}><Ic size={17} color={accent} /></div></div>
                <div className="gov-kpi-value">{loading ? <div className="gov-skel gov-kpi-skel" /> : value ?? "—"}</div>
                <div className="gov-kpi-label">{label}</div>
              </div>
            ))}
          </div>

          {/* Grade Distribution */}
          {gd && (
            <div className="gov-card gov-card-p">
              <div className="gov-card-header"><div className="gov-card-title"><div className="gov-card-icon" style={{ background: "#eff6ff" }}><BarChart3 size={14} color="#2F6FED" /></div>Booth Grade Distribution</div></div>
              <div style={{ display: "flex", gap: 12 }}>
                {(["A","B","C","D"] as const).map(g => {
                  const gc = GRADE_COLORS[g]
                  const label = g === "A" ? "Stronghold" : g === "B" ? "Leaning" : g === "C" ? "Swing" : "Critical"
                  return (
                    <div key={g} style={{ flex: 1, textAlign: "center", padding: "16px 8px", borderRadius: 10, background: gc.bg, border: `1px solid ${gc.bg}` }}>
                      <div style={{ fontSize: 28, fontWeight: 800, color: gc.color }}>{gd[g]}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: gc.color }}>Grade {g}</div>
                      <div style={{ fontSize: 11, color: gc.color, opacity: 0.8 }}>{label}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, padding: 4, borderRadius: 9, border: "1px solid var(--border)", background: "var(--bg)", width: "fit-content" }}>
            {(["surveys","booths"] as const).map(t => (
              <button key={t} className="gov-btn gov-btn-sm" onClick={() => setActiveTab(t)}
                style={{ background: activeTab === t ? "white" : "transparent", color: activeTab === t ? "var(--navy)" : "var(--sub)", boxShadow: activeTab === t ? "0 1px 3px rgba(20,37,68,.12)" : "none" }}>
                {t === "surveys" ? "Surveys" : "Critical Booths"}
              </button>
            ))}
          </div>

          {/* Surveys Tab */}
          {activeTab === "surveys" && (
            <div className="gov-card gov-card-p">
              <div className="gov-card-header">
                <div className="gov-card-title"><div className="gov-card-icon" style={{ background: "#eff6ff" }}><ClipboardList size={14} color="#2F6FED" /></div>All Surveys</div>
                <select className="gov-select" style={{ width: 130 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                  <option value="">All Status</option>
                  {["DRAFT","ACTIVE","CLOSED","ARCHIVED"].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[1,2,3].map(i => <div key={i} className="gov-skel" style={{ height: 48, borderRadius: 7 }} />)}
                </div>
              ) : surveys.length === 0 ? (
                <div className="gov-empty"><ClipboardList size={24} style={{ margin: "0 auto 10px", opacity: 0.3 }} /><div>No surveys found.</div></div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table className="gov-table">
                    <thead><tr><th>Title</th><th>Status</th><th>Target</th><th>Questions</th><th>Responses</th><th>Created</th><th></th></tr></thead>
                    <tbody>
                      {surveys.map(s => {
                        const sc = STATUS_COLORS[s.status] || STATUS_COLORS.DRAFT
                        return (
                          <tr key={s.id}>
                            <td style={{ fontWeight: 600 }}>{s.title}</td>
                            <td><Badge label={s.status} color={sc.color} bg={sc.bg} /></td>
                            <td style={{ fontSize: 12 }}>{s.targetLevel}</td>
                            <td style={{ fontWeight: 600 }}>{s._count.questions}</td>
                            <td style={{ fontWeight: 600 }}>{s._count.responses}</td>
                            <td style={{ color: "var(--sub)", fontSize: 12 }}>{fmtDate(s.createdAt)}</td>
                            <td><button className="gov-btn gov-btn-outline gov-btn-sm" onClick={() => setSelected(s)}>View</button></td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Critical Booths Tab */}
          {activeTab === "booths" && (
            <div className="gov-card gov-card-p">
              <div className="gov-card-header"><div className="gov-card-title"><div className="gov-card-icon" style={{ background: "#fef2f2" }}><AlertTriangle size={14} color="#991b1b" /></div>Critical Booths (Grade D)</div></div>
              {!stats?.criticalBooths?.length ? (
                <div className="gov-empty"><CheckCircle2 size={24} style={{ margin: "0 auto 10px", opacity: 0.3 }} /><div>No critical booths. All booths are Grade C or above.</div></div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table className="gov-table">
                    <thead><tr><th>Booth</th><th>Village</th><th>Mandal</th><th>Score</th><th>Grade</th><th>Drop</th></tr></thead>
                    <tbody>
                      {stats.criticalBooths.map(b => {
                        const gc = GRADE_COLORS[b.grade] || GRADE_COLORS.D
                        return (
                          <tr key={b.boothNumber}>
                            <td style={{ fontWeight: 600, fontFamily: "monospace" }}>{b.boothNumber}</td>
                            <td style={{ fontSize: 12 }}>{b.villageName || "—"}</td>
                            <td style={{ fontSize: 12 }}>{b.mandalName || "—"}</td>
                            <td style={{ fontWeight: 600 }}>{b.totalScore.toFixed(1)}%</td>
                            <td><Badge label={b.grade} color={gc.color} bg={gc.bg} /></td>
                            <td>{b.gradeDrop ? <Badge label="↓ Drop" color="#991b1b" bg="#fee2e2" /> : <span style={{ color: "var(--sub)" }}>—</span>}</td>
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
      </main>

      {showNew && <NewSurveyDrawer onClose={() => setShowNew(false)} onCreated={() => { setShowNew(false); load() }} />}
      {selected && <SurveyDrawer survey={selected} canWrite={canWrite} onClose={() => setSelected(null)} onRefresh={() => { load(); setSelected(null) }} />}
    </div>
  )
}
