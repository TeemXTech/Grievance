"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
  Shield, Users, FileText, Activity, Settings, RefreshCw,
  Bell, ChevronDown, Plus, X, CheckCircle2,
} from "lucide-react"
import { GovSidebar, type NavItem } from "@/components/GovSidebar"

interface PartyPost {
  id: string; title: string; wing: string | null; level: string
  description: string | null; isActive: boolean; createdAt: string
  _count: { workers: number }
}

const READ_ROLES  = ["MINISTER", "PA", "ADMIN", "BACK_OFFICER"]
const WRITE_ROLES = ["PA", "ADMIN"]

const LEVELS = ["STATE","DISTRICT","ASSEMBLY","MANDAL","VILLAGE","BOOTH"]

const NAV: NavItem[] = [
  { key: "overview",    label: "Overview",       Icon: Activity },
  { key: "users",       label: "Users",          Icon: Users },
  { key: "party-posts", label: "Party Posts",    Icon: Shield },
  { key: "offices",     label: "Offices",        Icon: FileText },
  { key: "settings",    label: "Settings",       Icon: Settings },
]

const LEVEL_COLORS: Record<string, { color: string; bg: string }> = {
  STATE:    { color: "#991b1b", bg: "#fee2e2" },
  DISTRICT: { color: "#1e40af", bg: "#dbeafe" },
  ASSEMBLY: { color: "#5b21b6", bg: "#ede9fe" },
  MANDAL:   { color: "#7c3aed", bg: "#ede9fe" },
  VILLAGE:  { color: "#065f46", bg: "#d1fae5" },
  BOOTH:    { color: "#92400e", bg: "#fef3c7" },
}

function Badge({ label, color, bg }: { label: string; color: string; bg: string }) {
  return <span className="gov-badge" style={{ color, background: bg }}>{label}</span>
}

function NewPostDrawer({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ title: "", wing: "", level: "MANDAL", description: "" })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState("")
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setErr("")
    try {
      const res = await fetch("/api/party-posts", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: form.title, wing: form.wing || null, level: form.level, description: form.description || null }),
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
          <div><div className="gov-drawer-title">New Party Post</div></div>
          <button className="gov-drawer-close" onClick={onClose}><X size={15} /></button>
        </header>
        <div className="gov-drawer-body">
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 13 }}>
            <div><label className="gov-label">Post Title *</label><input className="gov-input" required value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. Mandal President" /></div>
            <div className="gov-form-grid gov-form-grid-2">
              <div>
                <label className="gov-label">Level *</label>
                <select className="gov-select" value={form.level} onChange={e => set("level", e.target.value)}>
                  {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div><label className="gov-label">Wing</label><input className="gov-input" value={form.wing} onChange={e => set("wing", e.target.value)} placeholder="e.g. Youth Wing" /></div>
            </div>
            <div><label className="gov-label">Description</label><textarea className="gov-textarea" rows={2} value={form.description} onChange={e => set("description", e.target.value)} /></div>
            {err && <div style={{ color: "var(--crit)", fontSize: 13 }}>{err}</div>}
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" className="gov-btn gov-btn-outline" onClick={onClose}>Cancel</button>
              <button type="submit" className="gov-btn gov-btn-primary" disabled={saving}><Plus size={14} />{saving ? "Creating…" : "Create Post"}</button>
            </div>
          </form>
        </div>
      </aside>
    </>
  )
}

