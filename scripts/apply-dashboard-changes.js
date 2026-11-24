const fs = require('fs')

// ── PA Dashboard ──────────────────────────────────────────────────────────────
let pa = fs.readFileSync('app/pa/dashboard/page.tsx', 'utf8')

// 1. Add VoiceIntakeButton import
pa = pa.replace(
  `import { useState, useEffect } from "react"`,
  `import { useState, useEffect } from "react"\nimport { VoiceIntakeButton } from "@/components/VoiceIntake"`
)

// 2. Add signOut to next-auth import
pa = pa.replace(
  `import { useSession } from "next-auth/react"`,
  `import { useSession, signOut } from "next-auth/react"`
)

// 3. Add voice + QR state after showLogModal state
pa = pa.replace(
  `const [showLogModal, setShowLogModal] = useState(false)`,
  `const [showLogModal, setShowLogModal] = useState(false)\n  const [showVoice, setShowVoice] = useState(false)\n  const [createdQR, setCreatedQR] = useState<string|null>(null)`
)

// 4. Capture QR after petition creation
pa = pa.replace(
  `setShowLogModal(false)\n        fetchPetitions()`,
  `setShowLogModal(false)\n        setCreatedQR(data.petition?.qrCode || data.petition?.trackingNumber || null)\n        fetchPetitions()`
)

// 5. Add sign out button to header (after the + Log Petition button)
pa = pa.replace(
  `<Plus className="w-4 h-4" />+ Log Petition\n            </button>`,
  `<Plus className="w-4 h-4" />+ Log Petition\n            </button>\n            <button onClick={() => signOut({ callbackUrl: '/auth/login' })} className="flex items-center gap-1.5 text-xs bg-red-600/80 hover:bg-red-700 text-white font-semibold px-3 py-2 rounded-lg">\n              Sign Out\n            </button>`
)

// 6. Add voice intake button inside the petition form (before the category selector)
pa = pa.replace(
  `<form onSubmit={handleCreatePetition} className="p-4 overflow-y-auto space-y-4 text-xs">`,
  `<form onSubmit={handleCreatePetition} className="p-4 overflow-y-auto space-y-4 text-xs">
              {showVoice ? (
                <VoiceIntakeButton
                  onExtracted={(d) => {
                    setNewForm(prev => ({
                      ...prev,
                      applicantName: d.applicantName || prev.applicantName,
                      applicantPhone: d.applicantPhone || prev.applicantPhone,
                      villageName: d.villageName || prev.villageName,
                      mandalName: d.mandalName || prev.mandalName,
                      type: d.type || prev.type,
                      title: d.title || prev.title,
                      priority: d.priority || prev.priority,
                      hospitalName: d.hospitalName || prev.hospitalName,
                      requestedAmount: d.requestedAmount ? String(d.requestedAmount) : prev.requestedAmount,
                      description: d.description || prev.description,
                    }))
                    setShowVoice(false)
                  }}
                  onClose={() => setShowVoice(false)}
                />
              ) : (
                <button type="button" onClick={() => setShowVoice(true)} className="flex items-center gap-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-2 rounded-lg w-full justify-center">
                  🎤 Use Voice Intake (Telugu / English)
                </button>
              )}`
)

// 7. Add QR receipt modal before closing div
const paClosing = `    </div>\n  )\n}`
pa = pa.replace(
  paClosing,
  `      {/* QR Receipt Modal */}
      {createdQR && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-3xl">✅</span>
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Petition Created!</h3>
            <div className="p-3 bg-slate-50 rounded-lg border">
              <p className="text-xs text-slate-500 mb-1">Tracking / QR Code</p>
              <p className="font-mono font-bold text-slate-900 text-sm break-all">{createdQR}</p>
            </div>
            <p className="text-xs text-slate-500">Give this code to the citizen to track their petition.</p>
            <p className="text-xs font-mono text-blue-600 bg-blue-50 p-2 rounded break-all">
              {typeof window !== 'undefined' ? window.location.origin : ''}/track/{createdQR}
            </p>
            <button onClick={() => setCreatedQR(null)} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm">Done</button>
          </div>
        </div>
      )}
    </div>
  )
}`
)

