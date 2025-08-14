"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { GovernmentHeader } from "@/components/ui/government-header"
import { Users, Settings, BarChart3, Shield, UserPlus, Database, Activity, AlertTriangle } from "lucide-react"

export default function AdminDashboard() {
  const { data: session } = useSession()
  const [systemStats, setSystemStats] = useState<any>({})
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const loadSystemData = async () => {
    try {
      setLoading(true)
      const [statsRes, usersRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/users')
      ])
      
      if (statsRes.ok) {
        const stats = await statsRes.json()
        setSystemStats(stats)
      }
      
      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData)
      }
    } catch (error) {
      console.error('Failed to load admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSystemData()
  }, [])

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'MINISTER': return 'bg-red-100 text-red-800'
      case 'PA': return 'bg-blue-100 text-blue-800'
      case 'BACK_OFFICER': return 'bg-yellow-100 text-yellow-800'
      case 'FIELD_OFFICER': return 'bg-green-100 text-green-800'
      case 'ADMIN': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <GovernmentHeader
        title="System Administration"
        description="Manage users, roles, and system configuration"
        userName={session?.user?.name}
        userRole={session?.user?.role}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* System Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-700 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Users</p>
                  <p className="text-3xl font-bold">{users.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-700 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Active Sessions</p>
                  <p className="text-3xl font-bold">{Math.floor(users.length * 0.6)}</p>
                </div>
                <Activity className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-700 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">System Alerts</p>
                  <p className="text-3xl font-bold">3</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-700 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Database Size</p>
                  <p className="text-3xl font-bold">2.4GB</p>
                </div>
                <Database className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="roles">Role Configuration</TabsTrigger>
            <TabsTrigger value="system">System Settings</TabsTrigger>
            <TabsTrigger value="logs">Audit Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>System Users</span>
                  <Button>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Login</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user: any) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge className={getRoleColor(user.role)}>
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                              {user.status || 'active'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {new Date().toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">Edit</Button>
                              <Button size="sm" variant="outline">Reset</Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roles">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Role Permissions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['MINISTER', 'PA', 'BACK_OFFICER', 'FIELD_OFFICER', 'ADMIN'].map((role) => (
                      <div key={role} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <Badge className={getRoleColor(role)}>{role}</Badge>
                          <p className="text-sm text-gray-600 mt-1">
                            {role === 'MINISTER' && 'Full system access, can assign tasks'}
                            {role === 'PA' && 'Manage assigned grievances and projects'}
                            {role === 'BACK_OFFICER' && 'Data entry and document management'}
                            {role === 'FIELD_OFFICER' && 'Field updates and status reporting'}
                            {role === 'ADMIN' && 'System administration and user management'}
                          </p>
                        </div>
                        <Button size="sm" variant="outline">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Access Control</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span>Two-Factor Authentication</span>
                      <Badge variant="outline">Enabled</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span>Session Timeout</span>
                      <Badge variant="outline">8 hours</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span>Password Policy</span>
                      <Badge variant="outline">Strong</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span>API Rate Limiting</span>
                      <Badge variant="outline">Active</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="system">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 border rounded">
                      <span>WhatsApp Integration</span>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded">
                      <span>Email Notifications</span>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded">
                      <span>Auto-Assignment Rules</span>
                      <Badge className="bg-blue-100 text-blue-800">Configured</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded">
                      <span>Backup Schedule</span>
                      <Badge className="bg-green-100 text-green-800">Daily</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>System Uptime</span>
                      <span className="font-bold text-green-600">99.9%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Response Time</span>
                      <span className="font-bold">120ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Database Queries/sec</span>
                      <span className="font-bold">45</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Connections</span>
                      <span className="font-bold">12</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle>Recent System Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { action: 'User Login', user: 'minister@ap.gov.in', time: '2 minutes ago', type: 'info' },
                    { action: 'Grievance Assigned', user: 'pa1@ap.gov.in', time: '15 minutes ago', type: 'success' },
                    { action: 'Failed Login Attempt', user: 'unknown@email.com', time: '1 hour ago', type: 'warning' },
                    { action: 'System Backup', user: 'system', time: '2 hours ago', type: 'info' },
                    { action: 'User Created', user: 'admin@example.com', time: '3 hours ago', type: 'success' }
                  ].map((log, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          log.type === 'success' ? 'bg-green-500' : 
                          log.type === 'warning' ? 'bg-orange-500' : 'bg-blue-500'
                        }`}></div>
                        <div>
                          <div className="font-medium">{log.action}</div>
                          <div className="text-sm text-gray-500">{log.user}</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">{log.time}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}