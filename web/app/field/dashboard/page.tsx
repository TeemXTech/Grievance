"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  MapPin,
  Camera,
  Upload,
  CheckCircle,
  Clock,
  AlertTriangle,
  Navigation,
  Phone,
  MessageSquare,
  FileText,
} from "lucide-react"
import { GovernmentHeader } from "@/components/ui/government-header"

// Mock data for field officer tasks
const assignedTasks = [
  {
    id: "GRV-2024-0123",
    title: "Road repair in Main Street",
    description: "Multiple potholes need immediate repair on the main street connecting to the market area.",
    location: "Rampur Village, Srikakulam",
    priority: "HIGH",
    status: "ASSIGNED",
    assignedDate: "2024-01-15",
    requester: "Venkat Rao",
    requesterPhone: "+919876543220",
    coordinates: { lat: 18.2971, lng: 83.8936 },
  },
  {
    id: "GRV-2024-0124",
    title: "Water supply disruption",
    description: "No water supply for the past 2 days in the residential colony.",
    location: "Amadalavalasa Colony",
    priority: "CRITICAL",
    status: "IN_PROGRESS",
    assignedDate: "2024-01-14",
    requester: "Madhavi",
    requesterPhone: "+919876543224",
    coordinates: { lat: 18.4167, lng: 83.9 },
  },
  {
    id: "GRV-2024-0125",
    title: "Street light maintenance",
    description: "Several street lights are not working in the residential area.",
    location: "Kothavalasa",
    priority: "MEDIUM",
    status: "ASSIGNED",
    assignedDate: "2024-01-15",
    requester: "Ravi Kumar",
    requesterPhone: "+919876543223",
    coordinates: { lat: 18.3773, lng: 83.4308 },
  },
]

export default function FieldDashboard() {
  const { data: session } = useSession()
  const [selectedTask, setSelectedTask] = useState(assignedTasks[0])
  const [updateText, setUpdateText] = useState("")
  const [newStatus, setNewStatus] = useState("")

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "CRITICAL":
        return "bg-red-100 text-red-800 border-red-200"
      case "HIGH":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "MEDIUM":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "LOW":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ASSIGNED":
        return "bg-blue-100 text-blue-800"
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-800"
      case "RESOLVED":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleStatusUpdate = () => {
    // Handle status update logic here
    console.log("Updating status:", newStatus, updateText)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <GovernmentHeader
        title="Field Officer Dashboard"
        subtitle="Task Management & Field Updates"
        userName={session?.user?.name}
        userRole={session?.user?.role}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="professional-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Assigned Tasks</p>
                  <p className="text-3xl font-bold text-blue-600">8</p>
                </div>
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="professional-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-3xl font-bold text-yellow-600">3</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="professional-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed Today</p>
                  <p className="text-3xl font-bold text-green-600">2</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="professional-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Urgent</p>
                  <p className="text-3xl font-bold text-red-600">1</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Task List */}
          <div className="lg:col-span-1">
            <Card className="professional-card">
              <CardHeader>
                <CardTitle>My Tasks</CardTitle>
                <CardDescription>Assigned requests requiring field action</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {assignedTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedTask.id === task.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedTask(task)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm">{task.title}</h4>
                      <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{task.id}</p>
                    <div className="flex items-center space-x-1 mb-2">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">{task.location}</span>
                    </div>
                    <Badge className={getStatusColor(task.status)}>{task.status.replace("_", " ")}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Task Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="professional-card">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{selectedTask.title}</CardTitle>
                    <CardDescription className="mt-1">Request ID: {selectedTask.id}</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Badge className={getPriorityColor(selectedTask.priority)}>{selectedTask.priority}</Badge>
                    <Badge className={getStatusColor(selectedTask.status)}>
                      {selectedTask.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Description */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded">{selectedTask.description}</p>
                </div>

                {/* Location & Contact */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Location</h4>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{selectedTask.location}</span>
                    </div>
                    <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                      <Navigation className="w-4 h-4 mr-2" />
                      Get Directions
                    </Button>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Requester Contact</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{selectedTask.requester}</span>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Phone className="w-4 h-4 mr-2" />
                          Call
                        </Button>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          SMS
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Update */}
                <div className="border-t pt-6">
                  <h4 className="font-medium text-gray-900 mb-4">Update Status</h4>
                  <div className="space-y-4">
                    <Select value={newStatus} onValueChange={setNewStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select new status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="RESOLVED">Resolved</SelectItem>
                        <SelectItem value="REQUIRES_APPROVAL">Requires Approval</SelectItem>
                        <SelectItem value="BLOCKED">Blocked</SelectItem>
                      </SelectContent>
                    </Select>

                    <Textarea
                      placeholder="Add update notes, progress details, or any issues encountered..."
                      value={updateText}
                      onChange={(e) => setUpdateText(e.target.value)}
                      rows={4}
                    />

                    <div className="flex space-x-4">
                      <Button onClick={handleStatusUpdate} disabled={!newStatus || !updateText}>
                        Update Status
                      </Button>
                      <Button variant="outline">
                        <Camera className="w-4 h-4 mr-2" />
                        Add Photos
                      </Button>
                      <Button variant="outline">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Files
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Updates */}
            <Card className="professional-card">
              <CardHeader>
                <CardTitle>Recent Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Clock className="w-4 h-4 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Task assigned</p>
                      <p className="text-xs text-gray-500">Assigned by PA Sita Devi</p>
                      <p className="text-xs text-gray-400">2 hours ago</p>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Site inspection completed</p>
                      <p className="text-xs text-gray-500">Photos uploaded and assessment done</p>
                      <p className="text-xs text-gray-400">1 hour ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
