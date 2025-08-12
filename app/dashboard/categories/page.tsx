"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  FolderOpen,
  Plus,
  Edit,
  Trash2,
  ChevronDown,
  ChevronRight,
  Settings,
  FileText,
  Users,
  Activity
} from "lucide-react"

export default function CategoriesPage() {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])

  const categories = [
    {
      id: "1",
      name: "Infrastructure",
      color: "#0ea5e9",
      description: "Roads, bridges, and public infrastructure",
      grievanceCount: 456,
      subCategories: [
        { id: "1-1", name: "Roads & Highways", grievanceCount: 234 },
        { id: "1-2", name: "Bridges", grievanceCount: 89 },
        { id: "1-3", name: "Public Buildings", grievanceCount: 133 }
      ]
    },
    {
      id: "2",
      name: "Utilities",
      color: "#22c55e",
      description: "Water, electricity, and basic utilities",
      grievanceCount: 234,
      subCategories: [
        { id: "2-1", name: "Water Supply", grievanceCount: 156 },
        { id: "2-2", name: "Electricity", grievanceCount: 78 }
      ]
    },
    {
      id: "3",
      name: "Healthcare",
      color: "#a855f7",
      description: "Medical facilities and health services",
      grievanceCount: 189,
      subCategories: [
        { id: "3-1", name: "Hospitals", grievanceCount: 98 },
        { id: "3-2", name: "Clinics", grievanceCount: 67 },
        { id: "3-3", name: "Pharmacies", grievanceCount: 24 }
      ]
    },
    {
      id: "4",
      name: "Education",
      color: "#f59e0b",
      description: "Schools, colleges, and educational institutions",
      grievanceCount: 156,
      subCategories: [
        { id: "4-1", name: "Primary Schools", grievanceCount: 89 },
        { id: "4-2", name: "Secondary Schools", grievanceCount: 45 },
        { id: "4-3", name: "Colleges", grievanceCount: 22 }
      ]
    },
    {
      id: "5",
      name: "Others",
      color: "#64748b",
      description: "Miscellaneous grievances",
      grievanceCount: 212,
      subCategories: [
        { id: "5-1", name: "General Complaints", grievanceCount: 212 }
      ]
    }
  ]

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Category Management</h2>
          <p className="text-gray-600">Manage categories and sub-categories for grievances</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
              <DialogDescription>
                Create a new category for organizing grievances
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Category Name</Label>
                <Input id="name" placeholder="Enter category name" />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input id="description" placeholder="Enter description" />
              </div>
              <div>
                <Label htmlFor="color">Color</Label>
                <Input id="color" type="color" defaultValue="#0ea5e9" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline">Cancel</Button>
              <Button>Create Category</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
            <FolderOpen className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-gray-500">Main categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sub-Categories</CardTitle>
            <Settings className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {categories.reduce((acc, cat) => acc + cat.subCategories.length, 0)}
            </div>
            <p className="text-xs text-gray-500">Sub-categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Grievances</CardTitle>
            <FileText className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {categories.reduce((acc, cat) => acc + cat.grievanceCount, 0)}
            </div>
            <p className="text-xs text-gray-500">Across all categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-gray-500">Managing categories</p>
          </CardContent>
        </Card>
      </div>

      {/* Categories Management */}
      <Tabs defaultValue="hierarchy" className="space-y-4">
        <TabsList>
          <TabsTrigger value="hierarchy">Hierarchical View</TabsTrigger>
          <TabsTrigger value="table">Table View</TabsTrigger>
        </TabsList>

        <TabsContent value="hierarchy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Category Hierarchy</CardTitle>
              <CardDescription>
                View and manage categories in a hierarchical structure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category.id} className="border rounded-lg">
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleCategory(category.id)}
                        >
                          {expandedCategories.includes(category.id) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <div>
                          <h3 className="font-medium">{category.name}</h3>
                          <p className="text-sm text-gray-500">{category.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="secondary">{category.grievanceCount} grievances</Badge>
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Plus className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Add Sub-Category</DialogTitle>
                                <DialogDescription>
                                  Add a new sub-category to {category.name}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label>Sub-Category Name</Label>
                                  <Input placeholder="Enter sub-category name" />
                                </div>
                                <div>
                                  <Label>Description</Label>
                                  <Input placeholder="Enter description" />
                                </div>
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button variant="outline">Cancel</Button>
                                <Button>Add Sub-Category</Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    {expandedCategories.includes(category.id) && (
                      <div className="border-t bg-gray-50">
                        {category.subCategories.map((subCategory) => (
                          <div key={subCategory.id} className="flex items-center justify-between p-4 pl-12">
                            <div>
                              <h4 className="font-medium">{subCategory.name}</h4>
                              <p className="text-sm text-gray-500">
                                {subCategory.grievanceCount} grievances
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="table" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Categories Table</CardTitle>
              <CardDescription>
                Manage categories in a tabular format
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Sub-Categories</TableHead>
                    <TableHead>Grievances</TableHead>
                    <TableHead>Color</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="font-medium">{category.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{category.description}</TableCell>
                      <TableCell>{category.subCategories.length}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{category.grievanceCount}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded border"
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="text-xs">{category.color}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Category Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Category Performance
          </CardTitle>
          <CardDescription>
            Grievance distribution and performance by category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <div key={category.id} className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <h3 className="font-medium">{category.name}</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Grievances</span>
                    <span className="font-medium">{category.grievanceCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Sub-Categories</span>
                    <span className="font-medium">{category.subCategories.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Avg Resolution</span>
                    <span className="font-medium">3.2 days</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
