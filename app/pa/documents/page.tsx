"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
  Bell, Calendar, ChevronDown, FileText, Mail, MessageCircle,
  RefreshCw, Settings, Users, X, Megaphone, FolderOpen,
  ExternalLink, Trash2, Image as ImageIcon, File, FileArchive,
  Upload, CheckCircle2,
} from "lucide-react"
import { GovSidebar, type NavItem } from "@/components/GovSidebar"

interface Document {
  id: string; fileName: string; originalName: string
  fileUrl: string; fileType: string; mimeType: string | null
  fileSize: number | null; uploadedByName: string; createdAt: string
  petitionRequest: { id: string; trackingNumber: string; title: string; applicantName: string } | null
  publicWork: { id: string; workCode: string; title: string } | null
}

const READ_ROLES   = ["MINISTER", "PA", "ADMIN", "BACK_OFFICER"]
const UPLOAD_ROLES = ["PA", "ADMIN", "BACK_OFFICER", "FIELD_OFFICER"]
const DELETE_ROLES = ["PA", "ADMIN"]

const NAV: NavItem[] = [
  { key: "petitions",  label: "All Petitions",  Icon: FileText },
  { key: "whatsapp",   label: "WhatsApp Inbox", Icon: MessageCircle },
  { key: "campaigns",  label: "Bulk Campaigns", Icon: Megaphone },
  { key: "workers",    label: "Party Workers",  Icon: Users },
  { key: "documents",  label: "Documents",      Icon: FolderOpen },
  { key: "calendar",   label: "Calendar",       Icon: Calendar },
  { key: "settings",   label: "Settings",       Icon: Settings },
]

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
}

