"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, Building2, BarChart3, Clock, Plus, Languages, Search, Grid, List } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Mock data
const mockGrievances = [
    {
      id: 1,
      trackingNumber: "GRI-I-23-08012025",
      title: "Road Repair Needed",
      category: "Infrastructure",
      status: "Pending",
      priority: "High",
      citizenName: "Rajesh Kumar",
      citizenPhone: "+91-9876543210",
      location: "Manthanani Village",
      description: "Main road has multiple potholes causing accidents",
      createdAt: "2025-01-08",
      assignedTo: "Field Officer Ramesh"
    },
    {
      id: 2,
      trackingNumber: "GRI-H-45-07012025",
      title: "Water Supply Issue",
      category: "Water",
      status: "In Progress",
      priority: "Medium",
      citizenName: "Sita Devi",
      citizenPhone: "+91-9876543211",
      location: "Ramagundam",
      description: "Irregular water supply for past 2 weeks",
      createdAt: "2025-01-07",
      assignedTo: "PA Srinivas"
    }
]

const mockProjects = [
    {
      id: 1,
      projectNumber: "PRJ-I-12-08012025",
      name: "Bridge Construction",
      category: "Infrastructure",
      status: "In Progress",
      budget: "₹50 Lakh",
      location: "Manthanani",
      description: "New bridge construction over river",
      createdAt: "2025-01-08",
      assignedTo: "Engineer Kumar"
    },
    {
      id: 2,
      projectNumber: "PRJ-H-34-07012025",
      name: "Hospital Upgrade",
      category: "Health",
      status: "Planning",
      budget: "₹2 Crore",
      location: "Ramagundam",
      description: "Upgrade existing hospital facilities",
      createdAt: "2025-01-07",
      assignedTo: "Dr. Sharma"
    }
]

const translations = {
  en: {
    dashboard: "Dashboard", grievances: "Grievances", projects: "Projects",
    totalGrievances: "Total Grievances", totalProjects: "Total Projects",
    pendingItems: "Pending Items", todaysEntries: "Today's Entries",
    addGrievance: "Add Grievance", addProject: "Add Project",
    grievanceTitle: "Grievance Title", projectName: "Project Name",
    category: "Category", citizenName: "Citizen Name", phone: "Phone",
    location: "Location", priority: "Priority", budget: "Budget",
    description: "Description", status: "Status", assignedTo: "Assigned To",
    createdAt: "Created Date", save: "Save", cancel: "Cancel",
    search: "Search...", cardView: "Card View", tableView: "Table View",
    trackingNumber: "Tracking Number", projectNumber: "Project Number"
  },
  te: {
    dashboard: "డ్యాష్బోర్డ్", grievances: "ఫిర్యాదులు", projects: "ప్రాజెక్టులు",
    totalGrievances: "మొత్తం ఫిర్యాదులు", totalProjects: "మొత్తం ప్రాజెక్టులు",
    pendingItems: "పెండింగ్ అంశాలు", todaysEntries: "నేటి ఎంట్రీలు",
    addGrievance: "ఫిర్యాదు జోడించు", addProject: "ప్రాజెక్ట్ జోడించు",
    grievanceTitle: "ఫిర్యాదు శీర్షిక", projectName: "ప్రాజెక్ట్ పేరు",
    category: "వర్గం", citizenName: "పౌరుడి పేరు", phone: "ఫోన్",
    location: "స్థానం", priority: "ప్రాధాన్యత", budget: "బడ్జెట్",
    description: "వివరణ", status: "స్థితి", assignedTo: "కేటాయించబడింది",
    createdAt: "సృష్టించిన తేదీ", save: "సేవ్", cancel: "రద్దు",
    search: "వెతకండి...", cardView: "కార్డ్ వ్యూ", tableView: "టేబుల్ వ్యూ",
    trackingNumber: "ట్రాకింగ్ నంబర్", projectNumber: "ప్రాజెక్ట్ నంబర్"
  }
}

