"use client"

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
import { mockGrievances } from '@/constants'

export default function GrievancesPage() {
  const [grievances, setGrievances] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")

  useEffect(() => {
    let isMounted = true
    
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

        if (isMounted) {
          setGrievances(Array.isArray(grievancesData) ? grievancesData : [])
          setCategories(Array.isArray(categoriesData) ? categoriesData : [])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        if (isMounted) {
          setGrievances([])
          setCategories([])
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchData()
    return () => { isMounted = false }
  }, [])

  const filteredGrievances = mockGrievances.filter((grievance: any) => {
    const matchesSearch = (grievance.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (grievance.citizenName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (grievance.village || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || grievance.status === statusFilter
    const matchesPriority = priorityFilter === "all" || grievance.priority === priorityFilter
    const matchesCategory = categoryFilter === "all" || (grievance.category === categoryFilter)

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "RESOLVED": return "bg-green-100 text-green-800"
      case "IN_PROGRESS": return "bg-blue-100 text-blue-800"
      case "PENDING": return "bg-orange-100 text-orange-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH": return "border-red-500 text-red-700"
      case "MEDIUM": return "border-yellow-500 text-yellow-700"
      case "LOW": return "border-green-500 text-green-700"
      default: return "border-gray-500 text-gray-700"
    }
  }

  if (loading) {
    return <div className="container mx-auto py-10">Loading...</div>
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
                      {categories.map((category: any) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
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
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="LOW">Low</SelectItem>
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
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
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
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
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
                  {categories.map((category: any) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
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
          {filteredGrievances.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No grievances found matching your criteria.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Citizen Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Village</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGrievances.map((grievance: any) => (
                  <TableRow key={grievance.id}>
                    <TableCell className="font-mono text-sm">{grievance.trackingNumber}</TableCell>
                    <TableCell>
                      <div className="font-medium">{grievance.title}</div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{grievance.citizenName}</div>
                        <div className="text-sm text-gray-500">{grievance.requesterPhone}</div>
                      </div>
                    </TableCell>
                    <TableCell>{grievance.category || 'N/A'}</TableCell>
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
                    <TableCell>{grievance.village || 'N/A'}</TableCell>
                    <TableCell>{new Date(grievance.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
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
    </div>
  )
}