"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, Users, FileText, BarChart3, Phone, Mail, MapPin, Clock, CheckCircle, Award } from "lucide-react"

export default function HomePage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  
  const router = useRouter()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    console.log('🚀 Starting login process for:', email)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/dashboard"
      })

      console.log('📊 SignIn result:', result)

      if (result?.error) {
        console.log('❌ SignIn error:', result.error)
        setError("Invalid email or password. Please check your credentials.")
      } else if (result?.ok) {
        console.log('✅ SignIn successful, redirecting...')
        // Small delay to ensure session is set
        setTimeout(() => {
          router.push("/dashboard")
        }, 100)
      } else {
        console.log('⚠️ Unexpected result:', result)
        setError("Login failed. Please try again.")
      }
    } catch (err) {
      console.error('💥 Login error:', err)
      setError("Network error. Please check your connection.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Government of Telangana</h1>
                <p className="text-sm text-blue-200">Digital Governance Portal</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={() => router.push('/demo-login')}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
              >
                Demo Login
              </Button>
              <Button 
                onClick={() => setShowLogin(!showLogin)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                Staff Login
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Content */}
            <div className="text-white">
              <div className="mb-8">
                <div className="inline-flex items-center px-4 py-2 bg-white/10 rounded-full text-sm font-medium text-blue-200 mb-4">
                  <Award className="w-4 h-4 mr-2" />
                  Digital India Initiative
                </div>
                <h1 className="text-5xl font-bold mb-6 leading-tight">
                  Minister's
                  <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent"> Grievance </span>
                  Management System
                </h1>
                <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                  Empowering citizens through transparent, efficient, and technology-driven governance. 
                  Real-time tracking and resolution of public grievances.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">15,247</div>
                  <div className="text-sm text-blue-200">Grievances Resolved</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">2.1 Days</div>
                  <div className="text-sm text-blue-200">Avg Resolution</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">96.8%</div>
                  <div className="text-sm text-blue-200">Satisfaction Rate</div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center text-blue-100">
                  <Phone className="w-5 h-5 mr-3" />
                  <span>Helpline: 1800-425-2525</span>
                </div>
                <div className="flex items-center text-blue-100">
                  <Mail className="w-5 h-5 mr-3" />
                  <span>grievances@telangana.gov.in</span>
                </div>
                <div className="flex items-center text-blue-100">
                  <MapPin className="w-5 h-5 mr-3" />
                  <span>Secretariat, Hyderabad, Telangana</span>
                </div>
              </div>
            </div>

            {/* Right Content - Minister Card */}
            <div className="relative">
              <Card className="bg-white/10 backdrop-blur-md border border-white/20 overflow-hidden">
                <CardContent className="p-0">
                  {/* Minister Photo */}
                  <div className="relative h-80 bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
                    <div className="w-48 h-48 bg-white/20 rounded-full flex items-center justify-center">
                      <Users className="w-24 h-24 text-white/80" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                      <h3 className="text-2xl font-bold text-white mb-1">Hon'ble Chief Minister</h3>
                      <p className="text-blue-200">Sri A. Revanth Reddy</p>
                    </div>
                  </div>
                  
                  {/* Minister Info */}
                  <div className="p-6 text-white">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-300 mb-1">4+</div>
                        <div className="text-sm text-gray-300">Years in Office</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-300 mb-1">125+</div>
                        <div className="text-sm text-gray-300">Initiatives Launched</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                        <span className="text-gray-300">Digital Governance Champion</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                        <span className="text-gray-300">Citizen-Centric Administration</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                        <span className="text-gray-300">Transparent Governance</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Staff Login</h2>
                <p className="text-blue-200">Access your dashboard</p>
              </div>

              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="admin@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••••"
                    required
                  />
                </div>

                {error && (
                  <p className="text-red-300 text-sm bg-red-500/20 p-3 rounded-lg">{error}</p>
                )}

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50"
                  >
                    {loading ? "Signing in..." : "Login"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowLogin(false)}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">System Capabilities</h2>
          <p className="text-xl text-blue-200">Advanced features for efficient governance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 transition-all">
            <CardContent className="p-6 text-center">
              <FileText className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Smart Grievance Processing</h3>
              <p className="text-blue-200">AI-powered categorization and routing</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 transition-all">
            <CardContent className="p-6 text-center">
              <BarChart3 className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Real-time Analytics</h3>
              <p className="text-blue-200">Comprehensive performance dashboards</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 transition-all">
            <CardContent className="p-6 text-center">
              <Clock className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">24/7 Monitoring</h3>
              <p className="text-blue-200">Round-the-clock system availability</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-md border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-blue-200">© 2024 Government of Telangana. All rights reserved.</p>
            <p className="text-blue-300 text-sm mt-2">Powered by Digital Governance Initiative</p>
          </div>
        </div>
      </footer>
    </div>
  )
}