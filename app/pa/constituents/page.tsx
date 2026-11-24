"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
  Bell, Calendar, ChevronDown, FileText, Mail, MessageCircle,
  Plus, RefreshCw, Settings, Users, X, Megaphone, UserCheck,
  MapPin, Phone, BarChart3, Upload, CheckCircle2, AlertTriangle,
} from "lucide-react"
import { GovSidebar, type NavItem } from "@/components/GovSidebar"

// ─── Types ────────────────────────────────────────────────────────────────────
interface Citizen {
  id: string; name: string; epicNumber: string | null
  fatherOrHusband: string | null; age: number | null; gender: string | null
  houseNumber: string | null; streetColony: string | null
  villageName: string | null; mandalName: string | null; district: string
  boothNumber: string | null; phone: string | null; whatsappOptIn: boolean
  aadharLast4: string | null; dataSource: string; createdAt: string
  schemeBenefits: Record<string, boolean> | null
}

interface Stats {
  citizens: {
    total: number; whatsappOptIn: number; whatsappRate: number
    byGender: { gender: string; count: number }[]
    byMandal: { mandal: string; count: number }[]
  }
  households: { total: number }
  booths: { total: number }
  boothGrades: { A: number; B: number; C: number; D: number }
  partyWorkers: { total: number; active: number }
}

// ─── Constants ────────────────────────────────────────────────────────────────
const READ_ROLES    = ["MINISTER", "PA", "ADMIN", "BACK_OFFICER", "FIELD_OFFICER"]
const WRITE_ROLES   = ["PA", "ADMIN", "BACK_OFFICER"]
const PRIVATE_ROLES = ["MINISTER", "PA", "ADMIN", "BACK_OFFICER"]

const NAV: NavItem[] = [
  { key: "petitions",    label: "All Petitions",    Icon: FileText },
  { key: "whatsapp",     label: "WhatsApp Inbox",   Icon: MessageCircle },
  { key: "campaigns",    label: "Bulk Campaigns",   Icon: Megaphone },
  { key: "workers",      label: "Party Workers",    Icon: Users },
  { key: "constituents", label: "Constituents",     Icon: UserCheck },
  { key: "calendar",     label: "Calendar",         Icon: Calendar },
  { key: "settings",     label: "Settings",         Icon: Settings },
]

function fmtDate(d: string | null) {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
}

function Badge({ label, color, bg }: { label: string; color: string; bg: string }) {
  return <span className="gov-badge" style={{ color, background: bg }}>{label}</span>
}

