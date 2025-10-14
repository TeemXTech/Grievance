"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  TrendingUp,
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertTriangle,
  MapPin,
  Calendar,
  Users,
  FileText,
  MessageSquare,
  Eye,
  Edit,
  Plus,
  Activity
} from "lucide-react"

export default function TrackingPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const grievances = [
    {
      id: "GRV-001",
      title: "Road Repair on Main Street",
      status: "In Progress",
      priority: "High",
      category: "Infrastructure",
      assignedTo: "Officer Kumar",
      citizenName: "Rajesh Kumar",
      location: "Main Street, Hyderabad",
      createdAt: "2024-01-15",
      estimatedResolution: "2024-01-20",
      progress: 65,
      timeline: [
        { date: "2024-01-15", status: "Submitted", description: "Grievance submitted by citizen" },
        { date: "2024-01-16", status: "Assigned", description: "Assigned to Officer Kumar" },
        { date: "2024-01-17", status: "In Progress", description: "Site inspection completed" },
        { date: "2024-01-18", status: "In Progress", description: "Work order issued to contractor" }
      ]
    },
    {
      id: "GRV-002",
      title: "Water Supply Disruption",
      status: "Pending",
      priority: "High",
      category: "Utilities",
      assignedTo: "Officer Sharma",
      citizenName: "Priya Sharma",
      location: "Sector 12, Hyderabad",
      createdAt: "2024-01-14",
      estimatedResolution: "2024-01-18",
      progress: 25,
      timeline: [
        { date: "2024-01-14", status: "Submitted", description: "Grievance submitted by citizen" },
        { date: "2024-01-15", status: "Assigned", description: "Assigned to Officer Sharma" }
      ]
    },
    {
      id: "GRV-003",
      title: "Street Light Repair",
      status: "Resolved",
      priority: "Medium",
      category: "Infrastructure",
      assignedTo: "Officer Patel",
      citizenName: "Amit Patel",
      location: "Warangal",
      createdAt: "2024-01-10",
      resolvedAt: "2024-01-12",
      progress: 100,
      timeline: [
        { date: "2024-01-10", status: "Submitted", description: "Grievance submitted by citizen" },
        { date: "2024-01-11", status: "Assigned", description: "Assigned to Officer Patel" },
        { date: "2024-01-11", status: "In Progress", description: "Technician dispatched" },
        { date: "2024-01-12", status: "Resolved", description: "Street light repaired and tested" }
      ]
    }
  ]

  const filteredGrievances = grievances.filter(grievance => {
    const matchesSearch = grievance.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         grievance.citizenName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         grievance.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || grievance.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Resolved": return "bg-green-100 text-green-800"
      case "In Progress": return "bg-blue-100 text-blue-800"
      case "Pending": return "bg-orange-100 text-orange-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "border-red-500 text-red-700"
      case "Medium": return "border-yellow-500 text-yellow-700"
      case "Low": return "border-green-500 text-green-700"
      default: return "border-gray-500 text-gray-700"
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500"
    if (progress >= 50) return "bg-blue-500"
    return "bg-orange-500"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tracking & Status Updates</h2>
          <p className="text-gray-600">Monitor grievance progress and timelines</p>
        </div>
        {/* <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Status Update
        </Button> */}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tracked</CardTitle>
            <Activity className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{grievances.length}</div>
            <p className="text-xs text-gray-500">Active grievances</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Track</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-gray-500">Meeting timelines</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">At Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-gray-500">Behind schedule</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-gray-500">This week</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by ID, title, or citizen name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tracking Table */}
      <Card>
        <CardHeader>
          <CardTitle>Grievance Tracking ({filteredGrievances.length})</CardTitle>
          <CardDescription>
            Monitor progress and status updates for all grievances
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Timeline</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGrievances.map((grievance) => (
                <TableRow key={grievance.id}>
                  <TableCell className="font-medium">{grievance.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{grievance.title}</div>
                      <div className="text-sm text-gray-500">{grievance.location}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(grievance.status)}>
                      {grievance.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={grievance.progress} className="w-20 h-2" />
                      <span className="text-sm font-medium">{grievance.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>{grievance.assignedTo}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>Created: {grievance.createdAt}</div>
                      <div>Est. Resolution: {grievance.estimatedResolution}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Tracking Details - {grievance.id}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-6">
                            {/* Grievance Info */}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="font-medium">Title</Label>
                                <p>{grievance.title}</p>
                              </div>
                              <div>
                                <Label className="font-medium">Status</Label>
                                <Badge className={getStatusColor(grievance.status)}>
                                  {grievance.status}
                                </Badge>
                              </div>
                              <div>
                                <Label className="font-medium">Priority</Label>
                                <Badge variant="outline" className={getPriorityColor(grievance.priority)}>
                                  {grievance.priority}
                                </Badge>
                              </div>
                              <div>
                                <Label className="font-medium">Category</Label>
                                <p>{grievance.category}</p>
                              </div>
                              <div>
                                <Label className="font-medium">Assigned To</Label>
                                <p>{grievance.assignedTo}</p>
                              </div>
                              <div>
                                <Label className="font-medium">Location</Label>
                                <p>{grievance.location}</p>
                              </div>
                            </div>

                            {/* Progress Bar */}
                            <div>
                              <Label className="font-medium">Progress</Label>
                              <div className="flex items-center gap-2 mt-2">
                                <Progress value={grievance.progress} className="flex-1" />
                                <span className="text-sm font-medium">{grievance.progress}%</span>
                              </div>
                            </div>

                            {/* Timeline */}
                            <div>
                              <Label className="font-medium">Timeline</Label>
                              <div className="mt-3 space-y-3">
                                {grievance.timeline.map((event, index) => (
                                  <div key={index} className="flex items-start gap-3">
                                    <div className={`w-3 h-3 rounded-full mt-2 ${
                                      index === grievance.timeline.length - 1 ? getProgressColor(grievance.progress) : "bg-gray-300"
                                    }`}></div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium">{event.status}</span>
                                        <span className="text-sm text-gray-500">{event.date}</span>
                                      </div>
                                      <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Add Update */}
                            <div className="border-t pt-4">
                              <Label className="font-medium">Add Status Update</Label>
                              <div className="space-y-3 mt-3">
                                <Select>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="in-progress">In Progress</SelectItem>
                                    <SelectItem value="resolved">Resolved</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Textarea placeholder="Add update description..." />
                                <Button>Add Update</Button>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button variant="ghost" size="sm">
                        {/* <Edit className="h-4 w-4" /> */}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Timeline View */}
      <Tabs defaultValue="table" className="space-y-4">
        <TabsList>
          <TabsTrigger value="table">Table View</TabsTrigger>
          <TabsTrigger value="timeline">Timeline View</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Timeline View</CardTitle>
              <CardDescription>
                Visual timeline of grievance progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {filteredGrievances.map((grievance) => (
                  <div key={grievance.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-medium">{grievance.id} - {grievance.title}</h3>
                        <p className="text-sm text-gray-500">{grievance.location}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(grievance.status)}>
                          {grievance.status}
                        </Badge>
                        <Badge variant="outline" className={getPriorityColor(grievance.priority)}>
                          {grievance.priority}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {grievance.timeline.map((event, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className={`w-3 h-3 rounded-full mt-2 ${
                            index === grievance.timeline.length - 1 ? getProgressColor(grievance.progress) : "bg-gray-300"
                          }`}></div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{event.status}</span>
                              <span className="text-sm text-gray-500">{event.date}</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
