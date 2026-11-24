"use client"

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
  AlertTriangle, Calendar, CheckCircle2, ChevronDown, Clock3,
  FileText, History, Landmark, Mail, MessageCircle, Plus,
  RefreshCw, Search, Send, Settings, Sparkles, Users, X, Lock,
} from "lucide-react"
import { GovSidebar, type NavItem } from "@/components/GovSidebar"

// ─── Types ────────────────────────────────────────────────────────────────────

interface AQTimeline {
  id: string
  fromStatus: string | null
  toStatus: string
  actionTaken: string
  remarks: string | null
  performedByName: string
  performedByRole: string
  createdAt: string
}

interface AssemblyQuestion {
  id: string
  questionNumber: string
  sessionName: string
  questionType: "STARRED" | "UNSTARRED" | "SHORT_NOTICE"
  status: AQStatus
  subject: string
  questionText: string
  askedByMLA: string
  askedByConstituency: string | null
  ministry: string
  department: string | null
  receivedDate: string
  answerDueDate: string | null
  sentToDeptName: string | null
  sentToDeptAt: string | null
  draftAnswerText: string | null
  finalAnswerText: string | null
  answeredDate: string | null
  talkingPoints: string | null
  privateNotes: string | null
  handledByName: string | null
  fileUrl: string | null
  createdAt: string
  timeline: AQTimeline[]
}

interface AQStats {
  total: number
  received: number
  sentToDept: number
  draftReceived: number
  underReview: number
  answerReady: number
  answered: number
  lapsed: number
  overdueAnswer: number
  starred: number
  unstarred: number
}

interface StatsResponse {
  success: boolean
  stats: AQStats
  urgentList: AssemblyQuestion[]
  byMinistry: { ministry: string; count: number }[]
}

interface ListResponse {
  success: boolean
  questions: AssemblyQuestion[]
  total: number
  page: number
  pageSize: number
}

type AQStatus =
  | "RECEIVED" | "SENT_TO_DEPT" | "DRAFT_RECEIVED"
  | "UNDER_REVIEW" | "ANSWER_READY" | "ANSWERED" | "LAPSED"

type PageTab = "all" | "urgent" | "new"

// ─── Constants ────────────────────────────────────────────────────────────────

const READ_ROLES  = ["MINISTER", "PA", "ADMIN", "BACK_OFFICER"]
const WRITE_ROLES = ["PA", "ADMIN", "BACK_OFFICER"]
const PRIVATE_ROLES = ["MINISTER", "PA", "ADMIN"]

const NAV: NavItem[] = [
  { key: "petitions",          label: "All Petitions",      Icon: FileText },
  { key: "new-petition",       label: "New Petition",        Icon: Plus },
  { key: "whatsapp",           label: "WhatsApp Inbox",      Icon: MessageCircle },
  { key: "assembly-questions", label: "Assembly Questions",  Icon: Landmark },
  { key: "visitors",           label: "Visitors",            Icon: Users },
  { key: "letters",            label: "Letters",             Icon: Mail },
  { key: "calendar",           label: "Calendar",            Icon: Calendar },
  { key: "settings",           label: "Settings",            Icon: Settings },
]

const STATUS_META: Record<AQStatus, { label: string; color: string; bg: string }> = {
  RECEIVED:       { label: "Received",       color: "#92400e", bg: "#fef3c7" },
  SENT_TO_DEPT:   { label: "Sent to Dept",   color: "#1e40af", bg: "#dbeafe" },
  DRAFT_RECEIVED: { label: "Draft Received", color: "#5b21b6", bg: "#ede9fe" },
  UNDER_REVIEW:   { label: "Under Review",   color: "#3730a3", bg: "#e0e7ff" },
  ANSWER_READY:   { label: "Answer Ready",   color: "#0f766e", bg: "#ccfbf1" },
  ANSWERED:       { label: "Answered",       color: "#065f46", bg: "#d1fae5" },
  LAPSED:         { label: "Lapsed",         color: "#374151", bg: "#f3f4f6" },
}

const TYPE_META: Record<string, { label: string; badge: string }> = {
  STARRED:      { label: "Starred ★",    badge: "LAQ" },
  UNSTARRED:    { label: "Unstarred",    badge: "LCQ" },
  SHORT_NOTICE: { label: "Short Notice", badge: "AQ"  },
}

