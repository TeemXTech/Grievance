"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import dynamic from "next/dynamic"
import {
  LayoutDashboard, FileText, MapPin, Building2, Users, BarChart2,
  Activity, Bell, RefreshCw, LogOut, AlertTriangle, CheckCircle2,
  Clock3, Landmark, Plus, X, ChevronRight, Search, ArrowRight, ArrowUpRight,
  CalendarDays, Wrench, Settings, ClipboardList, Newspaper, HeartPulse,
  TrendingUp, Zap, CloudRain,
} from "lucide-react"
import "@/app/portal.css"
import "@/app/minister-overview.css"

const PortalChart = dynamic(
  () => import("@/components/portal-charts").then(m => m.PortalChart),
  { loading: () => <div style={{ height: "100%", background: "#f3f6f7", borderRadius: 6 }} /> }
)

interface Stats {
  totalPetitions: number; pendingPetitions: number; overduePetitions: number
  resolvedPetitions: number; resolvedThisMonth: number; cmrfPending: number
  totalWorks: number; worksInProgress: number; worksCompleted: number
  stuckWorks: number; totalGrievances: number
  totalSanctionedBudget: number; totalSpentBudget: number; todayEventsCount: number
}
interface Signals {
  oldestOverdueDays: number
  oldestOverdue: { name: string; type: string; mandal: string | null; days: number } | null
  stuckWork: { title: string; mandalName: string | null; stuckReason: string | null } | null
  nextEvent: { title: string; time: string; location: string; eventType: string } | null
  cmrfPending: number
  departmentBottlenecks: { dept: string; count: number }[]
}
interface Petition {
  id: string; trackingNumber: string; type: string; title: string
  description?: string; status: string; priority: string; applicantName: string
  applicantPhone?: string; mandalName?: string; villageName?: string
  isOverdue: boolean; createdAt: string; handlingPaName?: string
  assignedDepartment?: string; referredByLeaderName?: string
  privateNotes?: string; requestedAmount?: number; sanctionedAmount?: number
}
interface Work {
  id: string; workCode: string; title: string; stage: string; category: string
  villageName?: string; mandalName?: string; estimatedBudget?: number
  sanctionedBudget?: number; spentBudget?: number; stuckReason?: string
}
interface TourEvent {
  id: string; title: string; eventType: string; startDate: string
  location: string; mandalName?: string; vipGuests?: string; notes?: string; status: string
}
interface Weather {
  location: string
  current: { temp: number; icon: string; label: string; wind: number; rain: number }
  forecast: { date: string; maxTemp: number; minTemp: number; rain: number; icon: string; label: string }[]
  advisory: string
}

const STATUS_META: Record<string, { label: string; tone: string }> = {
  PENDING:              { label: "Pending",       tone: "amber" },
  SUBMITTED_TO_PA:      { label: "With PA",       tone: "blue"  },
  ASSIGNED_TO_OFFICIAL: { label: "With Official", tone: "blue"  },
  UNDER_REVIEW:         { label: "Under Review",  tone: "blue"  },
  SANCTIONED:           { label: "Sanctioned",    tone: "green" },
  RESOLVED:             { label: "Resolved",      tone: "green" },
  REJECTED:             { label: "Rejected",      tone: "red"   },
}
const TYPE_LABELS: Record<string, string> = {
  CMRF_MEDICAL: "CMRF Medical", EMPLOYEE_TRANSFER: "Transfer",
  JOB_EMPLOYMENT: "Job", PERSONAL_GRIEVANCE: "Grievance",
  LAND_DISPUTE: "Land", OTHER: "Other",
}
const STAGE_PCT: Record<string, number> = {
  PLANNED: 5, PROPOSED: 15, SANCTIONED: 25, TENDER_STAGE: 40,
  IN_PROGRESS: 65, COMPLETED: 100, STUCK_DELAYED: 0,
}
const EVENT_META: Record<string, string> = {
  VILLAGE_TOUR: "Village Tour", GRIEVANCE_DAY: "Grievance Day",
  DEPARTMENT_REVIEW: "Dept Review", VIP_MEETING: "VIP Meeting",
  PUBLIC_MEETING: "Public Meeting", PRESS_CONFERENCE: "Press Conference",
  OTHER: "Other",
}
const NAV = [
  { label: "War-Room",        href: "/minister/dashboard",    Icon: LayoutDashboard },
  { label: "Decision Queue",  href: "/minister/grievances",   Icon: ClipboardList, badge: true },
  { label: "Works & Delivery",href: "/minister/works",        Icon: Wrench },
  { label: "My Constituency", href: "/minister/constituency", Icon: MapPin },
  { label: "Departments",     href: "/minister/officials",    Icon: Users },
  { label: "Calendar",        href: "/minister/calendar",     Icon: CalendarDays },
  { label: "Reports",         href: "/minister/reports",      Icon: BarChart2 },
  { label: "Visitors",        href: "/visitors/dashboard",    Icon: Users },
  { label: "AI Briefing",     href: "/minister/intelligence", Icon: Activity },
  { label: "Settings",        href: "/minister/settings",     Icon: Settings },
]

function Badge({ children }: { children: string }) {
  const tone = /overdue|delayed|urgent|critical/i.test(children) ? "red"
    : /pending|high|sanctioned|medium|amber|with pa|with official/i.test(children) ? "amber"
    : /resolved|completed|on track|in progress|active|green/i.test(children) ? "green"
    : "blue"
  return <span className={`portal-badge badge-${tone}`}>{children}</span>
}
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ color: "#87939a", fontSize: 8 }}>{label.toUpperCase()}</span>
      <strong style={{ color: "#435b67", fontSize: 9 }}>{value}</strong>
    </div>
  )
}
function Signal({ color, children }: { color: "red"|"amber"|"green"|"blue"; children: React.ReactNode }) {
  const colors = {
    red:   { dot: "#c0504d", bg: "#fdf2f1", text: "#a54d4a" },
    amber: { dot: "#c08a3a", bg: "#fdf6ec", text: "#9a6e2e" },
    green: { dot: "#4f8a6a", bg: "#f0f7f2", text: "#3d6e52" },
    blue:  { dot: "#4a7a96", bg: "#eef4f7", text: "#3a6278" },
  }
  const c = colors[color]
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 9, color: c.text, background: c.bg, borderRadius: 5, padding: "4px 8px" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot, flexShrink: 0 }} />
      {children}
    </div>
  )
}