export default function PartyPostsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const user = session?.user as any
  const role = user?.role || ""
  const userName = user?.name || "Admin"

  const canRead  = READ_ROLES.includes(role)
  const canWrite = WRITE_ROLES.includes(role)

  const [posts, setPosts]     = useState<PartyPost[]>([])
  const [loading, setLoading] = useState(true)
  const [filterLevel, setFilterLevel] = useState("")
  const [showNew, setShowNew] = useState(false)
  const [toast, setToast]     = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filterLevel) params.set("level", filterLevel)
    const res = await fetch(`/api/party-posts?${params}`, { credentials: "include" })
    const d = await res.json()
    if (d.success) setPosts(d.posts)
    setLoading(false)
  }, [filterLevel])

  useEffect(() => { if (canRead) load() }, [canRead, load])

  const handleNav = (key: string) => {
    const routes: Record<string, string> = {
      overview: "/admin/dashboard", users: "/admin/dashboard",
      offices: "/admin/offices", settings: "/minister/settings",
    }
    if (key in routes) router.push(routes[key])
  }

  const toggleActive = async (post: PartyPost) => {
    const res = await fetch(`/api/party-posts/${post.id}`, {
      method: "PATCH", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !post.isActive }),
    })
    const d = await res.json()
    if (d.success) { setToast(`Post ${post.isActive ? "deactivated" : "activated"}`); load() }
    setTimeout(() => setToast(""), 3000)
  }

  if (!canRead) return <div style={{ padding: 40, color: "var(--crit)" }}>Access denied.</div>

  return (
    <div className="gov-app">
      <GovSidebar items={NAV} active="party-posts" onNav={handleNav} role={role} userName={userName} />
      <main className="gov-main">
        <header className="gov-header">
          <div>
            <div className="gov-header-title">Party Posts</div>
            <div className="gov-header-sub">Manage party designations and wings</div>
          </div>
          <div className="gov-header-actions">
            <button className="gov-header-btn" onClick={load}><RefreshCw size={15} /></button>
            <button className="gov-header-btn"><Bell size={15} /></button>
            {canWrite && (
              <button className="gov-btn gov-btn-primary" onClick={() => setShowNew(true)}>
                <Plus size={14} />New Post
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
              { label: "Total Posts",  value: posts.length,                                accent: "#2F6FED", Icon: Shield },
              { label: "Active",       value: posts.filter(p => p.isActive).length,        accent: "#16A34A", Icon: CheckCircle2 },
              { label: "Total Workers",value: posts.reduce((s, p) => s + p._count.workers, 0), accent: "#7c3aed", Icon: Users },
              { label: "Levels",       value: new Set(posts.map(p => p.level)).size,       accent: "#D97706", Icon: Activity },
            ].map(({ label, value, accent, Icon: Ic }) => (
              <div key={label} className="gov-kpi">
                <div className="gov-kpi-top"><div className="gov-kpi-icon" style={{ background: `${accent}18` }}><Ic size={17} color={accent} /></div></div>
                <div className="gov-kpi-value">{loading ? <div className="gov-skel gov-kpi-skel" /> : value}</div>
                <div className="gov-kpi-label">{label}</div>
              </div>
            ))}
          </div>

          <div className="gov-card gov-card-p">
            <div className="gov-card-header">
              <div className="gov-card-title">
                <div className="gov-card-icon" style={{ background: "#eff6ff" }}><Shield size={14} color="#2F6FED" /></div>
                All Posts <span style={{ fontSize: 12, color: "var(--sub)", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 5, padding: "1px 8px" }}>{posts.length}</span>
              </div>
              <select className="gov-select" style={{ width: 130 }} value={filterLevel} onChange={e => setFilterLevel(e.target.value)}>
                <option value="">All Levels</option>
                {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[1,2,3,4].map(i => <div key={i} className="gov-skel" style={{ height: 48, borderRadius: 7 }} />)}
              </div>
            ) : posts.length === 0 ? (
              <div className="gov-empty"><Shield size={24} style={{ margin: "0 auto 10px", opacity: 0.3 }} /><div>No party posts found.</div></div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="gov-table">
                  <thead><tr><th>Title</th><th>Level</th><th>Wing</th><th>Active Workers</th><th>Status</th>{canWrite && <th>Actions</th>}</tr></thead>
                  <tbody>
                    {posts.map(p => {
                      const lc = LEVEL_COLORS[p.level] || { color: "#475569", bg: "#f1f5f9" }
                      return (
                        <tr key={p.id}>
                          <td style={{ fontWeight: 600 }}>{p.title}</td>
                          <td><Badge label={p.level} color={lc.color} bg={lc.bg} /></td>
                          <td style={{ color: "var(--sub)", fontSize: 12 }}>{p.wing || "—"}</td>
                          <td style={{ fontWeight: 600 }}>{p._count.workers}</td>
                          <td>
                            <Badge
                              label={p.isActive ? "Active" : "Inactive"}
                              color={p.isActive ? "#065f46" : "#991b1b"}
                              bg={p.isActive ? "#d1fae5" : "#fee2e2"}
                            />
                          </td>
                          {canWrite && (
                            <td>
                              <button className="gov-btn gov-btn-outline gov-btn-sm" onClick={() => toggleActive(p)}>
                                {p.isActive ? "Deactivate" : "Activate"}
                              </button>
                            </td>
                          )}
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

      {showNew && <NewPostDrawer onClose={() => setShowNew(false)} onCreated={() => { setShowNew(false); load() }} />}
      {toast && <div className="gov-toast"><CheckCircle2 size={15} color="var(--success)" />{toast}</div>}
    </div>
  )
}
