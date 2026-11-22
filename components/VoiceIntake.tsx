"use client"

import { useState, useRef } from "react"
import { Mic, MicOff, Loader2, CheckCircle2, AlertTriangle, X } from "lucide-react"

interface VoiceIntakeProps {
  onExtracted: (data: any) => void
  onClose: () => void
}

export function VoiceIntakeButton({ onExtracted, onClose }: VoiceIntakeProps) {
  const [phase, setPhase] = useState<'idle' | 'listening' | 'processing' | 'done' | 'error'>('idle')
  const [transcript, setTranscript] = useState("")
  const [extracted, setExtracted] = useState<any>(null)
  const [duplicate, setDuplicate] = useState<any>(null)
  const [errorMsg, setErrorMsg] = useState("")
  const recognitionRef = useRef<any>(null)

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      setErrorMsg("Voice input not supported in this browser. Use Chrome.")
      setPhase('error')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'en-IN'
    recognition.continuous = false
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    recognition.onstart = () => setPhase('listening')
    recognition.onresult = (e: any) => {
      const t = Array.from(e.results).map((r: any) => r[0].transcript).join(' ')
      setTranscript(t)
    }
    recognition.onend = () => {
      if (transcript || recognitionRef.current?._finalTranscript) {
        processTranscript(recognitionRef.current?._finalTranscript || transcript)
      } else {
        setPhase('idle')
      }
    }
    recognition.onerror = (e: any) => {
      setErrorMsg(`Microphone error: ${e.error}. Please allow microphone access.`)
      setPhase('error')
    }

    // Track final transcript
    recognition.addEventListener('result', (e: any) => {
      const final = Array.from(e.results)
        .filter((r: any) => r.isFinal)
        .map((r: any) => r[0].transcript)
        .join(' ')
      if (final) recognitionRef.current._finalTranscript = final
    })

    recognitionRef.current = recognition
    recognitionRef.current._finalTranscript = ''
    recognition.start()
  }

  const stopListening = () => {
    recognitionRef.current?.stop()
  }

  const processTranscript = async (text: string) => {
    if (!text?.trim()) { setPhase('idle'); return }
    setPhase('processing')
    try {
      const res = await fetch('/api/ai/voice-intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: text }),
      })
      const data = await res.json()
      if (data.success) {
        setExtracted(data.extracted)
        setDuplicate(data.duplicate)
        setPhase('done')
      } else {
        setErrorMsg(data.error || 'Extraction failed')
        setPhase('error')
      }
    } catch {
      setErrorMsg('Server error. Please try again.')
      setPhase('error')
    }
  }

  const useExtracted = () => {
    if (extracted) onExtracted(extracted)
  }

  return (
    <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
          <Mic className="w-3.5 h-3.5" />
          Voice Intake (Telugu / English / Hindi)
        </p>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X className="w-4 h-4" /></button>
      </div>

      {phase === 'idle' && (
        <div className="space-y-2">
          <p className="text-xs text-indigo-700">
            Click the mic and speak the citizen's details. Example:<br />
            <em>"My name is Ramesh Kumar, phone 9876543210, from Bittupalli village, Manthanani mandal. He needs medical help for heart surgery at NIMS, amount 2 lakhs."</em>
          </p>
          <button
            onClick={startListening}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-lg text-sm w-full justify-center"
          >
            <Mic className="w-4 h-4" />
            Start Speaking
          </button>
        </div>
      )}

      {phase === 'listening' && (
        <div className="space-y-3 text-center">
          <div className="flex items-center justify-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <p className="text-sm font-bold text-red-700">Listening... Speak now</p>
          </div>
          {transcript && <p className="text-xs text-slate-600 italic bg-white p-2 rounded border">"{transcript}"</p>}
          <button onClick={stopListening} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg text-sm mx-auto">
            <MicOff className="w-4 h-4" />Stop & Process
          </button>
        </div>
      )}

      {phase === 'processing' && (
        <div className="flex items-center justify-center gap-2 py-3">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
          <p className="text-sm text-indigo-700">Extracting details...</p>
        </div>
      )}

      {phase === 'error' && (
        <div className="space-y-2">
          <p className="text-sm text-red-700 bg-red-50 p-2 rounded border border-red-200">{errorMsg}</p>
          <button onClick={() => setPhase('idle')} className="text-xs text-indigo-600 underline">Try again</button>
        </div>
      )}

      {phase === 'done' && extracted && (
        <div className="space-y-3">
          {/* Duplicate warning */}
          {duplicate?.found && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold text-amber-900">Possible duplicate!</p>
                <p className="text-amber-700">Open petition {duplicate.trackingNumber} ({duplicate.type.replace(/_/g,' ')}) — {duplicate.daysAgo} days ago, status: {duplicate.status.replace(/_/g,' ')}</p>
              </div>
            </div>
          )}

          {/* Extracted fields */}
          <div className="bg-white rounded-lg border border-indigo-200 p-3 space-y-1.5 text-xs">
            <p className="font-bold text-indigo-900 mb-2 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Extracted (confidence: {extracted.confidence}/3)
            </p>
            {[
              ['Name', extracted.applicantName],
              ['Phone', extracted.applicantPhone],
              ['Village', extracted.villageName],
              ['Mandal', extracted.mandalName],
              ['Type', extracted.type?.replace(/_/g,' ')],
              ['Priority', extracted.priority],
              ['Hospital', extracted.hospitalName],
              ['Amount', extracted.requestedAmount ? `₹${extracted.requestedAmount.toLocaleString('en-IN')}` : ''],
            ].filter(([, v]) => v).map(([k, v]) => (
              <div key={k} className="flex gap-2">
                <span className="text-slate-500 w-16 flex-shrink-0">{k}:</span>
                <span className="font-medium text-slate-900">{v}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={useExtracted}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg text-xs flex items-center justify-center gap-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Use These Details
            </button>
            <button onClick={() => setPhase('idle')} className="px-3 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs hover:bg-slate-50">
              Re-record
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
