"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
  Bell, Calendar, ChevronDown, FileText, Mail, MessageCircle,
  Plus, RefreshCw, Settings, Users, X, Megaphone, IndianRupee,
  AlertTriangle, CheckCircle2, Clock3, TrendingUp,
} from "lucide-react"
import { GovSidebar, type NavItem } from "@/components/GovSidebar"

// ─── Types ────────────────────────────────────────────────────────────────────
interface FundTimeline {
  id: string; fromStatus: string | null; toStatus: string
  actionTaken: string; remarks: string | null
  performedByName: string; performedByRole: string; createdAt: string
}

interface Fund {
  id: string; referenceNumber: string; scheme: string; financialYear: string
  workTitle: string; workDescription: string | null; category: string | null
  district: string; mandalName: string | null; villageName: string | null
  status: string; isStuck: boolean; stuckReason: string | null; stuckSince: string | null
  recommendedAmount: number; sanctionedAmount: number | null
  releasedAmount: number | null; utilizedAmount: number | null
  recommendedByName: string; createdAt: string
  notes: string | null; privateNotes: string | null
  timeline: FundTimeline[]
}

interface Stats {
  total: number; stuck: number; completed: number
  totalRecommended: number; totalSanctioned: number
  totalReleased: number; totalUtilized: number
  byScheme: { name: string; count: number; amount: number }[]
  byStatus: { name: string; value: number }[]
  stuckFunds: { id: string; referenceNumber: string; workTitle: string; status: string; stuckReason: string | null; stuckSince: string | null; mandalName: string | null }[]
}

// ─── Constants ────────────────────────────────────────────────────────────────
const READ_ROLES    = ["MINISTER", "PA", "ADMIN", "BACK_OFFICER"]
const WRITE_ROLES   = ["PA", "ADMIN"]
const PRIVATE_ROLES = ["MINISTER", "PA", "ADMIN"]

// Exact values from FundAllocationStatus enum in schema.prisma
const FUND_STATUSES = ["RECOMMENDED","LETTER_SENT","ADMIN_SANCTION","TECH_SANCTION","TENDER_FLOATED","WORK_IN_PROGRESS","COMPLETED","CANCELLED"]
// Exact values from FundScheme enum in schema.prisma
const FUND_SCHEMES  = ["MLACDS","MPLADS","STATE","OTHER"]

const NAV: NavItem[] = [
  { key: "petitions", label: "All Petitions",  Icon: FileText },
  { key: "whatsapp",  label: "WhatsApp Inbox", Icon: MessageCircle },
  { key: "campaigns", label: "Bulk Campaigns", Icon: Megaphone },
  { key: "workers",   label: "Party Workers",  Icon: Users },
  { key: "funds",     label: "Funds",          Icon: IndianRupee },
  { key: "calendar",  label: "Calendar",       Icon: Calendar },
  { key: "settings",  label: "Settings",       Icon: Settings },
]

const STATUS_COLORS: Record<string, { color: string; bg: string }> = {
  RECOMMENDED:       { color: "#475569", bg: "#f1f5f9" },
  LETTER_SENT:       { color: "#1e40af", bg: "#dbeafe" },
  ADMIN_SANCTION:    { color: "#7c3aed", bg: "#ede9fe" },
  TECH_SANCTION:     { color: "#0369a1", bg: "#e0f2fe" },
  TENDER_FLOATED:    { color: "#92400e", bg: "#fef3c7" },
  WORK_IN_PROGRESS:  { color: "#d97706", bg: "#fef9c3" },
  COMPLETED:         { color: "#14532d", bg: "#86efac" },
  CANCELLED:         { color: "#991b1b", bg: "#fee2e2" },
}

function fmtDate(d: string | null) {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
}