const NEXT_STATUSES: Record<AQStatus, AQStatus[]> = {
  RECEIVED:       ["SENT_TO_DEPT", "LAPSED"],
  SENT_TO_DEPT:   ["DRAFT_RECEIVED", "LAPSED"],
  DRAFT_RECEIVED: ["UNDER_REVIEW", "SENT_TO_DEPT"],
  UNDER_REVIEW:   ["ANSWER_READY", "SENT_TO_DEPT"],
  ANSWER_READY:   ["ANSWERED"],
  ANSWERED:       [],
  LAPSED:         [],
}

const EMPTY_STATS: AQStats = {
  total: 0, received: 0, sentToDept: 0, draftReceived: 0,
  underReview: 0, answerReady: 0, answered: 0, lapsed: 0,
  overdueAnswer: 0, starred: 0, unstarred: 0,
}

// ─── Small helpers ────────────────────────────────────────────────────────────

function Badge({ label, color, bg }: { label: string; color: string; bg: string }) {
  return <span className="gov-badge" style={{ color, background: bg }}>{label}</span>
}

function isOverdue(q: AssemblyQuestion) {
  return q.answerDueDate &&
    new Date(q.answerDueDate) < new Date() &&
    !["ANSWERED", "LAPSED"].includes(q.status)
}

function fmtDate(val: string | null | undefined) {
  if (!val) return "—"
  return new Date(val).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
}

// ─── Drawer ───────────────────────────────────────────────────────────────────