fs.writeFileSync('app/pa/dashboard/page.tsx', pa)
console.log('✅ PA dashboard updated')

// ── Minister Dashboard ────────────────────────────────────────────────────────
let min = fs.readFileSync('app/minister/dashboard/page.tsx', 'utf8')

// Add signOut import
min = min.replace(
  `import { useSession } from "next-auth/react"`,
  `import { useSession, signOut } from "next-auth/react"`
)

// Add Morning Briefing, Analytics, and Sign Out buttons to header
min = min.replace(
  `onClick={() => router.push("/pa/dashboard")}\n              className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg border border-white/20 font-medium"\n            >\n              💼 PA Office\n            </button>`,
  `onClick={() => router.push("/pa/dashboard")}\n              className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg border border-white/20 font-medium"\n            >\n              💼 PA Office\n            </button>\n            <button onClick={() => router.push("/minister/morning-briefing")} className="text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 px-3 py-1.5 rounded-lg border border-amber-400/40 font-medium">🌅 Briefing</button>\n            <button onClick={() => router.push("/minister/analytics")} className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg border border-white/20 font-medium">📊 Analytics</button>\n            <button onClick={() => signOut({ callbackUrl: '/auth/login' })} className="text-xs bg-red-600/70 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg font-medium">Sign Out</button>`
)

fs.writeFileSync('app/minister/dashboard/page.tsx', min)
console.log('✅ Minister dashboard updated')

// ── Back Officer Dashboard ────────────────────────────────────────────────────
let back = fs.readFileSync('app/back-officer/dashboard/page.tsx', 'utf8')

back = back.replace(
  `import { useSession } from "next-auth/react"`,
  `import { useSession, signOut } from "next-auth/react"`
)

// Add LogOut to lucide imports
back = back.replace(
  `FileText, Plus, Search, RefreshCw, X, Send,`,
  `FileText, Plus, Search, RefreshCw, X, Send, LogOut,`
)

// Add sign out button after New Entry button
back = back.replace(
  `<Plus className="w-4 h-4" />New Entry\n            </button>`,
  `<Plus className="w-4 h-4" />New Entry\n            </button>\n            <button onClick={() => signOut({ callbackUrl: '/auth/login' })} className="flex items-center gap-1.5 text-xs bg-red-600/80 hover:bg-red-700 text-white font-semibold px-3 py-2 rounded-lg">\n              <LogOut className="w-3.5 h-3.5" />Sign Out\n            </button>`
)

fs.writeFileSync('app/back-officer/dashboard/page.tsx', back)
console.log('✅ Back Officer dashboard updated')

// ── Field Officer Dashboard ───────────────────────────────────────────────────
let field = fs.readFileSync('app/field-officer/dashboard/page.tsx', 'utf8')

field = field.replace(
  `import { useSession } from "next-auth/react"`,
  `import { useSession, signOut } from "next-auth/react"`
)

field = field.replace(
  `FileText, Clock, CheckCircle2, AlertTriangle, RefreshCw,`,
  `FileText, Clock, CheckCircle2, AlertTriangle, RefreshCw, LogOut,`
)

// Add sign out button before the refresh button
field = field.replace(
  `<button onClick={fetchTasks} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20">`,
  `<button onClick={() => signOut({ callbackUrl: '/auth/login' })} className="flex items-center gap-1.5 text-xs bg-red-600/80 hover:bg-red-700 text-white font-semibold px-3 py-2 rounded-lg">\n              <LogOut className="w-3.5 h-3.5" />Sign Out\n            </button>\n          <button onClick={fetchTasks} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20">`
)

fs.writeFileSync('app/field-officer/dashboard/page.tsx', field)
console.log('✅ Field Officer dashboard updated')

console.log('\n✅ All dashboard files updated cleanly')
