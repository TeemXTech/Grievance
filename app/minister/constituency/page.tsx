// @ts-nocheck
"use client"
export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { signOut } from "next-auth/react"
import Link from "next/link"
import { ArrowLeft, RefreshCw, LogOut, MapPin, Users, Wrench, FileText, ChevronRight } from "lucide-react"

export default function MinisterConstituencyPage() {
  const [places, setPlaces] = useState([])
  const [leaders, setLeaders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const [pRes, lRes] = await Promise.all([
        fetch("/api/minister/places", { credentials: "include" }),
        fetch("/api/minister/analytics", { credentials: "include" }),
      ])
      const [pData, lData] = await Promise.all([pRes.json(), lRes.json()])
      if (pData.success) setPlaces(pData.places)
      if (lData.success) setLeaders(lData.leaders || [])
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/minister/dashboard" className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-bold text-slate-900">Constituency</h1>
              <p className="text-xs text-slate-500">Mandals, villages & local leaders</p>
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

      <div className="max-w-7xl mx-auto px-4 py-5 space-y-6">
        {loading ? (
          <div className="flex justify-center py-16"><RefreshCw className="w-8 h-8 animate-spin text-blue-600" /></div>
        ) : (
          <>
            {/* Mandals grid */}
            <div>
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" />Mandals ({places.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {places.map(p => (
                  <div key={p.id} onClick={() => setSelected(selected?.id === p.id ? null : p)}
                    className={`bg-white rounded-xl border shadow-sm p-4 cursor-pointer hover:shadow-md transition-all ${selected?.id === p.id ? "border-blue-500 ring-2 ring-blue-500/20" : "border-slate-200"}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-slate-900">{p.name} Mandal</h3>
                        <p className="text-xs text-slate-500">{p.villages?.length || 0} villages</p>
                      </div>
                      <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${selected?.id === p.id ? "rotate-90" : ""}`} />
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <p className="text-lg font-black text-blue-600">{p.totalWorks}</p>
                        <p className="text-xs text-slate-500">Works</p>
                      </div>
                      <div className="p-2 bg-emerald-50 rounded-lg">
                        <p className="text-lg font-black text-emerald-600">{p.completedWorks}</p>
                        <p className="text-xs text-slate-500">Done</p>
                      </div>
                      <div className="p-2 bg-indigo-50 rounded-lg">
                        <p className="text-lg font-black text-indigo-600">{p.totalPetitions}</p>
                        <p className="text-xs text-slate-500">Petitions</p>
                      </div>
                    </div>
                    {p.stuckWorks > 0 && (
                      <div className="mt-2 text-xs text-red-600 font-semibold">⚠️ {p.stuckWorks} stuck work{p.stuckWorks > 1 ? "s" : ""}</div>
                    )}
                    {/* Villages expand */}
                    {selected?.id === p.id && p.villages?.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-200 space-y-1">
                        <p className="text-xs font-bold text-slate-500 uppercase mb-2">Villages</p>
                        {p.villages.map(v => (
                          <div key={v.id} className="flex items-center justify-between text-xs p-1.5 bg-slate-50 rounded">
                            <span className="font-medium text-slate-800">{v.name}</span>
                            {v.population && <span className="text-slate-500">Pop: {v.population.toLocaleString("en-IN")}</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Local Leaders */}
            {leaders.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />Local Leaders ({leaders.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {leaders.map(l => (
                    <div key={l.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-200 text-indigo-900 flex items-center justify-center font-bold text-sm flex-shrink-0">
                          {l.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{l.name}</p>
                          <p className="text-xs text-slate-500">{l.designation} · {l.villageName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>📞 {l.phone}</span>
                        {l.mandalName && <span>📍 {l.mandalName}</span>}
                      </div>
                      <div className="flex gap-3 mt-2 text-xs">
                        <span className="text-blue-600 font-semibold">{l.referredRequests?.length || 0} petitions</span>
                        <span className="text-emerald-600 font-semibold">{l.referredWorks?.length || 0} works</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
