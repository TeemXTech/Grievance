"use client"

import React, { useRef } from "react"
import {
  FileText, Building2, CheckCircle2, AlertTriangle,
  RefreshCw, Mic, MicOff, Send, Volume2, VolumeX,
  HeartPulse, ArrowRightLeft, Briefcase, ChevronRight,
  Activity, Sparkles, X, Clock, MapPin,
} from "lucide-react"

// ── Shared Types ────────────────────────────────────────────────────────────
export interface Stats {
  totalPetitions: number
  pendingPetitions: number
  overduePetitions: number
  resolvedPetitions: number
  totalWorks: number
  worksInProgress: number
  worksCompleted: number
  worksStuck: number
  totalGrievances: number
}
export interface Petition {
  id: string
  trackingNumber: string
  type: string
  title: string
  description?: string
  status: string
  priority: string
  applicantName: string
  applicantPhone?: string
  mandalName?: string
  villageName?: string
  isOverdue: boolean
  createdAt: string
  handlingPaName?: string
  assignedDepartment?: string
  referredByLeaderName?: string
  privateNotes?: string
  requestedAmount?: number
  sanctionedAmount?: number
}
export interface Work {
  id: string
  workCode: string
  title: string
  stage: string
  category: string
  villageName?: string
  mandalName?: string
  estimatedBudget?: number
  sanctionedBudget?: number
  spentBudget?: number
  stuckReason?: string
  requestedByLeaderName?: string
}
export interface ChatMsg { role: "user" | "ai"; text: string }

// ── Lookup maps ─────────────────────────────────────────────────────────────
const TYPE_META: Record<string, { label: string; color: string; bg: string; Icon: any }> = {
  CMRF_MEDICAL:       { label: "CMRF / Medical",  color: "#b91c1c", bg: "#fef2f2", Icon: HeartPulse },
  EMPLOYEE_TRANSFER:  { label: "Transfer",         color: "#6d28d9", bg: "#f5f3ff", Icon: ArrowRightLeft },
  JOB_EMPLOYMENT:     { label: "Job Request",      color: "#b45309", bg: "#fffbeb", Icon: Briefcase },
  PERSONAL_GRIEVANCE: { label: "Grievance",        color: "#1d4ed8", bg: "#eff6ff", Icon: FileText },
  VILLAGE_WORK:       { label: "Village Work",     color: "#047857", bg: "#ecfdf5", Icon: Building2 },
  OTHER:              { label: "Other",            color: "#475569", bg: "#f8fafc", Icon: FileText },
}
const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:              { label: "Pending",        color: "#92400e", bg: "#fef3c7" },
  SUBMITTED_TO_PA:      { label: "With PA",        color: "#1e40af", bg: "#dbeafe" },
  ASSIGNED_TO_OFFICIAL: { label: "With Official",  color: "#5b21b6", bg: "#ede9fe" },
  UNDER_REVIEW:         { label: "Under Review",   color: "#6b21a8", bg: "#fae8ff" },
  SANCTIONED:           { label: "Sanctioned ✓",   color: "#065f46", bg: "#d1fae5" },
  RESOLVED:             { label: "Resolved ✓",     color: "#065f46", bg: "#d1fae5" },
  REJECTED:             { label: "Rejected",       color: "#991b1b", bg: "#fee2e2" },
}
const STAGE_META: Record<string, { label: string; color: string; bg: string; pct: number }> = {
  PLANNED:       { label: "Planned",        color: "#64748b", bg: "#f1f5f9", pct: 5   },
  PROPOSED:      { label: "Proposed",       color: "#0369a1", bg: "#e0f2fe", pct: 15  },
  SANCTIONED:    { label: "Sanctioned",     color: "#7c3aed", bg: "#f5f3ff", pct: 25  },
  TENDER_STAGE:  { label: "Tender Stage",   color: "#b45309", bg: "#fef3c7", pct: 40  },
  IN_PROGRESS:   { label: "In Progress",    color: "#1d4ed8", bg: "#dbeafe", pct: 65  },
  COMPLETED:     { label: "Completed",      color: "#065f46", bg: "#d1fae5", pct: 100 },
  STUCK_DELAYED: { label: "Stuck / Delayed",color: "#991b1b", bg: "#fee2e2", pct: 0   },
}

