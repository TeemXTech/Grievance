"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
  Bell, Calendar, ChevronDown, FileText, Mail, MessageCircle,
  Plus, RefreshCw, Send, Settings, Users, X, CheckCircle2,
  Clock3, AlertTriangle, Megaphone, Trash2,
} from "lucide-react"
import { GovSidebar, type NavItem } from "@/components/GovSidebar"

// ─── Types ────────────────────────────────────────────────────────────────────
interface Campaign {
  id: string
  title: string
  messageTemplate: string
  channel: string
  status: string
  segmentLabel: string | null
  recipientCount: number
  sentCount: number | null
  failedCount: number | null
  createdByName: string
  approvedByName: string | null
  scheduledAt: string | null
  sentAt: string | null
  createdAt: string
  notes: string | null
  _count?: { deliveries: number }
}

// ─── Constants ────────────────────────────────────────────────────────────────
const READ_ROLES  = ["MINISTER", "PA", "ADMIN"]
const WRITE_ROLES = ["PA", "ADMIN"]

const NAV: NavItem[] = [
  { key: "petitions",  label: "All Petitions",    Icon: FileText },
  { key: "whatsapp",   label: "WhatsApp Inbox",   Icon: MessageCircle },
  { key: "campaigns",  label: "Bulk Campaigns",   Icon: Megaphone },
  { key: "workers",    label: "Party Workers",    Icon: Users },
  { key: "letters",    label: "Letters",          Icon: Mail },
  { key: "calendar",   label: "Calendar",         Icon: Calendar },
  { key: "settings",   label: "Settings",         Icon: Settings },
]

const STATUS_COLORS: Record<string, { color: string; bg: string }> = {
  DRAFT:            { color: "#475569", bg: "#f1f5f9" },
  PENDING_APPROVAL: { color: "#92400e", bg: "#fef3c7" },
  APPROVED:         { color: "#1e40af", bg: "#dbeafe" },
  SENDING:          { color: "#7c3aed", bg: "#ede9fe" },
  SENT:             { color: "#065f46", bg: "#d1fae5" },
  CANCELLED:        { color: "#991b1b", bg: "#fee2e2" },
}

const CHANNEL_COLORS: Record<string, { color: string; bg: string }> = {
  WHATSAPP: { color: "#065f46", bg: "#d1fae5" },
  SMS:      { color: "#1e40af", bg: "#dbeafe" },
  BOTH:     { color: "#7c3aed", bg: "#ede9fe" },
}

function fmtDate(d: string | null) {
  if (!d) return "—"
  return new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

function Badge({ label, color, bg }: { label: string; color: string; bg: string }) {
  return <span className="gov-badge" style={{ color, background: bg }}>{label}</span>
}

// ─── New Campaign Form ────────────────────────────────────────────────────────
function NewCampaignDrawer({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    title: "", messageTemplate: "", channel: "WHATSAPP",
    segmentLabel: "", scheduledAt: "", notes: "",
  })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState("")

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setErr("")
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title, messageTemplate: form.messageTemplate,
          channel: form.channel,
          segmentLabel: form.segmentLabel || null,
          scheduledAt: form.scheduledAt || null,
          notes: form.notes || null,
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
          <div>
            <div className="gov-drawer-title">New Campaign</div>
            <div className="gov-drawer-sub">Draft a bulk SMS / WhatsApp campaign</div>
          </div>
          <button className="gov-drawer-close" onClick={onClose}><X size={15} /></button>
        </header>
        <div className="gov-drawer-body">
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 13 }}>
            <div>
              <label className="gov-label">Title *</label>
              <input className="gov-input" required value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. Rythu Bandhu Reminder" />
            </div>
            <div>
              <label className="gov-label">Channel</label>
              <select className="gov-select" value={form.channel} onChange={e => set("channel", e.target.value)}>
                <option value="WHATSAPP">WhatsApp</option>
                <option value="SMS">SMS</option>
                <option value="BOTH">Both</option>
              </select>
            </div>
            <div>
              <label className="gov-label">Message Template *</label>
              <textarea className="gov-textarea" rows={5} required value={form.messageTemplate}
                onChange={e => set("messageTemplate", e.target.value)}
                placeholder={"Dear {{Citizen_Name}},\n\nYour Rythu Bandhu payment has been processed..."} />
              <div style={{ fontSize: 11, color: "var(--sub)", marginTop: 4 }}>Use {"{{Citizen_Name}}"} for personalisation</div>
            </div>
            <div>
              <label className="gov-label">Segment Label</label>
              <input className="gov-input" value={form.segmentLabel} onChange={e => set("segmentLabel", e.target.value)} placeholder="e.g. Farmers — Peddapalli Mandal" />
            </div>
            <div>
              <label className="gov-label">Schedule At (optional)</label>
              <input className="gov-input" type="datetime-local" value={form.scheduledAt} onChange={e => set("scheduledAt", e.target.value)} />
            </div>
            <div>
              <label className="gov-label">Notes</label>
              <textarea className="gov-textarea" rows={2} value={form.notes} onChange={e => set("notes", e.target.value)} />
            </div>
            {err && <div style={{ color: "var(--crit)", fontSize: 13 }}>{err}</div>}
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" className="gov-btn gov-btn-outline" onClick={onClose}>Cancel</button>
              <button type="submit" className="gov-btn gov-btn-primary" disabled={saving}>
                <Plus size={14} />{saving ? "Creating…" : "Create Draft"}
              </button>
            </div>
          </form>
        </div>
      </aside>
    </>
  )
}

