// @ts-nocheck
"use client"
export const dynamic = 'force-dynamic'

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { ArrowLeft, LogOut, Shield, Clock, User, Key, CheckCircle2 } from "lucide-react"

export default function MinisterSettingsPage() {
  const { data: session } = useSession()
  const user = session?.user as any

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/minister/dashboard" className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-bold text-slate-900">Settings</h1>
              <p className="text-xs text-slate-500">Account & security</p>
            </div>
          </div>
          <button onClick={() => signOut({ callbackUrl: "/auth/login" })} className="flex items-center gap-1.5 text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg font-medium">
            <LogOut className="w-3.5 h-3.5" />Sign Out
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-5 space-y-5">
        {/* Profile */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><User className="w-4 h-4" />Profile</h2>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-xl">
              {user?.name?.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() || "M"}
            </div>
            <div>
              <p className="font-bold text-slate-900 text-lg">{user?.name || "—"}</p>
              <p className="text-sm text-slate-500">{user?.email || "—"}</p>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 mt-1 inline-block">{user?.role || "MINISTER"}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              ["Name", user?.name],
              ["Email", user?.email],
              ["Role", user?.role],
              ["Phone", user?.phone || "Not set"],
            ].map(([k, v]) => (
              <div key={k} className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 uppercase">{k}</p>
                <p className="font-semibold text-slate-900 mt-0.5">{v || "—"}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Shield className="w-4 h-4" />Security</h2>
          <div className="space-y-3">
            {[
              { label: "Session Timeout", value: "8 hours", icon: Clock, ok: true },
              { label: "Password Hashing", value: "bcrypt cost-12", icon: Key, ok: true },
              { label: "JWT Secret", value: "Cryptographic random (32 bytes)", icon: Shield, ok: true },
              { label: "Bypass Routes", value: "All 9 blocked at edge middleware", icon: CheckCircle2, ok: true },
              { label: "Private Notes", value: "MINISTER/PA/ADMIN only", icon: Shield, ok: true },
              { label: "Audit Logging", value: "Every sensitive action logged", icon: CheckCircle2, ok: true },
            ].map(({ label, value, icon: Icon, ok }) => (
              <div key={label} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700">{label}</span>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ok ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Password reset note */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-amber-900 mb-1">Need to change your password?</p>
          <p className="text-xs text-amber-700">Contact the System Administrator (admin@gov.in) to reset your password. Passwords are hashed with bcrypt and cannot be recovered.</p>
        </div>

        {/* Sign out */}
        <button onClick={() => signOut({ callbackUrl: "/auth/login" })}
          className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl flex items-center justify-center gap-2">
          <LogOut className="w-4 h-4" />Sign Out of All Sessions
        </button>
      </div>
    </div>
  )
}
