"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
  Shield, Users, FileText, Activity, Settings, RefreshCw,
  Bell, ChevronDown, Plus, X, CheckCircle2, Building2, MapPin, Phone, Mail,
} from "lucide-react"
import { GovSidebar, type NavItem } from "@/components/GovSidebar"

interface Office {
  id: string; name: string; officeType: string
  address: string | null; city: string | null
  phone: string | null; email: string | null
  inChargeName: string | null; isActive: boolean; isDefault: boolean
  createdAt: string
  _count: { tasks: number }
}

const READ_ROLES  = ["MINISTER", "PA", "ADMIN", "BACK_OFFICER"]
const WRITE_ROLES = ["PA", "ADMIN"]
const OFFICE_TYPES = ["SECRETARIAT","CONSTITUENCY","RESIDENCE","DISTRICT","OTHER"]

const NAV: NavItem[] = [
  { key: "overview",    label: "Overview",    Icon: Activity },
  { key: "users",       label: "Users",       Icon: Users },
  { key: "party-posts", label: "Party Posts", Icon: Shield },
  { key: "offices",     label: "Offices",     Icon: Building2 },
  { key: "settings",    label: "Settings",    Icon: Settings },
]

const TYPE_COLORS: Record<string, { color: string; bg: string }> = {
  SECRETARIAT:  { color: "#991b1b", bg: "#fee2e2" },
  CONSTITUENCY: { color: "#1e40af", bg: "#dbeafe" },
  RESIDENCE:    { color: "#065f46", bg: "#d1fae5" },
  DISTRICT:     { color: "#7c3aed", bg: "#ede9fe" },
  OTHER:        { color: "#475569", bg: "#f1f5f9" },
}

function Badge({ label, color, bg }: { label: string; color: string; bg: string }) {
  return <span className="gov-badge" style={{ color, background: bg }}>{label}</span>
}

