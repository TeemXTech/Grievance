"use client"

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
  AudioLines,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Mail,
  MessageCircle,
  Music2,
  Plus,
  RefreshCw,
  Settings,
  Users,
  X,
} from "lucide-react"
import { GovSidebar, type NavItem } from "@/components/GovSidebar"

interface WhatsAppMessage {
  id: string
  phone: string
  message: string
  rawText: string
  isProcessed: boolean
  processedAt: string | null
  grievanceId: string | null
  mediaUrl: string | null
  mediaType: string | null
  mediaCaption: string | null
  createdAt: string
}

interface MessagesResponse {
  success: boolean
  messages: WhatsAppMessage[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

interface ApproveForm {
  title: string
  description: string
  requesterName: string
  requesterPhone: string
  requesterAddress: string
  priority: "URGENT" | "HIGH" | "MEDIUM" | "LOW"
  status: "PENDING" | "ASSIGNED"
}

type InboxTab = "pending" | "processed" | "all"
type TabData = Record<InboxTab, WhatsAppMessage[]>
type TabTotals = Record<InboxTab, number>

const NAV: NavItem[] = [
  { key: "petitions", label: "All Petitions", Icon: FileText },
  { key: "new", label: "New Petition", Icon: Plus },
  { key: "whatsapp", label: "WhatsApp Inbox", Icon: MessageCircle },
  { key: "visitors", label: "Visitors", Icon: Users },
  { key: "letters", label: "Letters", Icon: Mail },
  { key: "calendar", label: "Calendar", Icon: Calendar },
  { key: "settings", label: "Settings", Icon: Settings },
]

const TAB_LABELS: Record<InboxTab, string> = {
  pending: "Pending",
  processed: "Processed",
  all: "All messages",
}

const EMPTY_MESSAGES: TabData = { pending: [], processed: [], all: [] }
const EMPTY_TOTALS: TabTotals = { pending: 0, processed: 0, all: 0 }
const ALLOWED_ROLES = ["PA", "ADMIN", "BACK_OFFICER"]

function formatReceivedAt(value: string, includeMonth = false) {
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: includeMonth ? "long" : "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function mediaPresentation(mediaType: string | null) {
  const type = mediaType?.toLowerCase()
  if (type === "image") return { label: "Image", Icon: ImageIcon }
  if (type === "audio") return { label: "Audio", Icon: Music2 }
  if (type === "document") return { label: "Doc", Icon: FileText }
  return { label: "Media", Icon: AudioLines }
}

function getRequestError(status?: number) {
  if (status === 401) return "Session expired. Please log in again."
  if (status === 403) return "Access denied. PA, Admin, or Back Officer role required."
  if (status) return "We couldn't load the WhatsApp inbox. Please try again."
  return "Network error. Check your connection and retry."
}

function createInitialForm(message: WhatsAppMessage): ApproveForm {
  return {
    title: message.message.slice(0, 80),
    description: message.message,
    requesterName: "",
    requesterPhone: message.phone,
    requesterAddress: "",
    priority: "MEDIUM",
    status: "PENDING",
  }
}

function MediaTypeBadge({ mediaType }: { mediaType: string | null }) {
  const normalizedType = mediaType?.toLowerCase()
  const Icon = normalizedType === "image" ? ImageIcon : normalizedType === "audio" ? Music2 : FileText
  const label = normalizedType === "image" ? "Image" : normalizedType === "audio" ? "Audio" : "Document"
  return <span className="gov-badge" style={{ color: "#475569", background: "#f1f5f9", gap: 5 }}><Icon size={13} />{label}</span>
}

function MessageDrawer({
  message,
  submitting,
  onClose,
  onApprove,
}: {
  message: WhatsAppMessage
  submitting: boolean
  onClose: () => void
  onApprove: (form: ApproveForm) => Promise<void>
}) {
  const [form, setForm] = useState(() => createInitialForm(message))

  useEffect(() => setForm(createInitialForm(message)), [message])

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void onApprove(form)
  }

  return (
    <>
      <button type="button" className="gov-overlay" onClick={onClose} aria-label="Close message details" />
      <aside className="gov-drawer" role="dialog" aria-modal="true" aria-labelledby="message-drawer-title">
        <header className="gov-drawer-header">
          <div>
            <div className="gov-drawer-title" id="message-drawer-title">Message details</div>
            <div className="gov-drawer-sub">Received {formatReceivedAt(message.createdAt, true)}</div>
          </div>
          <button className="gov-drawer-close" type="button" onClick={onClose} aria-label="Close drawer"><X size={15} /></button>
        </header>

        <div className="gov-drawer-body">
          <section aria-label="Message information">
            <div style={{ color: "var(--sub)", fontSize: 10, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 5 }}>Sender</div>
            <div style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 20, fontWeight: 700, color: "var(--navy)" }}>{message.phone}</div>
            <div style={{ color: "var(--sub)", fontSize: 12, marginTop: 4 }}>{formatReceivedAt(message.createdAt, true)}</div>
          </section>

