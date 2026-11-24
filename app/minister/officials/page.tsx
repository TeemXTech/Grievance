// @ts-nocheck
"use client"
export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { signOut } from "next-auth/react"
import Link from "next/link"
import { ArrowLeft, RefreshCw, LogOut, Users, Phone, Mail } from "lucide-react"

const ROLE_META = {
  PA:               { label: "Personal Assistant",  color: "bg-blue-100 text-blue-800" },
  BACK_OFFICER:     { label: "Back Officer",         color: "bg-amber-100 text-amber-800" },
  FIELD_OFFICER:    { label: "Field Officer",        color: "bg-green-100 text-green-800" },
  OFFICER:          { label: "Officer",              color: "bg-indigo-100 text-indigo-800" },
  GOVERNMENT_OFFICIAL: { label: "Govt Official",    color: "bg-purple-100 text-purple-800" },
  ADMIN:            { label: "Admin",                color: "bg-slate-100 text-slate-800" },
}

export default function MinisterOfficialsPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterRole, setFilterRole] = useState("ALL")

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/users", { credentials: "include" })
      const data = await res.json()
      if (data.users) setUsers(data.users.filter(u => u.role !== "MINISTER" && u.role !== "PUBLIC"))
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const filtered = filterRole === "ALL" ? users : users.filter(u => u.role === filterRole)
  const roles = [...new Set(users.map(u => u.role))]

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/minister/dashboard" className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-bold text-slate-900">Officials & Staff</h1>
              <p className="text-xs text-slate-500">All office staff and field officers</p>
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
        {/* Role filter */}
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setFilterRole("ALL")} className={`text-xs px-3 py-1.5 rounded-lg font-medium border transition-all ${filterRole === "ALL" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"}`}>
            All ({users.length})
          </button>
          {roles.map(role => {
            const rm = ROLE_META[role] || { label: role, color: "bg-gray-100 text-gray-800" }
            return (
              <button key={role} onClick={() => setFilterRole(role)} className={`text-xs px-3 py-1.5 rounded-lg font-medium border transition-all ${filterRole === role ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"}`}>
                {rm.label} ({users.filter(u => u.role === role).length})
              </button>
            )
          })}
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><RefreshCw className="w-8 h-8 animate-spin text-blue-600" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(u => {
              const rm = ROLE_META[u.role] || { label: u.role, color: "bg-gray-100 text-gray-800" }
              const initials = u.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()
              return (
                <div key={u.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 text-sm truncate">{u.name}</p>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${rm.color}`}>{rm.label}</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${u.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                      {u.status || "active"}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs text-slate-600">
                    <div className="flex items-center gap-2"><Mail className="w-3 h-3 text-slate-400" /><span className="truncate">{u.email}</span></div>
                    {u.phone && <div className="flex items-center gap-2"><Phone className="w-3 h-3 text-slate-400" /><span>{u.phone}</span></div>}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
