"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { DashboardStats, WhatsAppMessage, GrievanceRequest, User } from "@/types"
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
  PlusCircle,
  XCircle,
  CheckCircle,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
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
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | GrievanceStatus>("all")
  const [activeTab, setActiveTab] = useState("requests")
  const [currentPage, setCurrentPage] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)

  // Handle URL parameters
  useEffect(() => {
    const url = new URL(window.location.href);
    const tab = url.searchParams.get("tab");
    const status = url.searchParams.get("status");
    
    if (tab) {
      setActiveTab(tab);
    }
    if (status) {
      setFilterStatus(status as any);
    }
  }, [])

  const { data: stats, isLoading: statsLoading, error: statsError } = useDashboardStats({
    refetchInterval: 30000 // Refetch every 30 seconds
  })
  const { data: requestsData, isLoading: requestsLoading, error: requestsError } = useRequests({
    status: filterStatus === "all" ? undefined : filterStatus,
    search: searchTerm,
    limit: 20,
    page: currentPage
  }, {
    refetchInterval: 15000 // Refetch every 15 seconds
  })
  const { data: whatsappMessages, isLoading: whatsappLoading, error: whatsappError } = usePendingWhatsAppMessages({
    refetchInterval: 10000 // Refetch every 10 seconds
  })
  const { data: users, error: usersError } = useUsers({
    refetchInterval: 60000 // Refetch every minute
  })

  // Handle API errors
  if (statsError || requestsError || whatsappError || usersError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Dashboard</h2>
          <p className="text-gray-600">There was an error loading the dashboard data. Please try again later.</p>
        </div>
      </div>
    )
  }

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

  const handleApproveWhatsApp = async (messageId: number, message: WhatsAppMessage) => {
    try {
      await approveWhatsAppMessage.mutateAsync({
        id: messageId.toString(),
        data: {
          type: "OTHER",
          title: message.raw_text.substring(0, 100),
          description: message.raw_text,
          requester_name: "WhatsApp User",
          requester_phone: message.phone,
          requester_address: "Location not specified",
          priority: "MEDIUM",
          status: "NEW"
        }
      })
    } catch (error) {
      console.error("Failed to approve WhatsApp message:", error)
    }
  }

  const handleAssignRequest = async (requestId: string, assigneeId: string) => {
    try {
      await assignRequest.mutateAsync({
        id: requestId,
        assigneeId
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
        description="Operational Management & Request Assignment"
        userName={session?.user?.name}
        userRole={session?.user?.role}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="requests" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="mb-4">
            <TabsTrigger value="requests">Grievance Requests</TabsTrigger>
            <TabsTrigger value="whatsapp">WhatsApp Messages</TabsTrigger>
          </TabsList>

          {/* Requests Tab */}
          <TabsContent value="requests">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card 
                  className="professional-card bg-white transform transition duration-200 hover:scale-105 cursor-pointer hover:shadow-lg relative overflow-hidden" 
                  onClick={() => {
                    setActiveTab("requests");
                    setFilterStatus("PENDING");
                    router.push("/pa/dashboard?tab=requests&status=PENDING");
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-transparent opacity-50"/>
                  <CardContent className="p-6 h-full flex flex-col justify-between relative">
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
                    <div className="mt-4 flex items-center text-xs text-gray-500">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>Click to view pending requests</span>
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p>View and manage pending requests</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card 
                  className="professional-card bg-white transform transition duration-200 hover:scale-105 cursor-pointer hover:shadow-lg relative overflow-hidden"
                  onClick={() => {
                    setActiveTab("requests");
                    setFilterStatus("all");
                    router.push("/pa/dashboard?tab=requests&status=all");
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-50"/>
                  <CardContent className="p-6 h-full flex flex-col justify-between relative">
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
                    <div className="mt-4 flex items-center text-xs text-gray-500">
                      <FileText className="w-3 h-3 mr-1" />
                      <span>Click to view all requests</span>
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p>View all grievance requests</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card 
                  className="professional-card bg-white transform transition duration-200 hover:scale-105 cursor-pointer hover:shadow-lg relative overflow-hidden"
                  onClick={() => {
                    setActiveTab("whatsapp");
                    router.push("/pa/dashboard?tab=whatsapp");
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-transparent opacity-50"/>
                  <CardContent className="p-6 h-full flex flex-col justify-between relative">
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
                    <div className="mt-4 flex items-center text-xs text-gray-500">
                      <PlusCircle className="w-3 h-3 mr-1" />
                      <span>Click to process WhatsApp messages</span>
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p>Convert WhatsApp messages to requests</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card 
                  className="professional-card bg-white transform transition duration-200 hover:scale-105 cursor-pointer hover:shadow-lg relative overflow-hidden"
                  onClick={() => setFilterStatus("CRITICAL")}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-transparent opacity-50"/>
                  <CardContent className="p-6 h-full flex flex-col justify-between relative">
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
                    <div className="mt-4 flex items-center text-xs text-gray-500">
                      <XCircle className="w-3 h-3 mr-1" />
                      <span>Click to view critical requests</span>
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p>View and manage critical priority requests</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
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
                              <Select onValueChange={(value: string) => handleAssignRequest(request.id, value)}>
                                <SelectTrigger className="w-[100px]">
                                  <SelectValue placeholder="Assign" />
                                </SelectTrigger>
                                <SelectContent>
                                  {fieldTeam.map((member: { id: string, name: string }) => (
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

          {/* WhatsApp Tab */}
          <TabsContent value="whatsapp">
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
                ) : !whatsappMessages?.length ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="mx-auto h-8 w-8 mb-2" />
                    <p>No WhatsApp messages in queue</p>
                  </div>
                ) : (
                  whatsappMessages?.map((message: any) => ( 
                    <Card key={message.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <p className="font-medium">{message.phone}</p>
                          <p className="text-sm text-gray-600">{message.raw_text}</p>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(message.created_at).toLocaleString()}</span>
                          </div>
                        </div>
                        <Button onClick={() => handleApproveWhatsApp(message.id, message)}>
                          Convert to Request
                        </Button>
                      </div>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team" className="space-y-6">
            <Card className="professional-card">
              <CardHeader>
                <CardTitle>Field Team Management</CardTitle>
                <CardDescription>Assign and manage field team tasks</CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card className="professional-card">
              <CardHeader>
                <CardTitle>Operational Reports</CardTitle>
                <CardDescription>View and generate reports</CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
