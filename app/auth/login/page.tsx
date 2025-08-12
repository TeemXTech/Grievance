"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Commenting out signIn
    /*
    const res = await signIn("credentials", { redirect: false, email, password })
    if (res?.error) {
      setError("Invalid credentials")
      return
    }
    */

    // Directly calling your API to fetch user details
    try {
      // Simulate login API call
      // const loginResponse = await fetch("/api/login", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ email, password }),
      // })

      // if (!loginResponse.ok) {
      //   setError("Invalid credentials")
      //   return
      // }

      // After login, fetch the session/user details
      const sessionResponse = await fetch("/api/auth/session")
      if (!sessionResponse.ok) {
        setError("Failed to fetch session")
        return
      }

      const session = await sessionResponse.json()

      if (session?.user?.role) {
        const role = session.user.role

        if (role === "MINISTER") {
          router.push("/minister/dashboard")
        } else if (role === "PERSONAL_ASSISTANT") {
          router.push("/pa/dashboard")
        } else if (role === "FIELD_TEAM") {
          router.push("/field/dashboard")
        } else if (role === "ADMIN") {
          console.log("We are here")
          router.push("/dashboard")
        } else {
          router.push("/dashboard")
        }
      } else {
        router.push("/")
      }
    } catch (err) {
      setError("Something went wrong")
      console.error(err)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-white p-6 rounded-lg shadow">
        <h1 className="text-xl font-semibold mb-4">Sign in</h1>
        <label className="block mb-2 text-sm">Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          className="w-full mb-4 border rounded px-3 py-2"
          placeholder="admin@example.com"
          required
        />
        <label className="block mb-2 text-sm">Password</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          className="w-full mb-4 border rounded px-3 py-2"
          placeholder="password123"
          required
        />
        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Sign in
        </button>
      </form>
    </div>
  )
}
