"use client"
export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Volume2, VolumeX, RefreshCw, AlertTriangle, Calendar, FileText, Clock, ArrowLeft, CheckCircle2 } from "lucide-react"

type Lang = 'en' | 'te'

export default function MorningBriefingPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [briefing, setBriefing] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [lang, setLang] = useState<Lang>('en')
  const [speaking, setSpeaking] = useState(false)
  const [error, setError] = useState("")
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null)

  const load = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch('/api/ai/morning-briefing')
      const data = await res.json()
      if (data.success) setBriefing(data)
      else setError(data.error || "Failed to load briefing")
    } catch {
      setError("Could not connect to server")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const speak = () => {
    if (!briefing) return
    window.speechSynthesis.cancel()
    const text = briefing.briefing.text[lang]
    const utt = new SpeechSynthesisUtterance(text)
    utt.lang = lang === 'te' ? 'te-IN' : 'en-IN'
    utt.rate = 0.9
    utt.pitch = 1
    utt.onstart = () => setSpeaking(true)
    utt.onend = () => setSpeaking(false)
    utt.onerror = () => setSpeaking(false)
    synthRef.current = utt
    window.speechSynthesis.speak(utt)
  }

  const stopSpeaking = () => {
    window.speechSynthesis.cancel()
    setSpeaking(false)
  }

  const d = briefing?.briefing?.data

  const now = new Date()
  const greeting = now.getHours() < 12 ? (lang === 'te' ? 'శుభోదయం' : 'Good Morning') :
                   now.getHours() < 17 ? (lang === 'te' ? 'శుభ మధ్యాహ్నం' : 'Good Afternoon') :
                   (lang === 'te' ? 'శుభ సాయంత్రం' : 'Good Evening')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-black/30 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/minister/dashboard')} className="p-1.5 hover:bg-white/10 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <p className="font-bold text-sm">Morning Briefing</p>
              <p className="text-xs text-blue-300">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Language toggle */}
            <button
              onClick={() => setLang(l => l === 'en' ? 'te' : 'en')}
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20"
            >
              {lang === 'en' ? 'తెలుగు' : 'English'}
            </button>
            <button onClick={load} className="p-1.5 hover:bg-white/10 rounded-lg">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={() => signOut({ callbackUrl: '/auth/login' })} className="text-xs bg-red-600/70 hover:bg-red-700 px-3 py-1.5 rounded-lg">
              {lang === 'te' ? 'సైన్ అవుట్' : 'Sign Out'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-5">
        {/* Greeting + Speak Button */}
        <div className="text-center space-y-3 py-4">
          <p className="text-4xl font-black text-amber-300">{greeting}</p>
          <p className="text-xl text-white/80">{session?.user?.name}</p>
          <p className="text-sm text-blue-300">
            {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </p>

          {/* Big speak button */}
          <button
            onClick={speaking ? stopSpeaking : speak}
            disabled={loading || !briefing}
            className={`mt-4 inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl transition-all ${
              speaking
                ? 'bg-red-600 hover:bg-red-700 animate-pulse'
                : 'bg-amber-500 hover:bg-amber-400 text-amber-950'
            } disabled:opacity-40`}
          >
            {speaking ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
            {speaking
              ? (lang === 'te' ? 'ఆపు' : 'Stop')
              : (lang === 'te' ? 'బ్రీఫింగ్ వినండి' : 'Listen to Briefing')}
          </button>
        </div>

        {loading && (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-400" />
            <p className="text-blue-300 mt-2 text-sm">{lang === 'te' ? 'లోడ్ అవుతోంది...' : 'Loading briefing...'}</p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-900/40 border border-red-500/40 rounded-xl text-red-300 text-sm">{error}</div>
        )}

        {briefing && d && (
          <>
            {/* Briefing text card */}
            <div className="p-5 bg-white/5 border border-white/10 rounded-2xl space-y-2">
              <p className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                {lang === 'te' ? 'ఈ రోజు సారాంశం' : "Today's Summary"}
              </p>
              <p className="text-sm text-white/90 leading-relaxed">{briefing.briefing.text[lang]}</p>
            </div>

            {/* KPI row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: lang === 'te' ? 'నేటి కార్యక్రమాలు' : "Today's Events", value: d.todayEvents.length, icon: Calendar, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                { label: lang === 'te' ? 'గడువు మించాయి' : 'Overdue', value: d.overdueCount, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10' },
                { label: lang === 'te' ? 'కొత్త దరఖాస్తులు' : 'New Petitions', value: d.newPetitions, icon: FileText, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                { label: lang === 'te' ? 'ఆమోదం పెండింగ్' : 'Pending Approval', value: d.pendingApproval, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
              ].map(({ label, value, icon: Icon, color, bg }) => (
                <div key={label} className={`p-4 rounded-xl border border-white/10 ${bg}`}>
                  <Icon className={`w-5 h-5 ${color} mb-2`} />
                  <p className={`text-2xl font-black ${color}`}>{value}</p>
                  <p className="text-xs text-white/60 mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Today's events */}
            {d.todayEvents.length > 0 && (
              <div className="p-4 bg-blue-900/30 border border-blue-500/30 rounded-xl space-y-3">
                <p className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {lang === 'te' ? 'నేటి షెడ్యూల్' : "Today's Schedule"}
                </p>
                {d.todayEvents.map((e: any, i: number) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                    <span className="text-blue-300 font-bold text-sm w-14 flex-shrink-0">{e.time}</span>
                    <div>
                      <p className="font-semibold text-sm">{e.title}</p>
                      <p className="text-xs text-white/60">{e.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Overdue petitions */}
            {d.overdueItems.length > 0 && (
              <div className="p-4 bg-red-900/30 border border-red-500/30 rounded-xl space-y-3">
                <p className="text-xs font-bold text-red-300 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  {lang === 'te' ? 'అత్యవసర కేసులు' : 'Urgent — Overdue Cases'}
                </p>
                {d.overdueItems.map((item: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div>
                      <p className="font-semibold text-sm">{item.name}</p>
                      <p className="text-xs text-white/60">{item.type} · {item.department}</p>
                    </div>
                    <span className="text-red-400 font-black text-sm">{item.days}d</span>
                  </div>
                ))}
              </div>
            )}

            {/* Stuck works */}
            {d.stuckWorks > 0 && (
              <div className="p-4 bg-orange-900/30 border border-orange-500/30 rounded-xl">
                <p className="text-xs font-bold text-orange-300 uppercase tracking-wider mb-2">
                  {lang === 'te' ? 'ఆగిపోయిన పనులు' : 'Stuck Public Works'}
                </p>
                <p className="text-2xl font-black text-orange-400">{d.stuckWorks}</p>
                <p className="text-xs text-white/60 mt-1">
                  {lang === 'te' ? 'నియోజకవర్గంలో ఆలస్యమైన పనులు' : 'works delayed in constituency'}
                </p>
              </div>
            )}

            {/* Recent actions */}
            {d.recentActions.length > 0 && (
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2">
                <p className="text-xs font-bold text-white/50 uppercase tracking-wider">
                  {lang === 'te' ? 'ఇటీవలి చర్యలు' : 'Recent Actions'}
                </p>
                {d.recentActions.map((a: any, i: number) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-white/70">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{a.action} — {a.petition} ({a.by})</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