function fmtCr(n: number | null) {
  if (!n) return "—"
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`
  if (n >= 100000)   return `₹${(n / 100000).toFixed(2)} L`
  return `₹${n.toLocaleString("en-IN")}`
}

function Badge({ label, color, bg }: { label: string; color: string; bg: string }) {
  return <span className="gov-badge" style={{ color, background: bg }}>{label.replace(/_/g, " ")}</span>
}

// ─── Fund Drawer ──────────────────────────────────────────────────────────────
function FundDrawer({
  fund, canWrite, canSeePrivate, onClose, onRefresh,
}: {
  fund: Fund; canWrite: boolean; canSeePrivate: boolean
  onClose: () => void; onRefresh: () => void
}) {
  const [newStatus, setNewStatus] = useState(fund.status)
  const [actionTaken, setActionTaken] = useState("")
  const [isStuck, setIsStuck] = useState(fund.isStuck)
  const [stuckReason, setStuckReason] = useState(fund.stuckReason || "")
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState("")

  const save = async () => {
    setSaving(true); setMsg("")
    const body: any = { isStuck, stuckReason: stuckReason || null }
    if (newStatus !== fund.status) { body.status = newStatus; body.actionTaken = actionTaken || `Advanced to ${newStatus}` }
    const res = await fetch(`/api/funds/${fund.id}`, {
      method: "PATCH", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    const d = await res.json()
    setSaving(false)
    if (d.success) { setMsg("Updated"); onRefresh() }
    else setMsg(d.error || "Failed")
  }

  const sc = STATUS_COLORS[fund.status] || STATUS_COLORS.RECOMMENDED

  return (
    <>
      <button className="gov-overlay" onClick={onClose} />
      <aside className="gov-drawer">
        <header className="gov-drawer-header">
          <div>
            <div className="gov-drawer-title">{fund.workTitle}</div>
            <div className="gov-drawer-sub">{fund.referenceNumber} · {fund.scheme} · {fund.financialYear}</div>
          </div>
          <button className="gov-drawer-close" onClick={onClose}><X size={15} /></button>
        </header>
        <div className="gov-drawer-body">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Badge label={fund.status} color={sc.color} bg={sc.bg} />
            {fund.isStuck && <Badge label="STUCK" color="#991b1b" bg="#fee2e2" />}
          </div>

          <div className="gov-info-grid">
            <div className="gov-info-box"><div className="gov-label">Recommended</div><div style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)" }}>{fmtCr(fund.recommendedAmount)}</div></div>
            <div className="gov-info-box"><div className="gov-label">Sanctioned</div><div style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)" }}>{fmtCr(fund.sanctionedAmount)}</div></div>
            <div className="gov-info-box"><div className="gov-label">Released</div><div style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)" }}>{fmtCr(fund.releasedAmount)}</div></div>
            <div className="gov-info-box"><div className="gov-label">Utilized</div><div style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)" }}>{fmtCr(fund.utilizedAmount)}</div></div>
          </div>

          <div><div className="gov-label">Location</div><div style={{ fontSize: 13 }}>{fund.district}{fund.mandalName ? ` · ${fund.mandalName}` : ""}{fund.villageName ? ` · ${fund.villageName}` : ""}</div></div>
          {fund.category && <div><div className="gov-label">Category</div><div style={{ fontSize: 13 }}>{fund.category}</div></div>}
          {fund.workDescription && <div><div className="gov-label">Description</div><div style={{ fontSize: 13, color: "var(--sub)" }}>{fund.workDescription}</div></div>}
          {fund.stuckReason && <div style={{ padding: "10px 14px", borderRadius: 8, background: "#fef2f2", border: "1px solid #fecaca" }}><div className="gov-label" style={{ color: "#991b1b" }}>Stuck Reason</div><div style={{ fontSize: 13 }}>{fund.stuckReason}</div></div>}
          {canSeePrivate && fund.privateNotes && (
            <div className="gov-private-box">
              <div className="gov-label" style={{ color: "#92400e" }}>Private Notes</div>
              <div style={{ fontSize: 13 }}>{fund.privateNotes}</div>
            </div>
          )}

          {/* Timeline */}
          {fund.timeline.length > 0 && (
            <div>
              <div className="gov-label">Timeline</div>
              <div className="gov-timeline">
                {fund.timeline.map((t, i) => (
                  <div key={t.id} className="gov-timeline-item">
                    <div className="gov-timeline-dot" style={{ background: i === fund.timeline.length - 1 ? "var(--blue)" : "var(--border)" }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{t.actionTaken}</div>
                      <div style={{ fontSize: 11, color: "var(--sub)" }}>{t.performedByName} · {fmtDate(t.createdAt)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {msg && <div style={{ padding: "10px 14px", borderRadius: 8, background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", fontSize: 13 }}>{msg}</div>}

          {canWrite && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div>
                <div className="gov-label">Advance Stage</div>
                <select className="gov-select" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                  {FUND_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                </select>
              </div>
              {newStatus !== fund.status && (
                <div><label className="gov-label">Action Taken</label><input className="gov-input" value={actionTaken} onChange={e => setActionTaken(e.target.value)} placeholder="Describe what was done" /></div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="checkbox" id="stuck-chk" checked={isStuck} onChange={e => setIsStuck(e.target.checked)} />
                <label htmlFor="stuck-chk" style={{ fontSize: 13 }}>Mark as Stuck</label>
              </div>
              {isStuck && <div><label className="gov-label">Stuck Reason</label><input className="gov-input" value={stuckReason} onChange={e => setStuckReason(e.target.value)} /></div>}
              <button className="gov-btn gov-btn-primary" disabled={saving} onClick={save}>{saving ? "Saving…" : "Save Changes"}</button>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}

// ─── New Fund Form ────────────────────────────────────────────────────────────
function NewFundDrawer({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    workTitle: "", scheme: "MLACDS", financialYear: "", category: "",
    mandalName: "", villageName: "", recommendedAmount: "", notes: "",
  })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState("")
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setErr("")
    try {
      const res = await fetch("/api/funds", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, recommendedAmount: parseFloat(form.recommendedAmount) }),
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
          <div><div className="gov-drawer-title">New Fund Allocation</div></div>
          <button className="gov-drawer-close" onClick={onClose}><X size={15} /></button>
        </header>
        <div className="gov-drawer-body">
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 13 }}>
            <div><label className="gov-label">Work Title *</label><input className="gov-input" required value={form.workTitle} onChange={e => set("workTitle", e.target.value)} /></div>
            <div className="gov-form-grid gov-form-grid-2">
              <div>
                <label className="gov-label">Scheme</label>
                <select className="gov-select" value={form.scheme} onChange={e => set("scheme", e.target.value)}>
                  {FUND_SCHEMES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div><label className="gov-label">Financial Year *</label><input className="gov-input" required value={form.financialYear} onChange={e => set("financialYear", e.target.value)} placeholder="2024-25" /></div>
            </div>
            <div><label className="gov-label">Category</label><input className="gov-input" value={form.category} onChange={e => set("category", e.target.value)} placeholder="e.g. Roads, Drainage" /></div>
            <div className="gov-form-grid gov-form-grid-2">
              <div><label className="gov-label">Mandal</label><input className="gov-input" value={form.mandalName} onChange={e => set("mandalName", e.target.value)} /></div>
              <div><label className="gov-label">Village</label><input className="gov-input" value={form.villageName} onChange={e => set("villageName", e.target.value)} /></div>
            </div>
            <div><label className="gov-label">Recommended Amount (₹) *</label><input className="gov-input" required type="number" min="1" value={form.recommendedAmount} onChange={e => set("recommendedAmount", e.target.value)} placeholder="500000" /></div>
            <div><label className="gov-label">Notes</label><textarea className="gov-textarea" rows={2} value={form.notes} onChange={e => set("notes", e.target.value)} /></div>
            {err && <div style={{ color: "var(--crit)", fontSize: 13 }}>{err}</div>}
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" className="gov-btn gov-btn-outline" onClick={onClose}>Cancel</button>
              <button type="submit" className="gov-btn gov-btn-primary" disabled={saving}><Plus size={14} />{saving ? "Creating…" : "Create"}</button>
            </div>
          </form>
        </div>
      </aside>
    </>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function FundsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const user = session?.user as any
  const role = user?.role || ""
  const userName = user?.name || "Staff"

  const canRead       = READ_ROLES.includes(role)
  const canWrite      = WRITE_ROLES.includes(role)
  const canSeePrivate = PRIVATE_ROLES.includes(role)

  const [funds, setFunds]     = useState<Fund[]>([])
  const [stats, setStats]     = useState<Stats | null>(null)
  const [total, setTotal]     = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [filterScheme, setFilterScheme] = useState("")
  const [filterStuck, setFilterStuck]   = useState(false)
  const [selected, setSelected] = useState<Fund | null>(null)
  const [showNew, setShowNew]   = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search)       params.set("search", search)
    if (filterStatus) params.set("status", filterStatus)
    if (filterScheme) params.set("scheme", filterScheme)
    if (filterStuck)  params.set("stuck",  "true")
    const [fRes, sRes] = await Promise.all([
      fetch(`/api/funds?${params}`, { credentials: "include" }),
      fetch("/api/funds/stats", { credentials: "include" }),
    ])
    const fd = await fRes.json(); const sd = await sRes.json()
    if (fd.success) { setFunds(fd.funds); setTotal(fd.total) }
    if (sd.success) setStats(sd)
    setLoading(false)
  }, [search, filterStatus, filterScheme, filterStuck])

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

  return (
    <div className="gov-app">
      <GovSidebar items={NAV} active="funds" onNav={handleNav} role={role} userName={userName} />
      <main className="gov-main">
        <header className="gov-header">
          <div>
            <div className="gov-header-title">Fund Allocations</div>
            <div className="gov-header-sub">MLACDS, MPLADS, NABARD and other scheme tracking</div>
          </div>
          <div className="gov-header-actions">
            <button className="gov-header-btn" onClick={load}><RefreshCw size={15} /></button>
            <button className="gov-header-btn"><Bell size={15} /></button>
            {canWrite && (
              <button className="gov-btn gov-btn-primary" onClick={() => setShowNew(true)}>
                <Plus size={14} />New Allocation
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
              { label: "Total Allocations", value: stats?.total,            accent: "#2F6FED", Icon: IndianRupee, sub: fmtCr(stats?.totalRecommended || 0) },
              { label: "Stuck",             value: stats?.stuck,            accent: "#991b1b", Icon: AlertTriangle, sub: "Need attention" },
              { label: "Completed",         value: stats?.completed,        accent: "#16A34A", Icon: CheckCircle2, sub: fmtCr(stats?.totalUtilized || 0) + " utilized" },
              { label: "Total Released",    value: fmtCr(stats?.totalReleased || 0), accent: "#7c3aed", Icon: TrendingUp, sub: fmtCr(stats?.totalSanctioned || 0) + " sanctioned" },
            ].map(({ label, value, accent, Icon: Ic, sub }) => (
              <div key={label} className="gov-kpi">
                <div className="gov-kpi-top"><div className="gov-kpi-icon" style={{ background: `${accent}18` }}><Ic size={17} color={accent} /></div></div>
                <div className="gov-kpi-value">{loading ? <div className="gov-skel gov-kpi-skel" /> : value ?? "—"}</div>
                <div className="gov-kpi-label">{label}</div>
                <div style={{ fontSize: 11, color: "var(--sub)" }}>{sub}</div>
              </div>
            ))}
          </div>

          {/* Stuck Funds Alert */}
          {stats?.stuckFunds?.length ? (
            <div style={{ padding: "12px 16px", borderRadius: 10, background: "#fef2f2", border: "1px solid #fecaca", display: "flex", alignItems: "flex-start", gap: 10 }}>
              <AlertTriangle size={16} color="#991b1b" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#991b1b" }}>{stats.stuckFunds.length} stuck allocation{stats.stuckFunds.length > 1 ? "s" : ""} need attention</div>
                <div style={{ fontSize: 12, color: "#991b1b", marginTop: 3 }}>{stats.stuckFunds.slice(0, 3).map(f => f.workTitle).join(" · ")}{stats.stuckFunds.length > 3 ? ` +${stats.stuckFunds.length - 3} more` : ""}</div>
              </div>
            </div>
          ) : null}

          {/* Table */}
          <div className="gov-card gov-card-p">
            <div className="gov-card-header">
              <div className="gov-card-title">
                <div className="gov-card-icon" style={{ background: "#eff6ff" }}><IndianRupee size={14} color="#2F6FED" /></div>
                Allocations <span style={{ fontSize: 12, color: "var(--sub)", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 5, padding: "1px 8px" }}>{total}</span>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <input className="gov-input" style={{ width: 180 }} placeholder="Search work, ref, mandal…" value={search} onChange={e => setSearch(e.target.value)} />
                <select className="gov-select" style={{ width: 130 }} value={filterScheme} onChange={e => setFilterScheme(e.target.value)}>
                  <option value="">All Schemes</option>
                  {FUND_SCHEMES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select className="gov-select" style={{ width: 160 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                  <option value="">All Status</option>
                  {FUND_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                </select>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
                  <input type="checkbox" checked={filterStuck} onChange={e => setFilterStuck(e.target.checked)} />Stuck only
                </label>
              </div>
            </div>

            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[1,2,3,4].map(i => <div key={i} className="gov-skel" style={{ height: 48, borderRadius: 7 }} />)}
              </div>
            ) : funds.length === 0 ? (
              <div className="gov-empty"><IndianRupee size={24} style={{ margin: "0 auto 10px", opacity: 0.3 }} /><div>No allocations found.</div></div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="gov-table">
                  <thead><tr><th>Ref No.</th><th>Work Title</th><th>Scheme</th><th>Status</th><th>Amount</th><th>Mandal</th><th>FY</th><th></th></tr></thead>
                  <tbody>
                    {funds.map(f => {
                      const sc = STATUS_COLORS[f.status] || STATUS_COLORS.RECOMMENDED
                      return (
                        <tr key={f.id} style={{ background: f.isStuck ? "#fff7f7" : undefined }}>
                          <td style={{ fontFamily: "monospace", fontSize: 11 }}>{f.referenceNumber}</td>
                          <td style={{ fontWeight: 600, maxWidth: 200 }}>{f.workTitle}{f.isStuck && <span style={{ marginLeft: 6, fontSize: 10, color: "#991b1b", background: "#fee2e2", borderRadius: 4, padding: "1px 5px" }}>STUCK</span>}</td>
                          <td style={{ fontSize: 12 }}>{f.scheme}</td>
                          <td><Badge label={f.status} color={sc.color} bg={sc.bg} /></td>
                          <td style={{ fontWeight: 600 }}>{fmtCr(f.recommendedAmount)}</td>
                          <td style={{ color: "var(--sub)", fontSize: 12 }}>{f.mandalName || "—"}</td>
                          <td style={{ fontSize: 12 }}>{f.financialYear}</td>
                          <td><button className="gov-btn gov-btn-outline gov-btn-sm" onClick={() => setSelected(f)}>View</button></td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {showNew && <NewFundDrawer onClose={() => setShowNew(false)} onCreated={() => { setShowNew(false); load() }} />}
      {selected && <FundDrawer fund={selected} canWrite={canWrite} canSeePrivate={canSeePrivate} onClose={() => setSelected(null)} onRefresh={() => { load(); setSelected(null) }} />}
    </div>
  )
}
