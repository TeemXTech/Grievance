"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"

export default function DebugLoginPage() {
  const [email, setEmail] = useState("admin@example.com")
  const [password, setPassword] = useState("password123")
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
    console.log(message)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setLogs([])
    
    addLog("🔍 Form submitted")
    addLog(`📧 Email: ${email}`)
    addLog(`🔐 Password: ${password.replace(/./g, '*')}`)
    
    try {
      addLog("🚀 Calling signIn...")
      
      const result = await signIn("credentials", {
        email: email,
        password: password,
        redirect: false,
      })
      
      addLog(`📊 SignIn result: ${JSON.stringify(result)}`)
      
      if (result?.error) {
        addLog(`❌ Error: ${result.error}`)
      } else if (result?.ok) {
        addLog("✅ Login successful!")
      } else {
        addLog("⚠️ Unexpected result")
      }
      
    } catch (error) {
      addLog(`💥 Exception: ${error}`)
    } finally {
      setLoading(false)
      addLog("🏁 Process completed")
    }
  }

  const testButtonClick = () => {
    addLog("🖱️ Button clicked - event handler working!")
  }

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>🔍 Login Debug Page</h1>
      
      <div style={{ display: "flex", gap: "20px" }}>
        <div style={{ flex: 1 }}>
          <h2>Login Form</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "10px" }}>
              <label>Email:</label><br />
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: "100%", padding: "8px", marginTop: "4px" }}
              />
            </div>
            
            <div style={{ marginBottom: "10px" }}>
              <label>Password:</label><br />
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: "100%", padding: "8px", marginTop: "4px" }}
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              style={{ 
                padding: "10px 20px", 
                backgroundColor: loading ? "#ccc" : "#007bff",
                color: "white",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                marginRight: "10px"
              }}
            >
              {loading ? "🔄 Processing..." : "🚀 Login"}
            </button>
            
            <button 
              type="button"
              onClick={testButtonClick}
              style={{ 
                padding: "10px 20px", 
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                cursor: "pointer"
              }}
            >
              🖱️ Test Click
            </button>
          </form>
        </div>
        
        <div style={{ flex: 1 }}>
          <h2>Debug Logs</h2>
          <div style={{ 
            backgroundColor: "#f8f9fa", 
            border: "1px solid #dee2e6", 
            borderRadius: "4px", 
            padding: "10px",
            height: "300px",
            overflowY: "auto",
            fontFamily: "monospace",
            fontSize: "12px"
          }}>
            {logs.length === 0 ? (
              <div style={{ color: "#6c757d" }}>No logs yet. Click login to see debug info.</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} style={{ marginBottom: "2px" }}>
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      <div style={{ marginTop: "20px", padding: "10px", backgroundColor: "#e7f3ff", borderRadius: "4px" }}>
        <h3>Instructions:</h3>
        <ol>
          <li>First click "Test Click" to verify button events work</li>
          <li>Then click "Login" to test the full login flow</li>
          <li>Watch the debug logs on the right</li>
          <li>Check browser console (F12) for additional logs</li>
        </ol>
      </div>
    </div>
  )
}