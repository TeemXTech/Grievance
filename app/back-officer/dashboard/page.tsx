"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileText, Building2, BarChart3, Clock, Plus, Download, Search, Edit, Check, X, ArrowLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function BackOfficerDashboard() {
  const [activeView, setActiveView] = useState("dashboard")
  const [dataType, setDataType] = useState("grievances")
  const [filterType, setFilterType] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [editingItem, setEditingItem] = useState(null)
  const [editForm, setEditForm] = useState({})

  // Expanded mock data
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
      assignedTo: "PA Srinivas"
    },
    {
      id: 3, trackingNumber: "GRI-E-67-06012025", title: "School Building Repair", category: "Education",
      status: "Resolved", priority: "Medium", citizenName: "Ravi Kumar", citizenPhone: "+91-9876543212",
      location: "Karimnagar", description: "School roof needs repair", createdAt: "2025-01-06",
      assignedTo: "Engineer Kumar"
    },
    {
      id: 4, trackingNumber: "GRI-H-89-05012025", title: "Hospital Equipment", category: "Health",
      status: "Pending", priority: "High", citizenName: "Lakshmi Reddy", citizenPhone: "+91-9876543213",
      location: "Warangal", description: "Medical equipment not working", createdAt: "2025-01-05",
      assignedTo: "Dr. Sharma"
    },
    {
      id: 5, trackingNumber: "GRI-I-12-04012025", title: "Street Light Issue", category: "Infrastructure",
      status: "In Progress", priority: "Low", citizenName: "Suresh Babu", citizenPhone: "+91-9876543214",
      location: "Nizamabad", description: "Street lights not working", createdAt: "2025-01-04",
      assignedTo: "Field Officer Ramesh"
    }
  ]

  const mockProjects = [
    {
      id: 1, projectNumber: "PRJ-I-12-08012025", name: "Bridge Construction", category: "Infrastructure",
      status: "In Progress", budget: "₹50 Lakh", location: "Manthanani", 
      description: "New bridge construction", createdAt: "2025-01-08", assignedTo: "Engineer Kumar"
    },
    {
      id: 2, projectNumber: "PRJ-H-34-07012025", name: "Hospital Upgrade", category: "Health",
      status: "Planning", budget: "₹2 Crore", location: "Ramagundam", 
      description: "Hospital facilities upgrade", createdAt: "2025-01-07", assignedTo: "Dr. Sharma"
    },
    {
      id: 3, projectNumber: "PRJ-E-56-05012025", name: "School Construction", category: "Education",
      status: "Completed", budget: "₹1 Crore", location: "Karimnagar", 
      description: "New school building", createdAt: "2025-01-05", assignedTo: "Engineer Reddy"
    },
    {
      id: 4, projectNumber: "PRJ-W-78-04012025", name: "Water Tank Installation", category: "Water",
      status: "In Progress", budget: "₹25 Lakh", location: "Warangal", 
      description: "New water storage tank", createdAt: "2025-01-04", assignedTo: "Engineer Prasad"
    },
    {
      id: 5, projectNumber: "PRJ-I-90-03012025", name: "Road Widening", category: "Infrastructure",
      status: "Planning", budget: "₹75 Lakh", location: "Nizamabad", 
      description: "Main road widening project", createdAt: "2025-01-03", assignedTo: "Engineer Kumar"
    }
  ]

  const dashboardStats = {
    totalGrievances: mockGrievances.length,
    totalProjects: mockProjects.length,
    pendingGrievances: mockGrievances.filter(g => g.status === 'Pending').length,
    pendingProjects: mockProjects.filter(p => p.status === 'Planning').length,
    todaysEntries: 2
  }

  const getFilteredData = () => {
    const data = dataType === 'grievances' ? mockGrievances : mockProjects
    let filtered = data

    if (filterType === 'pending') {
      filtered = data.filter(item => item.status === 'Pending' || item.status === 'Planning')
    } else if (filterType === 'resolved') {
      filtered = data.filter(item => item.status === 'Resolved' || item.status === 'Completed')
    } else if (filterType === 'inprogress') {
      filtered = data.filter(item => item.status === 'In Progress')
    }

    if (searchTerm) {
      filtered = filtered.filter(item => 
        (item.title || item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.citizenName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.trackingNumber || item.projectNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return filtered
  }

  const handleCardClick = (type, filter = 'all') => {
    setDataType(type)
    setFilterType(filter)
    setActiveView('list')
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

  const startEdit = (item, type) => {
    setEditingItem({id: item.id, type})
    setEditForm(item)
  }

  const saveEdit = () => {
    alert(`${editingItem.type} updated successfully!`)
    setEditingItem(null)
    setEditForm({})
  }

  const cancelEdit = () => {
    setEditingItem(null)
    setEditForm({})
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Back Officer Dashboard</h1>
              <p className="text-gray-600">Data Entry & Project Management</p>
            </div>
            <div className="flex space-x-2">
              {activeView === 'list' && (
                <Button onClick={() => setActiveView('dashboard')}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              )}
              <Button 
                variant={activeView === 'dashboard' ? 'default' : 'outline'}
                onClick={() => setActiveView('dashboard')}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-l-4 border-l-blue-500" 
                    onClick={() => handleCardClick('grievances', 'all')}>
                <CardContent className="p-6 bg-gradient-to-br from-blue-50 to-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Grievances</p>
                      <p className="text-3xl font-bold text-blue-600">{dashboardStats.totalGrievances}</p>
                    </div>
                    <FileText className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-l-4 border-l-green-500" 
                    onClick={() => handleCardClick('projects', 'all')}>
                <CardContent className="p-6 bg-gradient-to-br from-green-50 to-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Projects</p>
                      <p className="text-3xl font-bold text-green-600">{dashboardStats.totalProjects}</p>
                    </div>
                    <Building2 className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-l-4 border-l-orange-500" 
                    onClick={() => handleCardClick(dataType, 'pending')}>
                <CardContent className="p-6 bg-gradient-to-br from-orange-50 to-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending Items</p>
                      <p className="text-3xl font-bold text-orange-600">{dashboardStats.pendingGrievances + dashboardStats.pendingProjects}</p>
                    </div>
                    <Clock className="w-8 h-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-l-4 border-l-purple-500">
                <CardContent className="p-6 bg-gradient-to-br from-purple-50 to-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Today's Entries</p>
                      <p className="text-3xl font-bold text-purple-600">{dashboardStats.todaysEntries}</p>
                    </div>
                    <Plus className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Grievances</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockGrievances.slice(0, 3).map((grievance) => (
                      <div key={grievance.id} className="border-l-4 border-blue-500 pl-4 cursor-pointer hover:bg-gray-50 p-2 rounded">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{grievance.title}</h4>
                          <Badge className={grievance.status === 'Resolved' ? 'bg-green-100 text-green-800' : grievance.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}>
                            {grievance.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{grievance.trackingNumber}</p>
                        <p className="text-sm text-gray-600">{grievance.location}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Projects</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockProjects.slice(0, 3).map((project) => (
                      <div key={project.id} className="border-l-4 border-green-500 pl-4 cursor-pointer hover:bg-gray-50 p-2 rounded">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{project.name}</h4>
                          <Badge className={project.status === 'Completed' ? 'bg-green-100 text-green-800' : project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}>
                            {project.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{project.projectNumber}</p>
                        <p className="text-sm text-gray-600">{project.location} • {project.budget}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeView === 'list' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="flex space-x-2">
                  <Button variant={dataType === 'grievances' ? 'default' : 'outline'} 
                          onClick={() => setDataType('grievances')}>
                    <FileText className="w-4 h-4 mr-2" />Grievances
                  </Button>
                  <Button variant={dataType === 'projects' ? 'default' : 'outline'} 
                          onClick={() => setDataType('projects')}>
                    <Building2 className="w-4 h-4 mr-2" />Projects
                  </Button>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant={filterType === 'all' ? 'default' : 'outline'} 
                          onClick={() => setFilterType('all')}>All</Button>
                  <Button size="sm" variant={filterType === 'pending' ? 'default' : 'outline'} 
                          onClick={() => setFilterType('pending')}>Pending</Button>
                  <Button size="sm" variant={filterType === 'inprogress' ? 'default' : 'outline'} 
                          onClick={() => setFilterType('inprogress')}>In Progress</Button>
                  <Button size="sm" variant={filterType === 'resolved' ? 'default' : 'outline'} 
                          onClick={() => setFilterType('resolved')}>Resolved</Button>
                </div>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <Input placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 w-64" />
                </div>
              </div>
              <Button onClick={() => downloadExcel(getFilteredData(), dataType)}>
                <Download className="w-4 h-4 mr-2" />Download Excel
              </Button>
            </div>

            <Card>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>S.No</TableHead>
                      <TableHead>{dataType === 'grievances' ? 'Tracking Number' : 'Project Number'}</TableHead>
                      <TableHead>{dataType === 'grievances' ? 'Title' : 'Project Name'}</TableHead>
                      {dataType === 'grievances' && <TableHead>Citizen Name</TableHead>}
                      <TableHead>Location</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getFilteredData().map((item, index) => (
                      <TableRow key={item.id} className="hover:bg-gray-50">
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">{item.trackingNumber || item.projectNumber}</TableCell>
                        <TableCell>{item.title || item.name}</TableCell>
                        {dataType === 'grievances' && <TableCell>{item.citizenName}</TableCell>}
                        <TableCell>{item.location}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>
                          {editingItem?.id === item.id ? (
                            <Select value={editForm.status} onValueChange={(value) => setEditForm({...editForm, status: value})}>
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="In Progress">In Progress</SelectItem>
                                <SelectItem value="Resolved">Resolved</SelectItem>
                                {dataType === 'projects' && <SelectItem value="Planning">Planning</SelectItem>}
                                {dataType === 'projects' && <SelectItem value="Completed">Completed</SelectItem>}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge className={item.status === 'Resolved' || item.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                                            item.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}>
                              {item.status}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingItem?.id === item.id ? (
                            <Select value={editForm.assignedTo} onValueChange={(value) => setEditForm({...editForm, assignedTo: value})}>
                              <SelectTrigger className="w-40">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Field Officer Ramesh">Field Officer Ramesh</SelectItem>
                                <SelectItem value="PA Srinivas">PA Srinivas</SelectItem>
                                <SelectItem value="Engineer Kumar">Engineer Kumar</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            item.assignedTo
                          )}
                        </TableCell>
                        <TableCell>
                          {editingItem?.id === item.id ? (
                            <div className="flex space-x-1">
                              <Button size="sm" onClick={saveEdit}>
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={cancelEdit}>
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <Button size="sm" variant="outline" onClick={() => startEdit(item, dataType)}>
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
    </div>
  )
}