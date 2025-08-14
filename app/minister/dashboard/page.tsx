"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { GovernmentHeader } from "@/components/ui/government-header"
import { BarChart, Users, MapPin, Clock, TrendingUp, Phone, Calendar, Filter } from "lucide-react"

export default function MinisterDashboard() {
  const { data: session } = useSession()
  const [selectedDistrict, setSelectedDistrict] = useState("all")
  const [selectedVillage, setSelectedVillage] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [analytics, setAnalytics] = useState<any>({})
  const [grievances, setGrievances] = useState([])
  const [villageLeaders, setVillageLeaders] = useState([])

  const loadAnalytics = async () => {
    try {
      const params = new URLSearchParams({
        district: selectedDistrict,
        village: selectedVillage,
        category: selectedCategory
      })
      const response = await fetch(`/api/minister/analytics?${params}`)
      const data = await response.json()
      setAnalytics(data)
      setGrievances(data.grievances || [])
      setVillageLeaders(data.leaders || [])
    } catch (error) {
      console.error("Failed to load analytics:", error)
    }
  }

  useEffect(() => {
    loadAnalytics()
  }, [selectedDistrict, selectedVillage, selectedCategory])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "RESOLVED": return "bg-green-100 text-green-800"
      case "IN_PROGRESS": return "bg-blue-100 text-blue-800"
      case "PENDING": return "bg-orange-100 text-orange-800"
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
        userName={session?.user?.name}
        userRole={session?.user?.role}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-4 gap-4">
              <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                <SelectTrigger>
                  <MapPin className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Select District" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Districts</SelectItem>
                  <SelectItem value="Hyderabad">Hyderabad</SelectItem>
                  <SelectItem value="Warangal">Warangal</SelectItem>
                  <SelectItem value="Nizamabad">Nizamabad</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedVillage} onValueChange={setSelectedVillage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Village" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Villages</SelectItem>
                  <SelectItem value="Kondapur">Kondapur</SelectItem>
                  <SelectItem value="Gachibowli">Gachibowli</SelectItem>
                  <SelectItem value="Madhapur">Madhapur</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="health">Health</SelectItem>
                  <SelectItem value="infrastructure">Infrastructure</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="employment">Employment</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={loadAnalytics} className="w-full">
                <TrendingUp className="w-4 h-4 mr-2" />
                Refresh Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Total Grievances</p>
                  <p className="text-3xl font-bold">{analytics.totalGrievances || 0}</p>
                </div>
                <BarChart className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Resolved</p>
                  <p className="text-3xl font-bold">{analytics.resolvedGrievances || 0}</p>
                  <p className="text-sm text-green-100">
                    {analytics.totalGrievances ? Math.round((analytics.resolvedGrievances / analytics.totalGrievances) * 100) : 0}% Success Rate
                  </p>
                </div>
                <Users className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">Avg Resolution</p>
                  <p className="text-3xl font-bold">{analytics.avgResolutionDays || 0}</p>
                  <p className="text-sm text-orange-100">Days</p>
                </div>
                <Clock className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Total Spent</p>
                  <p className="text-3xl font-bold">₹{(analytics.totalSpent || 0).toLocaleString()}</p>
                  <p className="text-sm text-purple-100">Lakhs</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="grievances" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="grievances">Grievances Detail</TabsTrigger>
            <TabsTrigger value="village">Village Summary</TabsTrigger>
            <TabsTrigger value="leaders">Key People</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
          </TabsList>

          <TabsContent value="grievances">
            <Card>
              <CardHeader>
                <CardTitle>Detailed Grievances Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reference</TableHead>
                      <TableHead>Requester</TableHead>
                      <TableHead>Issue Summary</TableHead>
                      <TableHead>Village</TableHead>
                      <TableHead>Responder</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead>Category</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {grievances.map((grievance: any) => (
                      <TableRow key={grievance.id}>
                        <TableCell className="font-mono text-sm">{grievance.referenceNumber}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{grievance.patientName}</div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Phone className="w-3 h-3 mr-1" />
                              {grievance.patientPhone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="truncate" title={grievance.issue}>
                            {grievance.issue?.substring(0, 50)}...
                          </div>
                        </TableCell>
                        <TableCell>{grievance.village || "N/A"}</TableCell>
                        <TableCell>{grievance.assignedTo?.name || "Unassigned"}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(grievance.status)}>
                            {grievance.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {calculateDays(grievance.createdAt, grievance.updatedAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">Health</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="village">
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Village Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Population:</span>
                      <span className="font-bold">25,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Households:</span>
                      <span className="font-bold">5,200</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Literacy Rate:</span>
                      <span className="font-bold">78%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Employment Rate:</span>
                      <span className="font-bold">65%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Achievements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 rounded">
                      <div className="font-medium text-green-800">Road Construction</div>
                      <div className="text-sm text-green-600">5km road completed - ₹2.5 Cr</div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded">
                      <div className="font-medium text-blue-800">School Building</div>
                      <div className="text-sm text-blue-600">New primary school - ₹1.2 Cr</div>
                    </div>
                    <div className="p-3 bg-purple-50 rounded">
                      <div className="font-medium text-purple-800">Water Supply</div>
                      <div className="text-sm text-purple-600">Bore wells installed - ₹80 L</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="leaders">
            <Card>
              <CardHeader>
                <CardTitle>Key People & Leaders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { name: "Sarpanch Ramesh", role: "Village Head", phone: "+91 9876543210", issues: 12 },
                    { name: "Dr. Priya Sharma", role: "PHC Doctor", phone: "+91 9876543211", issues: 8 },
                    { name: "Teacher Suresh", role: "School Principal", phone: "+91 9876543212", issues: 5 },
                    { name: "Farmer Krishnan", role: "Farmer Leader", phone: "+91 9876543213", issues: 15 },
                    { name: "SHG President Lakshmi", role: "Women's Group", phone: "+91 9876543214", issues: 7 },
                    { name: "Youth Leader Arjun", role: "Youth Association", phone: "+91 9876543215", issues: 9 }
                  ].map((leader, index) => (
                    <Card key={index} className="p-4">
                      <div className="font-medium">{leader.name}</div>
                      <div className="text-sm text-gray-600">{leader.role}</div>
                      <div className="text-sm text-gray-500 flex items-center mt-1">
                        <Phone className="w-3 h-3 mr-1" />
                        {leader.phone}
                      </div>
                      <div className="text-sm text-blue-600 mt-2">
                        {leader.issues} issues raised
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects">
            <Card>
              <CardHeader>
                <CardTitle>Government Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Budget</TableHead>
                      <TableHead>Spent</TableHead>
                      <TableHead>Beneficiaries</TableHead>
                      <TableHead>Completion</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { name: "Village Road Development", status: "COMPLETED", budget: 250, spent: 245, beneficiaries: 5000, completion: "100%" },
                      { name: "Primary School Building", status: "IN_PROGRESS", budget: 120, spent: 85, beneficiaries: 300, completion: "70%" },
                      { name: "Water Supply System", status: "COMPLETED", budget: 80, spent: 78, beneficiaries: 2500, completion: "100%" },
                      { name: "Community Health Center", status: "YET_TO_COMPLETE", budget: 200, spent: 0, beneficiaries: 8000, completion: "0%" }
                    ].map((project, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{project.name}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(project.status)}>
                            {project.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>₹{project.budget}L</TableCell>
                        <TableCell>₹{project.spent}L</TableCell>
                        <TableCell>{project.beneficiaries.toLocaleString()}</TableCell>
                        <TableCell>{project.completion}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}