"use client"

import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, User, Users, FileText, Settings, MapPin, Crown } from "lucide-react"

export default function DemoLoginPage() {
  const router = useRouter()

  const handleRoleLogin = async (email: string, redirectPath: string, roleName: string) => {
    console.log(`🚀 Demo login as ${roleName}:`, email)
    
    try {
      const result = await signIn("credentials", {
        email,
        password: "password123",
        redirect: false,
      })

      if (result?.ok) {
        console.log(`✅ ${roleName} login successful, redirecting to:`, redirectPath)
        router.push(redirectPath)
      } else {
        console.error(`❌ ${roleName} login failed:`, result?.error)
        alert(`Login failed for ${roleName}. Please try again.`)
      }
    } catch (error) {
      console.error(`💥 ${roleName} login error:`, error)
      alert(`Network error during ${roleName} login.`)
    }
  }

  const roles = [
    {
      title: "Minister",
      description: "Hon'ble Minister Dashboard",
      email: "minister@gov.in",
      path: "/minister/dashboard",
      icon: Crown,
      color: "from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700"
    },
    {
      title: "PA Officer",
      description: "Personal Assistant Dashboard",
      email: "pa@gov.in",
      path: "/pa/dashboard",
      icon: User,
      color: "from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700"
    },
    {
      title: "Back Officer",
      description: "Back Office Operations",
      email: "back@gov.in",
      path: "/back-officer/dashboard",
      icon: FileText,
      color: "from-green-600 to-green-700 hover:from-green-700 hover:to-green-800",
      bgColor: "bg-green-50",
      textColor: "text-green-700"
    },
    {
      title: "Field Officer",
      description: "Field Operations Dashboard",
      email: "field@gov.in",
      path: "/field/dashboard",
      icon: MapPin,
      color: "from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800",
      bgColor: "bg-orange-50",
      textColor: "text-orange-700"
    },
    {
      title: "Admin",
      description: "System Administration",
      email: "admin@gov.in",
      path: "/admin/dashboard",
      icon: Settings,
      color: "from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800",
      bgColor: "bg-gray-50",
      textColor: "text-gray-700"
    },
    {
      title: "General Officer",
      description: "Officer Dashboard",
      email: "officer@gov.in",
      path: "/dashboard",
      icon: Users,
      color: "from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800",
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-700"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-white/20 flex items-center justify-center">
                <img 
                  src="https://images.news18.com/ibnlive/uploads/2023/12/d-sridhar-babu-2023-12-7f4b8b8c8b8c8b8c8b8c8b8c8b8c8b8c.jpg" 
                  alt="Shri D. Sridhar Babu - IT Minister" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Government of Telangana</h1>
                <p className="text-sm text-blue-200">Demo Login Portal</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center">
                <img 
                  src="/telangana-logo.png" 
                  alt="Telangana Logo" 
                  className="w-12 h-12 object-contain"
                />
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-orange-400">Demo Mode</div>
                <div className="text-sm text-blue-300">One-Click Access</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-100px)] p-4">
        <div className="w-full max-w-6xl">
          <Card className="shadow-2xl border-0 bg-white/10 backdrop-blur-md border border-white/20">
            <CardHeader className="text-center pb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold text-white mb-2">
                Demo Login Portal
              </CardTitle>
              <p className="text-blue-200 text-lg">
                Click any role below to access the dashboard instantly
              </p>
              <div className="mt-4 p-3 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
                <p className="text-yellow-200 text-sm">
                  🚀 <strong>Demo Mode:</strong> All accounts use password: <code className="bg-black/20 px-2 py-1 rounded">password123</code>
                </p>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roles.map((role) => {
                  const IconComponent = role.icon
                  return (
                    <Card key={role.title} className="bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200">
                      <CardContent className="p-6">
                        <div className={`w-16 h-16 ${role.bgColor} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                          <IconComponent className={`w-8 h-8 ${role.textColor}`} />
                        </div>
                        
                        <h3 className="text-xl font-bold text-white text-center mb-2">
                          {role.title}
                        </h3>
                        
                        <p className="text-blue-200 text-center text-sm mb-4">
                          {role.description}
                        </p>
                        
                        <div className="text-center mb-4">
                          <code className="text-xs bg-black/20 text-blue-300 px-2 py-1 rounded">
                            {role.email}
                          </code>
                        </div>
                        
                        <Button
                          onClick={() => handleRoleLogin(role.email, role.path, role.title)}
                          className={`w-full bg-gradient-to-r ${role.color} text-white font-medium py-3 rounded-lg transition-all duration-200 transform hover:scale-105`}
                        >
                          Login as {role.title}
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {/* Additional Info */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-white/5 border border-white/10">
                  <CardContent className="p-6">
                    <h4 className="text-lg font-semibold text-white mb-3">📊 Demo Data Available</h4>
                    <ul className="text-blue-200 text-sm space-y-1">
                      <li>• 25+ Sample Grievances</li>
                      <li>• 10 Categories</li>
                      <li>• 22 Users (All Roles)</li>
                      <li>• 30+ Notifications</li>
                      <li>• Status Updates & History</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 border border-white/10">
                  <CardContent className="p-6">
                    <h4 className="text-lg font-semibold text-white mb-3">🔑 Quick Access</h4>
                    <ul className="text-blue-200 text-sm space-y-1">
                      <li>• No password required</li>
                      <li>• Instant role switching</li>
                      <li>• Pre-populated dashboards</li>
                      <li>• Real-time data</li>
                      <li>• Full feature access</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Footer */}
              <div className="text-center mt-8 pt-6 border-t border-white/10">
                <p className="text-blue-300 text-sm">
                  © 2024 Government of Telangana • Demo Environment
                </p>
                <p className="text-blue-400 text-xs mt-1">
                  Secure • Reliable • Transparent
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}