function QuestionDrawer({
  question,
  role,
  submitting,
  onClose,
  onUpdate,
}: {
  question: AssemblyQuestion
  role: string
  submitting: boolean
  onClose: () => void
  onUpdate: (id: string, body: Record<string, unknown>) => Promise<void>
}) {
  const canWrite  = WRITE_ROLES.includes(role)
  const canPrivate = PRIVATE_ROLES.includes(role)
  const nextStatuses = NEXT_STATUSES[question.status] ?? []
  const sm = STATUS_META[question.status] ?? { label: question.status, color: "#475569", bg: "#f1f5f9" }
  const tm = TYPE_META[question.questionType] ?? { label: question.questionType, badge: "AQ" }

  const [form, setForm] = useState({
    status: "" as AQStatus | "",
    actionTaken: "",
    remarks: "",
    sentToDeptName: question.sentToDeptName ?? "",
    draftAnswerText: question.draftAnswerText ?? "",
    finalAnswerText: question.finalAnswerText ?? "",
    answerDueDate: question.answerDueDate ? question.answerDueDate.slice(0, 10) : "",
    privateNotes: question.privateNotes ?? "",
    regenerateTalkingPoints: false,
  })

  const newStatus = form.status as AQStatus | ""

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const body: Record<string, unknown> = { actionTaken: form.actionTaken, remarks: form.remarks || undefined }
    if (newStatus) body.status = newStatus
    if (form.answerDueDate) body.answerDueDate = form.answerDueDate
    if (newStatus === "SENT_TO_DEPT" && form.sentToDeptName) body.sentToDeptName = form.sentToDeptName
    if (["DRAFT_RECEIVED","UNDER_REVIEW"].includes(newStatus) && form.draftAnswerText) body.draftAnswerText = form.draftAnswerText
    if (["ANSWER_READY","ANSWERED"].includes(newStatus) && form.finalAnswerText) body.finalAnswerText = form.finalAnswerText
    if (canPrivate && form.privateNotes !== (question.privateNotes ?? "")) body.privateNotes = form.privateNotes
    if (form.regenerateTalkingPoints) body.regenerateTalkingPoints = true
    void onUpdate(question.id, body)
  }

  return (
    <>
      <button type="button" className="gov-overlay" onClick={onClose} aria-label="Close" />
      <aside className="gov-drawer" role="dialog" aria-modal="true" aria-labelledby="aq-drawer-title">
        <header className="gov-drawer-header">
          <div>
            <div className="gov-drawer-title" id="aq-drawer-title">
              <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: "#1e40af", background: "#eff6ff", padding: "2px 8px", borderRadius: 4, marginRight: 8 }}>
                {question.questionNumber}
              </span>
              {tm.badge}
            </div>
            <div className="gov-drawer-sub">{question.sessionName}</div>
          </div>
          <button className="gov-drawer-close" type="button" onClick={onClose}><X size={15} /></button>
        </header>

        <div className="gov-drawer-body">
          {/* Badges */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <Badge label={sm.label} color={sm.color} bg={sm.bg} />
            <Badge label={tm.label} color="#475569" bg="#f1f5f9" />
            {isOverdue(question) && <Badge label="OVERDUE" color="#991b1b" bg="#fee2e2" />}
          </div>

          {/* Subject */}
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)", lineHeight: 1.4 }}>{question.subject}</div>

          {/* Info grid */}
          <div className="gov-info-grid">
            {([
              ["MLA", question.askedByMLA],
              ["Constituency", question.askedByConstituency],
              ["Ministry", question.ministry],
              ["Department", question.department],
              ["Session", question.sessionName],
              ["Received", fmtDate(question.receivedDate)],
              ["Due Date", fmtDate(question.answerDueDate)],
              ["Handled By", question.handledByName],
              ["Sent to Dept", question.sentToDeptName],
            ] as [string, string | null | undefined][]).filter(([, v]) => v).map(([l, v]) => (
              <div key={l} className="gov-info-box">
                <div className="gov-info-label">{l}</div>
                <div className="gov-info-value">{v}</div>
              </div>
            ))}
          </div>

          {/* Question text */}
          <div>
            <div style={{ fontSize: 11, color: "var(--sub)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 5 }}>Question Text</div>
            <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.7, background: "var(--bg)", borderRadius: 8, padding: "10px 14px", whiteSpace: "pre-wrap", maxHeight: 200, overflowY: "auto" }}>
              {question.questionText}
            </div>
          </div>

          {/* AI Talking Points */}
          {question.talkingPoints && (
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 9, padding: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#166534", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                <Sparkles size={14} /> AI Briefing Points
              </div>
              {question.talkingPoints.split("\n").filter(Boolean).map((line, i) => (
                <div key={i} style={{ fontSize: 12, color: "#166534", lineHeight: 1.6, marginBottom: 3 }}>{line}</div>
              ))}
            </div>
          )}

          {/* Private notes */}
          {canPrivate && question.privateNotes && (
            <div className="gov-private-box">
              <div className="gov-private-label"><Lock size={11} style={{ display: "inline", marginRight: 4 }} />Private Notes</div>
              <div className="gov-private-text">{question.privateNotes}</div>
            </div>
          )}

          {/* Timeline */}
          {question.timeline?.length > 0 && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--navy)", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                <History size={14} />Timeline ({question.timeline.length})
              </div>
              <div className="gov-timeline">
                {question.timeline.map((item, i) => (
                  <div key={item.id} className="gov-timeline-item">
                    <div className="gov-timeline-num">{i + 1}</div>
                    <div style={{ flex: 1 }}>
                      <div className="gov-timeline-action">{item.actionTaken}</div>
                      {item.remarks && <div style={{ fontSize: 12, color: "var(--sub)", fontStyle: "italic", marginTop: 2 }}>"{item.remarks}"</div>}
                      <div className="gov-timeline-meta">By {item.performedByName} · {fmtDate(item.createdAt)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Update form */}
          {canWrite && nextStatuses.length > 0 && (
            <form onSubmit={submit} style={{ background: "#f0f7ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)" }}>Update Question</div>

              <div className="gov-form-grid gov-form-grid-2">
                <div>
                  <label className="gov-label">New Status</label>
                  <select className="gov-select" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as AQStatus }))}>
                    <option value="">— no change —</option>
                    {nextStatuses.map(s => <option key={s} value={s}>{STATUS_META[s]?.label ?? s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="gov-label">Answer Due Date</label>
                  <input type="date" className="gov-input" value={form.answerDueDate} onChange={e => setForm(p => ({ ...p, answerDueDate: e.target.value }))} />
                </div>
              </div>

              {newStatus === "SENT_TO_DEPT" && (
                <div>
                  <label className="gov-label">Sent to Department *</label>
                  <input className="gov-input" value={form.sentToDeptName} onChange={e => setForm(p => ({ ...p, sentToDeptName: e.target.value }))} placeholder="e.g. Roads & Buildings Dept" />
                </div>
              )}

              {["DRAFT_RECEIVED","UNDER_REVIEW"].includes(newStatus) && (
                <div>
                  <label className="gov-label">Draft Answer</label>
                  <textarea className="gov-textarea" rows={3} value={form.draftAnswerText} onChange={e => setForm(p => ({ ...p, draftAnswerText: e.target.value }))} />
                </div>
              )}

              {["ANSWER_READY","ANSWERED"].includes(newStatus) && (
                <div>
                  <label className="gov-label">Final Answer</label>
                  <textarea className="gov-textarea" rows={3} value={form.finalAnswerText} onChange={e => setForm(p => ({ ...p, finalAnswerText: e.target.value }))} />
                </div>
              )}

              <div>
                <label className="gov-label">Action Taken *</label>
                <input required className="gov-input" value={form.actionTaken} onChange={e => setForm(p => ({ ...p, actionTaken: e.target.value }))} placeholder="Describe what was done..." />
              </div>
              <div>
                <label className="gov-label">Remarks</label>
                <input className="gov-input" value={form.remarks} onChange={e => setForm(p => ({ ...p, remarks: e.target.value }))} />
              </div>

              {canPrivate && (
                <div>
                  <label className="gov-label" style={{ color: "#b45309" }}><Lock size={12} style={{ display: "inline", marginRight: 4 }} />Private Notes</label>
                  <textarea className="gov-textarea" rows={2} value={form.privateNotes} onChange={e => setForm(p => ({ ...p, privateNotes: e.target.value }))} style={{ background: "#fffbeb", borderColor: "#fde68a" }} />
                </div>
              )}

              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--sub)", cursor: "pointer" }}>
                <input type="checkbox" checked={form.regenerateTalkingPoints} onChange={e => setForm(p => ({ ...p, regenerateTalkingPoints: e.target.checked }))} />
                <Sparkles size={13} /> Regenerate AI talking points
              </label>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button type="submit" disabled={submitting} className="gov-btn gov-btn-primary gov-btn-sm">
                  <Send size={13} />{submitting ? "Saving..." : "Save Update"}
                </button>
              </div>
            </form>
          )}

          {question.status === "ANSWERED" && (
            <div style={{ fontSize: 13, color: "var(--sub)", fontStyle: "italic", textAlign: "center", padding: "12px 0" }}>This question has been answered. No further updates needed.</div>
          )}
          {question.status === "LAPSED" && (
            <div style={{ fontSize: 13, color: "var(--sub)", fontStyle: "italic", textAlign: "center", padding: "12px 0" }}>This question has lapsed.</div>
          )}
        </div>
      </aside>
    </>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AssemblyQuestionsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const user = session?.user as any
  const role: string = user?.role ?? ""
  const userName: string = user?.name ?? "Staff"
  const canRead  = READ_ROLES.includes(role)
  const canWrite = WRITE_ROLES.includes(role)
  const canPrivate = PRIVATE_ROLES.includes(role)

  const [activeTab, setActiveTab] = useState<PageTab>("all")
  const [questions, setQuestions] = useState<AssemblyQuestion[]>([])
  const [stats, setStats]         = useState<AQStats>(EMPTY_STATS)
  const [urgentList, setUrgentList] = useState<AssemblyQuestion[]>([])
  const [total, setTotal]         = useState(0)
  const [loading, setLoading]     = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [error, setError]         = useState<string | null>(null)
  const [selected, setSelected]   = useState<AssemblyQuestion | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast]         = useState("")

  // filters
  const [search, setSearch]           = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [filterType, setFilterType]   = useState("")
  const [overdueOnly, setOverdueOnly] = useState(false)

  // new question form
  const [newForm, setNewForm] = useState({
    questionType: "STARRED",
    sessionName: "", subject: "", questionText: "",
    askedByMLA: "", askedByConstituency: "", ministry: "", department: "",
    receivedDate: new Date().toISOString().slice(0, 10),
    answerDueDate: "", privateNotes: "",
  })

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(""), 3500)
  }

  const loadStats = useCallback(async () => {
    setStatsLoading(true)
    try {
      const res = await fetch("/api/assembly-questions/stats", { credentials: "include" })
      const d: StatsResponse = await res.json()
      if (d.success) { setStats(d.stats); setUrgentList(d.urgentList ?? []) }
    } finally { setStatsLoading(false) }
  }, [])

  const loadQuestions = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const p = new URLSearchParams({ page: "1" })
      if (search)       p.set("search", search)
      if (filterStatus) p.set("status", filterStatus)
      if (filterType)   p.set("type", filterType)
      if (overdueOnly)  p.set("overdue", "true")
      const res = await fetch(`/api/assembly-questions?${p}`, { credentials: "include" })
      if (!res.ok) throw Object.assign(new Error(), { status: res.status })
      const d: ListResponse = await res.json()
      if (d.success) { setQuestions(d.questions); setTotal(d.total) }
    } catch (err: any) {
      if (err.status === 401) setError("Session expired. Please log in again.")
      else if (err.status === 403) setError("Access denied.")
      else setError("Could not load questions. Retry.")
    } finally { setLoading(false) }
  }, [search, filterStatus, filterType, overdueOnly])

  useEffect(() => { if (canRead) { void loadStats(); } }, [canRead, loadStats])
  useEffect(() => { if (canRead) { const t = setTimeout(() => void loadQuestions(), 250); return () => clearTimeout(t) } }, [canRead, loadQuestions])
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(""), 3500); return () => clearTimeout(t) }, [toast])

  const handleUpdate = async (id: string, body: Record<string, unknown>) => {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/assembly-questions/${id}`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const d = await res.json()
      if (d.success) {
        setSelected(d.question)
        showToast("✅ Updated")
        void loadQuestions(); void loadStats()
      }
    } finally { setSubmitting(false) }
  }

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault(); setSubmitting(true)
    try {
      const res = await fetch("/api/assembly-questions", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newForm),
      })
      const d = await res.json()
      if (d.success) {
        showToast(`✅ ${d.question.questionNumber} registered`)
        setNewForm({ questionType: "STARRED", sessionName: "", subject: "", questionText: "", askedByMLA: "", askedByConstituency: "", ministry: "", department: "", receivedDate: new Date().toISOString().slice(0, 10), answerDueDate: "", privateNotes: "" })
        setActiveTab("all")
        void loadQuestions(); void loadStats()
      }
    } finally { setSubmitting(false) }
  }

  const handleNav = (key: string) => {
    const routes: Record<string, string> = {
      petitions: "/pa/dashboard", "new-petition": "/pa/dashboard",
      whatsapp: "/pa/whatsapp", visitors: "/visitors/dashboard",
      letters: "/letters/dashboard", calendar: "/minister/calendar",
      settings: "/minister/settings",
    }
    if (key in routes) router.push(routes[key])
  }

  const todayStr = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })

  if (!canRead) return <div>Access denied.</div>

  return (
    <div className="gov-app">
      <GovSidebar items={NAV} active="assembly-questions" onNav={handleNav} role={role} userName={userName} />

      <main className="gov-main">
        <header className="gov-header">
          <div>
            <div className="gov-header-title">Assembly Questions</div>
            <div className="gov-header-sub">Legislative Assembly Q&A Management · {todayStr}</div>
          </div>
          <div className="gov-header-actions">
            <button className="gov-header-btn" type="button" onClick={() => { void loadQuestions(); void loadStats() }}>
              <RefreshCw size={15} />
            </button>
            <div className="gov-header-profile">
              <div className="gov-avatar">{userName.split(" ").map((p: string) => p[0]).join("").slice(0, 2).toUpperCase()}</div>
              <div><div className="gov-avatar-name">{userName}</div><div className="gov-avatar-role">{role.replaceAll("_", " ")}</div></div>
              <ChevronDown size={13} color="var(--sub)" />
            </div>
          </div>
        </header>

        <div className="gov-body">

          {/* KPI row */}
          <div className="gov-kpi-grid">
            {[
              { label: "Total Questions", value: stats.total,        accent: "#2F6FED", Icon: Landmark },
              { label: "Overdue",         value: stats.overdueAnswer, accent: "#DC2626", Icon: AlertTriangle },
              { label: "Answered",        value: stats.answered,     accent: "#16A34A", Icon: CheckCircle2 },
              { label: "Starred (LAQ)",   value: stats.starred,      accent: "#D97706", Icon: Clock3 },
            ].map(({ label, value, accent, Icon }) => (
              <div key={label} className="gov-kpi">
                <div className="gov-kpi-top"><div className="gov-kpi-icon" style={{ background: `${accent}18` }}><Icon size={17} color={accent} /></div></div>
                <div className="gov-kpi-value">{statsLoading ? <div className="gov-skel gov-kpi-skel" /> : value}</div>
                <div className="gov-kpi-label">{label}</div>
              </div>
            ))}
          </div>

          {/* Tab bar */}
          <div style={{ display: "flex", gap: 4, padding: 4, borderRadius: 9, border: "1px solid var(--border)", background: "var(--bg)", width: "fit-content" }}>
            {([
              { key: "all",    label: "All Questions" },
              { key: "urgent", label: `Urgent (${urgentList.length})` },
              ...(canWrite ? [{ key: "new", label: "Log New" }] : []),
            ] as { key: PageTab; label: string }[]).map(tab => (
              <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key as PageTab)}
                className="gov-btn gov-btn-sm"
                style={{ background: activeTab === tab.key ? "white" : "transparent", color: activeTab === tab.key ? "var(--navy)" : "var(--sub)", boxShadow: activeTab === tab.key ? "0 1px 3px rgba(20,37,68,.12)" : "none" }}>
                {tab.label}
              </button>
            ))}
          </div>

          {error && (
            <div className="gov-error" role="alert">
              <span>{error}</span>
              <button type="button" className="gov-btn gov-btn-outline gov-btn-sm" onClick={() => void loadQuestions()}><RefreshCw size={13} /> Retry</button>
            </div>
          )}

          {/* ALL QUESTIONS TAB */}
          {activeTab === "all" && (
            <div className="gov-card gov-card-p">
              <div className="gov-card-header">
                <div className="gov-card-title">
                  <div className="gov-card-icon" style={{ background: "#eff6ff" }}><Landmark size={15} color="#2F6FED" /></div>
                  All Questions
                  <span style={{ fontSize: 12, color: "var(--sub)", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 5, padding: "1px 8px" }}>{total}</span>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <div className="gov-search" style={{ width: 220 }}>
                    <Search size={14} color="var(--sub)" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Subject, MLA, ministry..." />
                    {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", color: "var(--sub)", padding: 0 }}><X size={13} /></button>}
                  </div>
                  <select className="gov-select" style={{ width: "auto" }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    <option value="">All Statuses</option>
                    {(Object.keys(STATUS_META) as AQStatus[]).map(s => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
                  </select>
                  <select className="gov-select" style={{ width: "auto" }} value={filterType} onChange={e => setFilterType(e.target.value)}>
                    <option value="">All Types</option>
                    {Object.entries(TYPE_META).map(([k, v]) => <option key={k} value={k}>{v.badge} — {v.label}</option>)}
                  </select>
                  <button onClick={() => setOverdueOnly(!overdueOnly)} className="gov-btn gov-btn-sm"
                    style={{ background: overdueOnly ? "#fef2f2" : "var(--bg)", color: overdueOnly ? "#991b1b" : "var(--sub)", border: `1px solid ${overdueOnly ? "#fecaca" : "var(--border)"}` }}>
                    <AlertTriangle size={13} /> Overdue
                  </button>
                </div>
              </div>

              {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[1,2,3,4,5].map(i => <div key={i} className="gov-skel" style={{ height: 48, borderRadius: 7 }} />)}
                </div>
              ) : questions.length === 0 ? (
                <div className="gov-empty"><Landmark size={28} style={{ margin: "0 auto 8px", display: "block", opacity: 0.3 }} /><div>No questions found.</div></div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table className="gov-table">
                    <thead><tr><th>Question No.</th><th>Type</th><th>Subject</th><th>MLA</th><th>Ministry</th><th>Due Date</th><th>Status</th><th></th></tr></thead>
                    <tbody>
                      {questions.map(q => {
                        const sm = STATUS_META[q.status] ?? { label: q.status, color: "#475569", bg: "#f1f5f9" }
                        const tm = TYPE_META[q.questionType] ?? { label: q.questionType, badge: "AQ" }
                        const overdue = isOverdue(q)
                        return (
                          <tr key={q.id} onClick={() => setSelected(q)} style={{ cursor: "pointer" }}>
                            <td><span style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 700, color: "#1e40af", background: "#eff6ff", padding: "2px 7px", borderRadius: 4 }}>{q.questionNumber}</span></td>
                            <td><span style={{ fontSize: 11, fontWeight: 700, color: "#475569", background: "#f1f5f9", padding: "2px 7px", borderRadius: 4 }}>{tm.badge}</span></td>
                            <td style={{ maxWidth: 240 }}><div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 600 }}>{q.subject}</div></td>
                            <td style={{ fontSize: 12 }}>{q.askedByMLA}</td>
                            <td style={{ fontSize: 12, color: "var(--sub)" }}>{q.ministry}</td>
                            <td style={{ fontSize: 12, color: overdue ? "#991b1b" : "var(--sub)", fontWeight: overdue ? 700 : 400 }}>
                              {overdue && "⚠ "}{fmtDate(q.answerDueDate)}
                            </td>
                            <td><Badge label={sm.label} color={sm.color} bg={sm.bg} /></td>
                            <td><button type="button" className="gov-btn gov-btn-outline gov-btn-sm" onClick={e => { e.stopPropagation(); setSelected(q) }}>Review</button></td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* URGENT TAB */}
          {activeTab === "urgent" && (
            <div className="gov-card gov-card-p">
              <div className="gov-card-header">
                <div className="gov-card-title">
                  <div className="gov-card-icon" style={{ background: "#fef2f2" }}><AlertTriangle size={15} color="#DC2626" /></div>
                  Due in next 7 days
                </div>
              </div>
              {urgentList.length === 0 ? (
                <div className="gov-empty"><CheckCircle2 size={28} style={{ margin: "0 auto 8px", display: "block", opacity: 0.3 }} /><div>No questions due in the next 7 days ✅</div></div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table className="gov-table">
                    <thead><tr><th>Question No.</th><th>Type</th><th>Subject</th><th>MLA</th><th>Ministry</th><th>Due Date</th><th>Status</th><th></th></tr></thead>
                    <tbody>
                      {urgentList.map(q => {
                        const sm = STATUS_META[q.status] ?? { label: q.status, color: "#475569", bg: "#f1f5f9" }
                        const tm = TYPE_META[q.questionType] ?? { label: q.questionType, badge: "AQ" }
                        return (
                          <tr key={q.id} onClick={() => setSelected(q)} style={{ cursor: "pointer" }}>
                            <td><span style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 700, color: "#1e40af", background: "#eff6ff", padding: "2px 7px", borderRadius: 4 }}>{q.questionNumber}</span></td>
                            <td><span style={{ fontSize: 11, fontWeight: 700, color: "#475569", background: "#f1f5f9", padding: "2px 7px", borderRadius: 4 }}>{tm.badge}</span></td>
                            <td style={{ maxWidth: 240 }}><div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 600 }}>{q.subject}</div></td>
                            <td style={{ fontSize: 12 }}>{q.askedByMLA}</td>
                            <td style={{ fontSize: 12, color: "var(--sub)" }}>{q.ministry}</td>
                            <td style={{ fontSize: 12, color: "#D97706", fontWeight: 700 }}>{fmtDate(q.answerDueDate)}</td>
                            <td><Badge label={sm.label} color={sm.color} bg={sm.bg} /></td>
                            <td><button type="button" className="gov-btn gov-btn-outline gov-btn-sm" onClick={e => { e.stopPropagation(); setSelected(q) }}>Review</button></td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* LOG NEW TAB */}
          {activeTab === "new" && canWrite && (
            <div className="gov-card gov-card-p" style={{ maxWidth: 760 }}>
              <div className="gov-card-header">
                <div className="gov-card-title"><div className="gov-card-icon" style={{ background: "#eff6ff" }}><Plus size={15} color="#2F6FED" /></div>Log New Assembly Question</div>
              </div>
              <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Type toggle */}
                <div>
                  <label className="gov-label">Question Type *</label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                    {Object.entries(TYPE_META).map(([k, v]) => (
                      <button type="button" key={k} onClick={() => setNewForm(p => ({ ...p, questionType: k }))}
                        style={{ padding: "10px 8px", borderRadius: 9, border: `1px solid ${newForm.questionType === k ? "var(--blue)" : "var(--border)"}`, background: newForm.questionType === k ? "#eff6ff" : "var(--bg)", color: newForm.questionType === k ? "var(--blue)" : "var(--sub)", fontWeight: newForm.questionType === k ? 700 : 400, fontSize: 12, cursor: "pointer" }}>
                        {v.badge} — {v.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="gov-form-grid gov-form-grid-2">
                  <div><label className="gov-label">Session Name *</label><input required className="gov-input" value={newForm.sessionName} onChange={e => setNewForm(p => ({ ...p, sessionName: e.target.value }))} placeholder="e.g. Budget Session 2025" /></div>
                  <div><label className="gov-label">Ministry *</label><input required className="gov-input" value={newForm.ministry} onChange={e => setNewForm(p => ({ ...p, ministry: e.target.value }))} placeholder="e.g. Roads & Buildings" /></div>
                  <div><label className="gov-label">Asked by MLA *</label><input required className="gov-input" value={newForm.askedByMLA} onChange={e => setNewForm(p => ({ ...p, askedByMLA: e.target.value }))} placeholder="MLA full name" /></div>
                  <div><label className="gov-label">Constituency</label><input className="gov-input" value={newForm.askedByConstituency} onChange={e => setNewForm(p => ({ ...p, askedByConstituency: e.target.value }))} placeholder="e.g. Manthanani" /></div>
                  <div><label className="gov-label">Department</label><input className="gov-input" value={newForm.department} onChange={e => setNewForm(p => ({ ...p, department: e.target.value }))} placeholder="e.g. NH Division" /></div>
                  <div><label className="gov-label">Received Date</label><input type="date" className="gov-input" value={newForm.receivedDate} onChange={e => setNewForm(p => ({ ...p, receivedDate: e.target.value }))} /></div>
                  <div><label className="gov-label">Answer Due Date</label><input type="date" className="gov-input" value={newForm.answerDueDate} onChange={e => setNewForm(p => ({ ...p, answerDueDate: e.target.value }))} /></div>
                </div>

                <div><label className="gov-label">Subject *</label><input required className="gov-input" value={newForm.subject} onChange={e => setNewForm(p => ({ ...p, subject: e.target.value }))} placeholder="Brief subject of the question" /></div>
                <div><label className="gov-label">Question Text *</label><textarea required className="gov-textarea" rows={5} value={newForm.questionText} onChange={e => setNewForm(p => ({ ...p, questionText: e.target.value }))} placeholder="Full text of the assembly question..." /></div>

                {canPrivate && (
                  <div>
                    <label className="gov-label" style={{ color: "#b45309" }}><Lock size={12} style={{ display: "inline", marginRight: 4 }} />Private Notes (Minister & PA only)</label>
                    <textarea className="gov-textarea" rows={2} value={newForm.privateNotes} onChange={e => setNewForm(p => ({ ...p, privateNotes: e.target.value }))} style={{ background: "#fffbeb", borderColor: "#fde68a" }} />
                  </div>
                )}

                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <button type="button" onClick={() => setActiveTab("all")} className="gov-btn gov-btn-outline">Cancel</button>
                  <button type="submit" disabled={submitting} className="gov-btn gov-btn-primary"><Send size={14} />{submitting ? "Registering..." : "Register Question"}</button>
                </div>
              </form>
            </div>
          )}

        </div>
      </main>

      {selected && (
        <QuestionDrawer
          question={selected}
          role={role}
          submitting={submitting}
          onClose={() => setSelected(null)}
          onUpdate={handleUpdate}
        />
      )}

      {toast && (
        <div className="gov-toast" role="status">
          <CheckCircle2 size={16} color="var(--success)" />{toast}
        </div>
      )}
    </div>
  )
}