function OfficeDrawer({
  office, canWrite, onClose, onRefresh,
}: {
  office: Office; canWrite: boolean; onClose: () => void; onRefresh: () => void
}) {
  const [form, setForm] = useState({
    name: office.name, officeType: office.officeType,
    address: office.address || "", city: office.city || "",
    phone: office.phone || "", email: office.email || "",
    inChargeName: office.inChargeName || "",
    isActive: office.isActive, isDefault: office.isDefault,
  })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState("")
  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }))

  const save = async () => {
    setSaving(true); setMsg("")
    const res = await fetch(`/api/offices/${office.id}`, {
      method: "PATCH", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name, officeType: form.officeType,
        address: form.address || null, city: form.city || null,
        phone: form.phone || null, email: form.email || null,
        inChargeName: form.inChargeName || null,
        isActive: form.isActive, isDefault: form.isDefault,
      }),
    })
    const d = await res.json()
    setSaving(false)
    if (d.success) { setMsg("Saved"); onRefresh() }
    else setMsg(d.error || "Failed")
  }

  const tc = TYPE_COLORS[office.officeType] || TYPE_COLORS.OTHER

  return (
    <>
      <button className="gov-overlay" onClick={onClose} />
      <aside className="gov-drawer">
        <header className="gov-drawer-header">
          <div>
            <div className="gov-drawer-title">{office.name}</div>
            <div className="gov-drawer-sub">{office.officeType}{office.isDefault ? " · Default Office" : ""}</div>
          </div>
          <button className="gov-drawer-close" onClick={onClose}><X size={15} /></button>
        </header>
        <div className="gov-drawer-body">
          <div style={{ display: "flex", gap: 8 }}>
            <Badge label={office.officeType} color={tc.color} bg={tc.bg} />
            {office.isDefault && <Badge label="Default" color="#1e40af" bg="#dbeafe" />}
            <Badge label={office.isActive ? "Active" : "Inactive"} color={office.isActive ? "#065f46" : "#991b1b"} bg={office.isActive ? "#d1fae5" : "#fee2e2"} />
          </div>

          <div className="gov-info-grid">
            <div className="gov-info-box"><div className="gov-label">Open Tasks</div><div style={{ fontSize: 22, fontWeight: 700, color: "var(--navy)" }}>{office._count.tasks}</div></div>
          </div>

          {office.address && <div><div className="gov-label">Address</div><div style={{ fontSize: 13, display: "flex", gap: 5 }}><MapPin size={13} color="var(--sub)" style={{ marginTop: 2, flexShrink: 0 }} />{office.address}{office.city ? `, ${office.city}` : ""}</div></div>}
          {office.phone && <div><div className="gov-label">Phone</div><div style={{ fontSize: 13, display: "flex", gap: 5 }}><Phone size={13} color="var(--sub)" />{office.phone}</div></div>}
          {office.email && <div><div className="gov-label">Email</div><div style={{ fontSize: 13, display: "flex", gap: 5 }}><Mail size={13} color="var(--sub)" />{office.email}</div></div>}
          {office.inChargeName && <div><div className="gov-label">In-Charge</div><div style={{ fontSize: 13 }}>{office.inChargeName}</div></div>}

          {canWrite && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, background: "#f0f7ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)" }}>Edit Office</div>
              <div><label className="gov-label">Name</label><input className="gov-input" value={form.name} onChange={e => set("name", e.target.value)} /></div>
              <div className="gov-form-grid gov-form-grid-2">
                <div>
                  <label className="gov-label">Type</label>
                  <select className="gov-select" value={form.officeType} onChange={e => set("officeType", e.target.value)}>
                    {OFFICE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div><label className="gov-label">City</label><input className="gov-input" value={form.city} onChange={e => set("city", e.target.value)} /></div>
              </div>
              <div><label className="gov-label">Address</label><input className="gov-input" value={form.address} onChange={e => set("address", e.target.value)} /></div>
              <div className="gov-form-grid gov-form-grid-2">
                <div><label className="gov-label">Phone</label><input className="gov-input" type="tel" value={form.phone} onChange={e => set("phone", e.target.value)} /></div>
                <div><label className="gov-label">Email</label><input className="gov-input" type="email" value={form.email} onChange={e => set("email", e.target.value)} /></div>
              </div>
              <div><label className="gov-label">In-Charge Name</label><input className="gov-input" value={form.inChargeName} onChange={e => set("inChargeName", e.target.value)} /></div>
              <div style={{ display: "flex", gap: 16 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
                  <input type="checkbox" checked={form.isActive} onChange={e => set("isActive", e.target.checked)} />Active
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
                  <input type="checkbox" checked={form.isDefault} onChange={e => set("isDefault", e.target.checked)} />Set as Default
                </label>
              </div>
              {msg && <div style={{ fontSize: 13, color: msg === "Saved" ? "var(--success)" : "var(--crit)", fontWeight: 600 }}>{msg}</div>}
              <button className="gov-btn gov-btn-primary" disabled={saving} onClick={save}>{saving ? "Saving…" : "Save Changes"}</button>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}

function NewOfficeDrawer({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ name: "", officeType: "CONSTITUENCY", address: "", city: "", phone: "", email: "", inChargeName: "", isDefault: false })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState("")
  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setErr("")
    try {
      const res = await fetch("/api/offices", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, address: form.address || null, city: form.city || null, phone: form.phone || null, email: form.email || null, inChargeName: form.inChargeName || null }),
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
          <div><div className="gov-drawer-title">Add Office</div></div>
          <button className="gov-drawer-close" onClick={onClose}><X size={15} /></button>
        </header>
        <div className="gov-drawer-body">
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 13 }}>
            <div><label className="gov-label">Office Name *</label><input className="gov-input" required value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Peddapalli Camp Office" /></div>
            <div className="gov-form-grid gov-form-grid-2">
              <div>
                <label className="gov-label">Type</label>
                <select className="gov-select" value={form.officeType} onChange={e => set("officeType", e.target.value)}>
                  {OFFICE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div><label className="gov-label">City</label><input className="gov-input" value={form.city} onChange={e => set("city", e.target.value)} /></div>
            </div>
            <div><label className="gov-label">Address</label><input className="gov-input" value={form.address} onChange={e => set("address", e.target.value)} /></div>
            <div className="gov-form-grid gov-form-grid-2">
              <div><label className="gov-label">Phone</label><input className="gov-input" type="tel" value={form.phone} onChange={e => set("phone", e.target.value)} /></div>
              <div><label className="gov-label">Email</label><input className="gov-input" type="email" value={form.email} onChange={e => set("email", e.target.value)} /></div>
            </div>
            <div><label className="gov-label">In-Charge Name</label><input className="gov-input" value={form.inChargeName} onChange={e => set("inChargeName", e.target.value)} /></div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
              <input type="checkbox" checked={form.isDefault} onChange={e => set("isDefault", e.target.checked)} />Set as Default Office
            </label>
            {err && <div style={{ color: "var(--crit)", fontSize: 13 }}>{err}</div>}
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" className="gov-btn gov-btn-outline" onClick={onClose}>Cancel</button>
              <button type="submit" className="gov-btn gov-btn-primary" disabled={saving}><Plus size={14} />{saving ? "Adding…" : "Add Office"}</button>
            </div>
          </form>
        </div>
      </aside>
    </>
  )
}

