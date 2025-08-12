"use client"

import type React from "react"
import { useState } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Users, Phone } from "lucide-react"

export default function LoginPage() {
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        phone,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid credentials. Please check your phone number and password.")
      } else {
        const session = await getSession()
        const role = session?.user?.role

        // Redirect based on role
        if (role === "MINISTER") {
          router.push("/minister/dashboard")
        } else if (role === "PERSONAL_ASSISTANT") {
          router.push("/pa/dashboard")
        } else if (role === "FIELD_TEAM") {
          router.push("/field/dashboard")
        } else if (role === "ADMIN") {
          router.push("/admin/dashboard")
        } else {
          router.push("/dashboard")
        }
      }
    } catch (error) {
      setError("Login failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const demoCredentials = [
    { role: "Minister", phone: "+919876543210", password: "minister123" },
    { role: "Personal Assistant", phone: "+919876543211", password: "pa123" },
    { role: "Admin", phone: "+919876543212", password: "admin123" },
    { role: "Field Officer", phone: "+919876543213", password: "field123" },
    { role: "Office Staff", phone: "+919876543214", password: "staff123" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Government Header with Logos */}
        <div className="text-center">
          {/* Government Logos */}
          <div className="flex items-center justify-center space-x-6 mb-6">
            {/* Telangana State Logo */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white rounded-full p-2 shadow-lg flex items-center justify-center mb-2">
                <img
                  src="/telangana-logo.png"
                  alt="Telangana State Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="text-xs text-gray-600 font-medium">Government of Telangana</p>
              <p className="text-xs text-gray-500 telugu-text">తెలంగాణ ప్రభుత్వం</p>
            </div>

            {/* Separator */}
            <div className="w-px h-16 bg-gray-300"></div>

            {/* One Rise Logo */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white rounded-lg p-2 shadow-lg flex items-center justify-center mb-2">
                <img src="/one-rise-logo.png" alt="One Rise Logo" className="w-full h-full object-contain" />
              </div>
              <p className="text-xs text-gray-600 font-medium">One Rise</p>
              <p className="text-xs text-gray-500">Digital Platform</p>
            </div>
          </div>

          {/* System Title */}
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Government Portal</h2>
            <p className="mt-2 text-sm text-gray-600">Minister's Grievance & Request Management System</p>
            <p className="text-xs text-gray-500 telugu-text mt-1">మంత్రి ఫిర్యాదు మరియు అభ్యర్థన నిర్వహణ వ్యవస్థ</p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="professional-card shadow-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl font-semibold text-gray-900">Sign In</CardTitle>
            <CardDescription>Enter your credentials to access the system</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  Phone Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+919876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        <Card className="professional-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-700 flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Demo Credentials
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {demoCredentials.map((cred, index) => (
                <div key={index} className="flex items-center justify-between text-xs bg-gray-50 p-3 rounded">
                  <div>
                    <p className="font-medium text-gray-900">{cred.role}</p>
                    <p className="text-gray-600">{cred.phone}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-gray-700">{cred.password}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>Note:</strong> This is a demo system. Use the credentials above to explore different user roles
                and functionalities.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer with Government Branding */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
            <span>Powered by One Rise</span>
            <span>•</span>
            <span>Government of Telangana</span>
          </div>
          <p className="text-xs text-gray-500">Secure Government Portal • Built for Efficient Governance</p>
          <p className="text-xs text-gray-400 telugu-text">సురక్షిత ప్రభుత్వ పోర్టల్ • సమర్థవంతమైన పాలన కోసం నిర్మించబడింది</p>
        </div>
      </div>
    </div>
  )
}
