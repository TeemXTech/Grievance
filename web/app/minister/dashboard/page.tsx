"use client"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import {
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  MapPin,
  TrendingUp,
  Calendar,
  Phone,
  MessageSquare,
  Loader2,
} from "lucide-react"
import { GovernmentHeader } from "@/components/ui/government-header"
import { useDashboardStats, useRecentRequests, useTrends, useCategoryDistribution } from "@/hooks/use-api"

export default function MinisterDashboard() {
  const { data: session } = useSession()
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: recentRequests, isLoading: recentLoading } = useRecentRequests(5)
  const { data: trends, isLoading: trendsLoading } = useTrends(180) // 6 months
  const { data: categoryData, isLoading: categoryLoading } = useCategoryDistribution()

  // Transform trends data for chart
  const trendData =
    trends?.map((item: any) => ({
      date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      requests: Number.parseInt(item.requests),
      resolved: Number.parseInt(item.resolved),
    })) || []

  // Transform category data for pie chart
  const pieData =
    categoryData?.map((item: any, index: number) => ({
      name: item.name,
      value: Number.parseInt(item.value),
      color: ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#6b7280"][index % 6],
    })) || []

  const statsData = [
    {
      name: "Total Requests",
      value: stats?.totalRequests || 0,
      icon: FileText,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      name: "Pending",
      value: stats?.pendingRequests || 0,
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      name: "Resolved",
      value: stats?.resolvedRequests || 0,
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      name: "Critical",
      value: stats?.criticalRequests || 0,
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-50",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <GovernmentHeader
        title="Minister's Dashboard"
        subtitle="Grievance & Request Management System"
        userName={session?.user?.name}
        userRole={session?.user?.role}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsData.map((stat) => (
            <Card key={stat.name} className="professional-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    {statsLoading ? (
                      <div className="flex items-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm text-gray-500">Loading...</span>
                      </div>
                    ) : (
                      <p className="text-3xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
                    )}
                  </div>
                  <div className={`p-3 rounded-full ${stat.bg}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Trends Chart */}
            <Card className="professional-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <span>Request Trends</span>
                </CardTitle>
                <CardDescription>Daily request and resolution trends over the last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                {trendsLoading ? (
                  <div className="flex items-center justify-center h-[300px]">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                        }}
                      />
                      <Line type="monotone" dataKey="requests" stroke="#3b82f6" strokeWidth={3} name="Requests" />
                      <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={3} name="Resolved" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Category Distribution */}
            <Card className="professional-card">
              <CardHeader>
                <CardTitle>Request Categories</CardTitle>
                <CardDescription>Distribution of requests by category</CardDescription>
              </CardHeader>
              <CardContent>
                {categoryLoading ? (
                  <div className="flex items-center justify-center h-[300px]">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-3">
                      {pieData.map((category) => (
                        <div key={category.name} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                            <span className="text-sm font-medium text-gray-700">{category.name}</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">{category.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Requests */}
            <Card className="professional-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span>Recent Requests</span>
                </CardTitle>
                <CardDescription>Latest requests requiring attention</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : recentRequests?.length > 0 ? (
                  recentRequests.map((request: any) => (
                    <div key={request.id} className="border-l-4 border-blue-500 pl-4 py-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{request.title}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">{request.requester_address}</span>
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {new Date(request.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <Badge
                          variant={request.priority === "CRITICAL" ? "destructive" : "secondary"}
                          className="text-xs"
                        >
                          {request.priority}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No recent requests</p>
                )}
                <Button variant="outline" className="w-full mt-4 bg-transparent">
                  View All Requests
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="professional-card">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Visit
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  AI Assistant
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Phone className="w-4 h-4 mr-2" />
                  Contact PA
                </Button>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card className="professional-card">
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Resolution Rate</span>
                  <span className="font-semibold text-green-600">{stats?.resolutionRate || "0"}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Avg. Response Time</span>
                  <span className="font-semibold">2.4 hours</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Field Officers</span>
                  <span className="font-semibold">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Satisfaction Score</span>
                  <span className="font-semibold text-blue-600">4.2/5</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
