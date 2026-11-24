"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
  Bell, Calendar, ChevronDown, FileText, Mail, MessageCircle,
  Plus, RefreshCw, Settings, Users, X, Megaphone, UserCheck,
  UserX, MapPin, Phone,
} from "lucide-react"
import { GovSidebar, type NavItem } from "@/components/GovSidebar"

// ─── Types ────────────────────────────────────────────────────────────────────
interface Worker {
  id: string
  name: string
  phone: string
  whatsappPhone: string | null
  email: string | null
  gender: string | null
  postTitle: string | null
  wing: string | null
  level: string
  district: string
  mandalName: string | null
  villageName: string | null
  boothNumber: string | null
  status: string
  joinedPartyOn: string | null
  voterId: string | null
  privateNotes: string | null
  notes: string | null
  addedByName: string
  createdAt: string
  partyPost?: { id: string; title: string; wing: string; level: string } | null
}

interface Stats {
  total: number; active: number; inactive: number; suspended: number
  byLevel: { name: string; value: number }[]
  byWing:  { name: string; value: number }[]
  recentlyAdded: Worker[]
}

// ─── Constants ────────────────────────────────────────────────────────────────
const READ_ROLES  = ["MINISTER", "PA", "ADMIN", "BACK_OFFICER"]
const WRITE_ROLES = ["PA", "ADMIN", "BACK_OFFICER"]
const PRIVATE_ROLES = ["MINISTER", "PA", "ADMIN"]

const NAV: NavItem[] = [
  { key: "petitions", label: "All Petitions",  Icon: FileText },
  { key: "whatsapp",  label: "WhatsApp Inbox", Icon: MessageCircle },
  { key: "campaigns", label: "Bulk Campaigns", Icon: Megaphone },
  { key: "workers",   label: "Party Workers",  Icon: Users },
  { key: "letters",   label: "Letters",        Icon: Mail },
  { key: "calendar",  label: "Calendar",       Icon: Calendar },
  { key: "settings",  label: "Settings",       Icon: Settings },
]

const STATUS_COLORS: Record<string, { color: string; bg: string }> = {
  ACTIVE:    { color: "#065f46", bg: "#d1fae5" },
  INACTIVE:  { color: "#475569", bg: "#f1f5f9" },
  SUSPENDED: { color: "#991b1b", bg: "#fee2e2" },
}

const LEVEL_COLORS: Record<string, { color: string; bg: string }> = {
  STATE:    { color: "#991b1b", bg: "#fee2e2" },
  DISTRICT: { color: "#1e40af", bg: "#dbeafe" },
  MANDAL:   { color: "#7c3aed", bg: "#ede9fe" },
  VILLAGE:  { color: "#065f46", bg: "#d1fae5" },
  BOOTH:    { color: "#92400e", bg: "#fef3c7" },
}

function fmtDate(d: string | null) {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
}

function Badge({ label, color, bg }: { label: string; color: string; bg: string }) {
  return <span className="gov-badge" style={{ color, background: bg }}>{label}</span>
}

