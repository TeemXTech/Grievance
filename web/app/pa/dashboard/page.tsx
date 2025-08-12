"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  FileText,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  UserCheck,
  MessageSquare,
  Phone,
  MapPin,
  Calendar,
  Loader2,
} from "lucide-react"
import { GovernmentHeader } from "@/components/ui/government-header"
import {
  useDashboardStats,
  useRequests,
  usePendingWhatsAppMessages,
  useUsers,
  useApproveWhatsAppMessage,
  useAssignRequest,
} from "@/hooks/use-api"

export default function PADashboard() {
  const { data: session } = useSession()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: requestsData, isLoading: requestsLoading } = useRequests({
    status: filterStatus === "all" ? undefined : filterStatus,
    limit: 20,
  })
  const { data: whatsappMessages, isLoading: whatsappLoading } = usePendingWhatsAppMessages()
  const { data: users } = useUsers()

  const approveWhatsAppMessage = useApproveWhatsAppMessage()
  const assignRequest = useAssignRequest()

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "CRITICAL":
        return "bg-red-100 text-red-800"
      case "HIGH":
        return "bg-orange-100 text-orange-800"
      case "MEDIUM":
        return "bg-blue-100 text-blue-800"
      case "LOW":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleApproveWhatsApp = async (messageId: number, message: any) => {
    try {
      await approveWhatsAppMessage.mutateAsync({
        id: messageId,
        data: {
          type: "OTHER",
          title: message.raw_text.substring(0, 100),
          description: message.raw_text,
          requester_name: "WhatsApp User",
          requester_phone: message.phone,
          requester_address: "Location not specified",
          priority: "MEDIUM",
        },
      })
    } catch (error) {
      console.error("Failed to approve WhatsApp message:", error)
    }
  }

  const handleAssignRequest = async (requestId: string, assigneeId: string) => {
    try {
      await assignRequest.mutateAsync({
        id: requestId,
        data: { assigned_to: assigneeId },
      })
    } catch (error) {
      console.error("Failed to assign request:", error)
    }
  }

  const fieldTeam = users?.filter((user: any) => user.role?.name === "FIELD_TEAM") || []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <GovernmentHeader
        title="Personal Assistant Dashboard"
        subtitle="Operational Management & Request Assignment"
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
                  <p className="text-sm font-medium text-gray-600">Pending Review</p>
                  {statsLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-orange-600" />
                  ) : (
                    <p className="text-3xl font-bold text-orange-600">{stats?.pendingRequests || 0}</p>
                  )}
                </div>
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="professional-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Requests</p>
                  {statsLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  ) : (
                    <p className="text-3xl font-bold text-blue-600">{stats?.totalRequests || 0}</p>
                  )}
                </div>
                <UserCheck className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="professional-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">WhatsApp Queue</p>
                  {whatsappLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-green-600" />
                  ) : (
                    <p className="text-3xl font-bold text-green-600">{whatsappMessages?.length || 0}</p>
                  )}
                </div>
                <MessageSquare className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="professional-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Critical</p>
                  {statsLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-red-600" />
                  ) : (
                    <p className="text-3xl font-bold text-red-600">{stats?.criticalRequests || 0}</p>
                  )}
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pending">Pending Requests</TabsTrigger>
            <TabsTrigger value="whatsapp">WhatsApp Queue</TabsTrigger>
            <TabsTrigger value="team">Field Team</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-6">
            {/* Filters */}
            <Card className="professional-card">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search requests..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Requests</SelectItem>
                      <SelectItem value="NEW">New</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="ASSIGNED">Assigned</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    More Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Requests Table */}
            <Card className="professional-card">
              <CardHeader>
                <CardTitle>Pending Requests</CardTitle>
                <CardDescription>Requests awaiting review and assignment</CardDescription>
              </CardHeader>
              <CardContent>
                {requestsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Request ID</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Requester</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requestsData?.data?.map((request: any) => (
                        <TableRow key={request.id}>
                          <TableCell className="font-medium">{request.id}</TableCell>
                          <TableCell className="max-w-xs truncate">{request.title}</TableCell>
                          <TableCell>{request.requester_name}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-3 h-3 text-gray-400" />
                              <span className="text-sm truncate max-w-[100px]">{request.requester_address}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{request.type}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getPriorityColor(request.priority)}>{request.priority}</Badge>
                          </TableCell>
                          <TableCell>{new Date(request.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Select onValueChange={(value) => handleAssignRequest(request.id, value)}>
                                <SelectTrigger className="w-[100px]">
                                  <SelectValue placeholder="Assign" />
                                </SelectTrigger>
                                <SelectContent>
                                  {fieldTeam.map((member: any) => (
                                    <SelectItem key={member.id} value={member.id}>
                                      {member.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button size="sm" variant="ghost">
                                <Phone className="w-4 h-4" />
                              </Button>
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

          <TabsContent value="whatsapp" className="space-y-6">
            <Card className="professional-card">
              <CardHeader>
                <CardTitle>WhatsApp Message Queue</CardTitle>
                <CardDescription>Messages awaiting review and conversion to requests</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {whatsappLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                ) : whatsappMessages?.length > 0 ? (
                  whatsappMessages.map((message: any) => (
                    <div key={message.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <MessageSquare className="w-4 h-4 text-green-600" />
                          <span className="font-medium">{message.phone}</span>
                          <Badge variant="outline" className="text-xs">
                            {message.parsed_status}
                          </Badge>
                        </div>
                        <span className="text-xs text-gray-500">{new Date(message.received_at).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">{message.raw_text}</p>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleApproveWhatsApp(message.id, message)}
                          disabled={approveWhatsAppMessage.isPending}
                        >
                          {approveWhatsAppMessage.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                          Create Request
                        </Button>
                        <Button size="sm" variant="outline">
                          Reply
                        </Button>
                        <Button size="sm" variant="ghost">
                          Ignore
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-8">No pending WhatsApp messages</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team" className="space-y-6">
            <Card className="professional-card">
              <CardHeader>
                <CardTitle>Field Team Management</CardTitle>
                <CardDescription>Monitor and manage field team assignments</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fieldTeam.map((member: any) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">{member.name}</TableCell>
                        <TableCell>{member.role?.name?.replace("_", " ")}</TableCell>
                        <TableCell>{member.phone}</TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              View Tasks
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Phone className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="professional-card">
                <CardHeader>
                  <CardTitle>Generate Reports</CardTitle>
                  <CardDescription>Create custom reports for analysis</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Daily Summary Report
                  </Button>
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <Calendar className="w-4 h-4 mr-2" />
                    Weekly Performance Report
                  </Button>
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <MapPin className="w-4 h-4 mr-2" />
                    Location-wise Analysis
                  </Button>
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <UserCheck className="w-4 h-4 mr-2" />
                    Team Performance Report
                  </Button>
                </CardContent>
              </Card>

              <Card className="professional-card">
                <CardHeader>
                  <CardTitle>Quick Statistics</CardTitle>
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
                    <span className="font-semibold">{fieldTeam.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Pending Assignments</span>
                    <span className="font-semibold text-orange-600">{stats?.pendingRequests || 0}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