export default function BackOfficerDashboard() {
  const [activeView, setActiveView] = useState("dashboard")
  const [selectedGrievance, setSelectedGrievance] = useState(null)
  const [selectedProject, setSelectedProject] = useState(null)
  const [showAddGrievance, setShowAddGrievance] = useState(false)
  const [showAddProject, setShowAddProject] = useState(false)
  const [grievances, setGrievances] = useState(mockGrievances)
  const [projects, setProjects] = useState(mockProjects)
  const [language, setLanguage] = useState("en")
  const [viewMode, setViewMode] = useState("card")
  const [searchTerm, setSearchTerm] = useState("")

  const t = translations[language]

  // Dashboard stats
  const dashboardStats = {
    totalGrievances: mockGrievances.length,
    totalProjects: mockProjects.length,
    pendingGrievances: mockGrievances.filter(g => g.status === 'Pending').length,
    inProgressProjects: mockProjects.filter(p => p.status === 'In Progress').length,
    completedItems: mockGrievances.filter(g => g.status === 'Resolved').length + mockProjects.filter(p => p.status === 'Completed').length,
    todaysEntries: 2
  }

  const filteredGrievances = grievances.filter(g => 
    g.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.citizenName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t.dashboard}</h1>
              <p className="text-gray-600">Data Entry & Project Management</p>
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
              <Button 
                variant={activeView === 'dashboard' ? 'default' : 'outline'}
                onClick={() => setActiveView('dashboard')}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                {t.dashboard}
              </Button>
              <Button 
                variant={activeView === 'grievances' ? 'default' : 'outline'}
                onClick={() => setActiveView('grievances')}
              >
                <FileText className="w-4 h-4 mr-2" />
                {t.grievances}
              </Button>
              <Button 
                variant={activeView === 'projects' ? 'default' : 'outline'}
                onClick={() => setActiveView('projects')}
              >
                <Building2 className="w-4 h-4 mr-2" />
                {t.projects}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === 'dashboard' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-l-4 border-l-blue-500" onClick={() => setActiveView('grievances')}>
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

              <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-l-4 border-l-green-500" onClick={() => setActiveView('projects')}>
                <CardContent className="p-6 bg-gradient-to-br from-green-50 to-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{t.totalProjects}</p>
                      <p className="text-3xl font-bold text-green-600">{dashboardStats.totalProjects}</p>
                    </div>
                    <Building2 className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-l-4 border-l-orange-500">
                <CardContent className="p-6 bg-gradient-to-br from-orange-50 to-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{t.pendingItems}</p>
                      <p className="text-3xl font-bold text-orange-600">{dashboardStats.pendingGrievances}</p>
                    </div>
                    <Clock className="w-8 h-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-l-4 border-l-purple-500">
                <CardContent className="p-6 bg-gradient-to-br from-purple-50 to-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{t.todaysEntries}</p>
                      <p className="text-3xl font-bold text-purple-600">{dashboardStats.todaysEntries}</p>
                    </div>
                    <Plus className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeView === 'grievances' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">{t.grievances} Management</h2>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <Input 
                    placeholder={t.search} 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    className="pl-10 w-64" 
                  />
                </div>
                <Button 
                  variant={viewMode === 'card' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('card')}
                >
                  <Grid className="w-4 h-4 mr-1" />
                  {t.cardView}
                </Button>
                <Button 
                  variant={viewMode === 'table' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                >
                  <List className="w-4 h-4 mr-1" />
                  {t.tableView}
                </Button>
                <Button onClick={() => setShowAddGrievance(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  {t.addGrievance}
                </Button>
              </div>
            </div>

            {showAddGrievance && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>{t.addGrievance}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(e) => {
                    e.preventDefault()
                    alert('New grievance added successfully!')
                    setShowAddGrievance(false)
                  }} className="grid grid-cols-2 gap-4">
                    <input name="title" placeholder={t.grievanceTitle} className="border rounded px-3 py-2" required />
                    <select name="category" className="border rounded px-3 py-2" required>
                      <option value="">Select {t.category}</option>
                      <option value="Infrastructure">Infrastructure</option>
                      <option value="Water">Water</option>
                      <option value="Health">Health</option>
                      <option value="Education">Education</option>
                    </select>
                    <input name="citizenName" placeholder={t.citizenName} className="border rounded px-3 py-2" required />
                    <input name="citizenPhone" placeholder={t.phone} className="border rounded px-3 py-2" required />
                    <input name="location" placeholder={t.location} className="border rounded px-3 py-2" required />
                    <select name="priority" className="border rounded px-3 py-2" required>
                      <option value="">Select {t.priority}</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                    <textarea name="description" placeholder={t.description} className="border rounded px-3 py-2 col-span-2" rows="3" required></textarea>
                    <div className="col-span-2 flex gap-2">
                      <Button type="submit">{t.addGrievance}</Button>
                      <Button type="button" variant="outline" onClick={() => setShowAddGrievance(false)}>{t.cancel}</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {viewMode === 'card' ? (
              <div className="grid gap-4">
                {filteredGrievances.map((grievance) => (
                  <Card key={grievance.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{grievance.title}</h3>
                          <p className="text-sm text-gray-600">{grievance.trackingNumber}</p>
                        </div>
                        <Badge className={grievance.status === 'Resolved' ? 'bg-green-100 text-green-800' : grievance.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}>
                          {grievance.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p><strong>{t.citizenName}:</strong> {grievance.citizenName}</p>
                          <p><strong>{t.phone}:</strong> {grievance.citizenPhone}</p>
                          <p><strong>{t.location}:</strong> {grievance.location}</p>
                        </div>
                        <div>
                          <p><strong>{t.category}:</strong> {grievance.category}</p>
                          <p><strong>{t.priority}:</strong> {grievance.priority}</p>
                          <p><strong>{t.assignedTo}:</strong> {grievance.assignedTo}</p>
                        </div>
                      </div>
                      <p className="mt-4 text-sm text-gray-700">{grievance.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t.trackingNumber}</TableHead>
                        <TableHead>{t.grievanceTitle}</TableHead>
                        <TableHead>{t.citizenName}</TableHead>
                        <TableHead>{t.location}</TableHead>
                        <TableHead>{t.category}</TableHead>
                        <TableHead>{t.priority}</TableHead>
                        <TableHead>{t.status}</TableHead>
                        <TableHead>{t.assignedTo}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredGrievances.map((grievance) => (
                        <TableRow key={grievance.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium">{grievance.trackingNumber}</TableCell>
                          <TableCell>{grievance.title}</TableCell>
                          <TableCell>{grievance.citizenName}</TableCell>
                          <TableCell>{grievance.location}</TableCell>
                          <TableCell>{grievance.category}</TableCell>
                          <TableCell>
                            <Badge variant={grievance.priority === 'High' ? 'destructive' : grievance.priority === 'Medium' ? 'default' : 'secondary'}>
                              {grievance.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={grievance.status === 'Resolved' ? 'bg-green-100 text-green-800' : grievance.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}>
                              {grievance.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{grievance.assignedTo}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeView === 'projects' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">{t.projects} Management</h2>
              <Button onClick={() => setShowAddProject(true)}>
                <Plus className="w-4 h-4 mr-2" />
                {t.addProject}
              </Button>
            </div>
            <div className="grid gap-4">
              {projects.map((project) => (
                <Card key={project.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{project.name}</h3>
                        <p className="text-sm text-gray-600">{project.projectNumber}</p>
                      </div>
                      <Badge className={project.status === 'Completed' ? 'bg-green-100 text-green-800' : project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}>
                        {project.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><strong>{t.budget}:</strong> {project.budget}</p>
                        <p><strong>{t.location}:</strong> {project.location}</p>
                        <p><strong>{t.category}:</strong> {project.category}</p>
                      </div>
                      <div>
                        <p><strong>{t.createdAt}:</strong> {project.createdAt}</p>
                        <p><strong>{t.assignedTo}:</strong> {project.assignedTo}</p>
                      </div>
                    </div>
                    <p className="mt-4 text-sm text-gray-700">{project.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}