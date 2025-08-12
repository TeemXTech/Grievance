"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  TrendingUp,
  BarChart3,
  Activity,
  Calendar,
  MapPin,
  Phone,
  Mail
} from "lucide-react"

export default function DashboardPage() {
  const stats = [
    {
      title: "Total Grievances",
      value: "1,247",
      change: "+12%",
      changeType: "positive",
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Pending",
      value: "89",
      change: "-5%",
      changeType: "negative",
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    },
    {
      title: "Resolved",
      value: "1,158",
      change: "+8%",
      changeType: "positive",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Active Users",
      value: "156",
      change: "+3%",
      changeType: "positive",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    }
  ]

  const recentGrievances = [
    {
      id: "GRV-001",
      title: "Road Repair on Main Street",
      status: "In Progress",
      priority: "High",
      category: "Infrastructure",
      assignedTo: "Officer Kumar",
      createdAt: "2 hours ago",
      location: "Hyderabad"
    },
    {
      id: "GRV-002",
      title: "Water Supply Disruption",
      status: "Pending",
      priority: "High",
      category: "Utilities",
      assignedTo: "Officer Sharma",
      createdAt: "4 hours ago",
      location: "Secunderabad"
    },
    {
      id: "GRV-003",
      title: "Street Light Repair",
      status: "Resolved",
      priority: "Medium",
      category: "Infrastructure",
      assignedTo: "Officer Patel",
      createdAt: "1 day ago",
      location: "Warangal"
    }
  ]

  const categoryStats = [
    { name: "Infrastructure", count: 456, percentage: 36.6 },
    { name: "Utilities", count: 234, percentage: 18.8 },
    { name: "Healthcare", count: 189, percentage: 15.2 },
    { name: "Education", count: 156, percentage: 12.5 },
    { name: "Others", count: 212, percentage: 17.0 }
  ]

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs text-gray-500 mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                {stat.change} from last month
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Grievances */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Grievances
              </CardTitle>
              <CardDescription>
                Latest grievances and their current status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentGrievances.map((grievance) => (
                  <div key={grievance.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{grievance.title}</h4>
                        <Badge variant={
                          grievance.status === "Resolved" ? "default" :
                          grievance.status === "In Progress" ? "secondary" : "destructive"
                        }>
                          {grievance.status}
                        </Badge>
                        <Badge variant="outline" className={
                          grievance.priority === "High" ? "border-red-500 text-red-700" :
                          grievance.priority === "Medium" ? "border-yellow-500 text-yellow-700" :
                          "border-green-500 text-green-700"
                        }>
                          {grievance.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {grievance.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {grievance.assignedTo}
                        </span>
                        <span>{grievance.createdAt}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Distribution */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Category Distribution
              </CardTitle>
              <CardDescription>
                Grievances by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryStats.map((category) => (
                  <div key={category.name} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{category.name}</span>
                      <span className="text-gray-500">{category.count}</span>
                    </div>
                    <Progress value={category.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Create New Grievance
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Assign Grievances
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <BarChart3 className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Meeting
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Average Resolution Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.2 days</div>
            <p className="text-xs text-gray-500 mt-1">Target: 5 days</p>
            <Progress value={64} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Citizen Satisfaction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2%</div>
            <p className="text-xs text-gray-500 mt-1">Based on 1,158 responses</p>
            <Progress value={94.2} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.7%</div>
            <p className="text-xs text-gray-500 mt-1">Within 24 hours</p>
            <Progress value={98.7} className="mt-2" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
