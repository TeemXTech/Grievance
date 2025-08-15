"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"

export default function TestLogin() {
  const [email, setEmail] = useState("admin@example.com")
  const [password, setPassword] = useState("password123")
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testLogin = async () => {
    setLoading(true)
    setResult(null)
    
    console.log("🧪 Testing login with:", email, password)
    
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })
      
      console.log("🧪 Test result:", result)
      setResult(result)
    } catch (error) {
      console.error("🧪 Test error:", error)
      setResult({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6">🧪 Authentication Test</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          
          <button
            onClick={testLogin}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Testing..." : "Test Login"}
          </button>
        </div>
        
        {result && (
          <div className="mt-6 p-4 bg-gray-50 rounded">
            <h3 className="font-medium mb-2">Result:</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
        
        <div className="mt-6 text-sm text-gray-600">
          <p><strong>Available test accounts:</strong></p>
          <ul className="list-disc list-inside mt-2">
            <li>admin@example.com / password123</li>
            <li>pa@example.com / password123</li>
            <li>back@example.com / password123</li>
          </ul>
        </div>
      </div>
    </div>
  )
}