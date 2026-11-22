"use client"
export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { ArrowLeft, RefreshCw, TrendingUp, FileText, Clock, AlertTriangle } from "lucide-react"

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6']

export default function AnalyticsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/analytics/realtime')
      const d = await res.json()
      if (d.success) setData(d)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 text-white sticky top-0 z-20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/minister/dashboard')} className="p-1.5 hover:bg-white/10 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <p className="font-bold">Analytics Dashboard</p>
              <p className="text-xs text-blue-300">Real-time data from PostgreSQL</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load} className="p-2 hover:bg-white/10 rounded-lg">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={() => signOut({ callbackUrl: '/auth/login' })} className="text-xs bg-red-600/70 hover:bg-red-700 px-3 py-1.5 rounded-lg">Sign Out</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {loading && (
          <div className="flex justify-center py-20">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        )}

        {data && (
          <>
            {/* KPI row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Petitions', value: data.kpis.totalPetitions, icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                { label: 'Resolved This Month', value: data.kpis.resolvedThisMonth, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { label: 'Overdue', value: data.kpis.overdueCount, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
                { label: 'Budget (Lakhs)', value: `₹${data.kpis.totalBudgetLakhs.toFixed(1)}L`, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
              ].map(({ label, value, icon: Icon, color, bg }) => (
                <div key={label} className={`p-5 rounded-xl border border-slate-200 bg-white shadow-sm`}>
                  <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center mb-3`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <p className={`text-2xl font-black ${color}`}>{value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Daily trend + By type */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <p className="font-bold text-slate-800 mb-4">Petitions — Last 7 Days</p>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={data.charts.dailyTrend}>
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <p className="font-bold text-slate-800 mb-4">Petitions by Type</p>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={data.charts.byType} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({ name, value }) => `${name.split(' ')[0]}: ${value}`} labelLine={false}>
                      {data.charts.byType.map((_: any, i: number) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* By status + By priority */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <p className="font-bold text-slate-800 mb-4">Petitions by Status</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data.charts.byStatus} layout="vertical">
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={110} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <p className="font-bold text-slate-800 mb-4">Petitions by Priority</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data.charts.byPriority}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {data.charts.byPriority.map((entry: any, i: number) => (
                        <Cell key={i} fill={entry.name === 'URGENT' ? '#ef4444' : entry.name === 'HIGH' ? '#f59e0b' : entry.name === 'MEDIUM' ? '#6366f1' : '#94a3b8'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Public works */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <p className="font-bold text-slate-800 mb-4">Public Works by Stage</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data.charts.worksByStage}>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip formatter={(v: any, n: string) => [n === 'budget' || n === 'spent' ? `₹${v}L` : v, n]} />
                    <Legend />
                    <Bar dataKey="count" name="Works" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="budget" name="Budget (L)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="spent" name="Spent (L)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <p className="font-bold text-slate-800 mb-4">Top Departments by Petition Load</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data.charts.byDepartment} layout="vertical">
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={130} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Overdue rate */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <p className="font-bold text-slate-800 mb-3">Overdue Rate</p>
              <div className="flex items-center gap-4">
                <div className="flex-1 bg-slate-100 rounded-full h-4 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${data.kpis.overdueRate > 30 ? 'bg-red-500' : data.kpis.overdueRate > 15 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min(data.kpis.overdueRate, 100)}%` }}
                  />
                </div>
                <span className={`font-black text-lg ${data.kpis.overdueRate > 30 ? 'text-red-600' : data.kpis.overdueRate > 15 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {data.kpis.overdueRate}%
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {data.kpis.overdueCount} of active petitions are past their due date.
                {data.kpis.overdueRate > 30 ? ' ⚠️ Action needed.' : data.kpis.overdueRate === 0 ? ' ✅ All on track.' : ''}
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
