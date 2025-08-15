"use client";
import { useEffect, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function MinisterAssistant() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [chartPath, setChartPath] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const speechRecRef = useRef<any>(null);

  const startListening = () => {
    const SR: any = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SR) { toast.error("Speech recognition not supported in this browser"); return; }
    const rec = new SR();
    speechRecRef.current = rec;
    rec.lang = "en-IN";
    rec.onresult = (e: any) => {
      const text = e.results[0][0].transcript;
      setQuestion(text);
    };
    rec.onerror = () => toast.error("Voice error");
    rec.start();
  };

  const speak = (text: string) => {
    if (!window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-IN";
    window.speechSynthesis.speak(u);
  };

  const ask = async (format: 'text' | 'excel' | 'pdf' | 'ppt' = 'text', compare = true) => {
    try {
      setLoading(true);
      setAnswer(null);
      setFileUrl(null);
      setChartPath(null);
      const res = await fetch('/api/assistant/query', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ question, format, compare })
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Request failed');
        return;
      }

      setAnswer(data.answer || 'No response generated');
      setFileUrl(data.fileUrl || null);
      if (data.answer) speak(data.answer);
    } catch (e: any) {
      toast.error(e.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 border rounded-xl max-w-4xl mx-auto bg-white shadow-sm">
      <Toaster position="top-right" />
      <h2 className="text-lg lg:text-xl font-semibold mb-4 text-gray-900">Minister AI Assistant (Local)</h2>

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Ask: 'Show grievances by district for July and compare'"
          value={question}
          onChange={e => setQuestion(e.target.value)}
        />
        <div className="flex gap-2">
          <button 
            onClick={startListening} 
            className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-colors"
          >
            🎙️ <span className="hidden sm:inline ml-1">Speak</span>
          </button>
          <button 
            onClick={() => ask('text', true)} 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors" 
            disabled={loading}
          >
            {loading ? 'Thinking…' : 'Ask'}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button 
          onClick={() => ask('excel', true)} 
          className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm transition-colors"
          disabled={loading}
        >
          📊 Export Excel
        </button>
        <button 
          onClick={() => ask('pdf', true)} 
          className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm transition-colors"
          disabled={loading}
        >
          📄 Export PDF
        </button>
        <button 
          onClick={() => ask('ppt', true)} 
          className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm transition-colors"
          disabled={loading}
        >
          📊 Export PPT
        </button>
      </div>

      {answer && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4 whitespace-pre-wrap text-sm text-gray-800">
          {answer}
        </div>
      )}



      {fileUrl && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <a className="text-blue-600 hover:text-blue-800 underline font-medium" href={fileUrl} download>
            📥 Download report
          </a>
        </div>
      )}
    </div>
  );
}