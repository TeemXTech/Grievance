"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { 
  Bell, Search, Menu, MapPin, Calendar as CalendarIcon, 
  BarChart3, FileText, Clock, ChevronRight,
  Building2, Stethoscope, GraduationCap, Wrench, Plus,
  Eye, X, AlertTriangle, Filter, Download, RefreshCw
} from "lucide-react"
import Image from "next/image"

const mockData = {
  minister: {
    name: "Hon. Rajesh Kumar",
    constituency: "Manthanani",
    designation: "Minister for Rural Development",
    district: "Peddapalli",
    state: "Telangana"
  },
  summary: {
    totalProjects: 45,
    totalGrievances: 128,
    pendingActions: 23,
    upcomingEvents: 8,
    unassignedGrievances: 15,
    overdueProjects: 8,
    criticalIssues: 5
  },
  places: [
    { id: 1, name: "Manthanani Town", projects: 12, grievances: 25 },
    { id: 2, name: "Ramagundam", projects: 8, grievances: 18 },
    { id: 3, name: "Pegadapally", projects: 6, grievances: 15 },
    { id: 4, name: "Jaipur", projects: 5, grievances: 12 },
    { id: 5, name: "Godavarikhani", projects: 9, grievances: 22 },
    { id: 6, name: "Sultanabad", projects: 5, grievances: 16 }
  ],
  categories: [
    { name: "Infrastructure", projects: 18, grievances: 45, color: "bg-blue-500", icon: Building2 },
    { name: "Healthcare", projects: 8, grievances: 28, color: "bg-red-500", icon: Stethoscope },
    { name: "Education", projects: 12, grievances: 32, color: "bg-green-500", icon: GraduationCap },
    { name: "Utilities", projects: 7, grievances: 23, color: "bg-yellow-500", icon: Wrench }
  ],
  projects: [
    { 
      id: 1, 
      name: "Road Construction - NH 563", 
      status: "In Progress", 
      progress: 75, 
      budget: "₹2.5 Cr", 
      spent: "₹1.8 Cr",
      place: "Manthanani Town",
      village: "Manthanani",
      mandal: "Manthanani",
      district: "Peddapalli",
      contractor: "ABC Construction Ltd",
      startDate: "2023-06-15",
      expectedEnd: "2024-03-15",
      workOrder: "WO/2023/MAN/001",
      documents: ["Tender_Document.pdf", "Work_Order.pdf", "Progress_Report_Dec.pdf"],
      images: ["site_photo_1.jpg", "progress_75_percent.jpg"],
      assignedOfficer: "Eng. Suresh Kumar",
      fieldOfficer: "Field Officer Ramesh",
      paOfficer: "PA Srinivas",
      daysInProgress: 185,
      issues: ["Monsoon delay", "Material shortage"]
    },
    { 
      id: 2, 
      name: "Primary Health Center Upgrade", 
      status: "Completed", 
      progress: 100, 
      budget: "₹1.2 Cr", 
      spent: "₹1.15 Cr",
      place: "Ramagundam",
      village: "Ramagundam",
      mandal: "Ramagundam",
      district: "Peddapalli",
      contractor: "Health Infra Pvt Ltd",
      startDate: "2023-01-10",
      completedDate: "2023-11-20",
      workOrder: "WO/2023/RAM/002",
      documents: ["Completion_Certificate.pdf", "Quality_Report.pdf", "Handover_Document.pdf"],
      images: ["completed_phc.jpg", "equipment_installed.jpg"],
      assignedOfficer: "Dr. Lakshmi Prasad",
      fieldOfficer: "Field Officer Priya",
      paOfficer: "PA Srinivas",
      daysCompleted: 314
    },
    { 
      id: 3, 
      name: "School Building Construction", 
      status: "Planning", 
      progress: 25, 
      budget: "₹3.1 Cr", 
      spent: "₹0.5 Cr",
      place: "Pegadapally",
      village: "Pegadapally",
      mandal: "Pegadapally",
      district: "Peddapalli",
      contractor: "Edu Build Solutions",
      startDate: "2023-12-01",
      expectedEnd: "2024-08-15",
      workOrder: "WO/2023/PEG/003",
      documents: ["Site_Survey.pdf", "Architectural_Plan.pdf", "Environmental_Clearance.pdf"],
      images: ["site_preparation.jpg", "foundation_work.jpg"],
      assignedOfficer: "Arch. Venkat Rao",
      fieldOfficer: "Field Officer Madhavi",
      paOfficer: "PA Rajesh",
      daysInProgress: 45,
      issues: ["Land acquisition pending"]
    }
  ],
  grievances: [
    { 
      id: 1, 
      referenceNumber: "GRV-2024-MAN-001",
      title: "Water Supply Issue - Irregular Timing", 
      status: "Open", 
      priority: "High", 
      place: "Jaipur",
      village: "Jaipur",
      mandal: "Jaipur",
      district: "Peddapalli",
      requesterName: "Smt. Kamala Devi",
      requesterPhone: "+91-9876543210",
      requesterAddress: "H.No 12-34, Jaipur Village",
      description: "Water supply is irregular, only 2 hours per day instead of promised 6 hours. Affecting 50+ families.",
      category: "Infrastructure",
      subcategory: "Water Supply",
      assignedFieldOfficer: "Field Officer Ramesh",
      assignedPAOfficer: "PA Srinivas",
      createdDate: "2024-01-10",
      daysOpen: 5,
      estimatedCost: "₹2.5 Lakh",
      affectedFamilies: 52,
      images: ["water_tank_empty.jpg", "complaint_letter.jpg"],
      updates: [
        { date: "2024-01-10", update: "Grievance registered", officer: "PA Srinivas" },
        { date: "2024-01-12", update: "Site inspection scheduled", officer: "Field Officer Ramesh" }
      ]
    },
    { 
      id: 2, 
      referenceNumber: "GRV-2024-GOD-002",
      title: "Road Repair Needed - Potholes", 
      status: "In Progress", 
      priority: "Medium", 
      place: "Godavarikhani",
      village: "Godavarikhani",
      mandal: "Godavarikhani",
      district: "Peddapalli",
      requesterName: "Sri. Venkat Reddy",
      requesterPhone: "+91-9876543211",
      requesterAddress: "Main Road, Godavarikhani",
      description: "Multiple potholes on main road causing vehicle damage and accidents. Urgent repair needed.",
      category: "Infrastructure",
      subcategory: "Roads",
      assignedFieldOfficer: "Field Officer Priya",
      assignedPAOfficer: "PA Rajesh",
      createdDate: "2024-01-05",
      daysInProgress: 10,
      estimatedCost: "₹1.2 Lakh",
      affectedArea: "2 KM stretch",
      images: ["pothole_damage.jpg", "road_condition.jpg"],
      updates: [
        { date: "2024-01-05", update: "Grievance registered", officer: "PA Rajesh" },
        { date: "2024-01-08", update: "Site inspected, estimate prepared", officer: "Field Officer Priya" },
        { date: "2024-01-12", update: "Work order issued", officer: "PA Rajesh" }
      ]
    },
    { 
      id: 3, 
      referenceNumber: "GRV-2024-SUL-003",
      title: "Electricity Problem - Frequent Outages", 
      status: "Resolved", 
      priority: "Low", 
      place: "Sultanabad",
      village: "Sultanabad",
      mandal: "Sultanabad",
      district: "Peddapalli",
      requesterName: "Sri. Ravi Kumar",
      requesterPhone: "+91-9876543212",
      requesterAddress: "Colony Road, Sultanabad",
      description: "Frequent power cuts lasting 4-6 hours daily. Transformer issues suspected.",
      category: "Utilities",
      subcategory: "Electricity",
      assignedFieldOfficer: "Field Officer Madhavi",
      assignedPAOfficer: "PA Srinivas",
      createdDate: "2023-12-20",
      resolvedDate: "2024-01-08",
      daysToResolve: 19,
      resolution: "Transformer replaced, power supply stabilized",
      resolutionCost: "₹85,000",
      images: ["old_transformer.jpg", "new_transformer.jpg"],
      updates: [
        { date: "2023-12-20", update: "Grievance registered", officer: "PA Srinivas" },
        { date: "2023-12-22", update: "Technical team inspection", officer: "Field Officer Madhavi" },
        { date: "2024-01-05", update: "New transformer ordered", officer: "PA Srinivas" },
        { date: "2024-01-08", update: "Transformer installed, issue resolved", officer: "Field Officer Madhavi" }
      ]
    }
  ],
  calendarEvents: [
    { 
      id: 1, 
      title: "Public Meeting - Water Issues", 
      date: "2024-01-15", 
      time: "10:00 AM", 
      endTime: "12:00 PM",
      place: "Manthanani Town Hall",
      type: "meeting",
      color: "bg-blue-500",
      priority: "High",
      attendees: 150,
      canDelegate: true,
      delegatedTo: null,
      agenda: "Discuss water supply issues in Jaipur and surrounding areas",
      relatedGrievances: ["GRV-2024-MAN-001"]
    },
    { 
      id: 2, 
      title: "Project Inspection - PHC", 
      date: "2024-01-16", 
      time: "2:00 PM", 
      endTime: "4:00 PM",
      place: "Ramagundam PHC",
      type: "inspection",
      color: "bg-green-500",
      priority: "Medium",
      canDelegate: true,
      delegatedTo: "PA Srinivas",
      agenda: "Final inspection of completed PHC upgrade project",
      relatedProjects: [2]
    },
    { 
      id: 3, 
      title: "Grievance Hearing", 
      date: "2024-01-17", 
      time: "11:00 AM", 
      endTime: "1:00 PM",
      place: "Collectorate",
      type: "hearing",
      color: "bg-red-500",
      priority: "High",
      canDelegate: false,
      agenda: "Weekly grievance hearing session",
      expectedGrievances: 25
    },
    { 
      id: 4, 
      title: "Marriage Inauguration", 
      date: "2024-01-18", 
      time: "6:00 PM", 
      endTime: "8:00 PM",
      place: "Community Hall, Pegadapally",
      type: "inauguration",
      color: "bg-pink-500",
      priority: "Low",
      canDelegate: true,
      delegatedTo: null,
      agenda: "Community marriage program inauguration"
    },
    { 
      id: 5, 
      title: "Press Meet - Development Updates", 
      date: "2024-01-19", 
      time: "11:00 AM", 
      endTime: "12:00 PM",
      place: "Press Club, Peddapalli",
      type: "press",
      color: "bg-purple-500",
      priority: "High",
      canDelegate: false,
      agenda: "Quarterly development progress announcement"
    }
  ],
  teamMembers: [
    { id: 1, name: "PA Srinivas", role: "Personal Assistant", phone: "+91-9876543220", available: true },
    { id: 2, name: "PA Rajesh", role: "Personal Assistant", phone: "+91-9876543221", available: true },
    { id: 3, name: "Field Officer Ramesh", role: "Field Officer", phone: "+91-9876543222", available: false },
    { id: 4, name: "Field Officer Priya", role: "Field Officer", phone: "+91-9876543223", available: true },
    { id: 5, name: "Field Officer Madhavi", role: "Field Officer", phone: "+91-9876543224", available: true }
  ]
}