function fmtSize(bytes: number | null) {
  if (!bytes) return "—"
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`
  if (bytes >= 1024)    return `${(bytes / 1024).toFixed(0)} KB`
  return `${bytes} B`
}

function FileIcon({ mimeType, fileType }: { mimeType: string | null; fileType: string }) {
  const t = (mimeType || fileType || "").toLowerCase()
  if (t.includes("image")) return <ImageIcon size={15} color="#7c3aed" />
  if (t.includes("pdf"))   return <FileText size={15} color="#991b1b" />
  if (t.includes("zip") || t.includes("archive")) return <FileArchive size={15} color="#92400e" />
  return <File size={15} color="#475569" />
}

function Badge({ label, color, bg }: { label: string; color: string; bg: string }) {
  return <span className="gov-badge" style={{ color, background: bg }}>{label}</span>
}

// ─── Upload Drawer ────────────────────────────────────────────────────────────
function UploadDrawer({ onClose, onUploaded }: { onClose: () => void; onUploaded: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [file, setFile]         = useState<File | null>(null)
  const [fileType, setFileType] = useState("DOCUMENT")
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress]   = useState("")
  const [err, setErr]             = useState("")

  const upload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) { setErr("Please select a file"); return }
    setUploading(true); setErr(""); setProgress("Uploading file…")

    try {
      // Step 1: upload file to storage
      const fd = new FormData()
      fd.append("file", file)
      const upRes = await fetch("/api/upload", { method: "POST", credentials: "include", body: fd })
      const upData = await upRes.json()
      if (!upData.success) { setErr(upData.error || "Upload failed"); return }

      setProgress("Registering document…")

      // Step 2: register in documents DB
      const docRes = await fetch("/api/documents", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName:     upData.fileName,
          originalName: upData.originalName,
          fileUrl:      upData.fileUrl,
          fileType:     fileType,
          mimeType:     upData.mimeType,
          fileSize:     upData.fileSize,
        }),
      })
      const docData = await docRes.json()
      if (!docData.success) { setErr(docData.error || "Registration failed"); return }

      setProgress("Done!")
      setTimeout(() => { onUploaded() }, 800)
    } catch { setErr("Network error — please try again") } finally { setUploading(false) }
  }

  return (
    <>
      <button className="gov-overlay" onClick={onClose} />
      <aside className="gov-drawer">
        <header className="gov-drawer-header">
          <div><div className="gov-drawer-title">Upload Document</div><div className="gov-drawer-sub">Max 10 MB · PDF, Word, Excel, Images</div></div>
          <button className="gov-drawer-close" onClick={onClose}><X size={15} /></button>
        </header>
        <div className="gov-drawer-body">
          <form onSubmit={upload} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label className="gov-label">File *</label>
              <div
                style={{ border: "2px dashed var(--border)", borderRadius: 10, padding: "24px 16px", textAlign: "center", cursor: "pointer", background: file ? "#f0fdf4" : "var(--bg)" }}
                onClick={() => fileRef.current?.click()}
              >
                {file ? (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <CheckCircle2 size={18} color="#16A34A" />
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#166534" }}>{file.name}</span>
                    <span style={{ fontSize: 12, color: "var(--sub)" }}>({fmtSize(file.size)})</span>
                  </div>
                ) : (
                  <div>
                    <Upload size={24} color="var(--sub)" style={{ margin: "0 auto 8px" }} />
                    <div style={{ fontSize: 13, color: "var(--sub)" }}>Click to select file</div>
                    <div style={{ fontSize: 11, color: "var(--sub)", marginTop: 4 }}>PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, WEBP</div>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" style={{ display: "none" }}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp,.gif"
                onChange={e => { const f = e.target.files?.[0]; if (f) setFile(f) }}
              />
            </div>

            <div>
              <label className="gov-label">Document Type</label>
              <select className="gov-select" value={fileType} onChange={e => setFileType(e.target.value)}>
                {["DOCUMENT","HANDWRITTEN_PETITION","SANCTION_ORDER","WORK_PROGRESS_PHOTO","MEDICAL_BILL","IDENTITY_PROOF","LAND_DOCUMENT","LETTER","OTHER"].map(t => (
                  <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
                ))}
              </select>
            </div>

            {progress && !err && <div style={{ fontSize: 13, color: "var(--success)", fontWeight: 600 }}>{progress}</div>}
            {err && <div style={{ fontSize: 13, color: "var(--crit)" }}>{err}</div>}

            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" className="gov-btn gov-btn-outline" onClick={onClose}>Cancel</button>
              <button type="submit" className="gov-btn gov-btn-primary" disabled={uploading || !file}>
                <Upload size={14} />{uploading ? "Uploading…" : "Upload"}
              </button>
            </div>
          </form>
        </div>
      </aside>
    </>
  )
}

// ─── Document Detail Drawer ───────────────────────────────────────────────────
function DocumentDrawer({
  doc, canDelete, onClose, onDeleted,
}: {
  doc: Document; canDelete: boolean; onClose: () => void; onDeleted: () => void
}) {
  const [deleting, setDeleting] = useState(false)

  const doDelete = async () => {
    if (!confirm(`Delete "${doc.originalName}"? This cannot be undone.`)) return
    setDeleting(true)
    const res = await fetch(`/api/documents/${doc.id}`, { method: "DELETE", credentials: "include" })
    const d = await res.json()
    setDeleting(false)
    if (d.success) onDeleted()
  }

  return (
    <>
      <button className="gov-overlay" onClick={onClose} />
      <aside className="gov-drawer">
        <header className="gov-drawer-header">
          <div>
            <div className="gov-drawer-title" style={{ wordBreak: "break-all" }}>{doc.originalName}</div>
            <div className="gov-drawer-sub">Uploaded {fmtDate(doc.createdAt)} by {doc.uploadedByName}</div>
          </div>
          <button className="gov-drawer-close" onClick={onClose}><X size={15} /></button>
        </header>
        <div className="gov-drawer-body">
          <div className="gov-info-grid">
            <div className="gov-info-box"><div className="gov-label">Type</div><div style={{ fontSize: 13, fontWeight: 600 }}>{doc.fileType.replace(/_/g, " ")}</div></div>
            <div className="gov-info-box"><div className="gov-label">Size</div><div style={{ fontSize: 13, fontWeight: 600 }}>{fmtSize(doc.fileSize)}</div></div>
          </div>

          {doc.mimeType && <div><div className="gov-label">MIME Type</div><div style={{ fontSize: 12, fontFamily: "monospace", color: "var(--sub)" }}>{doc.mimeType}</div></div>}

          {doc.petitionRequest && (
            <div style={{ padding: "10px 14px", borderRadius: 8, background: "#eff6ff", border: "1px solid #bfdbfe" }}>
              <div className="gov-label" style={{ color: "#1e40af" }}>Linked Petition</div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{doc.petitionRequest.title}</div>
              <div style={{ fontSize: 11, color: "#1e40af", fontFamily: "monospace" }}>{doc.petitionRequest.trackingNumber}</div>
            </div>
          )}

          {doc.publicWork && (
            <div style={{ padding: "10px 14px", borderRadius: 8, background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
              <div className="gov-label" style={{ color: "#065f46" }}>Linked Public Work</div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{doc.publicWork.title}</div>
              <div style={{ fontSize: 11, color: "#065f46", fontFamily: "monospace" }}>{doc.publicWork.workCode}</div>
            </div>
          )}

          <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer"
            className="gov-btn gov-btn-primary"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none" }}>
            <ExternalLink size={14} />Open File
          </a>

          {canDelete && (
            <button className="gov-btn" style={{ background: "#fef2f2", color: "var(--crit)", border: "1px solid #fecaca" }} disabled={deleting} onClick={doDelete}>
              <Trash2 size={13} />{deleting ? "Deleting…" : "Delete Document"}
            </button>
          )}
        </div>
      </aside>
    </>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DocumentsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const user = session?.user as any
  const role = user?.role || ""
  const userName = user?.name || "Staff"

  const canRead   = READ_ROLES.includes(role)
  const canUpload = UPLOAD_ROLES.includes(role)
  const canDelete = DELETE_ROLES.includes(role)

  const [docs, setDocs]       = useState<Document[]>([])
  const [total, setTotal]     = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage]       = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState("")
  const [filterType, setFilterType]     = useState("")
  const [filterLinked, setFilterLinked] = useState("")
  const [selected, setSelected]   = useState<Document | null>(null)
  const [showUpload, setShowUpload] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search)       params.set("search",   search)
    if (filterType)   params.set("fileType", filterType)
    if (filterLinked) params.set("linkedTo", filterLinked)
    params.set("page", String(page))
    const res = await fetch(`/api/documents?${params}`, { credentials: "include" })
    const d = await res.json()
    if (d.success) { setDocs(d.documents); setTotal(d.total); setTotalPages(d.totalPages) }
    setLoading(false)
  }, [search, filterType, filterLinked, page])

  useEffect(() => { if (canRead) load() }, [canRead, load])

  const handleNav = (key: string) => {
    const routes: Record<string, string> = {
      petitions: "/pa/dashboard", whatsapp: "/pa/whatsapp",
      campaigns: "/pa/campaigns", workers: "/pa/party-workers",
      calendar: "/minister/calendar", settings: "/minister/settings",
    }
    if (key in routes) router.push(routes[key])
  }

  const withPetition = docs.filter(d => d.petitionRequest).length
  const withWork     = docs.filter(d => d.publicWork).length
  const images       = docs.filter(d => (d.mimeType || "").includes("image")).length

  if (!canRead) return <div style={{ padding: 40, color: "var(--crit)" }}>Access denied.</div>

  return (
    <div className="gov-app">
      <GovSidebar items={NAV} active="documents" onNav={handleNav} role={role} userName={userName} />
      <main className="gov-main">
        <header className="gov-header">
          <div>
            <div className="gov-header-title">Documents Browser</div>
            <div className="gov-header-sub">All uploaded attachments — petitions, works, and standalone files</div>
          </div>
          <div className="gov-header-actions">
            <button className="gov-header-btn" onClick={load}><RefreshCw size={15} /></button>
            <button className="gov-header-btn"><Bell size={15} /></button>
            {canUpload && (
              <button className="gov-btn gov-btn-primary" onClick={() => setShowUpload(true)}>
                <Upload size={14} />Upload File
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
              { label: "Total Documents",     value: total,        accent: "#2F6FED", Icon: FolderOpen },
              { label: "Linked to Petitions", value: withPetition, accent: "#7c3aed", Icon: FileText },
              { label: "Linked to Works",     value: withWork,     accent: "#16A34A", Icon: File },
              { label: "Images",              value: images,       accent: "#D97706", Icon: ImageIcon },
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
                <div className="gov-card-icon" style={{ background: "#eff6ff" }}><FolderOpen size={14} color="#2F6FED" /></div>
                All Files <span style={{ fontSize: 12, color: "var(--sub)", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 5, padding: "1px 8px" }}>{total}</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <input className="gov-input" style={{ width: 200 }} placeholder="Search filename, uploader…" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
                <input className="gov-input" style={{ width: 130 }} placeholder="File type" value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1) }} />
                <select className="gov-select" style={{ width: 140 }} value={filterLinked} onChange={e => { setFilterLinked(e.target.value); setPage(1) }}>
                  <option value="">All Files</option>
                  <option value="petition">Petition Docs</option>
                  <option value="work">Work Docs</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[1,2,3,4,5].map(i => <div key={i} className="gov-skel" style={{ height: 48, borderRadius: 7 }} />)}
              </div>
            ) : docs.length === 0 ? (
              <div className="gov-empty">
                <FolderOpen size={24} style={{ margin: "0 auto 10px", opacity: 0.3 }} />
                <div>No documents found.</div>
                {canUpload && <button className="gov-btn gov-btn-primary" style={{ marginTop: 12 }} onClick={() => setShowUpload(true)}><Upload size={14} />Upload First File</button>}
              </div>
            ) : (
              <>
                <div style={{ overflowX: "auto" }}>
                  <table className="gov-table">
                    <thead><tr><th>File</th><th>Type</th><th>Size</th><th>Linked To</th><th>Uploaded By</th><th>Date</th><th></th></tr></thead>
                    <tbody>
                      {docs.map(d => (
                        <tr key={d.id}>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <FileIcon fileType={d.fileType} mimeType={d.mimeType} />
                              <span style={{ fontWeight: 600, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.originalName}</span>
                            </div>
                          </td>
                          <td><Badge label={d.fileType.replace(/_/g, " ")} color="#475569" bg="#f1f5f9" /></td>
                          <td style={{ fontSize: 12 }}>{fmtSize(d.fileSize)}</td>
                          <td style={{ fontSize: 12 }}>
                            {d.petitionRequest
                              ? <Badge label={`Petition: ${d.petitionRequest.trackingNumber}`} color="#1e40af" bg="#dbeafe" />
                              : d.publicWork
                              ? <Badge label={`Work: ${d.publicWork.workCode}`} color="#065f46" bg="#d1fae5" />
                              : <span style={{ color: "var(--sub)" }}>—</span>}
                          </td>
                          <td style={{ fontSize: 12, color: "var(--sub)" }}>{d.uploadedByName}</td>
                          <td style={{ fontSize: 12, color: "var(--sub)", whiteSpace: "nowrap" }}>{fmtDate(d.createdAt)}</td>
                          <td>
                            <div style={{ display: "flex", gap: 6 }}>
                              <button className="gov-btn gov-btn-outline gov-btn-sm" onClick={() => setSelected(d)}>View</button>
                              <a href={d.fileUrl} target="_blank" rel="noopener noreferrer"
                                className="gov-btn gov-btn-sm"
                                style={{ background: "var(--bg)", border: "1px solid var(--border)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}>
                                <ExternalLink size={12} />
                              </a>
                            </div>
                          </td>
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

      {showUpload && <UploadDrawer onClose={() => setShowUpload(false)} onUploaded={() => { setShowUpload(false); load() }} />}
      {selected && <DocumentDrawer doc={selected} canDelete={canDelete} onClose={() => setSelected(null)} onDeleted={() => { setSelected(null); load() }} />}
    </div>
  )
}