export default function OfficesPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const user = session?.user as any
  const role = user?.role || ""
  const userName = user?.name || "Admin"

  const canRead  = READ_ROLES.includes(role)
  const canWrite = WRITE_ROLES.includes(role)

  const [offices, setOffices] = useState<Office[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Office | null>(null)
  const [showNew, setShowNew]   = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch("/api/offices", { credentials: "include" })
    const d = await res.json()
    if (d.success) setOffices(d.offices)
    setLoading(false)
  }, [])

  useEffect(() => { if (canRead) load() }, [canRead, load])

  const handleNav = (key: string) => {
    const routes: Record<string, string> = {
      overview: "/admin/dashboard", users: "/admin/dashboard",
      "party-posts": "/admin/party-posts", settings: "/minister/settings",
    }
    if (key in routes) router.push(routes[key])
  }

  if (!canRead) return <div style={{ padding: 40, color: "var(--crit)" }}>Access denied.</div>

  return (
    <div className="gov-app">
      <GovSidebar items={NAV} active="offices" onNav={handleNav} role={role} userName={userName} />
      <main className="gov-main">
        <header className="gov-header">
          <div>
            <div className="gov-header-title">Office Management</div>
            <div className="gov-header-sub">Manage all ministerial offices across locations</div>
          </div>
          <div className="gov-header-actions">
            <button className="gov-header-btn" onClick={load}><RefreshCw size={15} /></button>
            <button className="gov-header-btn"><Bell size={15} /></button>
            {canWrite && (
              <button className="gov-btn gov-btn-primary" onClick={() => setShowNew(true)}>
                <Plus size={14} />Add Office
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
          <div className="gov-kpi-grid">
            {[
              { label: "Total Offices", value: offices.length,                                accent: "#2F6FED", Icon: Building2 },
              { label: "Active",        value: offices.filter(o => o.isActive).length,        accent: "#16A34A", Icon: CheckCircle2 },
              { label: "Open Tasks",    value: offices.reduce((s, o) => s + o._count.tasks, 0), accent: "#D97706", Icon: Activity },
              { label: "Default",       value: offices.find(o => o.isDefault)?.name || "None", accent: "#7c3aed", Icon: Shield },
            ].map(({ label, value, accent, Icon: Ic }) => (
              <div key={label} className="gov-kpi">
                <div className="gov-kpi-top"><div className="gov-kpi-icon" style={{ background: `${accent}18` }}><Ic size={17} color={accent} /></div></div>
                <div className="gov-kpi-value" style={{ fontSize: typeof value === "string" ? 14 : undefined }}>{loading ? <div className="gov-skel gov-kpi-skel" /> : value}</div>
                <div className="gov-kpi-label">{label}</div>
              </div>
            ))}
          </div>

          <div className="gov-card gov-card-p">
            <div className="gov-card-header">
              <div className="gov-card-title">
                <div className="gov-card-icon" style={{ background: "#eff6ff" }}><Building2 size={14} color="#2F6FED" /></div>
                All Offices <span style={{ fontSize: 12, color: "var(--sub)", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 5, padding: "1px 8px" }}>{offices.length}</span>
              </div>
            </div>

            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[1,2,3].map(i => <div key={i} className="gov-skel" style={{ height: 48, borderRadius: 7 }} />)}
              </div>
            ) : offices.length === 0 ? (
              <div className="gov-empty"><Building2 size={24} style={{ margin: "0 auto 10px", opacity: 0.3 }} /><div>No offices found.</div></div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="gov-table">
                  <thead><tr><th>Name</th><th>Type</th><th>City</th><th>In-Charge</th><th>Open Tasks</th><th>Status</th><th></th></tr></thead>
                  <tbody>
                    {offices.map(o => {
                      const tc = TYPE_COLORS[o.officeType] || TYPE_COLORS.OTHER
                      return (
                        <tr key={o.id}>
                          <td style={{ fontWeight: 600 }}>{o.name}{o.isDefault && <span style={{ marginLeft: 6, fontSize: 10, color: "#1e40af", background: "#dbeafe", borderRadius: 4, padding: "1px 5px" }}>DEFAULT</span>}</td>
                          <td><Badge label={o.officeType} color={tc.color} bg={tc.bg} /></td>
                          <td style={{ color: "var(--sub)", fontSize: 12 }}>{o.city || "—"}</td>
                          <td style={{ fontSize: 12 }}>{o.inChargeName || "—"}</td>
                          <td style={{ fontWeight: 600 }}>{o._count.tasks}</td>
                          <td><Badge label={o.isActive ? "Active" : "Inactive"} color={o.isActive ? "#065f46" : "#991b1b"} bg={o.isActive ? "#d1fae5" : "#fee2e2"} /></td>
                          <td><button className="gov-btn gov-btn-outline gov-btn-sm" onClick={() => setSelected(o)}>Manage</button></td>
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

      {showNew && <NewOfficeDrawer onClose={() => setShowNew(false)} onCreated={() => { setShowNew(false); load() }} />}
      {selected && <OfficeDrawer office={selected} canWrite={canWrite} onClose={() => setSelected(null)} onRefresh={() => { load(); setSelected(null) }} />}
    </div>
  )
}
