// @ts-nocheck
"use client"
export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef } from "react"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { ArrowLeft, RefreshCw, LogOut, Volume2, VolumeX, MapPin, AlertTriangle, CheckCircle2, Clock } from "lucide-react"

export default function MinisterIntelligencePage() {
  const { data: session } = useSession()
  const [briefing, setBriefing] = useState(null)
  const [visitData, setVisitData] = useState(null)
  const [mandal, setMandal] = useState("")
  const [places, setPlaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [visitLoading, setVisitLoading] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [lang, setLang] = useState("en")

  const loadBriefing = async () => {
    setLoading(true)
    try {
      const [bRes, pRes] = await Promise.all([
        fetch("/api/ai/morning-briefing", { credentials: "include" }),
        fetch("/api/minister/places", { credentials: "include" }),
      ])
      const [bData, pData] = await Promise.all([bRes.json(), pRes.json()])
      if (bData.success) setBriefing(bData)
      if (pData.success && pData.places?.length > 0) {
        setPlaces(pData.places)
        setMandal(pData.places[0].name)
      }
    } finally { setLoading(false) }
  }

  const loadVisitBrief = async () => {
    if (!mandal) return
    setVisitLoading(true)
    try {
      const res = await fetch(`/api/ai/visit-brief?mandal=${encodeURIComponent(mandal)}`, { credentials: "include" })
      const data = await res.json()
      if (data.success) setVisitData(data)
    } finally { setVisitLoading(false) }
  }

  useEffect(() => { loadBriefing() }, [])
  useEffect(() => { if (mandal) loadVisitBrief() }, [mandal])

  const speak = (text) => {
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(text)
    utt.lang = lang === "te" ? "te-IN" : "en-IN"
    utt.rate = 0.9
    utt.onstart = () => setSpeaking(true)
    utt.onend = () => setSpeaking(false)
    utt.onerror = () => setSpeaking(false)
    window.speechSynthesis.speak(utt)
  }

  const stopSpeaking = () => { window.speechSynthesis.cancel(); setSpeaking(false) }

  const d = briefing?.briefing?.data

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/minister/dashboard" className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-bold text-slate-900">AI Intelligence Briefing</h1>
              <p className="text-xs text-slate-500">Morning briefing · Visit prep · Real-time insights</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setLang(l => l === "en" ? "te" : "en")} className="text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300">
              {lang === "en" ? "తెలుగు" : "English"}
            </button>
            <button onClick={loadBriefing} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button onClick={() => signOut({ callbackUrl: "/auth/login" })} className="flex items-center gap-1.5 text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg font-medium">
              <LogOut className="w-3.5 h-3.5" />Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-5 space-y-5">
        {/* Morning Briefing */}
        {loading ? (
          <div className="flex justify-center py-8"><RefreshCw className="w-6 h-6 animate-spin text-blue-600" /></div>
        ) : briefing && d && (
          <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 rounded-2xl p-6 text-white space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-amber-300 uppercase tracking-wider">Morning Briefing</p>
                <h2 className="text-xl font-black mt-1">{lang === "te" ? "శుభోదయం" : "Good Morning"}, {session?.user?.name}</h2>
              </div>
              <button onClick={speaking ? stopSpeaking : () => speak(briefing.briefing.text[lang])}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm ${speaking ? "bg-red-600 animate-pulse" : "bg-amber-500 text-amber-950"}`}>
                {speaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                {speaking ? (lang === "te" ? "ఆపు" : "Stop") : (lang === "te" ? "వినండి" : "Listen")}
              </button>
            </div>

            <p className="text-sm text-white/90 leading-relaxed bg-white/5 p-4 rounded-xl">{briefing.briefing.text[lang]}</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: lang === "te" ? "నేటి కార్యక్రమాలు" : "Today's Events", value: d.todayEvents.length, color: "text-blue-400" },
                { label: lang === "te" ? "గడువు మించాయి" : "Overdue", value: d.overdueCount, color: "text-red-400" },
                { label: lang === "te" ? "కొత్త దరఖాస్తులు" : "New Petitions", value: d.newPetitions, color: "text-emerald-400" },
                { label: lang === "te" ? "ఆగిపోయిన పనులు" : "Stuck Works", value: d.stuckWorks, color: "text-orange-400" },
              ].map(s => (
                <div key={s.label} className="p-3 bg-white/5 rounded-xl border border-white/10 text-center">
                  <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-white/60 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {d.overdueItems.length > 0 && (
              <div className="p-3 bg-red-900/30 border border-red-500/30 rounded-xl space-y-2">
                <p className="text-xs font-bold text-red-300 uppercase">⚠️ Urgent Cases</p>
                {d.overdueItems.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="text-white/80">{item.name} — {item.type}</span>
                    <span className="text-red-400 font-bold">{item.days}d overdue</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Visit Brief */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Visit Preparation</p>
              <h2 className="font-bold text-slate-900 mt-0.5">Auto-generated speech points for your next visit</h2>
            </div>
            <select value={mandal} onChange={e => setMandal(e.target.value)} className="text-sm p-2 border border-slate-300 rounded-lg bg-white">
              {places.map(p => <option key={p.id} value={p.name}>{p.name} Mandal</option>)}
            </select>
          </div>

          {visitLoading ? (
            <div className="flex justify-center py-6"><RefreshCw className="w-5 h-5 animate-spin text-blue-600" /></div>
          ) : visitData && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[
                  { label: "Works", value: visitData.stats.totalWorks },
                  { label: "Done", value: visitData.stats.completedWorks },
                  { label: "Active", value: visitData.stats.inProgressWorks },
                  { label: "Stuck", value: visitData.stats.stuckWorks },
                  { label: "Petitions", value: visitData.stats.totalPetitions },
                  { label: "Resolved", value: visitData.stats.resolvedPetitions },
                ].map(s => (
                  <div key={s.label} className="p-2 bg-slate-50 rounded-lg text-center">
                    <p className="text-lg font-black text-slate-900">{s.value}</p>
                    <p className="text-xs text-slate-500">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Speech points */}
              <div className="p-4 bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 rounded-xl text-white space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-amber-300 uppercase">Speech Points — {mandal} Mandal</p>
                  <button onClick={() => speak(visitData.speechPoints[lang].join(" "))}
                    className="flex items-center gap-1.5 text-xs bg-amber-500 text-amber-950 font-bold px-3 py-1.5 rounded-lg">
                    <Volume2 className="w-3.5 h-3.5" />{lang === "te" ? "వినండి" : "Read Aloud"}
                  </button>
                </div>
                {visitData.speechPoints[lang].map((point, i) => (
                  <p key={i} className="text-sm text-blue-100 leading-relaxed">• {point}</p>
                ))}
              </div>

              {/* Leaders in this mandal */}
              {visitData.leaders.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-2">Local Leaders to Meet</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {visitData.leaders.map(l => (
                      <div key={l.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="w-8 h-8 rounded-full bg-indigo-200 text-indigo-900 flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {l.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">{l.name}</p>
                          <p className="text-xs text-slate-500">{l.designation} · {l.villageName}</p>
                        </div>
                        <span className="ml-auto text-xs text-slate-500">{l.phone}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
