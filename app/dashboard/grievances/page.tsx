"use client"

import { GrievanceList } from '@/components/grievance-list'
import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Edit, Eye, Filter, Plus, Search, UserPlus 
} from 'lucide-react'

export default function GrievancesPage() {
  const [grievances, setGrievances] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [grievancesRes, categoriesRes] = await Promise.all([
          fetch('/api/grievances'),
          fetch('/api/categories')
        ])

        if (!grievancesRes.ok || !categoriesRes.ok) {
          throw new Error('Failed to fetch data')
        }

        const [grievancesData, categoriesData] = await Promise.all([
          grievancesRes.json(),
          categoriesRes.json()
        ])

        setGrievances(grievancesData)
        setCategories(categoriesData)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <div className="container mx-auto py-10">Loading...</div>
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">Grievances</h1>
      <GrievanceList grievances={grievances} categories={categories} />
    </div>
  )

  const filteredGrievances = grievances.filter(grievance => {
    const matchesSearch = grievance.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         grievance.citizenName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         grievance.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || grievance.status === statusFilter
    const matchesPriority = priorityFilter === "all" || grievance.priority === priorityFilter
    const matchesCategory = categoryFilter === "all" || grievance.category === categoryFilter

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Resolved": return "bg-green-100 text-green-800"
      case "In Progress": return "bg-blue-100 text-blue-800"
      case "Pending": return "bg-orange-100 text-orange-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "border-red-500 text-red-700"
      case "Medium": return "border-yellow-500 text-yellow-700"
      case "Low": return "border-green-500 text-green-700"
      default: return "border-gray-500 text-gray-700"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Grievance Management</h2>
          <p className="text-gray-600">Manage and assign citizen grievances</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Grievance
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Grievance</DialogTitle>
              <DialogDescription>
                Add a new grievance to the system
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" placeholder="Enter grievance title" />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="infrastructure">Infrastructure</SelectItem>
                      <SelectItem value="utilities">Utilities</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="others">Others</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Enter detailed description" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" placeholder="Enter location" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="citizenName">Citizen Name</Label>
                  <Input id="citizenName" placeholder="Enter citizen name" />
                </div>
                <div>
                  <Label htmlFor="citizenPhone">Phone</Label>
                  <Input id="citizenPhone" placeholder="Enter phone number" />
                </div>
              </div>
              <div>
                <Label htmlFor="citizenEmail">Email</Label>
                <Input id="citizenEmail" placeholder="Enter email address" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline">Cancel</Button>
              <Button>Create Grievance</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search grievances..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                  <SelectItem value="Utilities">Utilities</SelectItem>
                  <SelectItem value="Healthcare">Healthcare</SelectItem>
                  <SelectItem value="Education">Education</SelectItem>
                  <SelectItem value="Others">Others</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grievances Table */}
      <Card>
        <CardHeader>
          <CardTitle>Grievances ({filteredGrievances.length})</CardTitle>
          <CardDescription>
            Manage and track all citizen grievances
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Citizen</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGrievances.map((grievance) => (
                <TableRow key={grievance.id}>
                  <TableCell className="font-medium">{grievance.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{grievance.title}</div>
                      <div className="text-sm text-gray-500">{grievance.location}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{grievance.citizenName}</div>
                      <div className="text-sm text-gray-500">{grievance.citizenPhone}</div>
                    </div>
                  </TableCell>
                  <TableCell>{grievance.category}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(grievance.status)}>
                      {grievance.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getPriorityColor(grievance.priority)}>
                      {grievance.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>{grievance.assignedTo}</TableCell>
                  <TableCell>{grievance.createdAt}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Grievance Details - {grievance.id}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label className="font-medium">Title</Label>
                              <p>{grievance.title}</p>
                            </div>
                            <div>
                              <Label className="font-medium">Description</Label>
                              <p>{grievance.description}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="font-medium">Status</Label>
                                <Badge className={getStatusColor(grievance.status)}>
                                  {grievance.status}
                                </Badge>
                              </div>
                              <div>
                                <Label className="font-medium">Priority</Label>
                                <Badge variant="outline" className={getPriorityColor(grievance.priority)}>
                                  {grievance.priority}
                                </Badge>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="font-medium">Category</Label>
                                <p>{grievance.category}</p>
                              </div>
                              <div>
                                <Label className="font-medium">Location</Label>
                                <p>{grievance.location}</p>
                              </div>
                            </div>
                            <div>
                              <Label className="font-medium">Citizen Information</Label>
                              <div className="grid grid-cols-2 gap-4 mt-2">
                                <div>
                                  <Label>Name</Label>
                                  <p>{grievance.citizenName}</p>
                                </div>
                                <div>
                                  <Label>Phone</Label>
                                  <p>{grievance.citizenPhone}</p>
                                </div>
                                <div>
                                  <Label>Email</Label>
                                  <p>{grievance.citizenEmail}</p>
                                </div>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="font-medium">Assigned To</Label>
                                <p>{grievance.assignedTo}</p>
                              </div>
                              <div>
                                <Label className="font-medium">Estimated Resolution</Label>
                                <p>{grievance.estimatedResolution}</p>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <UserPlus className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Assign Grievance</DialogTitle>
                            <DialogDescription>
                              Assign this grievance to an officer
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>Select Officer</Label>
                              <Select>
                                <SelectTrigger>
                                  <SelectValue placeholder="Choose an officer" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="officer1">Officer Kumar</SelectItem>
                                  <SelectItem value="officer2">Officer Sharma</SelectItem>
                                  <SelectItem value="officer3">Officer Patel</SelectItem>
                                  <SelectItem value="officer4">Officer Reddy</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Estimated Resolution Date</Label>
                              <Input type="date" />
                            </div>
                            <div>
                              <Label>Notes</Label>
                              <Textarea placeholder="Add any additional notes..." />
                            </div>
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline">Cancel</Button>
                            <Button>Assign</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
