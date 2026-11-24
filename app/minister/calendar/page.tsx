// @ts-nocheck
"use client"
export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { signOut } from "next-auth/react"
import Link from "next/link"
import { ArrowLeft, RefreshCw, Plus, X, MapPin, LogOut, Calendar, Clock } from "lucide-react"

const EVENT_META = {
  VILLAGE_TOUR: { label: "Village Tour", color: "bg-green-100 text-green-800 border-green-300" },
  GRIEVANCE_DAY: { label: "Grievance Day", color: "bg-blue-100 text-blue-800 border-blue-300" },
  DEPARTMENT_REVIEW: { label: "Dept Review", color: "bg-purple-100 text-purple-800 border-purple-300" },
  VIP_MEETING: { label: "VIP Meeting", color: "bg-amber-100 text-amber-800 border-amber-300" },
  PUBLIC_MEETING: { label: "Public Meeting", color: "bg-indigo-100 text-indigo-800 border-indigo-300" },
  PRESS_CONFERENCE: { label: "Press Conference", color: "bg-rose-100 text-rose-800 border-rose-300" },
  OTHER: { label: "Other", color: "bg-slate-100 text-slate-800 border-slate-300" },
}

export default function MinisterCalendarPage() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title: "", location: "", startDate: "", eventType: "VILLAGE_TOUR", notes: "", mandalName: "", villageName: "" })
  const [notice, setNotice] = useState("")

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/minister/events", { credentials: "include" })
      const data = await res.json()
      if (data.success) setEvents(data.events)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch("/api/minister/events", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        setShowAdd(false)
        setForm({ title: "", location: "", startDate: "", eventType: "VILLAGE_TOUR", notes: "", mandalName: "", villageName: "" })
        setNotice("Event added successfully")
        setTimeout(() => setNotice(""), 3000)
        load()
      }
    } finally { setSaving(false) }
  }

  const now = new Date()
  const upcoming = events.filter(e => new Date(e.startDate) >= now).sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
  const past = events.filter(e => new Date(e.startDate) < now).sort((a, b) => new Date(b.startDate) - new Date(a.startDate))

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/minister/dashboard" className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-bold text-slate-900">Tour & Calendar</h1>
              <p className="text-xs text-slate-500">Schedule & upcoming events</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-medium">
              <Plus className="w-3.5 h-3.5" />Add Event
            </button>
            <button onClick={load} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button onClick={() => signOut({ callbackUrl: "/auth/login" })} className="flex items-center gap-1.5 text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg font-medium">
              <LogOut className="w-3.5 h-3.5" />Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-5 space-y-6">
        {notice && <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm font-medium">{notice}</div>}

        {/* Upcoming */}
        <div>
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" />Upcoming Events ({upcoming.length})
          </h2>
          {loading ? (
            <div className="flex justify-center py-8"><RefreshCw className="w-6 h-6 animate-spin text-blue-600" /></div>
          ) : upcoming.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400">
              <Calendar className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p>No upcoming events. <button onClick={() => setShowAdd(true)} className="text-blue-600 underline">Add one →</button></p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map(ev => {
                const d = new Date(ev.startDate)
                const isToday = d.toDateString() === now.toDateString()
                const em = EVENT_META[ev.eventType] || EVENT_META.OTHER
                return (
                  <div key={ev.id} className={`bg-white rounded-xl border shadow-sm p-4 flex items-start gap-4 ${isToday ? "border-blue-400 ring-2 ring-blue-400/20" : "border-slate-200"}`}>
                    <div className={`flex-shrink-0 w-14 text-center p-2 rounded-lg ${isToday ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"}`}>
                      <p className="text-xs font-bold">{d.toLocaleDateString("en-IN", { month: "short" })}</p>
                      <p className="text-2xl font-black leading-none">{d.getDate()}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {isToday && <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">TODAY</span>}
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${em.color}`}>{em.label}</span>
                      </div>
                      <h3 className="font-bold text-slate-900">{ev.title}</h3>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{ev.location}</span>
                        {ev.mandalName && <span>{ev.mandalName} Mandal</span>}
                      </div>
                      {ev.notes && <p className="text-xs text-slate-500 mt-1 italic">{ev.notes}</p>}
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${ev.status === "CONFIRMED" ? "bg-emerald-100 text-emerald-700" : ev.status === "COMPLETED" ? "bg-slate-100 text-slate-600" : "bg-amber-100 text-amber-700"}`}>
                      {ev.status}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Past events */}
        {past.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Past Events ({past.length})</h2>
            <div className="space-y-2">
              {past.slice(0, 5).map(ev => {
                const d = new Date(ev.startDate)
                const em = EVENT_META[ev.eventType] || EVENT_META.OTHER
                return (
                  <div key={ev.id} className="bg-white rounded-xl border border-slate-200 p-3 flex items-center gap-3 opacity-70">
                    <div className="flex-shrink-0 w-10 text-center">
                      <p className="text-xs text-slate-500">{d.toLocaleDateString("en-IN", { month: "short" })}</p>
                      <p className="text-lg font-black text-slate-600 leading-none">{d.getDate()}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-700 text-sm">{ev.title}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1"><MapPin className="w-3 h-3" />{ev.location}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${em.color}`}>{em.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Add Event Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <h2 className="font-bold text-slate-900">Add Calendar Event</h2>
              <button onClick={() => setShowAdd(false)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={save} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Title *</label>
                <input required value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} placeholder="e.g. Village Tour - Bittupalli"
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Location *</label>
                  <input required value={form.location} onChange={e => setForm(p => ({...p, location: e.target.value}))} placeholder="e.g. Mandal Office"
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date & Time *</label>
                  <input required type="datetime-local" value={form.startDate} onChange={e => setForm(p => ({...p, startDate: e.target.value}))}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mandal</label>
                  <input value={form.mandalName} onChange={e => setForm(p => ({...p, mandalName: e.target.value}))} placeholder="e.g. Manthanani"
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Village</label>
                  <input value={form.villageName} onChange={e => setForm(p => ({...p, villageName: e.target.value}))} placeholder="e.g. Bittupalli"
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Event Type</label>
                <select value={form.eventType} onChange={e => setForm(p => ({...p, eventType: e.target.value}))}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {Object.entries(EVENT_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notes</label>
                <textarea rows={2} value={form.notes} onChange={e => setForm(p => ({...p, notes: e.target.value}))} placeholder="Any additional notes..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-2.5 border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50">
                  {saving ? "Saving..." : "Save Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