// ─── Campaign Detail Drawer ───────────────────────────────────────────────────
function CampaignDrawer({
  campaign, canWrite, onClose, onRefresh,
}: {
  campaign: Campaign; canWrite: boolean; onClose: () => void; onRefresh: () => void
}) {
  const [acting, setActing] = useState(false)
  const [toast, setToast] = useState("")

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000) }

  const doApprove = async () => {
    setActing(true)
    const res = await fetch(`/api/campaigns/${campaign.id}/approve`, { method: "POST", credentials: "include" })
    const d = await res.json()
    setActing(false)
    if (d.success) { showToast("Campaign approved"); onRefresh() }
    else showToast(d.error || "Failed")
  }

  const doSend = async () => {
    if (!confirm(`Send to ~${campaign.recipientCount} recipients? This cannot be undone.`)) return
    setActing(true)
    const res = await fetch(`/api/campaigns/${campaign.id}/send`, { method: "POST", credentials: "include" })
    const d = await res.json()
    setActing(false)
    if (d.success) { showToast(`Sent to ${d.sentCount} (${d.failedCount} failed)`); onRefresh() }
    else showToast(d.error || "Failed")
  }

  const doDelete = async () => {
    if (!confirm("Delete this campaign?")) return
    setActing(true)
    await fetch(`/api/campaigns/${campaign.id}`, { method: "DELETE", credentials: "include" })
    setActing(false)
    onClose(); onRefresh()
  }

  const sc = STATUS_COLORS[campaign.status] || STATUS_COLORS.DRAFT
  const cc = CHANNEL_COLORS[campaign.channel] || CHANNEL_COLORS.WHATSAPP

  return (
    <>
      <button className="gov-overlay" onClick={onClose} />
      <aside className="gov-drawer">
        <header className="gov-drawer-header">
          <div>
            <div className="gov-drawer-title">{campaign.title}</div>
            <div className="gov-drawer-sub">Created {fmtDate(campaign.createdAt)} by {campaign.createdByName}</div>
          </div>
          <button className="gov-drawer-close" onClick={onClose}><X size={15} /></button>
        </header>
        <div className="gov-drawer-body">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Badge label={campaign.status} color={sc.color} bg={sc.bg} />
            <Badge label={campaign.channel} color={cc.color} bg={cc.bg} />
          </div>

          <div className="gov-info-grid">
            <div className="gov-info-box"><div className="gov-label">Recipients</div><div style={{ fontSize: 22, fontWeight: 700, color: "var(--navy)" }}>{campaign.recipientCount}</div></div>
            <div className="gov-info-box"><div className="gov-label">Sent</div><div style={{ fontSize: 22, fontWeight: 700, color: "var(--navy)" }}>{campaign.sentCount ?? "—"}</div></div>
            <div className="gov-info-box"><div className="gov-label">Failed</div><div style={{ fontSize: 22, fontWeight: 700, color: campaign.failedCount ? "var(--crit)" : "var(--navy)" }}>{campaign.failedCount ?? "—"}</div></div>
          </div>

          {campaign.segmentLabel && (
            <div><div className="gov-label">Segment</div><div style={{ fontSize: 13, color: "var(--text)" }}>{campaign.segmentLabel}</div></div>
          )}

          <div>
            <div className="gov-label">Message Template</div>
            <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 9, padding: 12, fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap", maxHeight: 200, overflowY: "auto" }}>
              {campaign.messageTemplate}
            </div>
          </div>

          {campaign.scheduledAt && <div><div className="gov-label">Scheduled At</div><div style={{ fontSize: 13 }}>{fmtDate(campaign.scheduledAt)}</div></div>}
          {campaign.sentAt && <div><div className="gov-label">Sent At</div><div style={{ fontSize: 13 }}>{fmtDate(campaign.sentAt)}</div></div>}
          {campaign.approvedByName && <div><div className="gov-label">Approved By</div><div style={{ fontSize: 13 }}>{campaign.approvedByName}</div></div>}
          {campaign.notes && <div><div className="gov-label">Notes</div><div style={{ fontSize: 13, color: "var(--sub)" }}>{campaign.notes}</div></div>}

          {toast && <div style={{ padding: "10px 14px", borderRadius: 8, background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", fontSize: 13, fontWeight: 600 }}>{toast}</div>}

          {canWrite && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {campaign.status === "DRAFT" && (
                <button className="gov-btn gov-btn-outline" disabled={acting}
                  onClick={async () => {
                    setActing(true)
                    await fetch(`/api/campaigns/${campaign.id}`, { method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "PENDING_APPROVAL" }) })
                    setActing(false); onRefresh()
                  }}>
                  Submit for Approval
                </button>
              )}
              {campaign.status === "PENDING_APPROVAL" && (
                <button className="gov-btn gov-btn-primary" disabled={acting} onClick={doApprove}>
                  <CheckCircle2 size={14} />{acting ? "Approving…" : "Approve"}
                </button>
              )}
              {campaign.status === "APPROVED" && (
                <button className="gov-btn gov-btn-primary" disabled={acting} onClick={doSend}>
                  <Send size={14} />{acting ? "Sending…" : "Send Now"}
                </button>
              )}
              {["DRAFT", "PENDING_APPROVAL"].includes(campaign.status) && (
                <button className="gov-btn" style={{ background: "#fef2f2", color: "var(--crit)", border: "1px solid #fecaca" }} disabled={acting} onClick={doDelete}>
                  <Trash2 size={13} />Delete
                </button>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CampaignsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const user = session?.user as any
  const role = user?.role || ""
  const userName = user?.name || "Staff"

  const canRead  = READ_ROLES.includes(role)
  const canWrite = WRITE_ROLES.includes(role)

  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [total, setTotal]         = useState(0)
  const [loading, setLoading]     = useState(true)
  const [filterStatus, setFilterStatus]   = useState("")
  const [filterChannel, setFilterChannel] = useState("")
  const [selected, setSelected]   = useState<Campaign | null>(null)
  const [showNew, setShowNew]     = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filterStatus)  params.set("status",  filterStatus)
    if (filterChannel) params.set("channel", filterChannel)
    const res = await fetch(`/api/campaigns?${params}`, { credentials: "include" })
    const d = await res.json()
    if (d.success) { setCampaigns(d.campaigns); setTotal(d.total) }
    setLoading(false)
  }, [filterStatus, filterChannel])

  useEffect(() => { if (canRead) load() }, [canRead, load])

  const handleNav = (key: string) => {
    const routes: Record<string, string> = {
      petitions: "/pa/dashboard", whatsapp: "/pa/whatsapp",
      workers: "/pa/party-workers", letters: "/letters/dashboard",
      calendar: "/minister/calendar", settings: "/minister/settings",
    }
    if (key in routes) router.push(routes[key])
  }

  const stats = {
    total,
    draft:    campaigns.filter(c => c.status === "DRAFT").length,
    pending:  campaigns.filter(c => c.status === "PENDING_APPROVAL").length,
    sent:     campaigns.filter(c => c.status === "SENT").length,
    totalSent: campaigns.reduce((s, c) => s + (c.sentCount || 0), 0),
  }

  if (!canRead) return <div style={{ padding: 40, color: "var(--crit)" }}>Access denied.</div>

  return (
    <div className="gov-app">
      <GovSidebar items={NAV} active="campaigns" onNav={handleNav} role={role} userName={userName} />
      <main className="gov-main">
        <header className="gov-header">
          <div>
            <div className="gov-header-title">Bulk Campaigns</div>
            <div className="gov-header-sub">SMS &amp; WhatsApp outreach to constituents</div>
          </div>
          <div className="gov-header-actions">
            <button className="gov-header-btn" onClick={load}><RefreshCw size={15} /></button>
            <button className="gov-header-btn"><Bell size={15} /></button>
            {canWrite && (
              <button className="gov-btn gov-btn-primary" onClick={() => setShowNew(true)}>
                <Plus size={14} />New Campaign
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
              { label: "Total Campaigns", value: stats.total,     accent: "#2F6FED", Icon: Megaphone },
              { label: "Drafts",          value: stats.draft,     accent: "#D97706", Icon: Clock3 },
              { label: "Awaiting Approval",value: stats.pending,  accent: "#7c3aed", Icon: AlertTriangle },
              { label: "Messages Sent",   value: stats.totalSent, accent: "#16A34A", Icon: Send },
            ].map(({ label, value, accent, Icon: Ic }) => (
              <div key={label} className="gov-kpi">
                <div className="gov-kpi-top"><div className="gov-kpi-icon" style={{ background: `${accent}18` }}><Ic size={17} color={accent} /></div></div>
                <div className="gov-kpi-value">{loading ? <div className="gov-skel gov-kpi-skel" /> : value}</div>
                <div className="gov-kpi-label">{label}</div>
              </div>
            ))}
          </div>

          {/* Filters + Table */}
          <div className="gov-card gov-card-p">
            <div className="gov-card-header">
              <div className="gov-card-title">
                <div className="gov-card-icon" style={{ background: "#eff6ff" }}><Megaphone size={14} color="#2F6FED" /></div>
                All Campaigns <span style={{ fontSize: 12, color: "var(--sub)", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 5, padding: "1px 8px" }}>{total}</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <select className="gov-select" style={{ width: 140 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                  <option value="">All Status</option>
                  {["DRAFT","PENDING_APPROVAL","APPROVED","SENDING","SENT","CANCELLED"].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select className="gov-select" style={{ width: 130 }} value={filterChannel} onChange={e => setFilterChannel(e.target.value)}>
                  <option value="">All Channels</option>
                  <option value="WHATSAPP">WhatsApp</option>
                  <option value="SMS">SMS</option>
                  <option value="BOTH">Both</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[1,2,3,4].map(i => <div key={i} className="gov-skel" style={{ height: 48, borderRadius: 7 }} />)}
              </div>
            ) : campaigns.length === 0 ? (
              <div className="gov-empty"><Megaphone size={24} style={{ margin: "0 auto 10px", opacity: 0.3 }} /><div>No campaigns found.</div></div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="gov-table">
                  <thead><tr><th>Title</th><th>Channel</th><th>Status</th><th>Recipients</th><th>Sent</th><th>Segment</th><th>Created</th><th></th></tr></thead>
                  <tbody>
                    {campaigns.map(c => {
                      const sc = STATUS_COLORS[c.status] || STATUS_COLORS.DRAFT
                      const cc = CHANNEL_COLORS[c.channel] || CHANNEL_COLORS.WHATSAPP
                      return (
                        <tr key={c.id}>
                          <td style={{ fontWeight: 600 }}>{c.title}</td>
                          <td><Badge label={c.channel} color={cc.color} bg={cc.bg} /></td>
                          <td><Badge label={c.status} color={sc.color} bg={sc.bg} /></td>
                          <td style={{ fontWeight: 600 }}>{c.recipientCount}</td>
                          <td>{c.sentCount ?? "—"}</td>
                          <td style={{ color: "var(--sub)", fontSize: 12 }}>{c.segmentLabel || "—"}</td>
                          <td style={{ color: "var(--sub)", fontSize: 12, whiteSpace: "nowrap" }}>{fmtDate(c.createdAt)}</td>
                          <td><button className="gov-btn gov-btn-outline gov-btn-sm" onClick={() => setSelected(c)}>View</button></td>
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

      {showNew && <NewCampaignDrawer onClose={() => setShowNew(false)} onCreated={() => { setShowNew(false); load() }} />}
      {selected && <CampaignDrawer campaign={selected} canWrite={canWrite} onClose={() => setSelected(null)} onRefresh={() => { load(); setSelected(null) }} />}
    </div>
  )
}