// ─── Worker Drawer ────────────────────────────────────────────────────────────
function WorkerDrawer({
  worker, canWrite, canSeePrivate, onClose, onRefresh,
}: {
  worker: Worker; canWrite: boolean; canSeePrivate: boolean
  onClose: () => void; onRefresh: () => void
}) {
  const [editStatus, setEditStatus] = useState(worker.status)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState("")

  const saveStatus = async () => {
    if (editStatus === worker.status) return
    setSaving(true)
    const res = await fetch(`/api/party-workers/${worker.id}`, {
      method: "PATCH", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: editStatus }),
    })
    const d = await res.json()
    setSaving(false)
    if (d.success) { setMsg("Status updated"); onRefresh() }
    else setMsg(d.error || "Failed")
  }

  const sc = STATUS_COLORS[worker.status] || STATUS_COLORS.INACTIVE
  const lc = LEVEL_COLORS[worker.level]   || LEVEL_COLORS.MANDAL

  return (
    <>
      <button className="gov-overlay" onClick={onClose} />
      <aside className="gov-drawer">
        <header className="gov-drawer-header">
          <div>
            <div className="gov-drawer-title">{worker.name}</div>
            <div className="gov-drawer-sub">Added {fmtDate(worker.createdAt)} by {worker.addedByName}</div>
          </div>
          <button className="gov-drawer-close" onClick={onClose}><X size={15} /></button>
        </header>
        <div className="gov-drawer-body">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Badge label={worker.status} color={sc.color} bg={sc.bg} />
            <Badge label={worker.level}  color={lc.color} bg={lc.bg} />
            {worker.wing && <Badge label={worker.wing} color="#475569" bg="#f1f5f9" />}
          </div>

          <div className="gov-info-grid">
            <div className="gov-info-box">
              <div className="gov-label">Phone</div>
              <div style={{ fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
                <Phone size={13} color="var(--sub)" />{worker.phone}
              </div>
            </div>
            <div className="gov-info-box">
              <div className="gov-label">Location</div>
              <div style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 5 }}>
                <MapPin size={13} color="var(--sub)" />{worker.mandalName || worker.district}
                {worker.villageName && ` · ${worker.villageName}`}
              </div>
            </div>
          </div>

          {worker.postTitle && <div><div className="gov-label">Party Post</div><div style={{ fontSize: 13 }}>{worker.postTitle}</div></div>}
          {worker.email && <div><div className="gov-label">Email</div><div style={{ fontSize: 13 }}>{worker.email}</div></div>}
          {worker.boothNumber && <div><div className="gov-label">Booth</div><div style={{ fontSize: 13 }}>{worker.boothNumber}</div></div>}
          {worker.joinedPartyOn && <div><div className="gov-label">Joined Party</div><div style={{ fontSize: 13 }}>{fmtDate(worker.joinedPartyOn)}</div></div>}
          {canSeePrivate && worker.voterId && <div><div className="gov-label">Voter ID</div><div style={{ fontSize: 13, fontFamily: "monospace" }}>{worker.voterId}</div></div>}
          {worker.notes && <div><div className="gov-label">Notes</div><div style={{ fontSize: 13, color: "var(--sub)" }}>{worker.notes}</div></div>}
          {canSeePrivate && worker.privateNotes && (
            <div className="gov-private-box">
              <div className="gov-label" style={{ color: "#92400e" }}>Private Notes</div>
              <div style={{ fontSize: 13 }}>{worker.privateNotes}</div>
            </div>
          )}

          {canWrite && (
            <div>
              <div className="gov-label">Update Status</div>
              <div style={{ display: "flex", gap: 8 }}>
                <select className="gov-select" value={editStatus} onChange={e => setEditStatus(e.target.value)}>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
                <button className="gov-btn gov-btn-primary" disabled={saving || editStatus === worker.status} onClick={saveStatus}>
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
              {msg && <div style={{ fontSize: 12, color: msg.includes("updated") ? "var(--success)" : "var(--crit)", marginTop: 6 }}>{msg}</div>}
            </div>
          )}
        </div>
      </aside>
    </>
  )
}

