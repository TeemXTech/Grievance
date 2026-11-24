// @ts-nocheck
"use client"
export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { ArrowLeft, RefreshCw, X, MapPin, LogOut, Wrench, AlertTriangle } from "lucide-react"

const STAGE_META = {
  PLANNED:      { label: "Planned",      color: "bg-slate-100 text-slate-700 border-slate-300",   pct: 5 },
  PROPOSED:     { label: "Proposed",     color: "bg-blue-100 text-blue-700 border-blue-300",      pct: 15 },
  SANCTIONED:   { label: "Sanctioned",   color: "bg-indigo-100 text-indigo-700 border-indigo-300",pct: 25 },
  TENDER_STAGE: { label: "Tender",       color: "bg-purple-100 text-purple-700 border-purple-300",pct: 40 },
  IN_PROGRESS:  { label: "In Progress",  color: "bg-amber-100 text-amber-700 border-amber-300",   pct: 65 },
  COMPLETED:    { label: "Completed",    color: "bg-emerald-100 text-emerald-700 border-emerald-300", pct: 100 },
  STUCK_DELAYED:{ label: "Stuck/Delayed",color: "bg-red-100 text-red-700 border-red-300",         pct: 0 },
}

export default function MinisterWorksPage() {
  const [works, setWorks] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filterStage, setFilterStage] = useState("ALL")
  const [selected, setSelected] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterStage !== "ALL") params.set("stage", filterStage)
      const res = await fetch(`/api/minister/projects?${params}`, { credentials: "include" })
      const data = await res.json()
      if (data.success) { setWorks(data.works); setSummary(data.summary) }
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [filterStage])

  const totalBudget = summary?.totalSanctionedBudget || 0
  const totalSpent = summary?.totalSpentBudget || 0

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/minister/dashboard" className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-bold text-slate-900">Public Works</h1>
              <p className="text-xs text-slate-500">Constituency delivery portfolio · Live from database</p>
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
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              { label: "Total Works", value: summary.total, color: "text-slate-900", stage: "ALL" },
              { label: "✅ Completed", value: summary.completed, color: "text-emerald-700", stage: "COMPLETED" },
              { label: "🔨 In Progress", value: summary.inProgress, color: "text-amber-700", stage: "IN_PROGRESS" },
              { label: "⚠️ Stuck", value: summary.stuck, color: "text-red-700 font-black", stage: "STUCK_DELAYED" },
              { label: "Budget (L)", value: `₹${(totalBudget/100000).toFixed(1)}L`, color: "text-blue-700", stage: null },
              { label: "Spent (L)", value: `₹${(totalSpent/100000).toFixed(1)}L`, color: "text-indigo-700", stage: null },
            ].map(s => (
              <div key={s.label} onClick={() => s.stage !== null && setFilterStage(s.stage)}
                className={`bg-white rounded-xl p-4 border border-slate-200 shadow-sm ${s.stage !== null ? "cursor-pointer hover:border-blue-400" : ""} transition-all ${filterStage === s.stage ? "border-blue-500 ring-2 ring-blue-500/20" : ""}`}>
                <p className="text-xs text-slate-500 uppercase tracking-wide">{s.label}</p>
                <p className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Budget progress bar */}
        {totalBudget > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-slate-700">Budget Utilisation</p>
              <p className="text-sm font-bold text-slate-900">{Math.round((totalSpent/totalBudget)*100)}% spent</p>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-3 bg-blue-500 rounded-full transition-all" style={{ width: `${Math.min(100, Math.round((totalSpent/totalBudget)*100))}%` }} />
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>₹{(totalSpent/100000).toFixed(1)}L spent</span>
              <span>₹{(totalBudget/100000).toFixed(1)}L sanctioned</span>
            </div>
          </div>
        )}

        {/* Stage filter pills */}
        <div className="flex flex-wrap gap-2">
          {["ALL", ...Object.keys(STAGE_META)].map(stage => (
            <button key={stage} onClick={() => setFilterStage(stage)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium border transition-all ${filterStage === stage ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"}`}>
              {stage === "ALL" ? "All Works" : STAGE_META[stage]?.label || stage}
            </button>
          ))}
        </div>

        {/* Works grid */}
        {loading ? (
          <div className="flex justify-center py-16"><RefreshCw className="w-8 h-8 animate-spin text-blue-600" /></div>
        ) : works.length === 0 ? (
          <div className="py-16 text-center text-slate-400"><Wrench className="w-10 h-10 mx-auto mb-2" /><p>No works found</p></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {works.map(w => {
              const sm = STAGE_META[w.stage] || { label: w.stage, color: "bg-gray-100 text-gray-700 border-gray-300", pct: 0 }
              const budget = w.sanctionedBudget || w.estimatedBudget || 0
              const spent = w.spentBudget || 0
              const spentPct = budget > 0 ? Math.min(100, Math.round((spent/budget)*100)) : 0
              return (
                <div key={w.id} onClick={() => setSelected(w)}
                  className={`bg-white rounded-xl border shadow-sm p-4 cursor-pointer hover:shadow-md transition-all ${w.stage === "STUCK_DELAYED" ? "border-red-300 bg-red-50/30" : "border-slate-200"}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <span className="font-mono text-xs text-slate-500">{w.workCode}</span>
                      <h3 className="font-bold text-slate-900 text-sm mt-0.5 line-clamp-2">{w.title}</h3>
                    </div>
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold border flex-shrink-0 ${sm.color}`}>{sm.label}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                    <MapPin className="w-3 h-3" />
                    <span>{w.villageName || "—"}, {w.mandalName || "—"}</span>
                  </div>
                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Stage: {sm.pct}%</span>
                      {budget > 0 && <span>Budget: {spentPct}% used</span>}
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-2 rounded-full ${w.stage === "STUCK_DELAYED" ? "bg-red-400" : w.stage === "COMPLETED" ? "bg-emerald-500" : "bg-blue-500"}`}
                        style={{ width: `${sm.pct}%` }} />
                    </div>
                  </div>
                  {budget > 0 && (
                    <div className="flex justify-between text-xs text-slate-600 mt-2">
                      <span>₹{(budget/100000).toFixed(1)}L sanctioned</span>
                      <span className="font-semibold">₹{(spent/100000).toFixed(1)}L spent</span>
                    </div>
                  )}
                  {w.stage === "STUCK_DELAYED" && w.stuckReason && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700 flex items-start gap-1">
                      <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                      <span>{w.stuckReason}</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Detail drawer */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex justify-end" onClick={() => setSelected(null)}>
          <div className="bg-white w-full max-w-lg h-full overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-200 flex items-start justify-between sticky top-0 bg-white z-10">
              <div>
                <span className="font-mono text-xs text-slate-500">{selected.workCode}</span>
                <h2 className="font-bold text-slate-900 mt-1">{selected.title}</h2>
                <p className="text-sm text-slate-500">{selected.category?.replace(/_/g," ")} · {selected.mandalName}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["Stage", STAGE_META[selected.stage]?.label || selected.stage],
                  ["Category", selected.category?.replace(/_/g," ")],
                  ["Village", selected.villageName],
                  ["Mandal", selected.mandalName],
                  ["Estimated", selected.estimatedBudget ? `₹${(selected.estimatedBudget/100000).toFixed(1)}L` : null],
                  ["Sanctioned", selected.sanctionedBudget ? `₹${(selected.sanctionedBudget/100000).toFixed(1)}L` : null],
                  ["Spent", selected.spentBudget ? `₹${(selected.spentBudget/100000).toFixed(1)}L` : null],
                  ["Contractor", selected.contractorName],
                  ["Department", selected.executingDepartment],
                  ["Supervising", selected.supervisingOfficial],
                  ["Handling PA", selected.handlingPaName],
                  ["Requested By", selected.requestedByLeaderName],
                ].filter(([,v]) => v).map(([k,v]) => (
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
              {selected.stuckReason && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-xs font-bold text-red-700 uppercase mb-1">⚠️ Stuck Reason</p>
                  <p className="text-red-800">{selected.stuckReason}</p>
                </div>
              )}
              {selected.privateNotes && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs font-bold text-amber-900 uppercase mb-1">🔒 Private Note</p>
                  <p className="text-amber-950 italic">"{selected.privateNotes}"</p>
                </div>
              )}
              {selected.milestones && selected.milestones.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-500 uppercase">Milestones ({selected.milestones.length})</p>
                  {selected.milestones.map((m, i) => (
                    <div key={m.id || i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs flex-shrink-0">{m.percentageDone}%</div>
                      <div>
                        <p className="font-semibold text-slate-900 text-xs">{m.updateNote}</p>
                        <p className="text-xs text-slate-500">By {m.updatedByName} · {new Date(m.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}</p>
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
