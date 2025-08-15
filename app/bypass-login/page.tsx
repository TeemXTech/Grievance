"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { signIn } from "next-auth/react"

export default function BypassLoginPage() {
  const router = useRouter()

  useEffect(() => {
    const autoLogin = async () => {
      console.log('🔓 BYPASS: Auto-login initiated')
      
      // Automatically sign in with bypass credentials
      const result = await signIn("credentials", {
        email: "admin@bypass.com",
        password: "bypass",
        redirect: false,
      })

      console.log('🔓 BYPASS: Auto-login result:', result)
      
      // Redirect to admin dashboard
      router.push("/admin/dashboard")
    }

    autoLogin()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 flex items-center justify-center">
      <div className="text-center text-white">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold mb-2">🔓 BYPASS MODE ACTIVE</h1>
        <p className="text-lg">Automatically logging in...</p>
        <p className="text-sm mt-2 opacity-75">Authentication bypassed - redirecting to admin dashboard</p>
      </div>
    </div>
  )
}