          <section>
            <div className="gov-label">Full message</div>
            <div style={{ minHeight: 100, maxHeight: 220, overflowY: "auto", border: "1px solid var(--border)", borderRadius: 9, padding: 14, background: "var(--bg)", color: "var(--text)", fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
              {message.rawText || message.message}
            </div>
          </section>

          {message.mediaUrl && (
            <section style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 9 }}>
              <div className="gov-label" style={{ marginBottom: 0 }}>Attachment</div>
              <MediaTypeBadge mediaType={message.mediaType} />
              {message.mediaCaption && <div style={{ color: "var(--sub)", fontSize: 12 }}>{message.mediaCaption}</div>}
              <a className="gov-btn gov-btn-outline gov-btn-sm" href={message.mediaUrl} target="_blank" rel="noopener noreferrer">
                View attachment <ExternalLink size={13} />
              </a>
            </section>
          )}

          {message.isProcessed ? (
            <div role="status" style={{ border: "1px solid #bbf7d0", background: "#f0fdf4", color: "#166534", borderRadius: 9, padding: 14, fontSize: 13, lineHeight: 1.6 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontWeight: 700 }}><CheckCircle2 size={16} /> Converted to grievance</span>
              <div style={{ marginTop: 5, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", overflowWrap: "anywhere" }}>{message.grievanceId || "Reference unavailable"}</div>
            </div>
          ) : (
            <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 13 }}>
              <div style={{ paddingBottom: 10, borderBottom: "1px solid var(--border)" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)" }}>Approve as grievance</div>
                <div style={{ fontSize: 12, color: "var(--sub)", marginTop: 3 }}>Confirm the citizen details before creating a record.</div>
              </div>

              <div>
                <label className="gov-label" htmlFor="whatsapp-title">Title *</label>
                <input id="whatsapp-title" className="gov-input" required maxLength={160} value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
              </div>
              <div>
                <label className="gov-label" htmlFor="whatsapp-requester-name">Requester name *</label>
                <input id="whatsapp-requester-name" className="gov-input" required autoComplete="name" value={form.requesterName} onChange={(event) => setForm((current) => ({ ...current, requesterName: event.target.value }))} />
              </div>
              <div>
                <label className="gov-label" htmlFor="whatsapp-requester-phone">Phone *</label>
                <input id="whatsapp-requester-phone" className="gov-input" required type="tel" autoComplete="tel" value={form.requesterPhone} onChange={(event) => setForm((current) => ({ ...current, requesterPhone: event.target.value }))} />
              </div>
              <div>
                <label className="gov-label" htmlFor="whatsapp-requester-address">Address</label>
                <input id="whatsapp-requester-address" className="gov-input" autoComplete="street-address" value={form.requesterAddress} onChange={(event) => setForm((current) => ({ ...current, requesterAddress: event.target.value }))} />
              </div>
              <div className="gov-form-grid gov-form-grid-2">
                <div>
                  <label className="gov-label" htmlFor="whatsapp-priority">Priority</label>
                  <select id="whatsapp-priority" className="gov-select" value={form.priority} onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value as ApproveForm["priority"] }))}>
                    <option value="URGENT">Urgent</option><option value="HIGH">High</option><option value="MEDIUM">Medium</option><option value="LOW">Low</option>
                  </select>
                </div>
                <div>
                  <label className="gov-label" htmlFor="whatsapp-status">Status</label>
                  <select id="whatsapp-status" className="gov-select" value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as ApproveForm["status"] }))}>
                    <option value="PENDING">Pending</option><option value="ASSIGNED">Assigned</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="gov-label" htmlFor="whatsapp-description">Description *</label>
                <textarea id="whatsapp-description" className="gov-textarea" rows={4} required value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
              </div>
              <button type="submit" className="gov-btn gov-btn-primary" disabled={submitting}>
                {submitting ? "Creating grievance…" : "Approve as Grievance"}
              </button>
            </form>
          )}
        </div>
      </aside>
    </>
  )
}