// ─── Citizen Drawer ───────────────────────────────────────────────────────────
function CitizenDrawer({
  citizen, canSeePrivate, onClose,
}: {
  citizen: Citizen; canSeePrivate: boolean; onClose: () => void
}) {
  const schemes = citizen.schemeBenefits
    ? Object.entries(citizen.schemeBenefits).filter(([, v]) => v).map(([k]) => k)
    : []

  return (
    <>
      <button className="gov-overlay" onClick={onClose} />
      <aside className="gov-drawer">
        <header className="gov-drawer-header">
          <div>
            <div className="gov-drawer-title">{citizen.name}</div>
            <div className="gov-drawer-sub">Added {fmtDate(citizen.createdAt)} · {citizen.dataSource}</div>
          </div>
          <button className="gov-drawer-close" onClick={onClose}><X size={15} /></button>
        </header>
        <div className="gov-drawer-body">
          <div className="gov-info-grid">
            {citizen.age && <div className="gov-info-box"><div className="gov-label">Age</div><div style={{ fontSize: 18, fontWeight: 700, color: "var(--navy)" }}>{citizen.age}</div></div>}
            {citizen.gender && <div className="gov-info-box"><div className="gov-label">Gender</div><div style={{ fontSize: 14, fontWeight: 600 }}>{citizen.gender}</div></div>}
          </div>

          {citizen.fatherOrHusband && <div><div className="gov-label">Father / Husband</div><div style={{ fontSize: 13 }}>{citizen.fatherOrHusband}</div></div>}

          <div>
            <div className="gov-label">Address</div>
            <div style={{ fontSize: 13, display: "flex", alignItems: "flex-start", gap: 5 }}>
              <MapPin size={13} color="var(--sub)" style={{ marginTop: 2, flexShrink: 0 }} />
              <span>
                {[citizen.houseNumber, citizen.streetColony, citizen.villageName, citizen.mandalName, citizen.district].filter(Boolean).join(", ")}
              </span>
            </div>
          </div>

          {citizen.boothNumber && <div><div className="gov-label">Booth</div><div style={{ fontSize: 13, fontFamily: "monospace" }}>{citizen.boothNumber}</div></div>}

          {canSeePrivate && citizen.phone && (
            <div><div className="gov-label">Phone</div>
              <div style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 5 }}>
                <Phone size={13} color="var(--sub)" />{citizen.phone}
                {citizen.whatsappOptIn && <Badge label="WhatsApp" color="#065f46" bg="#d1fae5" />}
              </div>
            </div>
          )}

          {canSeePrivate && citizen.epicNumber && (
            <div><div className="gov-label">Voter ID (EPIC)</div><div style={{ fontSize: 13, fontFamily: "monospace" }}>{citizen.epicNumber}</div></div>
          )}

          {canSeePrivate && citizen.aadharLast4 && (
            <div><div className="gov-label">Aadhaar (last 4)</div><div style={{ fontSize: 13, fontFamily: "monospace" }}>XXXX-XXXX-{citizen.aadharLast4}</div></div>
          )}

          {schemes.length > 0 && (
            <div>
              <div className="gov-label">Scheme Benefits</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {schemes.map(s => <Badge key={s} label={s} color="#1e40af" bg="#dbeafe" />)}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}

// ─── New Citizen Form ─────────────────────────────────────────────────────────
function NewCitizenDrawer({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    name: "", epicNumber: "", fatherOrHusband: "", age: "",
    gender: "", phone: "", whatsappOptIn: false,
    villageName: "", mandalName: "", boothNumber: "",
  })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState("")
  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setErr("")
    try {
      const res = await fetch("/api/constituents", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, age: form.age ? parseInt(form.age) : null }),
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
          <div><div className="gov-drawer-title">Add Constituent</div></div>
          <button className="gov-drawer-close" onClick={onClose}><X size={15} /></button>
        </header>
        <div className="gov-drawer-body">
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 13 }}>
            <div className="gov-form-grid gov-form-grid-2">
              <div><label className="gov-label">Name *</label><input className="gov-input" required value={form.name} onChange={e => set("name", e.target.value)} /></div>
              <div><label className="gov-label">Voter ID (EPIC)</label><input className="gov-input" value={form.epicNumber} onChange={e => set("epicNumber", e.target.value)} /></div>
            </div>
            <div className="gov-form-grid gov-form-grid-2">
              <div><label className="gov-label">Father / Husband</label><input className="gov-input" value={form.fatherOrHusband} onChange={e => set("fatherOrHusband", e.target.value)} /></div>
              <div><label className="gov-label">Age</label><input className="gov-input" type="number" min="1" max="120" value={form.age} onChange={e => set("age", e.target.value)} /></div>
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
              <div><label className="gov-label">Phone</label><input className="gov-input" type="tel" value={form.phone} onChange={e => set("phone", e.target.value)} /></div>
            </div>
            <div className="gov-form-grid gov-form-grid-2">
              <div><label className="gov-label">Mandal</label><input className="gov-input" value={form.mandalName} onChange={e => set("mandalName", e.target.value)} /></div>
              <div><label className="gov-label">Village</label><input className="gov-input" value={form.villageName} onChange={e => set("villageName", e.target.value)} /></div>
            </div>
            <div><label className="gov-label">Booth Number</label><input className="gov-input" value={form.boothNumber} onChange={e => set("boothNumber", e.target.value)} /></div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
              <input type="checkbox" checked={form.whatsappOptIn} onChange={e => set("whatsappOptIn", e.target.checked)} />
              WhatsApp Opt-In
            </label>
            {err && <div style={{ color: "var(--crit)", fontSize: 13 }}>{err}</div>}
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" className="gov-btn gov-btn-outline" onClick={onClose}>Cancel</button>
              <button type="submit" className="gov-btn gov-btn-primary" disabled={saving}><Plus size={14} />{saving ? "Adding…" : "Add Constituent"}</button>
            </div>
          </form>
        </div>
      </aside>
    </>
  )
}

