"use client"

import { useState } from "react"
import { Search, CheckCircle2, Clock, AlertTriangle, XCircle, FileText, Phone, MapPin } from "lucide-react"

const STATUS_CONFIG: Record<string, { color: string; icon: any; label: string; labelTe: string }> = {
  SUBMITTED_TO_PA:      { color: 'bg-blue-100 text-blue-800 border-blue-300',    icon: Clock,         label: 'In PA Office',    labelTe: 'PA కార్యాలయంలో' },
  ASSIGNED_TO_OFFICIAL: { color: 'bg-indigo-100 text-indigo-800 border-indigo-300', icon: FileText,   label: 'Assigned',        labelTe: 'అప్పగించబడింది' },
  UNDER_REVIEW:         { color: 'bg-purple-100 text-purple-800 border-purple-300', icon: Clock,      label: 'Under Review',    labelTe: 'సమీక్షలో ఉంది' },
  SANCTIONED:           { color: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: CheckCircle2, label: 'Sanctioned', labelTe: 'మంజూరు చేయబడింది' },
  RESOLVED:             { color: 'bg-green-100 text-green-800 border-green-300',  icon: CheckCircle2,  label: 'Resolved',        labelTe: 'పరిష్కరించబడింది' },
  REJECTED:             { color: 'bg-red-100 text-red-800 border-red-300',        icon: XCircle,       label: 'Rejected',        labelTe: 'తిరస్కరించబడింది' },
  PENDING:              { color: 'bg-gray-100 text-gray-800 border-gray-300',     icon: Clock,         label: 'Pending',         labelTe: 'పెండింగ్' },
}

export default function TrackPage({ params }: { params: { qrCode: string } }) {
  const [query, setQuery] = useState(params.qrCode !== 'search' ? params.qrCode : '')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(params.qrCode !== 'search')
  const [error, setError] = useState("")
  const [lang, setLang] = useState<'en' | 'te'>('en')

  const search = async (code?: string) => {
    const q = code || query
    if (!q.trim()) return
    setLoading(true)
    setError("")
    setResult(null)
    try {
      const res = await fetch(`/api/track/${encodeURIComponent(q.trim())}`)
      const data = await res.json()
      if (data.success) setResult(data)
      else setError(data.error || 'Not found')
    } catch {
      setError('Could not connect. Please try again.')
    } finally { setLoading(false) }
  }

  // Auto-search if QR code provided in URL
  useState(() => {
    if (params.qrCode !== 'search') search(params.qrCode)
  })

  const p = result?.petition
  const cfg = p ? (STATUS_CONFIG[p.status] || STATUS_CONFIG['PENDING']) : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 flex flex-col">
      {/* Header */}
      <div className="bg-white/5 border-b border-white/10 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">T</div>
            <div>
              <p className="text-white font-bold text-sm">Government of Telangana</p>
              <p className="text-blue-300 text-xs">Petition Tracking System</p>
            </div>
          </div>
          <button
            onClick={() => setLang(l => l === 'en' ? 'te' : 'en')}
            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-white/10 text-white border border-white/20"
          >
            {lang === 'en' ? 'తెలుగు' : 'English'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-start justify-center p-4 pt-8">
        <div className="w-full max-w-lg space-y-5">
          {/* Title */}
          <div className="text-center">
            <h1 className="text-2xl font-black text-white">
              {lang === 'te' ? 'మీ దరఖాస్తు ట్రాక్ చేయండి' : 'Track Your Petition'}
            </h1>
            <p className="text-blue-300 text-sm mt-1">
              {lang === 'te' ? 'ట్రాకింగ్ నంబర్ లేదా QR కోడ్ నమోదు చేయండి' : 'Enter your tracking number or QR code'}
            </p>
          </div>

          {/* Search box */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-5 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && search()}
                  placeholder={lang === 'te' ? 'REQ-CMRF-2026-001 లేదా QR కోడ్' : 'REQ-CMRF-2026-001 or QR code'}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={() => search()}
                disabled={loading || !query.trim()}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{lang === 'te' ? 'వెతుకుతున్నాం...' : 'Searching...'}</>
                ) : (
                  <><Search className="w-4 h-4" />{lang === 'te' ? 'ట్రాక్ చేయండి' : 'Track Petition'}</>
                )}
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="px-5 pb-5">
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
              </div>
            )}

            {/* Result */}
            {p && cfg && (
              <div className="border-t border-slate-100 p-5 space-y-4">
                {/* Status badge */}
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold border ${cfg.color}`}>
                    <cfg.icon className="w-4 h-4" />
                    {lang === 'te' ? cfg.labelTe : cfg.label}
                  </span>
                  <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">{p.trackingNumber}</span>
                </div>

                {/* Status message */}
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-700">{p.statusMessage[lang]}</p>
                </div>

                {/* Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span className="font-medium">{p.title}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{p.applicantName}</span>
                  </div>
                  {p.villageName && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span>{p.villageName}, {p.mandalName}</span>
                    </div>
                  )}
                  {p.department && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <span className="text-slate-400 text-xs">Dept:</span>
                      <span>{p.department}</span>
                    </div>
                  )}
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3 text-xs text-slate-500">
                  <div>
                    <p className="font-semibold text-slate-700">{lang === 'te' ? 'సమర్పించిన తేదీ' : 'Submitted'}</p>
                    <p>{new Date(p.submittedOn).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700">{lang === 'te' ? 'చివరి నవీకరణ' : 'Last Updated'}</p>
                    <p>{new Date(p.lastUpdated).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</p>
                  </div>
                </div>

                {p.isOverdue && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    {lang === 'te' ? 'ఈ దరఖాస్తు గడువు మించింది. మా కార్యాలయం ఫాలో-అప్ చేస్తోంది.' : 'This petition is overdue. Our office is following up.'}
                  </div>
                )}

                {/* Timeline */}
                {result.timeline.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-500 uppercase">{lang === 'te' ? 'చరిత్ర' : 'History'}</p>
                    {result.timeline.map((t: any, i: number) => (
                      <div key={i} className="flex items-start gap-3 text-xs">
                        <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold flex-shrink-0">{i + 1}</div>
                        <div>
                          <p className="font-medium text-slate-800">{t.action}</p>
                          <p className="text-slate-500">{new Date(t.date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <p className="text-center text-white/30 text-xs">
            © {new Date().getFullYear()} Government of Telangana · Ministerial Office
          </p>
        </div>
      </div>
    </div>
  )
}