export default function WhatsAppInboxPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const user = session?.user as any
  const role = user?.role || ""
  const userName = user?.name || "Staff"
  const hasAccess = ALLOWED_ROLES.includes(String(role).toUpperCase())

  const [activeTab, setActiveTab] = useState<InboxTab>("pending")
  const [messages, setMessages] = useState<TabData>(EMPTY_MESSAGES)
  const [totals, setTotals] = useState<TabTotals>(EMPTY_TOTALS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMessage, setSelectedMessage] = useState<WhatsAppMessage | null>(null)
  const [approving, setApproving] = useState(false)
  const [toast, setToast] = useState("")

  const loadMessages = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const filters: Array<[InboxTab, string]> = [
        ["pending", "?processed=false&page=1"],
        ["processed", "?processed=true&page=1"],
        ["all", "?page=1"],
      ]
      const responses = await Promise.all(
        filters.map(async ([tab, query]) => {
          const response = await fetch(`/api/whatsapp/pending${query}`, { credentials: "include" })
          if (!response.ok) throw Object.assign(new Error("Inbox request failed"), { status: response.status })
          const payload = (await response.json()) as MessagesResponse
          if (!payload.success) throw Object.assign(new Error("Inbox request failed"), { status: 500 })
          return [tab, payload] as const
        }),
      )
      const nextMessages = { ...EMPTY_MESSAGES }
      const nextTotals = { ...EMPTY_TOTALS }
      for (const [tab, payload] of responses) {
        nextMessages[tab] = payload.messages || []
        nextTotals[tab] = payload.total || 0
      }
      setMessages(nextMessages)
      setTotals(nextTotals)
    } catch (requestError) {
      setError(getRequestError((requestError as { status?: number }).status))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (hasAccess) void loadMessages()
  }, [hasAccess, loadMessages])

  useEffect(() => {
    if (!toast) return
    const timeout = window.setTimeout(() => setToast(""), 3500)
    return () => window.clearTimeout(timeout)
  }, [toast])

  const processedToday = useMemo(() => {
    const today = new Date().toLocaleDateString("en-CA")
    return messages.processed.filter((message) => message.processedAt && new Date(message.processedAt).toLocaleDateString("en-CA") === today).length
  }, [messages.processed])

  const withMedia = useMemo(() => messages.all.filter((message) => Boolean(message.mediaUrl)).length, [messages.all])
  const activeMessages = messages[activeTab]

  const approveMessage = async (form: ApproveForm) => {
    if (!selectedMessage) return
    setApproving(true)
    setError(null)
    try {
      const response = await fetch(`/api/whatsapp/${encodeURIComponent(selectedMessage.id)}/approve`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          requester_name: form.requesterName,
          requester_phone: form.requesterPhone,
          requester_address: form.requesterAddress,
          priority: form.priority,
          status: form.status,
        }),
      })
      if (!response.ok) throw Object.assign(new Error("Approval failed"), { status: response.status })
      const result = await response.json()
      if (!result.success || !result.grievance) throw Object.assign(new Error("Approval failed"), { status: 500 })
      setToast(`Grievance ${result.grievance.referenceNumber} created`)
      setSelectedMessage(null)
      setActiveTab("processed")
      await loadMessages()
    } catch (requestError) {
      setError(getRequestError((requestError as { status?: number }).status))
    } finally {
      setApproving(false)
    }
  }

  const handleNav = (key: string) => {
    const routes: Record<string, string> = {
      petitions: "/pa/dashboard",
      new: "/pa/dashboard",
      visitors: "/visitors/dashboard",
      letters: "/letters/dashboard",
      calendar: "/minister/calendar",
      settings: "/minister/settings",
    }
    if (key in routes) router.push(routes[key])
  }

  if (!hasAccess) return <div>Access denied.</div>

  return (
    <div className="gov-app">
      <GovSidebar items={NAV} active="whatsapp" onNav={handleNav} role={role} userName={userName} />
      <main className="gov-main">
        <header className="gov-header">
          <div>
            <div className="gov-header-title">WhatsApp Inbox</div>
            <div className="gov-header-sub">Review incoming citizen messages and convert them into grievances</div>
          </div>
          <div className="gov-header-actions">
            <button className="gov-header-btn" type="button" onClick={() => void loadMessages()} aria-label="Refresh messages" title="Refresh messages">
              <RefreshCw size={15} />
            </button>
            <div className="gov-header-profile" aria-label={`Signed in as ${userName}, ${role}`}>
              <div className="gov-avatar">{userName.split(" ").map((part: string) => part[0]).join("").slice(0, 2).toUpperCase()}</div>
              <div><div className="gov-avatar-name">{userName}</div><div className="gov-avatar-role">{String(role).replaceAll("_", " ")}</div></div>
              <ChevronDown size={13} color="var(--sub)" />
            </div>
          </div>
        </header>

        <div className="gov-body">
          <section className="gov-kpi-grid" aria-label="WhatsApp message summary">
            {[
              { label: "Total Messages", value: totals.all, accent: "#2F6FED", Icon: MessageCircle },
              { label: "Pending", value: totals.pending, accent: "#D97706", Icon: Clock3 },
              { label: "Processed Today", value: processedToday, accent: "#16A34A", Icon: CheckCircle2 },
              { label: "With Media", value: withMedia, accent: "#7C3AED", Icon: ImageIcon },
            ].map(({ label, value, accent, Icon }) => (
              <article className="gov-kpi" key={label}>
                <div className="gov-kpi-top"><div className="gov-kpi-icon" style={{ background: `${accent}18` }}><Icon size={17} color={accent} /></div></div>
                <div className="gov-kpi-value">{loading ? <div className="gov-skel gov-kpi-skel" aria-label="Loading" /> : value}</div>
                <div className="gov-kpi-label">{label}</div>
              </article>
            ))}
          </section>

          {error && (
            <div className="gov-error" role="alert">
              <span>{error}</span>
              {(error.startsWith("Network error") || error.startsWith("We couldn't")) && (
                <button type="button" className="gov-btn gov-btn-outline gov-btn-sm" onClick={() => void loadMessages()}><RefreshCw size={13} /> Retry</button>
              )}
            </div>
          )}

          <section className="gov-card gov-card-p" aria-labelledby="messages-heading">
            <div className="gov-card-header" style={{ alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
              <div>
                <div className="gov-card-title" id="messages-heading">
                  <span className="gov-card-icon" style={{ background: "#e9f8f1" }}><MessageCircle size={16} color="#128C7E" /></span>
                  {activeTab === "pending" ? "Pending messages" : TAB_LABELS[activeTab]}
                </div>
                <div style={{ color: "var(--sub)", fontSize: 12, marginTop: 5 }}>Messages arrive from the public WhatsApp intake channel</div>
              </div>
              <div role="tablist" aria-label="Message status" style={{ display: "flex", gap: 4, padding: 4, borderRadius: 9, border: "1px solid var(--border)", background: "var(--bg)" }}>
                {(["pending", "processed", "all"] as InboxTab[]).map((tab) => (
                  <button key={tab} type="button" role="tab" aria-selected={activeTab === tab} onClick={() => setActiveTab(tab)} className="gov-btn gov-btn-sm" style={{ background: activeTab === tab ? "white" : "transparent", color: activeTab === tab ? "var(--navy)" : "var(--sub)", boxShadow: activeTab === tab ? "0 1px 3px rgba(20,37,68,.12)" : "none" }}>
                    {TAB_LABELS[tab]}<span style={{ minWidth: 18, textAlign: "center", borderRadius: 99, padding: "1px 5px", fontSize: 10, background: activeTab === tab ? "#eff6ff" : "transparent", color: activeTab === tab ? "var(--blue)" : "inherit" }}>{totals[tab]}</span>
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }} aria-label="Loading messages">
                {[1, 2, 3, 4, 5].map((item) => <div className="gov-skel" key={item} style={{ height: 52, borderRadius: 7 }} />)}
              </div>
            ) : activeMessages.length === 0 ? (
              <div className="gov-empty">
                <MessageCircle size={25} style={{ margin: "0 auto 10px", opacity: 0.35 }} />
                <div>{error ? "Inbox is unavailable right now." : `No ${activeTab === "all" ? "messages" : activeTab + " messages"} found.`}</div>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="gov-table">
                  <thead><tr><th>Time received</th><th>Phone</th><th>Message preview</th><th>Media</th>{activeTab !== "pending" && <th>Grievance</th>}{activeTab === "all" && <th>Status</th>}<th>{activeTab === "processed" ? "" : "Actions"}</th></tr></thead>
                  <tbody>
                    {activeMessages.map((message) => {
                      const media = message.mediaUrl ? mediaPresentation(message.mediaType) : null
                      return (
                        <tr key={message.id}>
                          <td style={{ whiteSpace: "nowrap", color: "var(--sub)", fontSize: 12 }}><span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Clock3 size={13} />{formatReceivedAt(message.createdAt)}</span></td>
                          <td style={{ whiteSpace: "nowrap", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 12, fontWeight: 600 }}>{message.phone}</td>
                          <td style={{ minWidth: 220, maxWidth: 360 }}><span style={{ display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: 2, overflow: "hidden", lineHeight: 1.5 }}>{message.message.slice(0, 120)}{message.message.length > 120 ? "…" : ""}</span></td>
                          <td>{media ? <span className="gov-badge" style={{ color: "#475569", background: "#f1f5f9", gap: 5 }}><media.Icon size={12} />{media.label}</span> : <span style={{ color: "var(--sub)" }}>—</span>}</td>
                          {activeTab !== "pending" && <td>{message.grievanceId ? <code style={{ color: "#1e40af", background: "#eff6ff", borderRadius: 5, padding: "3px 7px", fontSize: 11, whiteSpace: "nowrap" }}>{message.grievanceId}</code> : <span style={{ color: "var(--sub)" }}>—</span>}</td>}
                          {activeTab === "all" && <td><span className="gov-badge" style={message.isProcessed ? { color: "#166534", background: "#dcfce7" } : { color: "#92400e", background: "#fef3c7" }}>{message.isProcessed ? "Processed" : "Pending"}</span></td>}
                          <td>{!message.isProcessed && activeTab !== "processed" ? <button type="button" className="gov-btn gov-btn-outline gov-btn-sm" onClick={() => setSelectedMessage(message)}>Review</button> : activeTab === "processed" ? null : <span style={{ color: "var(--sub)" }}>—</span>}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>

      {selectedMessage && <MessageDrawer message={selectedMessage} submitting={approving} onClose={() => setSelectedMessage(null)} onApprove={approveMessage} />}
      {toast && <div className="gov-toast" role="status"><span style={{ display: "grid", placeItems: "center", width: 23, height: 23, borderRadius: 99, color: "#166534", background: "#dcfce7" }}><Check size={14} /></span>{toast}</div>}
    </div>
  )
}
