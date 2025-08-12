"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { 
  BarChart3, 
  TrendingUp, 
  MapPin, 
  Users, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  ArrowLeft,
  Download,
  Filter
} from "lucide-react"
import Link from "next/link"

interface AnalyticsData {
  period: {
    year: number
    constituency?: string
    district?: string
  }
  kpis: {
    totalGrievances: number
    totalEstimatedCost: number
    criticalGrievances: number
    overdueGrievances: number
    resolvedGrievances: number
    resolutionRate: string
    averageResolutionTime: string
  }
  distributions: {
    status: Record<string, number>
    priority: Record<string, number>
    category: Array<{
      categoryName: string
      categoryColor: string
      count: number
    }>
    district: Array<{
      district: string
      grievanceCount: number
      totalCost: number
    }>
  }
  trends: {
    monthly: Array<{
      month: string
      count: number
      total_cost: number
      resolved_count: number
    }>
  }
  recentActivity: {
    recentGrievances: Array<{
      id: string
      referenceNumber: string
      title: string
      status: string
      priority: string
      category: string
      assignedTo: string
      assignedToPhone: string
      createdAt: string
    }>
  }
  officerWorkload: Array<{
    officerName: string
    officerPhone: string
    officerEmail: string
    officerRole: string
    grievanceCount: number
  }>
}

interface MandalData {
  mandal: string
  totalGrievances: number
  pending: number
  resolved: number
  inProgress: number
  totalCost: number
  villages: VillageData[]
}

interface VillageData {
  village: string
  totalGrievances: number
  pending: number
  resolved: number
  inProgress: number
  totalCost: number
}

export default function AnalyticsPage() {
  const searchParams = useSearchParams()
  const constituency = searchParams.get("constituency")
  const district = searchParams.get("district")
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [mandalData, setMandalData] = useState<MandalData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    fetchAnalyticsData()
  }, [constituency, district])

  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true)
      
      // Fetch dashboard analytics
      const analyticsUrl = `/api/analytics/dashboard?${constituency ? `constituency=${constituency}` : ''}${district ? `&district=${district}` : ''}`
      const analyticsResponse = await fetch(analyticsUrl)
      const analytics = await analyticsResponse.json()
      setAnalyticsData(analytics)

      // Fetch mandal-level data
      const mandalUrl = `/api/analytics/aggregated?groupBy=mandal&${constituency ? `constituency=${constituency}` : ''}${district ? `&district=${district}` : ''}`
      const mandalResponse = await fetch(mandalUrl)
      const mandalData = await mandalResponse.json()
      
      // Transform mandal data
      const transformedMandalData: MandalData[] = mandalData.aggregatedData.map((item: any) => ({
        mandal: item.location.mandal || 'Unknown',
        totalGrievances: item.totalGrievances,
        pending: item.statusBreakdown.PENDING || 0,
        resolved: item.statusBreakdown.RESOLVED || 0,
        inProgress: item.statusBreakdown.IN_PROGRESS || 0,
        totalCost: item.totalEstimatedCost,
        villages: [] // Would be populated from village-level API
      }))
      
      setMandalData(transformedMandalData)
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching analytics data:', error)
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 1
    }).format(amount / 1000000) + 'M'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-orange-100 text-orange-800'
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800'
      case 'RESOLVED': return 'bg-green-100 text-green-800'
      case 'CLOSED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-100 text-red-800'
      case 'HIGH': return 'bg-orange-100 text-orange-800'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
      case 'LOW': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No data available for the selected region.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link href="/map">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Map
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {district ? `${district} District` : 'Telangana'} Analytics
              </h1>
              <p className="text-gray-600">
                {constituency && `Constituency: ${constituency}`} • Year: {analyticsData.period.year}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Grievances</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData.kpis.totalGrievances}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Resolution Rate</p>
                  <p className="text-2xl font-bold text-green-600">{analyticsData.kpis.resolutionRate}%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Critical Issues</p>
                  <p className="text-2xl font-bold text-red-600">{analyticsData.kpis.criticalGrievances}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Cost</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(analyticsData.kpis.totalEstimatedCost)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="mandals">Mandal Level</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="officers">Officers</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(analyticsData.distributions.status).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(status).split(' ')[0]}`}></div>
                          <span className="text-sm font-medium">{status}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Progress 
                            value={(count / analyticsData.kpis.totalGrievances) * 100} 
                            className="w-20"
                          />
                          <span className="text-sm font-semibold">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Category Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Category Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.distributions.category.map((category) => (
                      <div key={category.categoryName} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: category.categoryColor }}
                          ></div>
                          <span className="text-sm font-medium">{category.categoryName}</span>
                        </div>
                        <Badge variant="outline">{category.count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Grievances</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reference</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analyticsData.recentActivity.recentGrievances.map((grievance) => (
                      <TableRow key={grievance.id}>
                        <TableCell className="font-mono text-sm">{grievance.referenceNumber}</TableCell>
                        <TableCell className="font-medium">{grievance.title}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(grievance.status)}>
                            {grievance.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(grievance.priority)}>
                            {grievance.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>{grievance.assignedTo}</TableCell>
                        <TableCell>{formatDate(grievance.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mandals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Mandal-wise Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mandal</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Pending</TableHead>
                      <TableHead>In Progress</TableHead>
                      <TableHead>Resolved</TableHead>
                      <TableHead>Total Cost</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mandalData.map((mandal) => (
                      <TableRow key={mandal.mandal}>
                        <TableCell className="font-medium">{mandal.mandal}</TableCell>
                        <TableCell>{mandal.totalGrievances}</TableCell>
                        <TableCell>
                          <Badge variant="destructive">{mandal.pending}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{mandal.inProgress}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="default">{mandal.resolved}</Badge>
                        </TableCell>
                        <TableCell>{formatCurrency(mandal.totalCost)}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            <MapPin className="h-4 w-4 mr-1" />
                            View Villages
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.trends.monthly.map((month) => (
                    <div key={month.month} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{new Date(month.month).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</h4>
                        <p className="text-sm text-gray-600">Total: {month.count} • Resolved: {month.resolved_count}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(month.total_cost)}</p>
                        <p className="text-sm text-gray-600">
                          {month.count > 0 ? ((month.resolved_count / month.count) * 100).toFixed(1) : 0}% resolved
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="officers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Officer Workload</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analyticsData.officerWorkload.map((officer) => (
                    <Card key={officer.officerName} className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{officer.officerName}</h4>
                          <p className="text-sm text-gray-600">{officer.officerRole}</p>
                          <p className="text-sm text-gray-600">{officer.officerPhone}</p>
                        </div>
                        <Badge variant="outline">{officer.grievanceCount}</Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
