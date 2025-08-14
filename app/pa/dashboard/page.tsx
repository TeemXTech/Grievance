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

export default function PaDashboard() {
  const { data: session } = useSession();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [activeTab, setActiveTab] = useState("requests");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const url = new URL(window.location.href);
    const tab = url.searchParams.get("tab");
    const status = url.searchParams.get("status");
    if (tab) setActiveTab(tab);
    if (status) setFilterStatus(status);
  }, []);

  // Hooks always at top level
  const { data: stats, isLoading: statsLoading, error: statsError } = useDashboardStats({ refetchInterval: 30000 });
  const { data: requestsData, isLoading: requestsLoading, error: requestsError } = useRequests(
    {
      status: filterStatus === "all" ? undefined : filterStatus,
      search: searchTerm,
      limit: 20,
      page: currentPage,
    },
    { refetchInterval: 15000 }
  );
  const { data: whatsappMessages, isLoading: whatsappLoading, error: whatsappError } = usePendingWhatsAppMessages({
    refetchInterval: 10000,
  });
  const { data: users, error: usersError } = useUsers({ refetchInterval: 60000 });

  const approveWhatsAppMessage = useApproveWhatsAppMessage();
  const assignRequest = useAssignRequest();

  const hasError = statsError || requestsError || whatsappError || usersError;
  const fieldTeam = users?.filter((user) => user.role?.name === "FIELD_TEAM") || [];

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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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

            {/* Search and Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search requests by title, description, or reference number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="ASSIGNED">Assigned</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="RESOLVED">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Requests Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Grievance Requests
                  {requestsData?.pagination && (
                    <span className="text-sm font-normal text-gray-500">
                      ({requestsData.pagination.total} total)
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {requestsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Reference</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Requester</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requestsData?.grievances?.map((request: any) => (
                        <TableRow key={request.id}>
                          <TableCell className="font-mono text-sm">
                            {request.referenceNumber}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {request.title}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{request.requesterName}</div>
                              <div className="text-sm text-gray-500">{request.requesterPhone}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getPriorityColor(request.priority)}>
                              {request.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {request.status.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {request.assignedTo ? (
                              <div className="flex items-center gap-2">
                                <UserCheck className="w-4 h-4" />
                                <span className="text-sm">{request.assignedTo.name}</span>
                              </div>
                            ) : (
                              <Select
                                onValueChange={(value) => handleAssignRequest(request.id, value)}
                              >
                                <SelectTrigger className="w-[150px]">
                                  <SelectValue placeholder="Assign to..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {fieldTeam.map((user: any) => (
                                    <SelectItem key={user.id} value={user.id}>
                                      {user.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Calendar className="w-3 h-3" />
                              {new Date(request.createdAt).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/dashboard/grievances/${request.id}`)}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* WhatsApp Messages Tab */}
          <TabsContent value="whatsapp">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Pending WhatsApp Messages
                  {whatsappMessages && (
                    <span className="text-sm font-normal text-gray-500">
                      ({whatsappMessages.length} pending)
                    </span>
                  )}
                </CardTitle>
                <CardDescription>
                  Review and approve WhatsApp messages to convert them into grievance requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                {whatsappLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                ) : whatsappMessages && whatsappMessages.length > 0 ? (
                  <div className="space-y-4">
                    {whatsappMessages.map((message: any) => (
                      <Card key={message.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Phone className="w-4 h-4 text-gray-500" />
                                <span className="font-medium">{message.phone}</span>
                                <span className="text-sm text-gray-500">
                                  {new Date(message.created_at).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-gray-700 mb-3">{message.raw_text}</p>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Button
                                size="sm"
                                onClick={() => handleApproveWhatsApp(message.id, message)}
                                disabled={approveWhatsAppMessage.isPending}
                              >
                                {approveWhatsAppMessage.isPending ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <CheckCircle className="w-4 h-4" />
                                )}
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                              >
                                <XCircle className="w-4 h-4" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No pending WhatsApp messages</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}