// ─── New Worker Form ──────────────────────────────────────────────────────────
function NewWorkerDrawer({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    name: "", phone: "", gender: "", level: "MANDAL",
    wing: "", postTitle: "", mandalName: "", villageName: "",
    boothNumber: "", notes: "",
  })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState("")
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setErr("")
    try {
      const res = await fetch("/api/party-workers", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form }),
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
          <div><div className="gov-drawer-title">Add Party Worker</div></div>
          <button className="gov-drawer-close" onClick={onClose}><X size={15} /></button>
        </header>
        <div className="gov-drawer-body">
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 13 }}>
            <div className="gov-form-grid gov-form-grid-2">
              <div><label className="gov-label">Name *</label><input className="gov-input" required value={form.name} onChange={e => set("name", e.target.value)} /></div>
              <div><label className="gov-label">Phone *</label><input className="gov-input" required type="tel" value={form.phone} onChange={e => set("phone", e.target.value)} /></div>
            </div>
            <div className="gov-form-grid gov-form-grid-2">
              <div>
                <label className="gov-label">Gender</label>
                <select className="gov-select" value={form.gender} onChange={e => set("gender", e.target.value)}>
                  <option value="">Select</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="gov-label">Level</label>
                <select className="gov-select" value={form.level} onChange={e => set("level", e.target.value)}>
                  {["STATE","DISTRICT","MANDAL","VILLAGE","BOOTH"].map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <div className="gov-form-grid gov-form-grid-2">
              <div><label className="gov-label">Wing</label><input className="gov-input" value={form.wing} onChange={e => set("wing", e.target.value)} placeholder="e.g. Youth Wing" /></div>
              <div><label className="gov-label">Post Title</label><input className="gov-input" value={form.postTitle} onChange={e => set("postTitle", e.target.value)} /></div>
            </div>
            <div className="gov-form-grid gov-form-grid-2">
              <div><label className="gov-label">Mandal</label><input className="gov-input" value={form.mandalName} onChange={e => set("mandalName", e.target.value)} /></div>
              <div><label className="gov-label">Village</label><input className="gov-input" value={form.villageName} onChange={e => set("villageName", e.target.value)} /></div>
            </div>
            <div><label className="gov-label">Booth Number</label><input className="gov-input" value={form.boothNumber} onChange={e => set("boothNumber", e.target.value)} /></div>
            <div><label className="gov-label">Notes</label><textarea className="gov-textarea" rows={2} value={form.notes} onChange={e => set("notes", e.target.value)} /></div>
            {err && <div style={{ color: "var(--crit)", fontSize: 13 }}>{err}</div>}
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" className="gov-btn gov-btn-outline" onClick={onClose}>Cancel</button>
              <button type="submit" className="gov-btn gov-btn-primary" disabled={saving}><Plus size={14} />{saving ? "Adding…" : "Add Worker"}</button>
            </div>
          </form>
        </div>
      </aside>
    </>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PartyWorkersPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const user = session?.user as any
  const role = user?.role || ""
  const userName = user?.name || "Staff"

  const canRead       = READ_ROLES.includes(role)
  const canWrite      = WRITE_ROLES.includes(role)
  const canSeePrivate = PRIVATE_ROLES.includes(role)

  const [workers, setWorkers]   = useState<Worker[]>([])
  const [stats, setStats]       = useState<Stats | null>(null)
  const [total, setTotal]       = useState(0)
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [filterLevel, setFilterLevel]   = useState("")
  const [selected, setSelected] = useState<Worker | null>(null)
  const [showNew, setShowNew]   = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search)       params.set("search", search)
    if (filterStatus) params.set("status", filterStatus)
    if (filterLevel)  params.set("level",  filterLevel)
    const [wRes, sRes] = await Promise.all([
      fetch(`/api/party-workers?${params}`, { credentials: "include" }),
      fetch("/api/party-workers/stats", { credentials: "include" }),
    ])
    const wd = await wRes.json(); const sd = await sRes.json()
    if (wd.success) { setWorkers(wd.workers); setTotal(wd.total) }
    if (sd.success) setStats(sd)
    setLoading(false)
  }, [search, filterStatus, filterLevel])

  useEffect(() => { if (canRead) load() }, [canRead, load])

  const handleNav = (key: string) => {
    const routes: Record<string, string> = {
      petitions: "/pa/dashboard", whatsapp: "/pa/whatsapp",
      campaigns: "/pa/campaigns", letters: "/letters/dashboard",
      calendar: "/minister/calendar", settings: "/minister/settings",
    }
    if (key in routes) router.push(routes[key])
  }

  if (!canRead) return <div style={{ padding: 40, color: "var(--crit)" }}>Access denied.</div>

  return (
    <div className="gov-app">
      <GovSidebar items={NAV} active="workers" onNav={handleNav} role={role} userName={userName} />
      <main className="gov-main">
        <header className="gov-header">
          <div>
            <div className="gov-header-title">Party Workers</div>
            <div className="gov-header-sub">Manage party cadre across mandals and villages</div>
          </div>
          <div className="gov-header-actions">
            <button className="gov-header-btn" onClick={load}><RefreshCw size={15} /></button>
            <button className="gov-header-btn"><Bell size={15} /></button>
            {canWrite && (
              <button className="gov-btn gov-btn-primary" onClick={() => setShowNew(true)}>
                <Plus size={14} />Add Worker
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
              { label: "Total Workers", value: stats?.total,     accent: "#2F6FED", Icon: Users },
              { label: "Active",        value: stats?.active,    accent: "#16A34A", Icon: UserCheck },
              { label: "Inactive",      value: stats?.inactive,  accent: "#D97706", Icon: UserX },
              { label: "Suspended",     value: stats?.suspended, accent: "#991b1b", Icon: UserX },
            ].map(({ label, value, accent, Icon: Ic }) => (
              <div key={label} className="gov-kpi">
                <div className="gov-kpi-top"><div className="gov-kpi-icon" style={{ background: `${accent}18` }}><Ic size={17} color={accent} /></div></div>
                <div className="gov-kpi-value">{loading ? <div className="gov-skel gov-kpi-skel" /> : value ?? "—"}</div>
                <div className="gov-kpi-label">{label}</div>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="gov-card gov-card-p">
            <div className="gov-card-header">
              <div className="gov-card-title">
                <div className="gov-card-icon" style={{ background: "#eff6ff" }}><Users size={14} color="#2F6FED" /></div>
                Workers <span style={{ fontSize: 12, color: "var(--sub)", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 5, padding: "1px 8px" }}>{total}</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <input className="gov-input" style={{ width: 200 }} placeholder="Search name, phone, mandal…" value={search} onChange={e => setSearch(e.target.value)} />
                <select className="gov-select" style={{ width: 130 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                  <option value="">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
                <select className="gov-select" style={{ width: 120 }} value={filterLevel} onChange={e => setFilterLevel(e.target.value)}>
                  <option value="">All Levels</option>
                  {["STATE","DISTRICT","MANDAL","VILLAGE","BOOTH"].map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>

            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[1,2,3,4,5].map(i => <div key={i} className="gov-skel" style={{ height: 48, borderRadius: 7 }} />)}
              </div>
            ) : workers.length === 0 ? (
              <div className="gov-empty"><Users size={24} style={{ margin: "0 auto 10px", opacity: 0.3 }} /><div>No workers found.</div></div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="gov-table">
                  <thead><tr><th>Name</th><th>Phone</th><th>Level</th><th>Post</th><th>Mandal</th><th>Status</th><th></th></tr></thead>
                  <tbody>
                    {workers.map(w => {
                      const sc = STATUS_COLORS[w.status] || STATUS_COLORS.INACTIVE
                      const lc = LEVEL_COLORS[w.level]   || LEVEL_COLORS.MANDAL
                      return (
                        <tr key={w.id}>
                          <td style={{ fontWeight: 600 }}>{w.name}</td>
                          <td style={{ fontFamily: "monospace", fontSize: 12 }}>{w.phone}</td>
                          <td><Badge label={w.level} color={lc.color} bg={lc.bg} /></td>
                          <td style={{ color: "var(--sub)", fontSize: 12 }}>{w.postTitle || "—"}</td>
                          <td style={{ color: "var(--sub)", fontSize: 12 }}>{w.mandalName || "—"}</td>
                          <td><Badge label={w.status} color={sc.color} bg={sc.bg} /></td>
                          <td><button className="gov-btn gov-btn-outline gov-btn-sm" onClick={() => setSelected(w)}>View</button></td>
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

      {showNew && <NewWorkerDrawer onClose={() => setShowNew(false)} onCreated={() => { setShowNew(false); load() }} />}
      {selected && <WorkerDrawer worker={selected} canWrite={canWrite} canSeePrivate={canSeePrivate} onClose={() => setSelected(null)} onRefresh={() => { load(); setSelected(null) }} />}
    </div>
  )
}
