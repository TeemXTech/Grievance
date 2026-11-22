"use client"

import { useState, useEffect, useRef } from "react"
import { Mic, MicOff, Send, RefreshCw, Volume2, VolumeX, Sparkles, Sun, AlertTriangle } from "lucide-react"

interface Message {
  role: "user" | "assistant"
  text: string
  time: string
}

export default function MinisterAIAssistant() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [briefing, setBriefing] = useState("")
  const [briefingLoading, setBriefingLoading] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [voiceOn, setVoiceOn] = useState(true)
  const [listening, setListening] = useState(false)
  const [avatarTalking, setAvatarTalking] = useState(false)
  const recognitionRef = useRef<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-load morning briefing
  useEffect(() => {
    loadBriefing()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const loadBriefing = async () => {
    setBriefingLoading(true)
    try {
      const res = await fetch("/api/minister/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "briefing", message: "" }),
      })
      const data = await res.json()
      if (data.success) {
        setBriefing(data.response)
        if (voiceOn) speak(data.response)
      }
    } catch {}
    finally { setBriefingLoading(false) }
  }

  const speak = (text: string) => {
    if (!voiceOn || typeof window === "undefined") return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = "en-IN"
    utterance.rate = 0.9
    utterance.pitch = 1.0
    utterance.onstart = () => { setSpeaking(true); setAvatarTalking(true) }
    utterance.onend = () => { setSpeaking(false); setAvatarTalking(false) }
    window.speechSynthesis.speak(utterance)
  }

  const stopSpeaking = () => {
    window.speechSynthesis.cancel()
    setSpeaking(false)
    setAvatarTalking(false)
  }

  const sendMessage = async (text: string) => {
    if (!text.trim()) return
    const userMsg: Message = { role: "user", text, time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) }
    setMessages(prev => [...prev, userMsg])
    setInput("")
    setLoading(true)

    try {
      const res = await fetch("/api/minister/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, mode: "query" }),
      })
      const data = await res.json()
      const reply = data.response || "I could not process that request."
      const assistantMsg: Message = { role: "assistant", text: reply, time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) }
      setMessages(prev => [...prev, assistantMsg])
      if (voiceOn) speak(reply)
    } catch {
      setMessages(prev => [...prev, { role: "assistant", text: "Connection error. Please try again.", time: "" }])
    } finally {
      setLoading(false)
    }
  }

  const startVoiceInput = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) return
    const r = new SR()
    r.lang = "en-IN"
    r.continuous = false
    r.onstart = () => setListening(true)
    r.onresult = (e: any) => {
      const t = e.results[0][0].transcript
      setInput(t)
      sendMessage(t)
    }
    r.onend = () => setListening(false)
    r.onerror = () => setListening(false)
    recognitionRef.current = r
    r.start()
  }

  const quickQuestions = [
    "Give me today's morning briefing",
    "How many overdue cases need attention?",
    "Show CMRF medical cases status",
    "Which public works are stuck?",
    "How many petitions this week?",
    "Who are the top referring leaders?",
  ]

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* AI Avatar */}
          <div className="relative">
            <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center border-2 ${avatarTalking ? "border-green-400 shadow-lg shadow-green-400/50" : "border-white/30"} transition-all`}>
              <span className="text-2xl">🤖</span>
            </div>
            {avatarTalking && (
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse" />
            )}
          </div>
          <div>
            <p className="text-white font-bold text-sm">Minister AI Assistant</p>
            <p className="text-blue-200 text-xs">{avatarTalking ? "Speaking..." : listening ? "Listening..." : "Ready"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setVoiceOn(!voiceOn); if (speaking) stopSpeaking() }}
            className={`p-1.5 rounded-lg transition-all ${voiceOn ? "bg-white/20 text-white" : "bg-white/10 text-white/40"}`}
            title={voiceOn ? "Voice ON" : "Voice OFF"}
          >
            {voiceOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          {speaking && (
            <button onClick={stopSpeaking} className="p-1.5 bg-red-500/80 text-white rounded-lg text-xs">Stop</button>
          )}
        </div>
      </div>

      {/* Morning Briefing */}
      <div className="px-4 pt-3">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-600" /> Morning Briefing
            </p>
            <button
              onClick={loadBriefing}
              disabled={briefingLoading}
              className="text-[11px] text-amber-700 hover:text-amber-900 flex items-center gap-1"
            >
              <RefreshCw className={`w-3 h-3 ${briefingLoading ? "animate-spin" : ""}`} /> Refresh
            </button>
          </div>
          {briefingLoading ? (
            <p className="text-xs text-amber-700 animate-pulse">Generating briefing from live data...</p>
          ) : (
            <p className="text-xs text-amber-900 leading-relaxed">{briefing || "Loading..."}</p>
          )}
          {briefing && voiceOn && !speaking && (
            <button onClick={() => speak(briefing)} className="mt-1.5 text-[11px] text-amber-700 hover:text-amber-900 flex items-center gap-1">
              <Volume2 className="w-3 h-3" /> Read aloud
            </button>
          )}
        </div>
      </div>

      {/* Quick Questions */}
      {messages.length === 0 && (
        <div className="px-4 pt-3">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Quick Questions</p>
          <div className="flex flex-wrap gap-1.5">
            {quickQuestions.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="text-[11px] px-2.5 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 text-slate-600 rounded-lg border border-slate-200 transition-all"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-[200px] max-h-[320px]">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
              msg.role === "user"
                ? "bg-blue-700 text-white rounded-br-none"
                : "bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200"
            }`}>
              {msg.role === "assistant" && (
                <p className="text-[10px] font-bold text-blue-600 mb-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> AI Assistant
                </p>
              )}
              <p>{msg.text}</p>
              {msg.time && <p className={`text-[10px] mt-1 ${msg.role === "user" ? "text-blue-200" : "text-slate-400"}`}>{msg.time}</p>}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 rounded-xl px-3 py-2 border border-slate-200">
              <div className="flex gap-1 items-center">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-4 pt-2 border-t border-slate-100">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input) } }}
            placeholder="Ask anything about petitions, works, cases..."
            className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={startVoiceInput}
            disabled={listening}
            className={`p-2 rounded-lg transition-all ${listening ? "bg-red-500 text-white animate-pulse" : "bg-slate-100 hover:bg-slate-200 text-slate-600"}`}
            title="Voice input"
          >
            {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            className="p-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg disabled:opacity-50 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
