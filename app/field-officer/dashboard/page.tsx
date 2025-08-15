"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Building2, BarChart3, Clock, Plus, Download, Languages, Search, Edit, Check, X, ArrowLeft, MapPin, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function FieldOfficerDashboard() {
  const [activeView, setActiveView] = useState("dashboard")
  const [dataType, setDataType] = useState("grievances")
  const [filterType, setFilterType] = useState("all")
  const [language, setLanguage] = useState("en")
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [showFilteredList, setShowFilteredList] = useState(false)

  const translations = {
    en: {
      dashboard: "Dashboard", grievances: "Grievances", assignments: "Assignments", fieldWork: "Field Work",
      totalGrievances: "Total Grievances", pendingGrievances: "Pending Grievances", 
      resolvedGrievances: "Resolved Grievances", highPriority: "High Priority",
      all: "All", pending: "Pending", resolved: "Resolved", inProgress: "In Progress",
      addNew: "Add New", download: "Download Excel", search: "Search...", 
      trackingNumber: "Tracking Number", citizenName: "Citizen Name", 
      phone: "Phone", location: "Location", category: "Category", status: "Status", 
      assignedTo: "Assigned To", createdAt: "Created Date", save: "Save", cancel: "Cancel",
      backToDashboard: "Back to Dashboard", serialNo: "S.No", priority: "Priority",
      myAssignments: "My Assignments", fieldVisits: "Field Visits", visitDate: "Visit Date", visitTime: "Visit Time"
    },
    te: {
      dashboard: "డ్యాష్బోర్డ్", grievances: "ఫిర్యాదులు", assignments: "అసైన్మెంట్లు", fieldWork: "ఫీల్డ్ వర్క్",
      totalGrievances: "మొత్తం ఫిర్యాదులు", pendingGrievances: "పెండింగ్ ఫిర్యాదులు",
      resolvedGrievances: "పరిష్కరించిన ఫిర్యాదులు", highPriority: "అధిక ప్రాధాన్యత",
      all: "అన్నీ", pending: "పెండింగ్", resolved: "పరిష్కరించబడింది", inProgress: "ప్రగతిలో",
      addNew: "కొత్తది జోడించు", download: "ఎక్సెల్ డౌన్లోడ్", search: "వెతకండి...",
      trackingNumber: "ట్రాకింగ్ నంబర్", citizenName: "పౌరుడి పేరు",
      phone: "ఫోన్", location: "స్థానం", category: "వర్గం", status: "స్థితి",
      assignedTo: "కేటాయించబడింది", createdAt: "సృష్టించిన తేదీ", save: "సేవ్", cancel: "రద్దు",
      backToDashboard: "డ్యాష్బోర్డ్కు తిరిగి", serialNo: "క్రమ సంఖ్య", priority: "ప్రాధాన్యత",
      myAssignments: "నా అసైన్మెంట్లు", fieldVisits: "ఫీల్డ్ విజిట్లు", visitDate: "విజిట్ తేదీ", visitTime: "విజిట్ సమయం"
    }
  }

  const t = translations[language]

  const mockGrievances = [
    {
      id: 1, trackingNumber: "GRI-I-23-08012025", title: "Road Repair Needed", category: "Infrastructure",
      status: "Pending", priority: "High", citizenName: "Rajesh Kumar", citizenPhone: "+91-9876543210",
      location: "Manthanani Village", description: "Main road has multiple potholes", createdAt: "2025-01-08",
      assignedTo: "Field Officer Ramesh"
    },
    {
      id: 2, trackingNumber: "GRI-H-45-07012025", title: "Water Supply Issue", category: "Water",
      status: "In Progress", priority: "Medium", citizenName: "Sita Devi", citizenPhone: "+91-9876543211",
      location: "Ramagundam", description: "Irregular water supply", createdAt: "2025-01-07",
      assignedTo: "Field Officer Ramesh"
    },
    {
      id: 3, trackingNumber: "GRI-E-67-06012025", title: "School Building Repair", category: "Education",
      status: "Resolved", priority: "Medium", citizenName: "Ravi Kumar", citizenPhone: "+91-9876543212",
      location: "Karimnagar", description: "School roof needs repair", createdAt: "2025-01-06",
      assignedTo: "Field Officer Ramesh"
    }
  ]

  const mockAssignments = [
    { id: 1, trackingNumber: "GRI-I-23-08012025", title: "Road Repair Inspection", location: "Manthanani Village", priority: "High", dueDate: "2025-01-10" },
    { id: 2, trackingNumber: "GRI-H-45-07012025", title: "Water Supply Check", location: "Ramagundam", priority: "Medium", dueDate: "2025-01-12" }
  ]

  const mockFieldVisits = [
    { id: 1, location: "Manthanani Village", purpose: "Road Inspection", date: "2025-01-09", time: "10:00 AM", status: "Scheduled" },
    { id: 2, location: "Ramagundam", purpose: "Water Supply Assessment", date: "2025-01-11", time: "2:00 PM", status: "Completed" }
  ]

  const dashboardStats = {
    totalGrievances: mockGrievances.length,
    pendingGrievances: mockGrievances.filter(g => g.status === 'Pending').length,
    resolvedGrievances: mockGrievances.filter(g => g.status === 'Resolved').length,
    highPriority: mockGrievances.filter(g => g.priority === 'High').length
  }

  const getFilteredData = () => {
    let filtered = mockGrievances

    if (filterType === 'pending') {
      filtered = mockGrievances.filter(item => item.status === 'Pending')
    } else if (filterType === 'resolved') {
      filtered = mockGrievances.filter(item => item.status === 'Resolved')
    } else if (filterType === 'inprogress') {
      filtered = mockGrievances.filter(item => item.status === 'In Progress')
    } else if (filterType === 'high') {
      filtered = mockGrievances.filter(item => item.priority === 'High')
    }

    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.citizenName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return filtered
  }

  const handleCardClick = (filter = 'all') => {
    setFilterType(filter)
    setShowFilteredList(true)
  }

  const downloadExcel = (data, filename) => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      Object.keys(data[0]).join(",") + "\n" +
      data.map(row => Object.values(row).join(",")).join("\n")
    const link = document.createElement("a")
    link.setAttribute("href", encodeURI(csvContent))
    link.setAttribute("download", filename + ".csv")
    link.click()
  }

  const startEdit = (item) => {
    setEditingItem(item.id)
    setEditForm(item)
  }

  const saveEdit = () => {
    alert('Grievance updated successfully!')
    setEditingItem(null)
    setEditForm({})
  }

  const cancelEdit = () => {
    setEditingItem(null)
    setEditForm({})
  }

  if (selectedRecord) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Button onClick={() => setSelectedRecord(null)} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t.backToDashboard}
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">{selectedRecord.title}</h1>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-4">Details</h3>
                  <div className="space-y-2">
                    <p><strong>Tracking Number:</strong> {selectedRecord.trackingNumber}</p>
                    <p><strong>Category:</strong> {selectedRecord.category}</p>
                    <p><strong>Status:</strong> <Badge>{selectedRecord.status}</Badge></p>
                    <p><strong>Priority:</strong> <Badge className={selectedRecord.priority === 'High' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>{selectedRecord.priority}</Badge></p>
                    <p><strong>Location:</strong> {selectedRecord.location}</p>
                    <p><strong>Citizen:</strong> {selectedRecord.citizenName}</p>
                    <p><strong>Phone:</strong> {selectedRecord.citizenPhone}</p>
                    <p><strong>Assigned To:</strong> {selectedRecord.assignedTo}</p>
                    <p><strong>Created:</strong> {selectedRecord.createdAt}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-4">Description</h3>
                  <p className="text-gray-700">{selectedRecord.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Field Officer {t.dashboard}</h1>
              <p className="text-gray-600">Field Operations & Grievance Management</p>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-32">
                  <Languages className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="te">తెలుగు</SelectItem>
                </SelectContent>
              </Select>
              {showFilteredList && (
                <Button onClick={() => setShowFilteredList(false)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t.backToDashboard}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-l-4 border-l-blue-500" 
                    onClick={() => handleCardClick('all')}>
                <CardContent className="p-6 bg-gradient-to-br from-blue-50 to-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{t.totalGrievances}</p>
                      <p className="text-3xl font-bold text-blue-600">{dashboardStats.totalGrievances}</p>
                    </div>
                    <FileText className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-l-4 border-l-orange-500" 
                    onClick={() => handleCardClick('pending')}>
                <CardContent className="p-6 bg-gradient-to-br from-orange-50 to-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{t.pendingGrievances}</p>
                      <p className="text-3xl font-bold text-orange-600">{dashboardStats.pendingGrievances}</p>
                    </div>
                    <Clock className="w-8 h-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-l-4 border-l-green-500" 
                    onClick={() => handleCardClick('resolved')}>
                <CardContent className="p-6 bg-gradient-to-br from-green-50 to-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{t.resolvedGrievances}</p>
                      <p className="text-3xl font-bold text-green-600">{dashboardStats.resolvedGrievances}</p>
                    </div>
                    <Building2 className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-l-4 border-l-red-500" 
                    onClick={() => handleCardClick('high')}>
                <CardContent className="p-6 bg-gradient-to-br from-red-50 to-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{t.highPriority}</p>
                      <p className="text-3xl font-bold text-red-600">{dashboardStats.highPriority}</p>
                    </div>
                    <Plus className="w-8 h-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filtered List Section */}
            {showFilteredList && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <div className="flex space-x-2">
                      <Button size="sm" variant={filterType === 'all' ? 'default' : 'outline'} 
                              onClick={() => setFilterType('all')}>{t.all}</Button>
                      <Button size="sm" variant={filterType === 'pending' ? 'default' : 'outline'} 
                              onClick={() => setFilterType('pending')}>{t.pending}</Button>
                      <Button size="sm" variant={filterType === 'inprogress' ? 'default' : 'outline'} 
                              onClick={() => setFilterType('inprogress')}>{t.inProgress}</Button>
                      <Button size="sm" variant={filterType === 'resolved' ? 'default' : 'outline'} 
                              onClick={() => setFilterType('resolved')}>{t.resolved}</Button>
                      <Button size="sm" variant={filterType === 'high' ? 'default' : 'outline'} 
                              onClick={() => setFilterType('high')}>High Priority</Button>
                    </div>
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                      <Input placeholder={t.search} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 w-64" />
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={() => downloadExcel(getFilteredData(), 'grievances')}>
                      <Download className="w-4 h-4 mr-2" />{t.download}
                    </Button>
                    <Button onClick={() => setShowAddForm(!showAddForm)}>
                      <Plus className="w-4 h-4 mr-2" />{t.addNew}
                    </Button>
                  </div>
                </div>

                <Card>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t.serialNo}</TableHead>
                          <TableHead>{t.trackingNumber}</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>{t.citizenName}</TableHead>
                          <TableHead>{t.location}</TableHead>
                          <TableHead>{t.category}</TableHead>
                          <TableHead>{t.priority}</TableHead>
                          <TableHead>{t.status}</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getFilteredData().map((item, index) => (
                          <TableRow key={item.id} className="cursor-pointer hover:bg-gray-50" 
                                    onClick={() => setSelectedRecord(item)}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell className="font-medium">{item.trackingNumber}</TableCell>
                            <TableCell>{item.title}</TableCell>
                            <TableCell>{item.citizenName}</TableCell>
                            <TableCell>{item.location}</TableCell>
                            <TableCell>{item.category}</TableCell>
                            <TableCell>
                              <Badge className={item.priority === 'High' ? 'bg-red-100 text-red-800' : item.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}>
                                {item.priority}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {editingItem === item.id ? (
                                <Select value={editForm.status} onValueChange={(value) => setEditForm({...editForm, status: value})}>
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="In Progress">In Progress</SelectItem>
                                    <SelectItem value="Resolved">Resolved</SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Badge className={item.status === 'Resolved' ? 'bg-green-100 text-green-800' : 
                                                item.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}>
                                  {item.status}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              {editingItem === item.id ? (
                                <div className="flex space-x-1">
                                  <Button size="sm" onClick={saveEdit}>
                                    <Check className="w-4 h-4" />
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={cancelEdit}>
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              ) : (
                                <Button size="sm" variant="outline" onClick={() => startEdit(item)}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}



        {activeView === 'assignments' && (
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>{t.myAssignments}</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t.trackingNumber}</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>{t.location}</TableHead>
                      <TableHead>{t.priority}</TableHead>
                      <TableHead>Due Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockAssignments.map((assignment) => (
                      <TableRow key={assignment.id}>
                        <TableCell className="font-medium">{assignment.trackingNumber}</TableCell>
                        <TableCell>{assignment.title}</TableCell>
                        <TableCell>{assignment.location}</TableCell>
                        <TableCell>
                          <Badge className={assignment.priority === 'High' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
                            {assignment.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>{assignment.dueDate}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {activeView === 'fieldwork' && (
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>{t.fieldVisits}</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t.location}</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead>{t.visitDate}</TableHead>
                      <TableHead>{t.visitTime}</TableHead>
                      <TableHead>{t.status}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockFieldVisits.map((visit) => (
                      <TableRow key={visit.id}>
                        <TableCell className="font-medium">{visit.location}</TableCell>
                        <TableCell>{visit.purpose}</TableCell>
                        <TableCell>{visit.date}</TableCell>
                        <TableCell>{visit.time}</TableCell>
                        <TableCell>
                          <Badge className={visit.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                            {visit.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}