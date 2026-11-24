// @ts-nocheck
"use client"
export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { ArrowLeft, Search, RefreshCw, AlertTriangle, Filter, X, Phone, MapPin, Clock, CheckCircle2, FileText, LogOut } from "lucide-react"

const STATUS_META = {
  PENDING:              { label: "Pending",       color: "bg-amber-100 text-amber-800 border-amber-300" },
  SUBMITTED_TO_PA:      { label: "With PA",       color: "bg-blue-100 text-blue-800 border-blue-300" },
  ASSIGNED_TO_OFFICIAL: { label: "With Official", color: "bg-indigo-100 text-indigo-800 border-indigo-300" },
  UNDER_REVIEW:         { label: "Under Review",  color: "bg-purple-100 text-purple-800 border-purple-300" },
  SANCTIONED:           { label: "Sanctioned",    color: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  RESOLVED:             { label: "Resolved",      color: "bg-green-100 text-green-800 border-green-300" },
  REJECTED:             { label: "Rejected",      color: "bg-red-100 text-red-800 border-red-300" },
}
const TYPE_LABELS = {
  CMRF_MEDICAL: "CMRF Medical", EMPLOYEE_TRANSFER: "Transfer",
  JOB_EMPLOYMENT: "Job", PERSONAL_GRIEVANCE: "Grievance", OTHER: "Other",
}

export default function MinisterGrievancesPage() {
  const { data: session } = useSession()
  const [petitions, setPetitions] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("ALL")
  const [filterType, setFilterType] = useState("ALL")
  const [overdueOnly, setOverdueOnly] = useState(false)
  const [selected, setSelected] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterStatus !== "ALL") params.set("status", filterStatus)
      if (filterType !== "ALL") params.set("type", filterType)
      if (overdueOnly) params.set("overdue", "true")
      if (search.trim()) params.set("search", search.trim())
      const res = await fetch(`/api/pa/petitions?${params}`, { credentials: "include" })
      const data = await res.json()
      if (data.success) setPetitions(data.petitions)
    } finally { setLoading(false) }
  }

  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t) }, [search, filterStatus, filterType, overdueOnly])

  const now = new Date()
  const overdue = petitions.filter(p => p.isOverdue)
  const pending = petitions.filter(p => !["RESOLVED","SANCTIONED","CLOSED","REJECTED"].includes(p.status))

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/minister/dashboard" className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-bold text-slate-900">Petitions & Grievances</h1>
              <p className="text-xs text-slate-500">All citizen petitions · Live from database</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button onClick={() => signOut({ callbackUrl: "/auth/login" })} className="flex items-center gap-1.5 text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg font-medium">
              <LogOut className="w-3.5 h-3.5" />Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-5 space-y-5">
        {/* KPI row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total", value: petitions.length, color: "text-slate-900", onClick: () => { setFilterStatus("ALL"); setOverdueOnly(false) } },
            { label: "⚠️ Overdue", value: overdue.length, color: "text-red-700 font-black", onClick: () => setOverdueOnly(!overdueOnly) },
            { label: "⏳ Pending", value: pending.length, color: "text-amber-700", onClick: () => setFilterStatus("SUBMITTED_TO_PA") },
            { label: "✅ Resolved", value: petitions.filter(p => p.status === "RESOLVED" || p.status === "SANCTIONED").length, color: "text-emerald-700", onClick: () => setFilterStatus("SANCTIONED") },
          ].map(s => (
            <div key={s.label} onClick={s.onClick} className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm cursor-pointer hover:border-blue-400 transition-all">
              <p className="text-xs text-slate-500 uppercase tracking-wide">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input type="text" placeholder="Search citizen, phone, tracking #..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            {search && <button onClick={() => setSearch("")} className="absolute right-3 top-2.5 text-slate-400"><X className="w-4 h-4" /></button>}
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="text-sm p-2 border border-slate-300 rounded-lg bg-white">
            <option value="ALL">All Statuses</option>
            {Object.entries(STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className="text-sm p-2 border border-slate-300 rounded-lg bg-white">
            <option value="ALL">All Types</option>
            {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <button onClick={() => setOverdueOnly(!overdueOnly)}
            className={`text-sm px-3 py-2 rounded-lg font-medium border transition-all ${overdueOnly ? "bg-red-600 text-white border-red-600" : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"}`}>
            ⚠️ Overdue Only
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
              Petitions ({petitions.length}){overdueOnly && <span className="ml-2 text-xs font-bold text-red-600">· Overdue Only</span>}
            </h2>
          </div>
          {loading ? (
            <div className="py-16 text-center"><RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600" /></div>
          ) : petitions.length === 0 ? (
            <div className="py-16 text-center text-slate-400"><FileText className="w-10 h-10 mx-auto mb-2" /><p>No petitions found</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100/70 text-slate-600 text-xs font-semibold uppercase border-b border-slate-200">
                    <th className="py-3 px-4">Tracking & Type</th>
                    <th className="py-3 px-4">Citizen</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Age</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {petitions.map(p => {
                    const sm = STATUS_META[p.status] || { label: p.status, color: "bg-gray-100 text-gray-800 border-gray-200" }
                    const age = Math.floor((now.getTime() - new Date(p.createdAt).getTime()) / 86400000)
                    return (
                      <tr key={p.id} onClick={() => setSelected(p)} className={`cursor-pointer hover:bg-blue-50/60 transition-colors ${p.isOverdue ? "bg-red-50/40" : ""}`}>
                        <td className="py-3 px-4">
                          <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 block mb-1">{p.trackingNumber}</span>
                          <p className="font-semibold text-slate-900 line-clamp-1">{p.title}</p>
                          <span className="text-slate-500">{TYPE_LABELS[p.type] || p.type}</span>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-slate-900">{p.applicantName}</p>
                          <p className="text-slate-500 flex items-center gap-1"><Phone className="w-3 h-3" />{p.applicantPhone}</p>
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          <p className="font-medium">{p.villageName || "—"}</p>
                          <p className="text-slate-500">{p.mandalName || "—"}</p>
                        </td>
                        <td className="py-3 px-4 text-slate-700 max-w-[160px]">
                          <p className="truncate">{p.assignedDepartment || "—"}</p>
                          <p className="text-slate-500">{p.handlingPaName || "—"}</p>
                        </td>
                        <td className={`py-3 px-4 font-bold ${p.isOverdue ? "text-red-600" : "text-slate-600"}`}>
                          {age}d{p.isOverdue ? " ⚠" : ""}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${sm.color}`}>{sm.label}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Detail drawer */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex justify-end" onClick={() => setSelected(null)}>
          <div className="bg-white w-full max-w-lg h-full overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-200 flex items-start justify-between sticky top-0 bg-white z-10">
              <div>
                <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">{selected.trackingNumber}</span>
                <h2 className="font-bold text-slate-900 mt-2">{selected.title}</h2>
                <p className="text-sm text-slate-500">{selected.applicantName} · {selected.mandalName}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4 text-sm">
              {selected.isOverdue && (
                <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-center gap-2 text-red-700">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span className="font-bold">Overdue — {Math.floor((now.getTime() - new Date(selected.createdAt).getTime()) / 86400000)} days idle</span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["Type", TYPE_LABELS[selected.type] || selected.type],
                  ["Priority", selected.priority],
                  ["Status", STATUS_META[selected.status]?.label || selected.status],
                  ["Phone", selected.applicantPhone],
                  ["Village", selected.villageName],
                  ["Mandal", selected.mandalName],
                  ["Department", selected.assignedDepartment],
                  ["Handling PA", selected.handlingPaName],
                  ["Referred By", selected.referredByLeaderName],
                  ["Submitted", new Date(selected.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })],
                  ["Requested ₹", selected.requestedAmount ? `₹${selected.requestedAmount.toLocaleString("en-IN")}` : null],
                  ["Sanctioned ₹", selected.sanctionedAmount ? `₹${selected.sanctionedAmount.toLocaleString("en-IN")}` : null],
                ].filter(([, v]) => v).map(([k, v]) => (
                  <div key={k} className="p-2 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500 uppercase">{k}</p>
                    <p className="font-semibold text-slate-900 mt-0.5">{v}</p>
                  </div>
                ))}
              </div>
              {selected.description && (
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500 uppercase mb-1">Description</p>
                  <p className="text-slate-800">{selected.description}</p>
                </div>
              )}
              {selected.privateNotes && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs font-bold text-amber-900 uppercase mb-1">🔒 Private Note (Minister/PA Only)</p>
                  <p className="text-amber-950 italic">"{selected.privateNotes}"</p>
                </div>
              )}
              {selected.timeline && selected.timeline.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-500 uppercase">Timeline ({selected.timeline.length})</p>
                  {selected.timeline.map((t, i) => (
                    <div key={t.id || i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                      <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs flex-shrink-0">{i + 1}</div>
                      <div>
                        <p className="font-semibold text-slate-900 text-xs">{t.actionTaken}</p>
                        <p className="text-xs text-slate-500">By {t.performedByName} · {new Date(t.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