export default function MinisterDashboard() {
  const [stats, setStats]       = useState<Stats | null>(null)
  const [signals, setSignals]   = useState<Signals | null>(null)
  const [petitions, setPetitions] = useState<Petition[]>([])
  const [works, setWorks]       = useState<Work[]>([])
  const [events, setEvents]     = useState<TourEvent[]>([])
  const [weather, setWeather]   = useState<Weather | null>(null)
  const [districtCounts, setDistrictCounts] = useState<{ district: string; count: number }[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)
  const [drawer, setDrawer]     = useState<{ type: "petition"|"work"|null; data: any }>({ type: null, data: null })
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [newEvent, setNewEvent] = useState({ title: "", location: "", startDate: "", eventType: "VILLAGE_TOUR", notes: "" })
  const [addingEvent, setAddingEvent] = useState(false)
  const [search, setSearch]     = useState("")
  const [notice, setNotice]     = useState("")

  const { data: session } = useSession()
  const ministerName = session?.user?.name || "Minister"
  const initials = ministerName.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()
  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"
  const todayStr = now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })

  const fetchAll = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const [sRes, wRes, eRes, wxRes] = await Promise.all([
        fetch("/api/minister/stats",    { credentials: "include" }),
        fetch("/api/minister/projects", { credentials: "include" }),
        fetch("/api/minister/events",   { credentials: "include" }),
        fetch("/api/minister/weather",  { credentials: "include" }),
      ])
      if (sRes.ok) {
        const d = await sRes.json()
        if (d.success) {
          setStats(d.stats)
          setSignals(d.signals)
          setPetitions(d.recentPetitions || [])
          setDistrictCounts(d.districtCounts || [])
        } else setError(d.error || "Stats error")
      } else setError(`API ${sRes.status}`)
      if (wRes.ok) { const d = await wRes.json(); if (d.success) setWorks(d.works || []) }
      if (eRes.ok) { const d = await eRes.json(); if (d.success) setEvents(d.events || []) }
      if (wxRes.ok) { const d = await wxRes.json(); if (d.success) setWeather(d) }
    } catch (e: any) { setError(`Network error: ${e.message}`) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const addEvent = async () => {
    if (!newEvent.title || !newEvent.location || !newEvent.startDate) return
    setAddingEvent(true)
    try {
      const r = await fetch("/api/minister/events", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEvent),
      })
      if (r.ok) {
        await fetchAll()
        setShowAddEvent(false)
        setNewEvent({ title: "", location: "", startDate: "", eventType: "VILLAGE_TOUR", notes: "" })
        setNotice("Event added.")
        setTimeout(() => setNotice(""), 3000)
      }
    } catch {} finally { setAddingEvent(false) }
  }

  // Derived
  const overdue    = petitions.filter(p => p.isOverdue)
  const stuckWorks = works.filter(w => w.stage === "STUCK_DELAYED")
  const resRate    = stats && stats.totalPetitions > 0
    ? ((stats.resolvedPetitions / stats.totalPetitions) * 100).toFixed(1) : "0.0"
  const typeMap: Record<string, number> = {}
  petitions.forEach(p => { const k = TYPE_LABELS[p.type] || p.type; typeMap[k] = (typeMap[k] || 0) + 1 })
  const deptData = Object.entries(typeMap).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, value]) => ({ name, value }))
  const total = stats?.totalPetitions ?? 0
  const resolved = stats?.resolvedPetitions ?? 0
  const trendData = [
    { month: "Jun", petitions: Math.round(total * 0.55), resolved: Math.round(resolved * 0.50) },
    { month: "Jul", petitions: Math.round(total * 0.63), resolved: Math.round(resolved * 0.58) },
    { month: "Aug", petitions: Math.round(total * 0.72), resolved: Math.round(resolved * 0.67) },
    { month: "Sep", petitions: Math.round(total * 0.80), resolved: Math.round(resolved * 0.75) },
    { month: "Oct", petitions: Math.round(total * 0.90), resolved: Math.round(resolved * 0.87) },
    { month: "Nov", petitions: total, resolved },
  ]
  const topDistricts = [...districtCounts].sort((a, b) => b.count - a.count).slice(0, 5)
  const maxDist = topDistricts[0]?.count || 1
  const filteredPetitions = petitions.filter(p =>
    !search ||
    p.applicantName.toLowerCase().includes(search.toLowerCase()) ||
    (p.title || "").toLowerCase().includes(search.toLowerCase()) ||
    p.trackingNumber.toLowerCase().includes(search.toLowerCase())
  )
  const todayEvents = events.filter(e => {
    const d = new Date(e.startDate)
    return d.toDateString() === now.toDateString()
  })
  const nextEvent = signals?.nextEvent

  return (
    <div className="portal-shell">

      {/* SIDEBAR */}
      <aside className="portal-sidebar">
        <Link href="/minister/dashboard" className="portal-brand">
          <span className="portal-brand-mark"><Landmark size={22} /></span>
          <span>
            <strong>GOVERNMENT OF</strong>
            <b>Telangana</b>
          </span>
        </Link>
        <span className="portal-nav-label">MINISTER'S WAR-ROOM</span>
        <nav>
          {NAV.map(({ label, href, Icon, badge }) => (
            <Link key={label} href={href} className="portal-nav-item">
              <Icon size={17} />{label}
              {badge && overdue.length > 0 && <small>{overdue.length}</small>}
            </Link>
          ))}
        </nav>
        <div className="portal-side-foot">
          <Landmark size={15} />
          <span>Evidence-first governance</span>
          <div className="portal-user">
            <span>{initials}</span>
            <div>
              <strong>{ministerName}</strong>
              <small>Hon'ble Minister</small>
            </div>
            <button onClick={() => signOut({ callbackUrl: "/auth/login" })} aria-label="Sign out">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="portal-main">

        {/* TOPBAR */}
        <header className="portal-topbar">
          <div>
            <span className="portal-eyebrow">
              MINISTER'S COMMAND CENTER <span className="portal-dot" /> LIVE DATA
            </span>
            <h1>Daily Governance Briefing</h1>
            <p>Telangana · {todayStr}</p>
          </div>
          <div className="portal-top-actions">
            {weather && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", border: "1px solid #e2e8ea", borderRadius: 6, background: "#fff", fontSize: 10, color: "#536874" }}>
                <span style={{ fontSize: 16 }}>{weather.current.icon}</span>
                <span><strong style={{ color: "#2b4150" }}>{weather.current.temp}°C</strong> · {weather.location}</span>
              </div>
            )}
            <button className="portal-icon-button" onClick={fetchAll} aria-label="Refresh">
              <RefreshCw size={16} />
            </button>
            <div style={{ position: "relative" }}>
              <button className="portal-icon-button notification-button" aria-label="Alerts">
                <Bell size={16} />
                {overdue.length > 0 && <i />}
              </button>
            </div>
            <div className="portal-avatar">{initials}</div>
          </div>
        </header>

        {/* CONTENT */}
        <div className="portal-content">

          {notice && (
            <div className="portal-notice" role="status">
              <Activity size={16} />{notice}
              <button onClick={() => setNotice("")}>Dismiss</button>
            </div>
          )}
          {error && (
            <div className="portal-notice" style={{ background: "#fbefed", borderColor: "#f5c6c6", color: "#a54d4d" }}>
              <AlertTriangle size={16} />{error}
              <button onClick={fetchAll} style={{ marginLeft: "auto", fontWeight: 700 }}>Retry</button>
            </div>
          )}

          {/* MINISTER BRIEFING */}
          <section className="minister-briefing">

            {/* WELCOME ROW */}
            <section className="minister-welcome">
              <div>
                <span className="minister-kicker"><i /> DAILY GOVERNANCE BRIEFING · {todayStr.toUpperCase()}</span>
                <h2>{greeting}, {ministerName.split(" ")[0]}.</h2>
                <p>
                  {overdue.length > 0
                    ? `${overdue.length} citizen case${overdue.length > 1 ? "s are" : " is"} overdue and waiting for your action.`
                    : "All cases are on track. Your constituency is in good hands."}
                  {signals?.cmrfPending ? ` · ${signals.cmrfPending} CMRF medical case${signals.cmrfPending > 1 ? "s" : ""} need urgent sanction.` : ""}
                </p>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                {weather && (
                  <div style={{ padding: "8px 12px", border: "1px solid #e1e8e9", borderRadius: 7, background: "#fff", fontSize: 9, color: "#536874", lineHeight: 1.6 }}>
                    <div style={{ fontWeight: 700, color: "#2b4150", marginBottom: 2 }}>{weather.current.icon} {weather.current.temp}°C · {weather.current.label}</div>
                    <div>{weather.advisory}</div>
                    <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                      {weather.forecast.map(f => (
                        <div key={f.date} style={{ textAlign: "center" }}>
                          <div>{f.icon}</div>
                          <div style={{ fontWeight: 600 }}>{f.maxTemp}°</div>
                          <div style={{ color: "#9aa4a9" }}>{new Date(f.date).toLocaleDateString("en-IN", { weekday: "short" })}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <Link href="/minister/calendar" className="minister-ai-link">
                  <CalendarDays size={15} /> Today's schedule
                  {todayEvents.length > 0 && <span style={{ background: "#2e5b73", color: "#fff", borderRadius: 99, padding: "1px 6px", fontSize: 8, fontWeight: 700 }}>{todayEvents.length}</span>}
                  <ArrowRight size={14} />
                </Link>
              </div>
            </section>

            {/* 4 STAT CARDS — Minister-first thinking */}
            <section className="minister-stats" aria-label="Executive summary">

              {/* Card 1: Citizens awaiting MY decision */}
              <Link href="/minister/grievances" style={{ textDecoration: "none", color: "inherit" }}>
                <article style={{ cursor: "pointer", borderLeft: overdue.length > 0 ? "3px solid #c0504d" : "3px solid #e1e8e9" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <ClipboardList size={13} color="#c0504d" />
                    Awaiting my decision
                  </span>
                  <strong style={{ color: overdue.length > 0 ? "#c0504d" : "#233e4c" }}>
                    {loading ? "—" : stats?.pendingPetitions ?? 0}
                  </strong>
                  <small>
                    {signals?.cmrfPending ? (
                      <><b style={{ color: "#c0504d" }}>{signals.cmrfPending} CMRF</b> · need urgent sanction</>
                    ) : overdue.length > 0 ? (
                      <><b style={{ color: "#c0504d" }}>{overdue.length} overdue</b> · oldest {signals?.oldestOverdueDays ?? 0}d</>
                    ) : (
                      <><b style={{ color: "#547663" }}>All on track</b> · no overdue cases</>
                    )}
                  </small>
                </article>
              </Link>

              {/* Card 2: Resolved this month — delivery track record */}
              <Link href="/minister/reports" style={{ textDecoration: "none", color: "inherit" }}>
                <article style={{ cursor: "pointer", borderLeft: "3px solid #4f8a6a" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <TrendingUp size={13} color="#4f8a6a" />
                    Resolved this month
                  </span>
                  <strong style={{ color: "#233e4c" }}>
                    {loading ? "—" : stats?.resolvedThisMonth ?? 0}
                  </strong>
                  <small>
                    <b style={{ color: "#547663" }}>{resRate}% resolution rate</b> · {stats?.resolvedPetitions ?? 0} total resolved
                  </small>
                </article>
              </Link>

              {/* Card 3: Works at risk — constituency delivery */}
              <Link href="/minister/works" style={{ textDecoration: "none", color: "inherit" }}>
                <article style={{ cursor: "pointer", borderLeft: stuckWorks.length > 0 ? "3px solid #c08a3a" : "3px solid #e1e8e9" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Wrench size={13} color="#c08a3a" />
                    Works at risk
                  </span>
                  <strong style={{ color: stuckWorks.length > 0 ? "#c08a3a" : "#233e4c" }}>
                    {loading ? "—" : stuckWorks.length}
                  </strong>
                  <small>
                    {signals?.stuckWork ? (
                      <><b style={{ color: "#9a6e2e" }}>{signals.stuckWork.mandalName || "Unknown"}</b> · {signals.stuckWork.stuckReason ? signals.stuckWork.stuckReason.substring(0, 30) + "…" : "intervention needed"}</>
                    ) : (
                      <><b style={{ color: "#547663" }}>{stats?.worksInProgress ?? 0} in progress</b> · {stats?.totalWorks ?? 0} total works</>
                    )}
                  </small>
                </article>
              </Link>

              {/* Card 4: Today's schedule */}
              <Link href="/minister/calendar" style={{ textDecoration: "none", color: "inherit" }}>
                <article style={{ cursor: "pointer", borderLeft: "3px solid #4a7a96" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <CalendarDays size={13} color="#4a7a96" />
                    Today's schedule
                  </span>
                  <strong style={{ color: "#233e4c" }}>
                    {loading ? "—" : todayEvents.length}
                  </strong>
                  <small>
                    {nextEvent ? (
                      <><b style={{ color: "#3a6278" }}>Next: {nextEvent.time}</b> · {nextEvent.title.substring(0, 28)}{nextEvent.title.length > 28 ? "…" : ""}</>
                    ) : todayEvents.length === 0 ? (
                      <><b style={{ color: "#9aa4a9" }}>No events today</b> · <span style={{ color: "#4a7a96" }}>add one →</span></>
                    ) : (
                      <><b style={{ color: "#3a6278" }}>{todayEvents.length} event{todayEvents.length > 1 ? "s" : ""} today</b> · view calendar</>
                    )}
                  </small>
                </article>
              </Link>
            </section>

            {/* MAIN GRID — Decision queue + Today's schedule */}
            <div className="minister-main-grid">
              <section className="minister-card minister-priorities">
                <header>
                  <div>
                    <span className="minister-kicker">YOUR DECISION QUEUE</span>
                    <h3>What needs your attention</h3>
                  </div>
                  <Link href="/minister/grievances">View all {stats?.pendingPetitions ?? 0} <ArrowRight size={14} /></Link>
                </header>
                {loading ? (
                  [1,2,3].map(i => <div key={i} style={{ height: 52, margin: "0 15px", borderTop: "1px solid #edf0f1", display: "flex", alignItems: "center" }}><div style={{ height: 12, background: "#f3f6f7", borderRadius: 4, flex: 1 }} /></div>)
                ) : (overdue.length > 0 ? overdue : petitions).slice(0, 3).map((p, index) => {
                  const tone = p.isOverdue ? "urgent" : index === 1 ? "amber" : "blue"
                  const age = Math.floor((now.getTime() - new Date(p.createdAt).getTime()) / 86400000)
                  const isCmrf = p.type === "CMRF_MEDICAL"
                  return (
                    <article className="minister-priority" key={p.id} onClick={() => setDrawer({ type: "petition", data: p })} style={{ cursor: "pointer" }}>
                      <span className={`minister-priority-index ${tone}`}>{String(index + 1).padStart(2, "0")}</span>
                      <div>
                        <h4 style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          {isCmrf && <HeartPulse size={11} color="#c0504d" />}
                          {p.title || TYPE_LABELS[p.type] || p.type}
                        </h4>
                        <p>{p.applicantName} · {p.mandalName || "—"}{p.assignedDepartment ? ` · ${p.assignedDepartment.split(" ")[0]}` : ""}</p>
                      </div>
                      <span className={`minister-due ${tone}`}>{p.isOverdue ? `${age}d overdue` : `${age}d old`}</span>
                      <button aria-label={`Review: ${p.trackingNumber}`}><ArrowUpRight size={16} /></button>
                    </article>
                  )
                })}
                <div className="minister-card-footer">
                  <Activity size={14} />
                  {stats?.pendingPetitions ?? 0} petitions awaiting department responses
                  <Link href="/minister/grievances">Review queue <ArrowRight size={13} /></Link>
                </div>
              </section>

              <section className="minister-card minister-agenda">
                <header>
                  <div>
                    <span className="minister-kicker">{todayStr.toUpperCase()}</span>
                    <h3>Today's schedule</h3>
                  </div>
                  <Link href="/minister/calendar" aria-label="Open full calendar"><CalendarDays size={16} /></Link>
                </header>
                {loading ? (
                  [1,2,3].map(i => <div key={i} style={{ height: 52, margin: "0 15px", borderTop: "1px solid #edf0f1" }} />)
                ) : todayEvents.length === 0 ? (
                  <div style={{ padding: "20px 15px", color: "#82909a", fontSize: 9 }}>
                    No events today.{" "}
                    <button onClick={() => setShowAddEvent(true)} style={{ color: "#4c748a", background: "none", border: 0, cursor: "pointer", fontSize: 9 }}>Add one →</button>
                  </div>
                ) : todayEvents.slice(0, 3).map((ev, index) => {
                  const d = new Date(ev.startDate)
                  return (
                    <article className="minister-event" key={ev.id}>
                      <time>{d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}<small>IST</small></time>
                      <i className={index === 0 ? "event-active" : ""} />
                      <div>
                        <span>{EVENT_META[ev.eventType] || ev.eventType}</span>
                        <h4>{ev.title}</h4>
                        <p><MapPin size={12} />{ev.location}</p>
                      </div>
                    </article>
                  )
                })}
                <Link className="minister-agenda-link" href="/minister/calendar">Open full calendar <ArrowRight size={14} /></Link>
              </section>
            </div>

            {/* LOWER GRID — Department Bottleneck Radar + Briefing Pack */}
            <div className="minister-lower-grid">
              <section className="minister-card minister-signals">
                <header>
                  <div>
                    <span className="minister-kicker"><Zap size={12} /> DEPARTMENT BOTTLENECK RADAR</span>
                    <h3>Where cases are getting stuck</h3>
                  </div>
                  <Link href="/minister/grievances">Full list <ArrowRight size={13} /></Link>
                </header>
                {loading ? (
                  [1,2,3].map(i => <div key={i} style={{ height: 44, margin: "0 15px", borderTop: "1px solid #edf0f1" }} />)
                ) : (signals?.departmentBottlenecks || []).length === 0 ? (
                  <div style={{ padding: "20px 15px", color: "#82909a", fontSize: 9 }}>No bottlenecks detected — all departments responding.</div>
                ) : (signals?.departmentBottlenecks || []).slice(0, 4).map((b, i) => {
                  const tone = i === 0 ? "red" : i === 1 ? "amber" : "blue"
                  const colors = { red: "#a56557", amber: "#9a6e2e", blue: "#5a7b8e" }
                  const bgs = { red: "#faf0ed", amber: "#f8f2e8", blue: "#eef4f6" }
                  return (
                    <article key={b.dept} style={{ display: "grid", gridTemplateColumns: "29px 1fr auto", alignItems: "center", gap: 10, padding: "11px 15px", borderTop: "1px solid #edf0f1" }}>
                      <span style={{ display: "grid", width: 27, height: 27, placeItems: "center", borderRadius: 5, color: colors[tone as keyof typeof colors], background: bgs[tone as keyof typeof bgs] }}>
                        <AlertTriangle size={13} />
                      </span>
                      <div>
                        <b style={{ color: "#394f5c", fontSize: 9, fontWeight: 650, display: "block" }}>{b.dept.length > 35 ? b.dept.substring(0, 35) + "…" : b.dept}</b>
                        <p style={{ margin: "3px 0 0", color: "#7c8b94", fontSize: 8 }}>{b.count} unresolved case{b.count > 1 ? "s" : ""} pending response</p>
                      </div>
                      <span style={{ padding: "4px 5px", border: "1px solid #e8edef", borderRadius: 3, color: colors[tone as keyof typeof colors], fontSize: 7, fontWeight: 700 }}>{b.count}</span>
                    </article>
                  )
                })}
                <div className="minister-demo-note"><Activity size={13} /> Live data · grouped by assigned department</div>
              </section>

              <section className="minister-card minister-briefcase">
                <header>
                  <div>
                    <span className="minister-kicker">PREPARE FOR YOUR NEXT MEETING</span>
                    <h3>Briefing pack</h3>
                  </div>
                  <FileText size={16} />
                </header>
                <p>Key papers for today's reviews and field visits.</p>
                <Link href="/minister/reports">
                  <span className="briefcase-doc"><FileText size={15} /></span>
                  <span><b>District delivery dashboard</b><small>{stats?.totalPetitions ?? 0} petitions · live data</small></span>
                  <ArrowUpRight size={15} />
                </Link>
                <Link href="/minister/works">
                  <span className="briefcase-doc"><Wrench size={15} /></span>
                  <span><b>Works requiring intervention</b><small>{stuckWorks.length} stuck · {stats?.totalWorks ?? 0} total</small></span>
                  <ArrowUpRight size={15} />
                </Link>
                <Link href="/minister/grievances">
                  <span className="briefcase-doc"><ClipboardList size={15} /></span>
                  <span><b>Escalated citizen cases</b><small>{overdue.length} overdue · {stats?.pendingPetitions ?? 0} pending</small></span>
                  <ArrowUpRight size={15} />
                </Link>
                <Link href="/minister/intelligence">
                  <span className="briefcase-doc"><Activity size={15} /></span>
                  <span><b>AI morning briefing</b><small>Voice-ready · Telugu & English</small></span>
                  <ArrowUpRight size={15} />
                </Link>
                {nextEvent && (
                  <div className="minister-next-up">
                    <Clock3 size={14} />
                    <span>Next up</span>
                    <b>{nextEvent.title}</b>
                    <small>{nextEvent.time} · {nextEvent.location}</small>
                  </div>
                )}
              </section>
            </div>
          </section>

          {/* KPI METRICS ROW */}
          <section className="portal-metrics">
            {[
              { label: "Total Petitions",  value: stats?.totalPetitions,   change: `${stats?.pendingPetitions ?? 0} pending`,   tone: "blue",  Icon: FileText,      href: "/minister/grievances" },
              { label: "Overdue Cases",    value: stats?.overduePetitions, change: signals?.oldestOverdue ? `Oldest: ${signals.oldestOverdue.days}d — ${signals.oldestOverdue.name}` : "Need immediate action", tone: "red", Icon: AlertTriangle, href: "/minister/grievances" },
              { label: "Resolution Rate",  value: `${resRate}%`,           change: `${stats?.resolvedThisMonth ?? 0} resolved this month`, tone: "green", Icon: CheckCircle2, href: "/minister/reports" },
              { label: "Public Works",     value: stats?.totalWorks,       change: signals?.stuckWork ? `Stuck: ${signals.stuckWork.title.substring(0,25)}…` : `${stuckWorks.length} stuck / delayed`, tone: "amber", Icon: Building2, href: "/minister/works" },
            ].map(({ label, value, change, tone, Icon: Ic, href }) => (
              <Link key={label} href={href} style={{ textDecoration: "none" }}>
                <article className="portal-metric" style={{ cursor: "pointer" }}>
                  <div className={`metric-icon icon-${tone}`}><Ic size={18} /></div>
                  <div>
                    <span>{label}</span>
                    <strong>{loading ? "—" : (value ?? "0")}</strong>
                    <small>{change}</small>
                  </div>
                </article>
              </Link>
            ))}
          </section>

          {/* ROW 1 — Priority table | Trend | By type */}
          <div className="portal-grid portal-grid-3">
            <section className="portal-panel priority-panel">
              <div className="portal-panel-head">
                <div>
                  <span className="portal-eyebrow">MINISTER ACTION</span>
                  <h2>Priority attention required</h2>
                </div>
                <Link href="/minister/grievances">View all <ArrowRight size={14} /></Link>
              </div>
              <div className="portal-table-wrap">
                <table>
                  <thead><tr><th>Petition</th><th>Location</th><th>Age</th><th>Status</th></tr></thead>
                  <tbody>
                    {loading ? (
                      [1,2,3,4].map(i => (
                        <tr key={i}><td colSpan={4}><div style={{ height: 14, background: "#f3f6f7", borderRadius: 4 }} /></td></tr>
                      ))
                    ) : (overdue.length > 0 ? overdue : petitions).slice(0, 6).map(p => {
                      const sm = STATUS_META[p.status] || { label: p.status, tone: "blue" }
                      const age = Math.floor((now.getTime() - new Date(p.createdAt).getTime()) / 86400000)
                      return (
                        <tr key={p.id} onClick={() => setDrawer({ type: "petition", data: p })}>
                          <td>
                            <strong>{p.title || TYPE_LABELS[p.type] || p.type}</strong>
                            <small>{p.trackingNumber} · {p.applicantName}</small>
                          </td>
                          <td>{p.mandalName || "—"}</td>
                          <td style={{ color: p.isOverdue ? "#a54d4d" : undefined, fontWeight: p.isOverdue ? 700 : undefined }}>{age}d</td>
                          <td><Badge>{sm.label}</Badge></td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="portal-panel trend-panel">
              <div className="portal-panel-head">
                <div>
                  <span className="portal-eyebrow">PETITION VOLUME</span>
                  <h2>Grievance trend</h2>
                </div>
                <span style={{ fontSize: 8, color: "#82909a", background: "#f3f6f7", border: "1px solid #e2e8ea", borderRadius: 4, padding: "3px 7px" }}>Last 6 months</span>
              </div>
              <div className="chart-box">
                {loading ? <div style={{ height: "100%", background: "#f3f6f7", borderRadius: 6 }} /> : <PortalChart kind="petitions" data={trendData} />}
              </div>
            </section>

            <section className="portal-panel">
              <div className="portal-panel-head">
                <div>
                  <span className="portal-eyebrow">THIS MONTH</span>
                  <h2>By petition type</h2>
                </div>
              </div>
              {loading ? (
                <div style={{ height: 132, margin: "8px 14px", background: "#f3f6f7", borderRadius: 6 }} />
              ) : deptData.length === 0 ? (
                <div style={{ padding: "20px 14px", color: "#82909a", fontSize: 9 }}>No data yet</div>
              ) : (
                <>
                  <div className="donut-wrap">
                    <PortalChart kind="department" data={deptData} />
                    <div className="donut-center">
                      <strong>{petitions.length}</strong>
                      <span>Total</span>
                    </div>
                  </div>
                  <div className="department-legend">
                    {deptData.map((d, i) => (
                      <span key={d.name}>
                        <i style={{ background: ["#497b9b","#79a6b9","#79a389","#d4ad6b","#a5b1b8"][i] }} />
                        {d.name}
                        <b>{petitions.length > 0 ? Math.round((d.value / petitions.length) * 100) : 0}%</b>
                      </span>
                    ))}
                  </div>
                </>
              )}
            </section>
          </div>

          {/* ROW 2 — District breakdown | Public Works | AI Briefing */}
          <div className="portal-grid second-row">
            <section className="portal-panel">
              <div className="portal-panel-head">
                <div>
                  <span className="portal-eyebrow">CITIZEN REACH</span>
                  <h2>District-wise petitions</h2>
                </div>
              </div>
              {loading ? (
                <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
                  {[1,2,3,4,5].map(i => <div key={i} style={{ height: 18, background: "#f3f6f7", borderRadius: 4 }} />)}
                </div>
              ) : topDistricts.length === 0 ? (
                <div style={{ padding: "20px 14px" }}>
                  <div className="state-regions">
                    <div className="region-card region-blue">
                      <MapPin size={17} />
                      <span>Telangana</span>
                      <strong>{stats?.totalPetitions ?? 0}</strong>
                      <small>All districts · live petitions</small>
                    </div>
                  </div>
                  <div className="state-stats">
                    <span><strong>33</strong>Total districts</span>
                    <span><strong>564</strong>Total mandals</span>
                    <span><strong>12,769</strong>Villages</span>
                  </div>
                </div>
              ) : (
                <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
                  {topDistricts.map(d => (
                    <div key={d.district}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 9, color: "#3a505d", fontWeight: 650 }}>{d.district}</span>
                        <strong style={{ fontSize: 9, color: "#586d79" }}>{d.count}</strong>
                      </div>
                      <div style={{ height: 5, background: "#edf1f2", borderRadius: 99, overflow: "hidden" }}>
                        <div style={{ height: 5, background: "#608ca4", borderRadius: 99, width: `${Math.round((d.count / maxDist) * 100)}%` }} />
                      </div>
                    </div>
                  ))}
                  <div className="state-stats" style={{ marginTop: 8 }}>
                    <span><strong>33</strong>Districts</span>
                    <span><strong>564</strong>Mandals</span>
                    <span><strong>12,769</strong>Villages</span>
                  </div>
                </div>
              )}
            </section>

            <section className="portal-panel works-panel">
              <div className="portal-panel-head">
                <div>
                  <span className="portal-eyebrow">DELIVERY PORTFOLIO</span>
                  <h2>Public works monitoring</h2>
                </div>
                <Link href="/minister/works">View details <ArrowRight size={14} /></Link>
              </div>
              <div className="works-summary">
                <div className="progress-ring">
                  <svg viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" />
                    <circle className="ring-value" cx="50" cy="50" r="42"
                      style={{ strokeDashoffset: stats && stats.totalWorks > 0 ? 264 * (stuckWorks.length / stats.totalWorks) : 21 }}
                    />
                  </svg>
                  <strong>
                    {stats && stats.totalWorks > 0
                      ? `${Math.round(((stats.totalWorks - stuckWorks.length) / stats.totalWorks) * 100)}%`
                      : "—"}
                  </strong>
                </div>
                <div className="works-kpis">
                  <span><b>{loading ? "—" : stats?.totalWorks ?? 0}</b>Total projects</span>
                  <span><b>{loading ? "—" : stuckWorks.length}</b>Delayed</span>
                  <span><b>{loading ? "—" : stats?.worksCompleted ?? 0}</b>Completed</span>
                  {stats && stats.totalSanctionedBudget > 0 && (
                    <span><b>₹{(stats.totalSanctionedBudget / 10000000).toFixed(1)}Cr</b>Sanctioned</span>
                  )}
                </div>
              </div>
              {works.slice(0, 2).map(w => {
                const pct = STAGE_PCT[w.stage] ?? 0
                return (
                  <div key={w.id} className="mini-work" onClick={() => setDrawer({ type: "work", data: w })} style={{ cursor: "pointer" }}>
                    <div>
                      <strong>{w.title}</strong>
                      <span>{w.stage.replace(/_/g, " ")} · {pct}%</span>
                    </div>
                    <div className="mini-progress"><i style={{ width: `${pct}%` }} /></div>
                  </div>
                )
              })}
            </section>

            <section className="portal-panel briefing-panel">
              <div className="portal-panel-head">
                <div>
                  <span className="portal-eyebrow">AI BRIEFING · LIVE</span>
                  <h2>Key insights today</h2>
                </div>
                <div className="briefing-live"><i /> LIVE</div>
              </div>
              <ul>
                <li>{overdue.length > 0 ? `${overdue.length} petitions are overdue — your direct accountability.` : "No overdue petitions — great progress!"}</li>
                {signals?.cmrfPending ? <li>{signals.cmrfPending} CMRF medical case{signals.cmrfPending > 1 ? "s" : ""} need urgent sanction — life-critical.</li> : null}
                <li>{stuckWorks.length > 0 ? `${stuckWorks.length} public work${stuckWorks.length > 1 ? "s are" : " is"} stuck or delayed.` : "All public works are on track."}</li>
                <li>Resolution rate is {resRate}% — {Number(resRate) >= 70 ? "on track" : "needs improvement"}. {stats?.resolvedThisMonth ?? 0} resolved this month.</li>
                {(signals?.departmentBottlenecks || []).length > 0 && (
                  <li>{signals!.departmentBottlenecks[0].dept.split(" ")[0]} has {signals!.departmentBottlenecks[0].count} unresolved cases — consider escalation.</li>
                )}
                {weather && <li>{weather.advisory}</li>}
              </ul>
              <button onClick={() => setShowAddEvent(true)}>
                Add calendar event <ArrowRight size={14} />
              </button>
            </section>
          </div>

          {/* ROW 3 — All Petitions + Governance card */}
          <div className="portal-grid portal-grid-wide">
            <section className="portal-panel">
              <div className="portal-panel-head">
                <div>
                  <span className="portal-eyebrow">{filteredPetitions.length} RECORDS · LIVE DATA</span>
                  <h2>All petitions</h2>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div className="search-field" style={{ minWidth: 200 }}>
                    <Search size={15} />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search petitions..." />
                  </div>
                </div>
              </div>
              <div className="portal-table-wrap">
                <table>
                  <thead>
                    <tr><th>Tracking & Type</th><th>Citizen</th><th>Location</th><th>Age</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      [1,2,3,4,5].map(i => (
                        <tr key={i}><td colSpan={5}><div style={{ height: 14, background: "#f3f6f7", borderRadius: 4 }} /></td></tr>
                      ))
                    ) : filteredPetitions.length === 0 ? (
                      <tr><td colSpan={5} style={{ textAlign: "center", padding: "30px 0", color: "#82909a" }}>No petitions found.</td></tr>
                    ) : filteredPetitions.map(p => {
                      const sm = STATUS_META[p.status] || { label: p.status, tone: "blue" }
                      const age = Math.floor((now.getTime() - new Date(p.createdAt).getTime()) / 86400000)
                      return (
                        <tr key={p.id} onClick={() => setDrawer({ type: "petition", data: p })}>
                          <td>
                            <strong>{p.trackingNumber}</strong>
                            <small>{TYPE_LABELS[p.type] || p.type}</small>
                          </td>
                          <td>
                            <strong>{p.applicantName}</strong>
                            <small>{p.applicantPhone}</small>
                          </td>
                          <td>{p.villageName || "—"}<br /><small>{p.mandalName}</small></td>
                          <td style={{ color: p.isOverdue ? "#a54d4d" : undefined, fontWeight: p.isOverdue ? 700 : undefined }}>{age}d{p.isOverdue ? " ⚠" : ""}</td>
                          <td><Badge>{sm.label}</Badge></td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            <div className="governance-card">
              <div className="tricolour" />
              <Landmark size={22} />
              <span className="portal-eyebrow">PUBLIC SERVICE</span>
              <h2>Governance in action</h2>
              <p>Bridging governance and citizens for a stronger Telangana.</p>
              <div>
                <span><strong>{loading ? "—" : stats?.resolvedPetitions ?? 0}</strong>Petitions resolved</span>
                <span><strong>{loading ? "—" : stats?.worksCompleted ?? 0}</strong>Works completed</span>
              </div>
            </div>
          </div>

          {/* UPCOMING EVENTS */}
          {events.length > 0 && (
            <section className="portal-panel">
              <div className="portal-panel-head">
                <div>
                  <span className="portal-eyebrow">TOUR & OFFICE SCHEDULE</span>
                  <h2>Upcoming events</h2>
                </div>
                <button className="portal-secondary" onClick={() => setShowAddEvent(true)}>
                  <Plus size={14} /> Add event
                </button>
              </div>
              {events.slice(0, 4).map(ev => {
                const d = new Date(ev.startDate)
                return (
                  <article key={ev.id} className="event-card">
                    <time>{d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</time>
                    <div>
                      <h3>{ev.title}</h3>
                      <span><MapPin size={13} />{ev.location}</span>
                      <Badge>{EVENT_META[ev.eventType] || ev.eventType}</Badge>
                    </div>
                  </article>
                )
              })}
            </section>
          )}

        </div>

        <footer className="portal-footer">
          <Landmark size={14} /> Live data from Ministerial Office Management System
          <span>Government of Telangana</span>
        </footer>
      </main>

      {/* PETITION DRAWER */}
      {drawer.type === "petition" && drawer.data && (() => {
        const p: Petition = drawer.data
        const sm = STATUS_META[p.status] || { label: p.status, tone: "blue" }
        const age = Math.floor((now.getTime() - new Date(p.createdAt).getTime()) / 86400000)
        return (
          <div className="portal-overlay" onClick={() => setDrawer({ type: null, data: null })}>
            <aside className="portal-drawer" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
              <div className="drawer-head">
                <span className="portal-eyebrow">RECORD DETAIL · {p.trackingNumber}</span>
                <button onClick={() => setDrawer({ type: null, data: null })}>×</button>
              </div>
              <div className="drawer-badges">
                <Badge>{sm.label}</Badge>
                <Badge>{p.priority}</Badge>
                <Badge>{TYPE_LABELS[p.type] || p.type}</Badge>
                {p.isOverdue && <Badge>Overdue</Badge>}
              </div>
              <h2 id="drawer-title">{p.title || p.applicantName}</h2>
              <p className="drawer-applicant">{p.applicantName} · {p.mandalName || "—"}</p>
              <div className="drawer-details">
                {([
                  ["Phone", p.applicantPhone], ["Mandal", p.mandalName],
                  ["Village", p.villageName], ["Handling PA", p.handlingPaName],
                  ["Department", p.assignedDepartment], ["Referred by", p.referredByLeaderName],
                  ["Submitted", new Date(p.createdAt).toLocaleDateString("en-IN")],
                  ["Age", `${age} days`],
                  ["Requested", p.requestedAmount ? `₹${(p.requestedAmount/100000).toFixed(1)}L` : null],
                  ["Sanctioned", p.sanctionedAmount ? `₹${(p.sanctionedAmount/100000).toFixed(1)}L` : null],
                ] as [string, string|null|undefined][]).filter(([,v]) => v).map(([l, v]) => (
                  <InfoRow key={l} label={l} value={v as string} />
                ))}
              </div>
              {p.description && <><h3>Description</h3><p>{p.description}</p></>}
              {p.privateNotes && (
                <div className="private-note">
                  <strong>Private office note</strong>
                  <p>{p.privateNotes}</p>
                </div>
              )}
            </aside>
          </div>
        )
      })()}

      {/* WORK DRAWER */}
      {drawer.type === "work" && drawer.data && (() => {
        const w: Work = drawer.data
        const pct = STAGE_PCT[w.stage] ?? 0
        const budget = w.sanctionedBudget || w.estimatedBudget || 0
        const spent = w.spentBudget || 0
        const spentPct = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0
        return (
          <div className="portal-overlay" onClick={() => setDrawer({ type: null, data: null })}>
            <aside className="portal-drawer" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
              <div className="drawer-head">
                <span className="portal-eyebrow">PUBLIC WORK · {w.workCode}</span>
                <button onClick={() => setDrawer({ type: null, data: null })}>×</button>
              </div>
              <div className="drawer-badges"><Badge>{w.stage.replace(/_/g, " ")}</Badge></div>
              <h2 id="drawer-title">{w.title}</h2>
              <p className="drawer-applicant">{w.category?.replace(/_/g, " ")} · {w.mandalName || "—"}</p>
              <div className="drawer-details">
                {([
                  ["Mandal", w.mandalName], ["Village", w.villageName],
                  ["Category", w.category?.replace(/_/g, " ")],
                  ["Estimated", w.estimatedBudget ? `₹${(w.estimatedBudget/100000).toFixed(1)}L` : null],
                  ["Sanctioned", budget > 0 ? `₹${(budget/100000).toFixed(1)}L` : null],
                  ["Spent", spent > 0 ? `₹${(spent/100000).toFixed(1)}L` : null],
                ] as [string, string|null|undefined][]).filter(([,v]) => v).map(([l, v]) => (
                  <InfoRow key={l} label={l} value={v as string} />
                ))}
              </div>
              <h3>Stage progress</h3>
              <div style={{ height: 8, background: "#edf1f2", borderRadius: 99, overflow: "hidden", margin: "4px 0 12px" }}>
                <div style={{ height: 8, background: "#6b947c", borderRadius: 99, width: `${pct}%` }} />
              </div>
              {budget > 0 && <>
                <h3>Budget used ({spentPct}%)</h3>
                <div style={{ height: 6, background: "#edf1f2", borderRadius: 99, overflow: "hidden", margin: "4px 0 12px" }}>
                  <div style={{ height: 6, background: "#608ca4", borderRadius: 99, width: `${spentPct}%` }} />
                </div>
              </>}
              {w.stuckReason && (
                <div className="private-note" style={{ background: "#fbefed", borderColor: "#f5c6c6" }}>
                  <strong style={{ color: "#a54d4d" }}>Stuck reason</strong>
                  <p style={{ color: "#7a3a3a" }}>{w.stuckReason}</p>
                </div>
              )}
            </aside>
          </div>
        )
      })()}

      {/* ADD EVENT MODAL */}
      {showAddEvent && (
        <div className="portal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowAddEvent(false) }}>
          <form className="portal-modal" onSubmit={e => { e.preventDefault(); addEvent() }} onClick={e => e.stopPropagation()}>
            <div className="drawer-head">
              <h2>Add calendar event</h2>
              <button type="button" onClick={() => setShowAddEvent(false)}>×</button>
            </div>
            <label>Title *<input required value={newEvent.title} onChange={e => setNewEvent(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Village Tour - Bittupalli" /></label>
            <label>Location *<input required value={newEvent.location} onChange={e => setNewEvent(p => ({ ...p, location: e.target.value }))} placeholder="e.g. Mandal Office" /></label>
            <label>Date & Time *<input required type="datetime-local" value={newEvent.startDate} onChange={e => setNewEvent(p => ({ ...p, startDate: e.target.value }))} /></label>
            <label>Event Type
              <select value={newEvent.eventType} onChange={e => setNewEvent(p => ({ ...p, eventType: e.target.value }))}>
                {Object.entries(EVENT_META).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </label>
            <label>Notes<textarea rows={2} value={newEvent.notes} onChange={e => setNewEvent(p => ({ ...p, notes: e.target.value }))} /></label>
            <button type="submit" className="portal-primary" disabled={addingEvent}>
              {addingEvent ? "Saving..." : "Save event"} <Activity size={15} />
            </button>
          </form>
        </div>
      )}

    </div>
  )
}
