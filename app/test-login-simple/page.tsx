"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"

export default function TestLoginPage() {
  const [email, setEmail] = useState("admin@example.com")
  const [password, setPassword] = useState("password123")
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    
    console.log("🔍 Starting login test...")
    console.log("Email:", email)
    console.log("Password:", password)
    
    try {
      const loginResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })
      
      console.log("🔍 Login result:", loginResult)
      setResult(loginResult)
      
    } catch (error) {
      console.error("🔍 Login error:", error)
      setResult({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: "20px", fontFamily: "monospace" }}>
      <h1>Login Debug Test</h1>
      
      <form onSubmit={handleLogin} style={{ marginBottom: "20px" }}>
        <div style={{ marginBottom: "10px" }}>
          <label>Email:</label><br />
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "300px", padding: "5px" }}
          />
        </div>
        
        <div style={{ marginBottom: "10px" }}>
          <label>Password:</label><br />
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "300px", padding: "5px" }}
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
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Testing..." : "Test Login"}
        </button>
      </form>
      
      <div style={{ backgroundColor: "#f5f5f5", padding: "10px", borderRadius: "5px" }}>
        <h3>Result:</h3>
        <pre>{JSON.stringify(result, null, 2)}</pre>
      </div>
      
      <div style={{ marginTop: "20px", backgroundColor: "#e8f4f8", padding: "10px", borderRadius: "5px" }}>
        <h3>Instructions:</h3>
        <p>1. Open browser console (F12)</p>
        <p>2. Click "Test Login" button</p>
        <p>3. Check console logs and result above</p>
        <p>4. Check if any errors appear</p>
      </div>
    </div>
  )
}