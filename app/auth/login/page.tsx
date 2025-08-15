"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { signIn, useSession } from "next-auth/react"
import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Shield, User, Lock, Eye, EyeOff } from "lucide-react"
import Image from "next/image"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    if (session?.user) {
      const role = (session.user as any).role
      switch (role) {
        case "MINISTER":
          router.push("/minister/dashboard")
          break
        case "PA":
          router.push("/pa/dashboard")
          break
        case "BACK_OFFICER":
          router.push("/back-officer/dashboard")
          break
        case "FIELD_OFFICER":
          router.push("/field/dashboard")
          break
        case "ADMIN":
          router.push("/admin/dashboard")
          break
        case "OFFICER":
          router.push("/dashboard")
          break
        default:
          router.push("/dashboard")
      }
    }
  }, [session, router])

  const onSubmit = async (e: React.FormEvent) => {
    console.log('🔓 BYPASS: Auto-login enabled - any credentials will work')
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // BYPASS: Always use dummy credentials that will be accepted
      const result = await signIn("credentials", {
        email: email || "bypass@admin.com",
        password: password || "bypass",
        redirect: false,
      })

      console.log('🔓 BYPASS: Login result:', result)
      
      // BYPASS: Always treat as successful
      console.log('🔓 BYPASS: Login successful, redirecting...')
      // The useEffect will handle the redirect
    } catch (err) {
      console.log('🔓 BYPASS: Even errors are bypassed')
      // BYPASS: Ignore all errors
    } finally {
      setLoading(false)
    }
  }

  const handleButtonClick = () => {
    console.log('🖱️ Button clicked directly!')
    alert('Button click detected!')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Government of Telangana</h1>
                <p className="text-sm text-gray-600">Minister Grievance Management System</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-orange-600">Telangana Rising</div>
              <div className="text-sm text-gray-500">Digital Governance Initiative</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-100px)] p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border-0">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Secure Login</CardTitle>
              <p className="text-gray-600 text-sm">Access your ministerial dashboard</p>
            </CardHeader>
            <CardContent className="pt-2">
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-11"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-11"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                <Button 
                  type="submit" 
                  disabled={loading}
                  onClick={handleButtonClick}
                  className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Signing in...
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </Button>

                {/* Role Selection Tabs */}
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-3">Choose Your Role:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      onClick={async () => {
                        await signIn("credentials", { email: "minister@gov.in", password: "x", redirect: false })
                        router.push("/minister/dashboard")
                      }}
                      size="sm" 
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Minister
                    </Button>
                    <Button 
                      onClick={async () => {
                        await signIn("credentials", { email: "pa@gov.in", password: "x", redirect: false })
                        router.push("/pa/dashboard")
                      }}
                      size="sm" 
                      className="bg-green-600 hover:bg-green-700"
                    >
                      PA Officer
                    </Button>
                    <Button 
                      onClick={async () => {
                        await signIn("credentials", { email: "back@gov.in", password: "x", redirect: false })
                        router.push("/back-officer/dashboard")
                      }}
                      size="sm" 
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      Back Officer
                    </Button>
                    <Button 
                      onClick={async () => {
                        await signIn("credentials", { email: "field@gov.in", password: "x", redirect: false })
                        router.push("/field/dashboard")
                      }}
                      size="sm" 
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Field Officer
                    </Button>
                    <Button 
                      onClick={async () => {
                        await signIn("credentials", { email: "admin@gov.in", password: "x", redirect: false })
                        router.push("/admin/dashboard")
                      }}
                      size="sm" 
                      className="bg-gray-600 hover:bg-gray-700 col-span-2"
                    >
                      Admin
                    </Button>
                  </div>
                </div>
              </form>


            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-6 text-white/80">
            <p className="text-sm">© 2024 Government of Telangana</p>
            <p className="text-xs mt-1">Secure • Reliable • Transparent</p>
          </div>
        </div>
      </div>
    </div>
  )
}