// ── Small helpers ────────────────────────────────────────────────────────────
function Badge({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold"
      style={{ color, backgroundColor: bg }}>
      {label}
    </span>
  )
}

function KpiCard({ label, value, sub, iconBg, Icon, loading }: {
  label: string; value: number | string; sub?: string
  Icon: any; iconBg: string; loading?: boolean
}) {
  return (
    <div className="relative bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: iconBg }}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <div className="mt-3">
        {loading ? (
          <div className="h-8 w-16 bg-gray-100 rounded-lg animate-pulse" />
        ) : (
          <p className="text-3xl font-black text-gray-900 tracking-tight">{value}</p>
        )}
        <p className="text-xs font-semibold text-gray-500 mt-1">{label}</p>
        {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

// ── OverviewTab ──────────────────────────────────────────────────────────────
export function OverviewTab({
  stats, loading, petitions, works, briefing, briefingLoading,
  onRefreshBriefing, onSelectPetition, onNavChange,
}: {
  stats: Stats | null; loading: boolean; petitions: Petition[]; works: Work[]
  briefing: string; briefingLoading: boolean
  onRefreshBriefing: () => void; onSelectPetition: (p: Petition) => void; onNavChange: (tab: string) => void
}) {
  const overdue = petitions.filter(p => p.isOverdue)
  const resolvedPct = stats && stats.totalPetitions > 0
    ? Math.round((stats.resolvedPetitions / stats.totalPetitions) * 100) : 0

  return (
    <div className="space-y-5">

      {/* ── KPI Grid ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard loading={loading} label="Total Petitions" value={stats?.totalPetitions ?? 0}
          sub="All time" Icon={FileText} iconBg="linear-gradient(135deg,#3b82f6,#1d4ed8)" />
        <KpiCard loading={loading} label="Pending Action" value={stats?.pendingPetitions ?? 0}
          sub="Needs attention" Icon={Clock} iconBg="linear-gradient(135deg,#f59e0b,#ea580c)" />
        <KpiCard loading={loading} label="Overdue" value={stats?.overduePetitions ?? 0}
          sub="Past SLA" Icon={AlertTriangle} iconBg="linear-gradient(135deg,#ef4444,#e11d48)" />
        <KpiCard loading={loading} label="Resolved" value={stats?.resolvedPetitions ?? 0}
          sub={`${resolvedPct}% resolution rate`} Icon={CheckCircle2} iconBg="linear-gradient(135deg,#10b981,#0d9488)" />
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard loading={loading} label="Public Works" value={stats?.totalWorks ?? 0}
          sub="Constituency projects" Icon={Building2} iconBg="linear-gradient(135deg,#8b5cf6,#7c3aed)" />
        <KpiCard loading={loading} label="In Progress" value={stats?.worksInProgress ?? 0}
          sub="Active on ground" Icon={Activity} iconBg="linear-gradient(135deg,#0ea5e9,#2563eb)" />
        <KpiCard loading={loading} label="Completed" value={stats?.worksCompleted ?? 0}
          sub="Delivered" Icon={CheckCircle2} iconBg="linear-gradient(135deg,#22c55e,#059669)" />
        <KpiCard loading={loading} label="Portal Grievances" value={stats?.totalGrievances ?? 0}
          sub="Citizen submissions" Icon={FileText} iconBg="linear-gradient(135deg,#64748b,#334155)" />
      </div>

      {/* ── Briefing + Priority ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Morning Briefing */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-amber-50 border-b border-amber-100 px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg,#f59e0b,#ea580c)" }}>
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">AI Morning Briefing</p>
                <p className="text-[10px] text-amber-700">Powered by Gemini · Live DB data</p>
              </div>
            </div>
            <button onClick={onRefreshBriefing} className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-100 rounded-lg transition-all">
              <RefreshCw className={`w-3.5 h-3.5 ${briefingLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
          <div className="p-5">
            {briefingLoading ? (
              <div className="space-y-2.5">
                {[100, 90, 80, 60].map(w => (
                  <div key={w} className="h-3 bg-gray-100 rounded-full animate-pulse" style={{ width: `${w}%` }} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {briefing || "Click refresh to generate today's briefing."}
              </p>
            )}
          </div>
        </div>

        {/* Priority Queue */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-red-50 border-b border-red-100 px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg,#ef4444,#e11d48)" }}>
                <AlertTriangle className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Priority Queue</p>
                <p className="text-[10px] text-red-600">{overdue.length} overdue cases</p>
              </div>
            </div>
            <button onClick={() => onNavChange("petitions")} className="text-[11px] font-semibold text-red-600 hover:text-red-800 transition-all">View all →</button>
          </div>
          <div className="p-3">
            {overdue.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                <CheckCircle2 className="w-9 h-9 mb-2 text-emerald-400" />
                <p className="text-xs font-medium text-gray-500">All clear — no overdue</p>
              </div>
            ) : (
              <div className="space-y-1">
                {overdue.slice(0, 6).map(p => {
                  const tm = TYPE_META[p.type] || TYPE_META.OTHER
                  return (
                    <button key={p.id} onClick={() => onSelectPetition(p)}
                      className="w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-red-50 transition-all group">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: tm.bg }}>
                        <tm.Icon className="w-3.5 h-3.5" style={{ color: tm.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 truncate">{p.applicantName}</p>
                        <p className="text-[10px] text-gray-400">{tm.label} · {p.mandalName || ""}</p>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-red-400 flex-shrink-0" />
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Works Progress ── */}
      {works.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg,#8b5cf6,#7c3aed)" }}>
                <Building2 className="w-3.5 h-3.5 text-white" />
              </div>
              <p className="text-xs font-bold text-gray-900">Public Works Status</p>
            </div>
            <button onClick={() => onNavChange("works")} className="text-[11px] font-semibold text-blue-600 hover:text-blue-800">View all →</button>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            {works.slice(0, 3).map(w => {
              const sm = STAGE_META[w.stage] || STAGE_META.PLANNED
              const budget = w.sanctionedBudget || w.estimatedBudget
              return (
                <div key={w.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-gray-200 hover:shadow-sm transition-all">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <p className="text-xs font-bold text-gray-900 leading-snug">{w.title}</p>
                    {budget && <p className="text-[11px] font-bold text-gray-500 flex-shrink-0">₹{(budget/100000).toFixed(0)}L</p>}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ color: sm.color, backgroundColor: sm.bg }}>{sm.label}</span>
                    {w.mandalName && <span className="text-[10px] text-gray-400">{w.mandalName}</span>}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full transition-all" style={{ width: `${sm.pct}%`, backgroundColor: sm.color }} />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1 text-right">{sm.pct}% complete</p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ── PetitionsTab ─────────────────────────────────────────────────────────────
export function PetitionsTab({ petitions, loading, onSelect }: {
  petitions: Petition[]; loading: boolean; onSelect: (p: Petition) => void
}) {
  if (loading) return (
    <div className="space-y-3">
      {[1,2,3,4,5].map(i => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
          <div className="flex gap-3">
            <div className="w-9 h-9 bg-gray-100 rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-100 rounded w-1/3" />
              <div className="h-3 bg-gray-100 rounded w-2/3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="space-y-3">
      {petitions.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400 text-sm">
          No petitions found.
        </div>
      )}
      {petitions.map(p => {
        const tm = TYPE_META[p.type] || TYPE_META.OTHER
        const sm = STATUS_META[p.status] || { label: p.status, color: "#475569", bg: "#f1f5f9" }
        return (
          <button key={p.id} onClick={() => onSelect(p)}
            className="w-full text-left bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all group">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: tm.bg }}>
                <tm.Icon className="w-4 h-4" style={{ color: tm.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-gray-900">{p.applicantName}</span>
                  <span className="text-[11px] text-gray-400">{p.trackingNumber}</span>
                  {p.isOverdue && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-600">
                      <Clock className="w-2.5 h-2.5" /> Overdue
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-0.5 truncate">{p.title || tm.label}</p>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <Badge label={sm.label} color={sm.color} bg={sm.bg} />
                  <Badge label={tm.label} color={tm.color} bg={tm.bg} />
                  {p.mandalName && (
                    <span className="flex items-center gap-1 text-[11px] text-gray-400">
                      <MapPin className="w-2.5 h-2.5" />{p.mandalName}
                    </span>
                  )}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 flex-shrink-0 mt-1" />
            </div>
          </button>
        )
      })}
    </div>
  )
}

// ── WorksTab ─────────────────────────────────────────────────────────────────
export function WorksTab({ works, loading }: { works: Work[]; loading: boolean }) {
  if (loading) return (
    <div className="space-y-3">
      {[1,2,3].map(i => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
          <div className="h-4 bg-gray-100 rounded w-1/2 mb-3" />
          <div className="h-2 bg-gray-100 rounded w-full" />
        </div>
      ))}
    </div>
  )

  return (
    <div className="space-y-4">
      {works.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400 text-sm">
          No public works found.
        </div>
      )}
      {works.map(w => {
        const sm = STAGE_META[w.stage] || STAGE_META.PLANNED
        const budget = w.sanctionedBudget || w.estimatedBudget
        const spent = w.spentBudget || 0
        const spentPct = budget ? Math.min(100, Math.round((spent / budget) * 100)) : 0
        return (
          <div key={w.id} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-semibold text-gray-900">{w.title}</h3>
                  <Badge label={sm.label} color={sm.color} bg={sm.bg} />
                </div>
                <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-400">
                  <span>{w.workCode}</span>
                  {w.mandalName && <span className="flex items-center gap-1"><MapPin className="w-2.5 h-2.5" />{w.mandalName}</span>}
                  {w.villageName && <span>{w.villageName}</span>}
                </div>
              </div>
              {budget && (
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-bold text-gray-900">₹{(budget / 100000).toFixed(1)}L</p>
                  <p className="text-[11px] text-gray-400">sanctioned</p>
                </div>
              )}
            </div>

            {/* Progress bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-gray-500">
                <span>Progress</span>
                <span>{sm.pct}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="h-2 rounded-full transition-all" style={{ width: `${sm.pct}%`, backgroundColor: sm.color }} />
              </div>
            </div>

            {/* Budget utilisation */}
            {budget != null && budget > 0 && (
              <div className="space-y-1 mt-2">
                <div className="flex justify-between text-[11px] text-gray-500">
                  <span>Budget utilised</span>
                  <span>₹{(spent / 100000).toFixed(1)}L / ₹{((budget as number) / 100000).toFixed(1)}L ({spentPct}%)</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className="h-1.5 rounded-full bg-blue-500 transition-all" style={{ width: `${spentPct}%` }} />
                </div>
              </div>
            )}

            {w.stuckReason && (
              <div className="mt-3 flex items-start gap-2 p-2.5 bg-red-50 rounded-lg">
                <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-700">{w.stuckReason}</p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── MapTab ───────────────────────────────────────────────────────────────────
export function MapTab({ MapComp, mounted }: { MapComp: any; mounted: boolean }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden" style={{ height: "calc(100vh - 160px)" }}>
      {!mounted || !MapComp ? (
        <div className="flex items-center justify-center h-full text-gray-400 text-sm">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading district map…
          </div>
        </div>
      ) : (
        <MapComp />
      )}
    </div>
  )
}

// ── AITab ────────────────────────────────────────────────────────────────────
const QUICK_Q = [
  "What needs my decision today?",
  "Which CMRF cases are overdue?",
  "Status of Bittupalli road work?",
  "How many transfers are pending?",
  "Which works are stuck and why?",
]

export function AITab({
  messages, input, setInput, aiLoading, briefing, briefingLoading,
  voiceOn, setVoiceOn, listening, avatarTalking,
  chatEndRef, onSend, onVoice, onRefreshBriefing,
}: {
  messages: ChatMsg[]; input: string; setInput: (v: string) => void
  aiLoading: boolean; briefing: string; briefingLoading: boolean
  voiceOn: boolean; setVoiceOn: (v: boolean) => void
  listening: boolean; avatarTalking: boolean
  chatEndRef: React.RefObject<HTMLDivElement>
  onSend: (t: string) => void; onVoice: () => void; onRefreshBriefing: () => void
  speak?: (t: string) => void
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Briefing panel */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-semibold text-gray-900">Morning Briefing</h2>
          </div>
          <button onClick={onRefreshBriefing} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all">
            <RefreshCw className={`w-3.5 h-3.5 ${briefingLoading ? "animate-spin text-blue-500" : ""}`} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {briefingLoading ? (
            <div className="space-y-2">
              {[1,2,3,4].map(i => <div key={i} className="h-3 bg-gray-100 rounded animate-pulse" style={{ width: `${95 - i*8}%` }} />)}
            </div>
          ) : (
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{briefing || "No briefing available."}</p>
          )}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-[11px] text-gray-400 mb-2 font-medium">Quick questions</p>
          <div className="space-y-1.5">
            {QUICK_Q.map(q => (
              <button key={q} onClick={() => onSend(q)}
                className="w-full text-left text-xs text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg transition-all">
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat panel */}
      <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 flex flex-col" style={{ height: "calc(100vh - 160px)" }}>
        {/* Chat header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center transition-all ${avatarTalking ? "ring-2 ring-blue-400 ring-offset-1" : ""}`}>
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-900">Gemini AI Assistant</p>
              <p className="text-[10px] text-gray-400">{aiLoading ? "Thinking…" : listening ? "Listening…" : "Ready"}</p>
            </div>
          </div>
          <button onClick={() => setVoiceOn(!voiceOn)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${voiceOn ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
            {voiceOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            {voiceOn ? "Voice On" : "Voice Off"}
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <Sparkles className="w-8 h-8 mb-2 text-gray-300" />
              <p className="text-sm">Ask anything about your constituency</p>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-blue-600 text-white rounded-br-sm"
                  : "bg-gray-100 text-gray-800 rounded-bl-sm"
              }`}>
                {m.text}
              </div>
            </div>
          ))}
          {aiLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1">
                {[0,1,2].map(i => (
                  <div key={i} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-gray-100">
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && onSend(input)}
              placeholder="Ask about petitions, works, or constituency…"
              className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
            />
            <button onClick={onVoice}
              className={`p-1.5 rounded-lg transition-all ${listening ? "bg-red-100 text-red-500" : "text-gray-400 hover:text-gray-700 hover:bg-gray-200"}`}>
              {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            <button onClick={() => onSend(input)} disabled={!input.trim() || aiLoading}
              className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── PetitionDrawer ────────────────────────────────────────────────────────────
export function PetitionDrawer({ petition: p, onClose }: { petition: Petition; onClose: () => void }) {
  const tm = TYPE_META[p.type] || TYPE_META.OTHER
  const sm = STATUS_META[p.status] || { label: p.status, color: "#475569", bg: "#f1f5f9" }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: tm.bg }}>
              <tm.Icon className="w-4 h-4" style={{ color: tm.color }} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">{p.applicantName}</p>
              <p className="text-[11px] text-gray-400">{p.trackingNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge label={sm.label} color={sm.color} bg={sm.bg} />
            <Badge label={tm.label} color={tm.color} bg={tm.bg} />
            {p.isOverdue && <Badge label="⚠ Overdue" color="#b91c1c" bg="#fef2f2" />}
            {p.priority && p.priority !== "NORMAL" && <Badge label={p.priority} color="#b45309" bg="#fffbeb" />}
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Phone", value: p.applicantPhone },
              { label: "Mandal", value: p.mandalName },
              { label: "Village", value: p.villageName },
              { label: "Handling PA", value: p.handlingPaName },
              { label: "Department", value: p.assignedDepartment },
              { label: "Referred by", value: p.referredByLeaderName },
              { label: "Submitted", value: p.createdAt ? new Date(p.createdAt).toLocaleDateString("en-IN") : undefined },
              { label: "Requested ₹", value: p.requestedAmount ? `₹${(p.requestedAmount/100000).toFixed(1)}L` : undefined },
              { label: "Sanctioned ₹", value: p.sanctionedAmount ? `₹${(p.sanctionedAmount/100000).toFixed(1)}L` : undefined },
            ].filter(r => r.value).map(({ label, value }) => (
              <div key={label} className="bg-gray-50 rounded-lg p-3">
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">{label}</p>
                <p className="text-xs font-semibold text-gray-800 mt-0.5">{value}</p>
              </div>
            ))}
          </div>

          {/* Description */}
          {p.title && (
            <div>
              <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide mb-1">Subject</p>
              <p className="text-sm text-gray-700">{p.title}</p>
            </div>
          )}
          {p.description && (
            <div>
              <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide mb-1">Description</p>
              <p className="text-sm text-gray-600 leading-relaxed">{p.description}</p>
            </div>
          )}

          {/* Private notes — minister/PA only */}
          {p.privateNotes && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-[11px] text-amber-700 font-bold uppercase tracking-wide mb-1">🔒 Private Notes</p>
              <p className="text-sm text-amber-800 leading-relaxed">{p.privateNotes}</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