// ─── Bulk Import Drawer ──────────────────────────────────────────────────────
function BulkImportDrawer({ onClose, onImported }: { onClose: () => void; onImported: () => void }) {
  const [jsonText, setJsonText] = useState("")
  const [dataSource, setDataSource] = useState("ECI_ROLL")
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState<{ total: number; created: number; skipped: number; errorCount: number } | null>(null)
  const [err, setErr] = useState("")

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setErr(""); setResult(null)
    try {
      let citizens: any[]
      try { citizens = JSON.parse(jsonText) } catch { setErr("Invalid JSON — paste a valid JSON array"); setSaving(false); return }
      if (!Array.isArray(citizens)) { setErr("JSON must be an array of citizen objects"); setSaving(false); return }
      const res = await fetch("/api/constituents/bulk-import", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ citizens, dataSource }),
      })
      const d = await res.json()
      if (!d.success) { setErr(d.error || "Import failed"); return }
      setResult(d.summary)
    } catch { setErr("Network error") } finally { setSaving(false) }
  }

  return (
    <>
      <button className="gov-overlay" onClick={onClose} />
      <aside className="gov-drawer">
        <header className="gov-drawer-header">
          <div><div className="gov-drawer-title">Bulk Import Citizens</div><div className="gov-drawer-sub">Paste ECI roll JSON — max 5000 records per batch</div></div>
          <button className="gov-drawer-close" onClick={onClose}><X size={15} /></button>
        </header>
        <div className="gov-drawer-body">
          {result ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ padding: "16px", borderRadius: 10, background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#166534", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                  <CheckCircle2 size={16} />Import Complete
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[{l:"Total",v:result.total},{l:"Created",v:result.created},{l:"Skipped (duplicates)",v:result.skipped},{l:"Errors",v:result.errorCount}].map(({l,v}) => (
                    <div key={l} style={{ background: "white", borderRadius: 8, padding: "10px 12px", border: "1px solid #bbf7d0" }}>
                      <div style={{ fontSize: 11, color: "var(--sub)" }}>{l}</div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: "var(--navy)" }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="gov-btn gov-btn-outline" onClick={() => { setResult(null); setJsonText("") }}>Import More</button>
                <button className="gov-btn gov-btn-primary" onClick={onImported}>Done</button>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 13 }}>
              <div>
                <label className="gov-label">Data Source</label>
                <select className="gov-select" value={dataSource} onChange={e => setDataSource(e.target.value)}>
                  <option value="ECI_ROLL">ECI Electoral Roll</option>
                  <option value="CAMP_OFFICE">Camp Office Entry</option>
                  <option value="SURVEY">Survey Collection</option>
                  <option value="MANUAL">Manual Entry</option>
                </select>
              </div>
              <div>
                <label className="gov-label">JSON Data *</label>
                <textarea className="gov-textarea" rows={10} required value={jsonText} onChange={e => setJsonText(e.target.value)}
                  placeholder={'[\n  {\n    "name": "Ravi Kumar",\n    "epicNumber": "TG/01/001/000001",\n    "fatherOrHusband": "Suresh Kumar",\n    "age": 35,\n    "gender": "MALE",\n    "villageName": "Manthani",\n    "mandalName": "Manthani",\n    "boothNumber": "42"\n  }\n]'}
                />
              </div>
              <div style={{ padding: "10px 14px", borderRadius: 8, background: "#fffbeb", border: "1px solid #fde68a", fontSize: 12, color: "#92400e" }}>
                <AlertTriangle size={13} style={{ display: "inline", marginRight: 4 }} />
                Duplicates (same EPIC number) are automatically skipped. Max 5000 records per batch.
              </div>
              {err && <div style={{ color: "var(--crit)", fontSize: 13 }}>{err}</div>}
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" className="gov-btn gov-btn-outline" onClick={onClose}>Cancel</button>
                <button type="submit" className="gov-btn gov-btn-primary" disabled={saving}><Upload size={14} />{saving ? "Importing…" : "Import"}</button>
              </div>
            </form>
          )}
        </div>
      </aside>
    </>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ConstituentsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const user = session?.user as any
  const role = user?.role || ""
  const userName = user?.name || "Staff"

  const canRead       = READ_ROLES.includes(role)
  const canWrite      = WRITE_ROLES.includes(role)
  const canSeePrivate = PRIVATE_ROLES.includes(role)

  const [citizens, setCitizens]   = useState<Citizen[]>([])
  const [stats, setStats]         = useState<Stats | null>(null)
  const [total, setTotal]         = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage]           = useState(1)
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState("")
  const [filterMandal, setFilterMandal]   = useState("")
  const [filterGender, setFilterGender]   = useState("")
  const [selected, setSelected]   = useState<Citizen | null>(null)
  const [showNew, setShowNew]       = useState(false)
  const [showImport, setShowImport] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search)       params.set("search",  search)
    if (filterMandal) params.set("mandal",  filterMandal)
    if (filterGender) params.set("gender",  filterGender)
    params.set("page", String(page))
    const [cRes, sRes] = await Promise.all([
      fetch(`/api/constituents?${params}`, { credentials: "include" }),
      fetch("/api/constituents/stats", { credentials: "include" }),
    ])
    const cd = await cRes.json(); const sd = await sRes.json()
    if (cd.success) { setCitizens(cd.citizens); setTotal(cd.total); setTotalPages(cd.totalPages) }
    if (sd.success) setStats(sd)
    setLoading(false)
  }, [search, filterMandal, filterGender, page])

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
      <GovSidebar items={NAV} active="constituents" onNav={handleNav} role={role} userName={userName} />
      <main className="gov-main">
        <header className="gov-header">
          <div>
            <div className="gov-header-title">Constituents Directory</div>
            <div className="gov-header-sub">Voter database, household mapping, scheme beneficiaries</div>
          </div>
          <div className="gov-header-actions">
            <button className="gov-header-btn" onClick={load}><RefreshCw size={15} /></button>
            <button className="gov-header-btn"><Bell size={15} /></button>
            {canWrite && (
              <div style={{ display: "flex", gap: 8 }}>
                <button className="gov-btn gov-btn-outline" onClick={() => setShowImport(true)}>
                  <Upload size={14} />Bulk Import
                </button>
                <button className="gov-btn gov-btn-primary" onClick={() => setShowNew(true)}>
                  <Plus size={14} />Add Constituent
                </button>
              </div>
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
              { label: "Total Citizens",   value: stats?.citizens.total,       accent: "#2F6FED", Icon: Users,      sub: `${stats?.booths.total ?? 0} booths` },
              { label: "WhatsApp Opt-In",  value: stats?.citizens.whatsappOptIn, accent: "#16A34A", Icon: MessageCircle, sub: `${stats?.citizens.whatsappRate ?? 0}% rate` },
              { label: "Households",       value: stats?.households.total,     accent: "#7c3aed", Icon: MapPin,     sub: "Mapped" },
              { label: "Party Workers",    value: stats?.partyWorkers.total,   accent: "#D97706", Icon: UserCheck,  sub: `${stats?.partyWorkers.active ?? 0} active` },
            ].map(({ label, value, accent, Icon: Ic, sub }) => (
              <div key={label} className="gov-kpi">
                <div className="gov-kpi-top"><div className="gov-kpi-icon" style={{ background: `${accent}18` }}><Ic size={17} color={accent} /></div></div>
                <div className="gov-kpi-value">{loading ? <div className="gov-skel gov-kpi-skel" /> : value ?? "—"}</div>
                <div className="gov-kpi-label">{label}</div>
                <div style={{ fontSize: 11, color: "var(--sub)" }}>{sub}</div>
              </div>
            ))}
          </div>

          {/* By Mandal */}
          {stats?.citizens.byMandal?.length ? (
            <div className="gov-card gov-card-p">
              <div className="gov-card-header"><div className="gov-card-title"><div className="gov-card-icon" style={{ background: "#eff6ff" }}><BarChart3 size={14} color="#2F6FED" /></div>Top Mandals by Voters</div></div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {stats.citizens.byMandal.slice(0, 8).map(m => (
                  <div key={m.mandal} style={{ padding: "8px 14px", borderRadius: 8, background: "var(--bg)", border: "1px solid var(--border)", cursor: "pointer" }}
                    onClick={() => setFilterMandal(m.mandal)}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--navy)" }}>{m.mandal}</div>
                    <div style={{ fontSize: 11, color: "var(--sub)" }}>{m.count.toLocaleString()} voters</div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Table */}
          <div className="gov-card gov-card-p">
            <div className="gov-card-header">
              <div className="gov-card-title">
                <div className="gov-card-icon" style={{ background: "#eff6ff" }}><Users size={14} color="#2F6FED" /></div>
                Citizens <span style={{ fontSize: 12, color: "var(--sub)", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 5, padding: "1px 8px" }}>{total.toLocaleString()}</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <input className="gov-input" style={{ width: 200 }} placeholder="Search name, EPIC, phone…" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
                <input className="gov-input" style={{ width: 140 }} placeholder="Mandal filter" value={filterMandal} onChange={e => { setFilterMandal(e.target.value); setPage(1) }} />
                <select className="gov-select" style={{ width: 110 }} value={filterGender} onChange={e => { setFilterGender(e.target.value); setPage(1) }}>
                  <option value="">All Gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[1,2,3,4,5].map(i => <div key={i} className="gov-skel" style={{ height: 48, borderRadius: 7 }} />)}
              </div>
            ) : citizens.length === 0 ? (
              <div className="gov-empty"><Users size={24} style={{ margin: "0 auto 10px", opacity: 0.3 }} /><div>No citizens found.</div></div>
            ) : (
              <>
                <div style={{ overflowX: "auto" }}>
                  <table className="gov-table">
                    <thead><tr><th>Name</th><th>Father/Husband</th><th>Age</th><th>Mandal</th><th>Village</th><th>Booth</th>{canSeePrivate && <th>Phone</th>}<th>WhatsApp</th><th></th></tr></thead>
                    <tbody>
                      {citizens.map(c => (
                        <tr key={c.id}>
                          <td style={{ fontWeight: 600 }}>{c.name}</td>
                          <td style={{ color: "var(--sub)", fontSize: 12 }}>{c.fatherOrHusband || "—"}</td>
                          <td>{c.age || "—"}</td>
                          <td style={{ fontSize: 12 }}>{c.mandalName || "—"}</td>
                          <td style={{ fontSize: 12 }}>{c.villageName || "—"}</td>
                          <td style={{ fontFamily: "monospace", fontSize: 11 }}>{c.boothNumber || "—"}</td>
                          {canSeePrivate && <td style={{ fontFamily: "monospace", fontSize: 11 }}>{c.phone || "—"}</td>}
                          <td>{c.whatsappOptIn ? <Badge label="Yes" color="#065f46" bg="#d1fae5" /> : <span style={{ color: "var(--sub)" }}>—</span>}</td>
                          <td><button className="gov-btn gov-btn-outline gov-btn-sm" onClick={() => setSelected(c)}>View</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {totalPages > 1 && (
                  <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 12 }}>
                    <button className="gov-btn gov-btn-outline gov-btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
                    <span style={{ fontSize: 13, color: "var(--sub)", alignSelf: "center" }}>Page {page} of {totalPages}</span>
                    <button className="gov-btn gov-btn-outline gov-btn-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {showNew && <NewCitizenDrawer onClose={() => setShowNew(false)} onCreated={() => { setShowNew(false); load() }} />}
      {showImport && <BulkImportDrawer onClose={() => setShowImport(false)} onImported={() => { setShowImport(false); load() }} />}
      {selected && <CitizenDrawer citizen={selected} canSeePrivate={canSeePrivate} onClose={() => setSelected(null)} />}
    </div>
  )
}