export default function ManthananiDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [selectedPlace, setSelectedPlace] = useState<any>(null)
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [selectedGrievance, setSelectedGrievance] = useState<any>(null)
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [activeView, setActiveView] = useState("dashboard")
  const [showDelegationModal, setShowDelegationModal] = useState(false)
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [loading, setLoading] = useState(false)
  const [dashboardData, setDashboardData] = useState<any>(mockData)
  const [projects, setProjects] = useState<any[]>([])
  const [grievances, setGrievances] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [places, setPlaces] = useState<any[]>([])
  const [filters, setFilters] = useState({ place: '', status: '', priority: '' })
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table')

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed": case "resolved": return "bg-green-100 text-green-800"
      case "in progress": case "in-progress": return "bg-blue-100 text-blue-800"
      case "planning": case "open": return "bg-yellow-100 text-yellow-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high": return "bg-red-100 text-red-800"
      case "medium": return "bg-yellow-100 text-yellow-800"
      case "low": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  // Fetch data from APIs
  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const [dashboardRes, projectsRes, grievancesRes, eventsRes, placesRes] = await Promise.all([
        fetch('/api/minister/dashboard'),
        fetch('/api/minister/projects'),
        fetch('/api/minister/grievances'),
        fetch('/api/minister/events'),
        fetch('/api/minister/places')
      ])

      if (dashboardRes.ok) {
        const data = await dashboardRes.json()
        setDashboardData(data)
      }
      if (projectsRes.ok) {
        const data = await projectsRes.json()
        setProjects(data)
      }
      if (grievancesRes.ok) {
        const data = await grievancesRes.json()
        setGrievances(data)
      }
      if (eventsRes.ok) {
        const data = await eventsRes.json()
        setEvents(data)
      }
      if (placesRes.ok) {
        const data = await placesRes.json()
        setPlaces(data)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchFilteredData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.place) params.append('place', filters.place)
      if (filters.status) params.append('status', filters.status)
      if (filters.priority) params.append('priority', filters.priority)

      const [projectsRes, grievancesRes] = await Promise.all([
        fetch(`/api/minister/projects?${params}`),
        fetch(`/api/minister/grievances?${params}`)
      ])

      if (projectsRes.ok) {
        const data = await projectsRes.json()
        setProjects(data)
      }
      if (grievancesRes.ok) {
        const data = await grievancesRes.json()
        setGrievances(data)
      }
    } catch (error) {
      console.error('Failed to fetch filtered data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  useEffect(() => {
    if (filters.place || filters.status || filters.priority) {
      fetchFilteredData()
    }
  }, [filters])

  // Filter and paginate data
  const getFilteredData = (data: any[]) => {
    let filtered = data
    
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.requesterName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.village?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    return filtered
  }

  const getPaginatedData = (data: any[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return data.slice(startIndex, endIndex)
  }

  const getTotalPages = (data: any[]) => {
    return Math.ceil(data.length / itemsPerPage)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white shadow-lg transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b">
          <div className="flex items-center space-x-3">
            <Image src="/telangana-logo.png" alt="Telangana" width={40} height={40} />
            {sidebarOpen && (
              <div>
                <h2 className="font-bold text-lg text-blue-900">Telangana Govt</h2>
                <p className="text-xs text-gray-600">Minister Dashboard</p>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {[
              { id: "dashboard", label: "Dashboard", icon: BarChart3 },
              { id: "overview", label: "Constituency", icon: MapPin },
              { id: "projects", label: "Projects", icon: Building2 },
              { id: "grievances", label: "Grievances", icon: FileText },
              { id: "schedule", label: "Schedule", icon: CalendarIcon },
              { id: "map", label: "Map View", icon: MapPin },
              { id: "reports", label: "Reports", icon: BarChart3 }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  activeView === item.id ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            ))}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)}>
                <Menu className="w-5 h-5" />
              </Button>
              
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input placeholder="Search projects, grievances, places..." className="pl-10 w-96" />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">5</span>
              </Button>

              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarFallback>RK</AvatarFallback>
                </Avatar>
                <div className="text-right">
                  <p className="font-medium">{mockData.minister.name}</p>
                  <p className="text-sm text-gray-600">{mockData.minister.constituency} Constituency</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-6 overflow-auto bg-gray-50">
          {loading && (
            <div className="fixed top-4 right-4 z-50">
              <div className="bg-white p-3 rounded-lg shadow-lg flex items-center space-x-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading...</span>
              </div>
            </div>
          )}

          {/* Filters Bar */}
          {(activeView === "projects" || activeView === "grievances") && (
            <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium">Filters:</span>
                  </div>
                <select 
                  value={filters.place} 
                  onChange={(e) => setFilters({...filters, place: e.target.value})}
                  className="px-3 py-1 border rounded text-sm"
                >
                  <option value="">All Places</option>
                  {(places.length > 0 ? places : mockData.places).map(place => (
                    <option key={place.id} value={place.name}>{place.name}</option>
                  ))}
                </select>
                <select 
                  value={filters.status} 
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="px-3 py-1 border rounded text-sm"
                >
                  <option value="">All Status</option>
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="RESOLVED">Resolved</option>
                </select>
                {activeView === "grievances" && (
                  <select 
                    value={filters.priority} 
                    onChange={(e) => setFilters({...filters, priority: e.target.value})}
                    className="px-3 py-1 border rounded text-sm"
                  >
                    <option value="">All Priority</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                )}
                <Button size="sm" variant="outline" onClick={() => setFilters({ place: '', status: '', priority: '' })}>
                  Clear Filters
                </Button>
                  <Button size="sm" variant="outline" onClick={fetchDashboardData}>
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Refresh
                  </Button>
                </div>
                
                {(activeView === "projects" || activeView === "grievances") && (
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input 
                        placeholder={`Search ${activeView}...`} 
                        className="pl-10 w-64" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="flex border rounded">
                      <Button 
                        size="sm" 
                        variant={viewMode === 'table' ? 'default' : 'ghost'}
                        onClick={() => setViewMode('table')}
                        className="rounded-r-none"
                      >
                        Table
                      </Button>
                      <Button 
                        size="sm" 
                        variant={viewMode === 'cards' ? 'default' : 'ghost'}
                        onClick={() => setViewMode('cards')}
                        className="rounded-l-none"
                      >
                        Cards
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}



          {activeView === "dashboard" && (
            <div className="space-y-6">
              {/* Enhanced Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-l-4 border-l-blue-500" onClick={() => setActiveView("projects")}>
                  <CardContent className="p-6 bg-gradient-to-br from-blue-50 to-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Projects</p>
                        <p className="text-3xl font-bold text-blue-600">{dashboardData.summary?.totalProjects || mockData.summary.totalProjects}</p>
                      </div>
                      <Building2 className="w-8 h-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-l-4 border-l-green-500" onClick={() => setActiveView("grievances")}>
                  <CardContent className="p-6 bg-gradient-to-br from-green-50 to-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Grievances</p>
                        <p className="text-3xl font-bold text-green-600">{dashboardData.summary?.totalGrievances || mockData.summary.totalGrievances}</p>
                      </div>
                      <FileText className="w-8 h-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-l-4 border-l-orange-500">
                  <CardContent className="p-6 bg-gradient-to-br from-orange-50 to-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Pending Actions</p>
                        <p className="text-3xl font-bold text-orange-600">{dashboardData.summary?.pendingActions || mockData.summary.pendingActions}</p>
                      </div>
                      <Clock className="w-8 h-8 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-l-4 border-l-purple-500" onClick={() => setActiveView("schedule")}>
                  <CardContent className="p-4 bg-gradient-to-br from-purple-50 to-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Upcoming Events</p>
                        <p className="text-2xl font-bold text-purple-600">{events.length || mockData.summary.upcomingEvents}</p>
                      </div>
                      <CalendarIcon className="w-6 h-6 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-l-4 border-l-red-500 bg-red-50">
                  <CardContent className="p-4 bg-gradient-to-br from-red-50 to-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-red-600">Critical Issues</p>
                        <p className="text-2xl font-bold text-red-700">{dashboardData.summary?.criticalIssues || mockData.summary.criticalIssues}</p>
                      </div>
                      <AlertTriangle className="w-6 h-6 text-red-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Interactive Map & Places */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MapPin className="w-5 h-5" />
                      <span>Constituency Map</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg relative overflow-hidden border-2 border-green-200">
                      <div className="absolute inset-0">
                        <div className="absolute top-4 left-4 text-xs font-bold text-green-800">TELANGANA STATE</div>
                        <div className="absolute top-8 left-4 text-xs text-green-600">Peddapalli District</div>
                        <div className="absolute bottom-4 right-4 text-xs text-blue-600">Manthanani Constituency</div>
                      </div>
                      
                      {(places.length > 0 ? places : mockData.places).map((place, index) => {
                        const hasIssues = mockData.grievances.filter(g => g.place === place.name && g.status === 'Open').length > 0
                        const hasProjects = mockData.projects.filter(p => p.place === place.name).length > 0
                        return (
                          <div
                            key={place.id}
                            className={`absolute w-6 h-6 rounded-full cursor-pointer transition-all hover:scale-125 flex items-center justify-center text-white text-xs font-bold ${
                              hasIssues ? 'bg-red-500 animate-pulse' : hasProjects ? 'bg-blue-500' : 'bg-green-500'
                            }`}
                            style={{
                              left: `${15 + (index * 12)}%`,
                              top: `${25 + (index * 8)}%`
                            }}
                            onClick={() => setSelectedPlace(place)}
                            title={`${place.name} - ${place.projects} projects, ${place.grievances} grievances`}
                          >
                            {place.grievances}
                          </div>
                        )
                      })}
                      
                      <div className="absolute bottom-2 left-2 bg-white bg-opacity-90 p-2 rounded text-xs">
                        <div className="flex items-center space-x-1 mb-1">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <span>Issues</span>
                        </div>
                        <div className="flex items-center space-x-1 mb-1">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span>Projects</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span>Normal</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Places Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-80 overflow-auto">
                      {(places.length > 0 ? places : mockData.places).map((place) => (
                        <div
                          key={place.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                          onClick={() => setSelectedPlace(place)}
                        >
                          <div>
                            <p className="font-medium">{place.name}</p>
                            <p className="text-sm text-gray-600">
                              {place.projects} projects, {place.grievances} grievances
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Projects</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(projects.length > 0 ? projects : mockData.projects).slice(0, 3).map((project) => (
                        <div key={project.id} className="border-l-4 border-blue-500 pl-4 cursor-pointer hover:bg-gray-50 p-2 rounded"
                             onClick={() => setSelectedProject(project)}>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{project.name}</h4>
                            <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{project.place} • {project.budget}</p>
                          <div className="flex items-center space-x-2">
                            <Progress value={project.progress} className="flex-1" />
                            <span className="text-sm font-medium">{project.progress}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Grievances</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(grievances.length > 0 ? grievances : mockData.grievances).slice(0, 3).map((grievance) => (
                        <div key={grievance.id} className="border-l-4 border-red-500 pl-4 cursor-pointer hover:bg-gray-50 p-2 rounded"
                             onClick={() => setSelectedGrievance(grievance)}>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-sm">{grievance.title}</h4>
                            <div className="flex space-x-1">
                              <Badge className={getPriorityColor(grievance.priority)} variant="outline">{grievance.priority}</Badge>
                              <Badge className={getStatusColor(grievance.status)}>{grievance.status}</Badge>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 mb-1">{grievance.referenceNumber}</p>
                          <p className="text-xs text-gray-600 mb-1">By: {grievance.requesterName} from {grievance.place}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeView === "schedule" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Schedule & Calendar</h2>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Event
                </Button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>January 2024</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-7 gap-2 text-center text-sm mb-4">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="p-2 font-semibold text-gray-700">{day}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                      {Array.from({length: 31}, (_, i) => {
                        const day = i + 1
                        const hasEvent = (events.length > 0 ? events : mockData.calendarEvents).some(event => 
                          new Date(event.date).getDate() === day
                        )
                        const isToday = day === 15
                        return (
                          <div 
                            key={day} 
                            className={`p-3 text-center cursor-pointer rounded-lg border transition-colors ${
                              isToday ? 'bg-blue-500 text-white border-blue-500' : 
                              hasEvent ? 'bg-green-100 border-green-300 hover:bg-green-200' :
                              'hover:bg-gray-100 border-gray-200'
                            }`}
                            onClick={() => {
                              const dayEvents = (events.length > 0 ? events : mockData.calendarEvents).filter(event => 
                                new Date(event.date).getDate() === day
                              )
                              if (dayEvents.length > 0) {
                                setSelectedEvent(dayEvents[0])
                              }
                            }}
                          >
                            <span className="text-sm font-medium">{day}</span>
                            {hasEvent && (
                              <div className="w-1 h-1 bg-current rounded-full mx-auto mt-1"></div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Events</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-96 overflow-auto">
                      {(events.length > 0 ? events : mockData.calendarEvents).map((event) => (
                        <div 
                          key={event.id} 
                          className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => setSelectedEvent(event)}
                        >
                          <h4 className="font-medium text-sm">{event.title}</h4>
                          <p className="text-xs text-gray-600">{event.date}</p>
                          <p className="text-xs text-gray-600">{event.time} - {event.endTime}</p>
                          <p className="text-xs text-gray-500">{event.place}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeView === "projects" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">All Projects</h2>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Project
                </Button>
              </div>
              
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-left p-4 font-semibold">Project Name</th>
                          <th className="text-left p-4 font-semibold">Village</th>
                          <th className="text-left p-4 font-semibold">Budget</th>
                          <th className="text-left p-4 font-semibold">Progress</th>
                          <th className="text-left p-4 font-semibold">Status</th>
                          <th className="text-left p-4 font-semibold">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(projects.length > 0 ? projects : mockData.projects).map((project, index) => (
                          <tr key={project.id} className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                            <td className="p-4">
                              <p className="font-medium text-sm">{project.name}</p>
                            </td>
                            <td className="p-4">
                              <span className="text-sm">{project.village}</span>
                            </td>
                            <td className="p-4">
                              <p className="text-sm font-medium">{project.budget}</p>
                            </td>
                            <td className="p-4">
                              <div className="w-20">
                                <Progress value={project.progress} className="h-2" />
                                <span className="text-xs">{project.progress}%</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
                            </td>
                            <td className="p-4">
                              <Button size="sm" variant="ghost" onClick={() => setSelectedProject(project)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}