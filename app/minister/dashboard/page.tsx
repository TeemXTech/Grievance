"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { GovernmentHeader } from "@/components/ui/government-header"
import { BarChart, Users, MapPin, Clock, TrendingUp, Phone, Calendar, Filter, AlertTriangle, CheckCircle, UserPlus, FileText, Building2, Eye, Download, ArrowLeft, ChevronRight } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function MinisterDashboard() {
  const [timeFilter, setTimeFilter] = useState("month")
  const [selectedDistrict, setSelectedDistrict] = useState("all")
  const [selectedMandal, setSelectedMandal] = useState("all")
  const [selectedVillage, setSelectedVillage] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedPriority, setSelectedPriority] = useState("all")
  const [currentView, setCurrentView] = useState("state") // state, district, mandal, village
  const [breadcrumb, setBreadcrumb] = useState([{ name: "Telangana", level: "state" }])
  const [dashboardData, setDashboardData] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [availableUsers, setAvailableUsers] = useState([])
  const [mapData, setMapData] = useState<any>({})
  const [activeTab, setActiveTab] = useState("overview")

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        timeFilter,
        district: selectedDistrict,
        mandal: selectedMandal,
        village: selectedVillage,
        category: selectedCategory,
        status: selectedStatus,
        priority: selectedPriority,
        view: currentView
      })
      const [dashboardRes, usersRes, mapRes] = await Promise.all([
        fetch(`/api/minister/dashboard?${params}`),
        fetch('/api/users'),
        fetch(`/api/minister/map-data?${params}`)
      ])
      const dashboardData = await dashboardRes.json()
      const usersData = await usersRes.json()
      const mapData = await mapRes.json()
      
      setDashboardData(dashboardData)
      setMapData(mapData)
      setAvailableUsers(usersData.filter((u: any) => ['PA', 'FIELD_OFFICER', 'BACK_OFFICER'].includes(u.role)))
    } catch (error) {
      console.error("Failed to load dashboard:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAssignment = async (type: string, itemId: string, assigneeId: string) => {
    try {
      await fetch('/api/minister/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, itemId, assigneeId })
      })
      setAssignDialogOpen(false)
      setSelectedItem(null)
      loadDashboardData()
    } catch (error) {
      console.error('Assignment failed:', error)
    }
  }

  const handleDrillDown = (level: string, name: string, value: string) => {
    const newBreadcrumb = [...breadcrumb]
    
    if (level === "district") {
      setSelectedDistrict(value)
      setCurrentView("district")
      newBreadcrumb.push({ name, level: "district" })
    } else if (level === "mandal") {
      setSelectedMandal(value)
      setCurrentView("mandal")
      newBreadcrumb.push({ name, level: "mandal" })
    } else if (level === "village") {
      setSelectedVillage(value)
      setCurrentView("village")
      newBreadcrumb.push({ name, level: "village" })
    }
    
    setBreadcrumb(newBreadcrumb)
  }

  const handleBreadcrumbClick = (index: number) => {
    const newBreadcrumb = breadcrumb.slice(0, index + 1)
    setBreadcrumb(newBreadcrumb)
    
    const level = newBreadcrumb[newBreadcrumb.length - 1].level
    setCurrentView(level)
    
    if (level === "state") {
      setSelectedDistrict("all")
      setSelectedMandal("all")
      setSelectedVillage("all")
    } else if (level === "district") {
      setSelectedMandal("all")
      setSelectedVillage("all")
    } else if (level === "mandal") {
      setSelectedVillage("all")
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [timeFilter, selectedDistrict, selectedMandal, selectedVillage, selectedCategory, selectedStatus, selectedPriority, currentView])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "RESOLVED": return "bg-green-100 text-green-800"
      case "IN_PROGRESS": return "bg-blue-100 text-blue-800"
      case "WIP": return "bg-yellow-100 text-yellow-800"
      case "PENDING": return "bg-orange-100 text-orange-800"
      case "ASSIGNED": return "bg-purple-100 text-purple-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "URGENT": return "bg-red-100 text-red-800"
      case "HIGH": return "bg-orange-100 text-orange-800"
      case "MEDIUM": return "bg-blue-100 text-blue-800"
      case "LOW": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const calculateDays = (startDate: string, endDate?: string) => {
    const start = new Date(startDate)
    const end = endDate ? new Date(endDate) : new Date()
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <GovernmentHeader
        title="Minister Dashboard"
        description="Comprehensive Analytics & Village Insights"
        userName="Hon. Minister"
        userRole="Minister"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-sm">
              {breadcrumb.map((item, index) => (
                <div key={index} className="flex items-center">
                  <button
                    onClick={() => handleBreadcrumbClick(index)}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {item.name}
                  </button>
                  {index < breadcrumb.length - 1 && (
                    <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Filters */}
        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Filter className="w-5 h-5" />
              Dashboard Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger>
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <FileText className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="HEALTH">Health</SelectItem>
                  <SelectItem value="JOBS">Jobs</SelectItem>
                  <SelectItem value="CIVIL_WORK">Civil Work</SelectItem>
                  <SelectItem value="CM_FUND">CM Fund</SelectItem>
                  <SelectItem value="INFRASTRUCTURE">Infrastructure</SelectItem>
                  <SelectItem value="EDUCATION">Education</SelectItem>
                  <SelectItem value="AGRICULTURE">Agriculture</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="WIP">WIP</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                  <SelectItem value="ASSIGNED">Assigned</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger>
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
              </Select>

              {currentView === "state" && (
                <Select value={selectedDistrict} onValueChange={(value) => {
                  if (value !== "all") {
                    handleDrillDown("district", value, value)
                  }
                }}>
                  <SelectTrigger>
                    <Building2 className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Select District" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Districts</SelectItem>
                    <SelectItem value="Hyderabad">Hyderabad</SelectItem>
                    <SelectItem value="Warangal">Warangal</SelectItem>
                    <SelectItem value="Nizamabad">Nizamabad</SelectItem>
                    <SelectItem value="Karimnagar">Karimnagar</SelectItem>
                    <SelectItem value="Khammam">Khammam</SelectItem>
                  </SelectContent>
                </Select>
              )}

              {currentView === "district" && (
                <Select value={selectedMandal} onValueChange={(value) => {
                  if (value !== "all") {
                    handleDrillDown("mandal", value, value)
                  }
                }}>
                  <SelectTrigger>
                    <MapPin className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Select Mandal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Mandals</SelectItem>
                    {mapData.mandals?.map((mandal: any) => (
                      <SelectItem key={mandal.name} value={mandal.name}>{mandal.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {currentView === "mandal" && (
                <Select value={selectedVillage} onValueChange={(value) => {
                  if (value !== "all") {
                    handleDrillDown("village", value, value)
                  }
                }}>
                  <SelectTrigger>
                    <Users className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Select Village" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Villages</SelectItem>
                    {mapData.villages?.map((village: any) => (
                      <SelectItem key={village.name} value={village.name}>{village.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <Button onClick={loadDashboardData} className="w-full bg-blue-600 hover:bg-blue-700">
                <TrendingUp className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Active Filters Notification */}
        {(selectedStatus !== "all" || selectedCategory !== "all" || selectedPriority !== "all") && (
          <Card className="mb-4 border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Active Filters:</span>
                  {selectedStatus !== "all" && <Badge variant="outline">Status: {selectedStatus}</Badge>}
                  {selectedCategory !== "all" && <Badge variant="outline">Category: {selectedCategory}</Badge>}
                  {selectedPriority !== "all" && <Badge variant="outline">Priority: {selectedPriority}</Badge>}
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => {
                    setSelectedStatus("all")
                    setSelectedCategory("all")
                    setSelectedPriority("all")
                  }}
                >
                  Clear All
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-700 text-white cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                onClick={() => {
                  setSelectedStatus("all")
                  setSelectedCategory("all")
                  setSelectedPriority("all")
                  setActiveTab("grievances")
                }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Grievances</p>
                  <p className="text-4xl font-bold mb-1">{dashboardData.stats?.grievances?.total || 0}</p>
                  <p className="text-xs text-blue-200">Click to view all</p>
                </div>
                <BarChart className="w-10 h-10 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-700 text-white cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                onClick={() => {
                  setSelectedStatus("RESOLVED")
                  setSelectedCategory("all")
                  setSelectedPriority("all")
                  setActiveTab("grievances")
                }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Resolved</p>
                  <p className="text-4xl font-bold mb-1">{dashboardData.stats?.grievances?.resolved || 0}</p>
                  <p className="text-xs text-green-200">
                    {dashboardData.stats?.grievances?.total ? Math.round((dashboardData.stats.grievances.resolved / dashboardData.stats.grievances.total) * 100) : 0}% Success Rate
                  </p>
                </div>
                <CheckCircle className="w-10 h-10 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-700 text-white cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                onClick={() => {
                  setSelectedStatus("PENDING")
                  setSelectedCategory("all")
                  setSelectedPriority("all")
                  setActiveTab("grievances")
                }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Pending Action</p>
                  <p className="text-4xl font-bold mb-1">{dashboardData.stats?.grievances?.pending || 0}</p>
                  <p className="text-xs text-orange-200">Click to view pending</p>
                </div>
                <AlertTriangle className="w-10 h-10 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-700 text-white cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                onClick={() => {
                  setActiveTab("assignments")
                }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Active Users</p>
                  <p className="text-4xl font-bold mb-1">{availableUsers.length || 0}</p>
                  <p className="text-xs text-purple-200">Team members online</p>
                </div>
                <Users className="w-10 h-10 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts Section */}
        {dashboardData.alerts && dashboardData.alerts.length > 0 && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <AlertTriangle className="w-5 h-5" />
                Alerts & Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {dashboardData.alerts.map((alert: any, index: number) => (
                  <div key={index} className={`p-3 rounded-lg ${alert.type === 'warning' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>
                    <div className="flex items-center justify-between">
                      <span>{alert.message}</span>
                      <Badge variant="outline">{alert.count}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6" id="main-tabs">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="grievances">Grievances</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="map">Interactive Map</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Hierarchical View */}
              <Card>
                <CardHeader>
                  <CardTitle>Current View: {currentView.charAt(0).toUpperCase() + currentView.slice(1)}</CardTitle>
                </CardHeader>
                <CardContent>
                  {currentView === "state" && (
                    <div className="space-y-3">
                      <h4 className="font-medium">Districts</h4>
                      {mapData.districts?.map((district: any) => (
                        <div key={district.name} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 cursor-pointer"
                             onClick={() => handleDrillDown("district", district.name, district.name)}>
                          <div>
                            <div className="font-medium">{district.name}</div>
                            <div className="text-sm text-gray-500">{district.mandals} mandals, {district.villages} villages</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{district.grievances} grievances</div>
                            <div className="text-sm font-medium text-blue-600">{district.projects} projects</div>
                          </div>
                        </div>
                      )) || (
                        <div className="text-center py-8 text-gray-500">
                          <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>Loading districts...</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {currentView === "district" && (
                    <div className="space-y-3">
                      <h4 className="font-medium">Mandals in {breadcrumb[breadcrumb.length - 1].name}</h4>
                      {mapData.mandals?.map((mandal: any) => (
                        <div key={mandal.name} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 cursor-pointer"
                             onClick={() => handleDrillDown("mandal", mandal.name, mandal.name)}>
                          <div>
                            <div className="font-medium">{mandal.name}</div>
                            <div className="text-sm text-gray-500">{mandal.villages} villages</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{mandal.grievances} grievances</div>
                            <div className="text-sm font-medium text-blue-600">{mandal.projects} projects</div>
                          </div>
                        </div>
                      )) || (
                        <div className="text-center py-8 text-gray-500">
                          <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>Loading mandals...</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {currentView === "mandal" && (
                    <div className="space-y-3">
                      <h4 className="font-medium">Villages in {breadcrumb[breadcrumb.length - 1].name}</h4>
                      {mapData.villages?.map((village: any) => (
                        <div key={village.name} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 cursor-pointer"
                             onClick={() => handleDrillDown("village", village.name, village.name)}>
                          <div>
                            <div className="font-medium">{village.name}</div>
                            <div className="text-sm text-gray-500">Population: {village.population}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{village.grievances} grievances</div>
                            <div className="text-sm font-medium text-blue-600">{village.projects} projects</div>
                          </div>
                        </div>
                      )) || (
                        <div className="text-center py-8 text-gray-500">
                          <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>Loading villages...</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {currentView === "village" && (
                    <div className="space-y-4">
                      <h4 className="font-medium">Village Details: {breadcrumb[breadcrumb.length - 1].name}</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-blue-50 rounded">
                          <div className="text-2xl font-bold text-blue-600">{mapData.villageDetails?.population || 0}</div>
                          <div className="text-sm text-blue-800">Population</div>
                        </div>
                        <div className="p-3 bg-green-50 rounded">
                          <div className="text-2xl font-bold text-green-600">{mapData.villageDetails?.households || 0}</div>
                          <div className="text-sm text-green-800">Households</div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button className="w-full justify-start" variant="outline" 
                            onClick={() => {
                              setSelectedPriority("URGENT")
                              setActiveTab("grievances")
                            }}>
                      <AlertTriangle className="w-4 h-4 mr-2 text-red-500" />
                      View Urgent Issues ({dashboardData.stats?.urgent || 0})
                    </Button>
                    <Button className="w-full justify-start" variant="outline"
                            onClick={() => {
                              setSelectedPriority("HIGH")
                              setActiveTab("grievances")
                            }}>
                      <TrendingUp className="w-4 h-4 mr-2 text-orange-500" />
                      View High Priority ({dashboardData.stats?.high || 0})
                    </Button>
                    <Button className="w-full justify-start" variant="outline"
                            onClick={() => {
                              setSelectedStatus("PENDING")
                              setActiveTab("assignments")
                            }}>
                      <Clock className="w-4 h-4 mr-2 text-yellow-500" />
                      Pending Assignments ({dashboardData.stats?.unassigned || 0})
                    </Button>
                    <Button className="w-full justify-start" variant="outline"
                            onClick={() => {
                              // Create new grievance - redirect to form
                              window.location.href = '/dashboard/grievances?action=create'
                            }}>
                      <FileText className="w-4 h-4 mr-2" />
                      Create New Grievance
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="map">
            <Card>
              <CardHeader>
                <CardTitle>Interactive Telangana Map</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">Interactive map will be loaded here</p>
                    <p className="text-sm text-gray-500">Click on districts to drill down</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="grievances">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Grievances Overview</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View All
                    </Button>
                  </div>
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
                        <TableHead>Reference</TableHead>
                        <TableHead>Requester</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dashboardData.grievances?.map((grievance: any) => (
                        <TableRow key={grievance.id} className="hover:bg-gray-50">
                          <TableCell className="font-mono text-sm font-medium">
                            {grievance.referenceNumber}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{grievance.requesterName}</div>
                              <div className="text-sm text-gray-500 flex items-center">
                                <Phone className="w-3 h-3 mr-1" />
                                {grievance.requesterPhone}
                              </div>
                              <div className="text-xs text-gray-400">
                                Created: {new Date(grievance.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{grievance.grievanceCategory || 'OTHER'}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              <div className="text-sm">
                                {grievance.village && <div>{grievance.village}</div>}
                                {grievance.mandal && <div className="text-gray-500">{grievance.mandal}</div>}
                                {grievance.district && <div className="text-gray-400">{grievance.district}</div>}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {grievance.assignedTo ? (
                              <div className="flex items-center">
                                <Users className="w-3 h-3 mr-1" />
                                <div>
                                  <div className="text-sm font-medium">{grievance.assignedTo.name}</div>
                                  <div className="text-xs text-gray-500">{grievance.assignedTo.role}</div>
                                </div>
                              </div>
                            ) : (
                              <Badge variant="secondary">Unassigned</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(grievance.status)} 
                                   onClick={() => {
                                     setSelectedStatus(grievance.status)
                                     setSelectedCategory("all")
                                     setSelectedPriority("all")
                                   }}
                                   style={{ cursor: 'pointer' }}
                                   title="Click to filter by this status">
                              {grievance.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getPriorityColor(grievance.priority)}
                                   onClick={() => {
                                     setSelectedPriority(grievance.priority)
                                     setSelectedCategory("all")
                                     setSelectedStatus("all")
                                   }}
                                   style={{ cursor: 'pointer' }}
                                   title="Click to filter by this priority">
                              {grievance.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setSelectedItem({ ...grievance, type: 'grievance' })
                                  setAssignDialogOpen(true)
                                }}
                                disabled={!!grievance.assignedTo}
                              >
                                <UserPlus className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Eye className="w-3 h-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )) || []}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Government Projects</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reference</TableHead>
                      <TableHead>Project Name</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Budget</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dashboardData.projects?.map((project: any) => (
                      <TableRow key={project.id} className="hover:bg-gray-50">
                        <TableCell className="font-mono text-sm">{project.referenceNumber}</TableCell>
                        <TableCell className="font-medium">{project.projectName}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {project.village || project.district}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(project.status)}>
                            {project.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>₹{(project.estimatedCost || 0).toLocaleString()}</TableCell>
                        <TableCell>
                          {project.assignedTo ? (
                            <div className="flex items-center">
                              <Users className="w-3 h-3 mr-1" />
                              {project.assignedTo.name}
                            </div>
                          ) : (
                            <Badge variant="secondary">Unassigned</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setSelectedItem({ ...project, type: 'project' })
                                setAssignDialogOpen(true)
                              }}
                            >
                              <UserPlus className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Eye className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )) || []}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="visitors">
            <Card>
              <CardHeader>
                <CardTitle>Recent Visitors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.recentVisitors?.map((visitor: any) => (
                    <div key={visitor.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">{visitor.visitorName}</div>
                          <div className="text-sm text-gray-500">{visitor.purpose}</div>
                          <div className="text-xs text-gray-400">
                            {new Date(visitor.visitDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {visitor.grievance && (
                          <div className="text-sm">
                            <span className="font-mono">{visitor.grievance.referenceNumber}</span>
                            <Badge className={`ml-2 ${getStatusColor(visitor.grievance.status)}`}>
                              {visitor.grievance.status}
                            </Badge>
                          </div>
                        )}
                        {visitor.project && (
                          <div className="text-sm">
                            <span className="font-mono">{visitor.project.referenceNumber}</span>
                            <Badge className={`ml-2 ${getStatusColor(visitor.project.status)}`}>
                              {visitor.project.status}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No recent visitors</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assignments">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Unassigned Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-red-50 rounded cursor-pointer" 
                         onClick={() => {
                           setSelectedPriority("URGENT")
                           setSelectedStatus("PENDING")
                           setActiveTab("grievances")
                         }}>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Urgent Grievances</span>
                        <Badge variant="destructive">
                          {dashboardData.grievances?.filter((g: any) => !g.assignedTo && g.priority === 'URGENT').length || 0}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">Needs immediate attention</div>
                    </div>
                    
                    <div className="p-3 bg-orange-50 rounded cursor-pointer"
                         onClick={() => {
                           setSelectedStatus("PENDING")
                           setActiveTab("grievances")
                         }}>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Unassigned Grievances</span>
                        <Badge variant="outline">
                          {dashboardData.grievances?.filter((g: any) => !g.assignedTo).length || 0}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">Awaiting assignment</div>
                    </div>
                    
                    <div className="p-3 bg-blue-50 rounded cursor-pointer"
                         onClick={() => setActiveTab("projects")}>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Unassigned Projects</span>
                        <Badge variant="outline">
                          {dashboardData.projects?.filter((p: any) => !p.assignedTo).length || 0}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">Awaiting assignment</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Team Workload</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {availableUsers.map((user: any) => (
                      <div key={user.id} className="flex justify-between items-center p-3 border rounded hover:bg-gray-50">
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.role}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {dashboardData.workload?.[user.id] || Math.floor(Math.random() * 10) + 1} tasks
                          </div>
                          <div className="text-xs text-gray-500">assigned</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Bulk Assignment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button className="w-full" variant="outline">
                      Auto-assign by Location
                    </Button>
                    <Button className="w-full" variant="outline">
                      Auto-assign by Category
                    </Button>
                    <Button className="w-full" variant="outline">
                      Auto-assign by Workload
                    </Button>
                    <Button className="w-full" variant="outline">
                      Manual Bulk Assignment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Generate Reports</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button className="w-full justify-start" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Grievances Summary Report
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Projects Status Report
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Performance Analytics
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Visitor Log Report
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Resolution Rate</span>
                      <span className="font-bold text-green-600">
                        {dashboardData.stats?.grievances?.total ? 
                          Math.round((dashboardData.stats.grievances.resolved / dashboardData.stats.grievances.total) * 100) : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Response Time</span>
                      <span className="font-bold">2.3 days</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Project Completion</span>
                      <span className="font-bold text-blue-600">
                        {dashboardData.stats?.projects?.total ? 
                          Math.round(((dashboardData.stats.projects.total - dashboardData.stats.projects.ongoing) / dashboardData.stats.projects.total) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Assignment Dialog */}
        <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Assign {selectedItem?.type}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedItem && (
                <div className="p-4 bg-gray-50 rounded">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="font-medium">
                        {selectedItem.type === 'grievance' ? selectedItem.title : selectedItem.projectName}
                      </div>
                      <div className="text-sm text-gray-600">
                        Ref: {selectedItem.referenceNumber}
                      </div>
                      <div className="text-sm text-gray-600">
                        Requester: {selectedItem.requesterName}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">
                        Location: {selectedItem.village || selectedItem.mandal || selectedItem.district || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-600">
                        Category: {selectedItem.grievanceCategory || selectedItem.category || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-600">
                        Priority: <Badge className={getPriorityColor(selectedItem.priority)}>{selectedItem.priority}</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium mb-2">Assign to:</label>
                <Select onValueChange={(value) => {
                  if (selectedItem) {
                    handleAssignment(selectedItem.type, selectedItem.id, value)
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team member" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUsers.map((user: any) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center justify-between w-full">
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-xs text-gray-500">{user.email}</div>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline" className="ml-2">{user.role}</Badge>
                            <div className="text-xs text-gray-500">
                              {dashboardData.workload?.[user.id] || Math.floor(Math.random() * 10) + 1} tasks
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}