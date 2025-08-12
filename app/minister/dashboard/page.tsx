"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { 
  Phone, 
  MessageCircle, 
  MapPin, 
  Users, 
  FileText, 
  TrendingUp, 
  AlertTriangle,
  Download,
  Printer,
  Eye,
  Filter,
  Search,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  UserCheck,
  IndianRupee
} from "lucide-react"
import { GovernmentHeader } from "@/components/ui/government-header"

// Declare Leaflet types for TypeScript
declare global {
  interface Window {
    L: any
  }
}

interface ConstituencyData {
  id: string
  name: string
  district: string
  totalGrievances: number
  pending: number
  resolved: number
  inProgress: number
  totalCost: number
  resolutionRate: number
}

interface OfficerData {
  id: string
  name: string
  role: string
  phone: string
  email: string
  assignedGrievances: number
  resolvedGrievances: number
  constituency: string
}

interface CasteData {
  category: string
  grievanceCount: number
  fundAmount: number
  percentage: number
}

interface VillageData {
  id: string
  name: string
  mandal: string
  district: string
  grievanceCount: number
  pending: number
  resolved: number
  latitude: number
  longitude: number
}

interface MapState {
  selectedConstituency: string
  selectedMandal: string
  selectedVillage: string
  zoomLevel: number
  center: [number, number]
}

export default function MinisterDashboard() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const [selectedConstituency, setSelectedConstituency] = useState<string>("")
  const [mapState, setMapState] = useState<MapState>({
    selectedConstituency: "",
    selectedMandal: "",
    selectedVillage: "",
    zoomLevel: 7,
    center: [17.3850, 78.4867]
  })
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  // Sample data - in real app, this would come from API
  const constituencies: ConstituencyData[] = [
    {
      id: "hyd-1",
      name: "Hyderabad Central",
      district: "Hyderabad",
      totalGrievances: 1247,
      pending: 156,
      resolved: 892,
      inProgress: 89,
      totalCost: 15000000,
      resolutionRate: 71.5
    },
    {
      id: "hyd-2", 
      name: "Hyderabad North",
      district: "Hyderabad",
      totalGrievances: 856,
      pending: 98,
      resolved: 623,
      inProgress: 67,
      totalCost: 9800000,
      resolutionRate: 72.8
    },
    {
      id: "war-1",
      name: "Warangal East",
      district: "Warangal", 
      totalGrievances: 723,
      pending: 87,
      resolved: 534,
      inProgress: 45,
      totalCost: 8200000,
      resolutionRate: 73.9
    }
  ]

  const officers: OfficerData[] = [
    {
      id: "1",
      name: "Rajesh Kumar",
      role: "Field Officer",
      phone: "+91-9876543210",
      email: "rajesh.kumar@telangana.gov.in",
      assignedGrievances: 45,
      resolvedGrievances: 38,
      constituency: "Hyderabad Central"
    },
    {
      id: "2",
      name: "Priya Sharma",
      role: "Assistant Commissioner",
      phone: "+91-9876543211", 
      email: "priya.sharma@telangana.gov.in",
      assignedGrievances: 32,
      resolvedGrievances: 28,
      constituency: "Hyderabad Central"
    },
    {
      id: "3",
      name: "Amit Patel",
      role: "Deputy Collector",
      phone: "+91-9876543212",
      email: "amit.patel@telangana.gov.in", 
      assignedGrievances: 28,
      resolvedGrievances: 25,
      constituency: "Hyderabad North"
    }
  ]

  const casteData: CasteData[] = [
    { category: "SC", grievanceCount: 234, fundAmount: 3500000, percentage: 18.8 },
    { category: "ST", grievanceCount: 156, fundAmount: 2800000, percentage: 12.5 },
    { category: "OBC", grievanceCount: 445, fundAmount: 6200000, percentage: 35.7 },
    { category: "General", grievanceCount: 412, fundAmount: 2500000, percentage: 33.0 }
  ]

  const villages: VillageData[] = [
    {
      id: "1",
      name: "Hyderabad Village",
      mandal: "Secunderabad",
      district: "Hyderabad",
      grievanceCount: 45,
      pending: 5,
      resolved: 38,
      latitude: 17.3850,
      longitude: 78.4867
    },
    {
      id: "2", 
      name: "Warangal Village",
      mandal: "Warangal",
      district: "Warangal",
      grievanceCount: 32,
      pending: 3,
      resolved: 28,
      latitude: 17.9689,
      longitude: 79.5941
    }
  ]

  useEffect(() => {
    if (selectedConstituency) {
      initializeMap()
    }
  }, [selectedConstituency])

  const initializeMap = async () => {
    if (!mapRef.current) return

    // Load Leaflet CSS and JS
    if (!window.L) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
      link.crossOrigin = ''
      document.head.appendChild(link)

      const script = document.createElement('script')
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo='
      script.crossOrigin = ''
      script.onload = () => createMap()
      document.head.appendChild(script)
    } else {
      createMap()
    }
  }

  const createMap = () => {
    if (!mapRef.current || !window.L) return

    // Clear existing map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
    }

    // Initialize map
    const map = window.L.map(mapRef.current).setView([17.3850, 78.4867], 8)
    mapInstanceRef.current = map

    // Add OpenStreetMap tiles
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map)

    // Add village markers
    villages.forEach(village => {
      const marker = window.L.circleMarker([village.latitude, village.longitude], {
        radius: Math.max(8, village.grievanceCount / 5),
        fillColor: getColorByGrievanceCount(village.grievanceCount),
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
      }).addTo(map)

      marker.bindTooltip(`
        <div class="p-2">
          <h3 class="font-bold text-lg">${village.name}</h3>
          <p class="text-sm text-gray-600">${village.mandal}, ${village.district}</p>
          <div class="mt-2 space-y-1">
            <div class="flex justify-between">
              <span>Total Grievances:</span>
              <span class="font-semibold">${village.grievanceCount}</span>
            </div>
            <div class="flex justify-between">
              <span>Pending:</span>
              <span class="text-orange-600">${village.pending}</span>
            </div>
            <div class="flex justify-between">
              <span>Resolved:</span>
              <span class="text-green-600">${village.resolved}</span>
            </div>
          </div>
        </div>
      `, {
        className: 'custom-tooltip',
        sticky: true
      })

      marker.on('click', () => {
        setMapState(prev => ({
          ...prev,
          selectedVillage: village.name
        }))
      })
    })

    setIsLoading(false)
  }

  const getColorByGrievanceCount = (count: number) => {
    if (count > 40) return '#dc2626' // Red
    if (count > 30) return '#ea580c' // Orange
    if (count > 20) return '#d97706' // Amber
    if (count > 10) return '#65a30d' // Green
    return '#059669' // Emerald
  }

  const handlePhoneCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self')
  }

  const handleWhatsApp = (phone: string, name: string) => {
    const message = `Hello ${name}, I am calling regarding the grievance management system.`
    const whatsappUrl = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const handlePrintReport = () => {
    window.print()
  }

  const handleExportPDF = () => {
    // In real app, this would call an API to generate PDF
    alert('PDF export functionality would be implemented here')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 1
    }).format(amount / 1000000) + 'M'
  }

  const selectedConstituencyData = constituencies.find(c => c.id === selectedConstituency)

  return (
    <div className="min-h-screen bg-gray-50">
      <GovernmentHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Minister Dashboard</h1>
            <p className="text-gray-600">Constituency-wise grievance management overview</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handlePrintReport}>
              <Printer className="h-4 w-4 mr-2" />
              Print Report
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Constituency Selector */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Select Constituency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedConstituency} onValueChange={setSelectedConstituency}>
              <SelectTrigger className="w-full max-w-md">
                <SelectValue placeholder="Choose your constituency" />
              </SelectTrigger>
              <SelectContent>
                {constituencies.map((constituency) => (
                  <SelectItem key={constituency.id} value={constituency.id}>
                    {constituency.name} - {constituency.district}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedConstituencyData && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Grievances</p>
                      <p className="text-2xl font-bold text-gray-900">{selectedConstituencyData.totalGrievances}</p>
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
                      <p className="text-2xl font-bold text-green-600">{selectedConstituencyData.resolutionRate}%</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending Issues</p>
                      <p className="text-2xl font-bold text-orange-600">{selectedConstituencyData.pending}</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Cost</p>
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(selectedConstituencyData.totalCost)}</p>
                    </div>
                    <IndianRupee className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="map">Geospatial Map</TabsTrigger>
                <TabsTrigger value="caste">Caste-wise Analysis</TabsTrigger>
                <TabsTrigger value="officers">Officers</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Status Distribution */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Grievance Status Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="text-sm font-medium">Resolved</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Progress 
                              value={(selectedConstituencyData.resolved / selectedConstituencyData.totalGrievances) * 100} 
                              className="w-20"
                            />
                            <span className="text-sm font-semibold">{selectedConstituencyData.resolved}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <span className="text-sm font-medium">In Progress</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Progress 
                              value={(selectedConstituencyData.inProgress / selectedConstituencyData.totalGrievances) * 100} 
                              className="w-20"
                            />
                            <span className="text-sm font-semibold">{selectedConstituencyData.inProgress}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                            <span className="text-sm font-medium">Pending</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Progress 
                              value={(selectedConstituencyData.pending / selectedConstituencyData.totalGrievances) * 100} 
                              className="w-20"
                            />
                            <span className="text-sm font-semibold">{selectedConstituencyData.pending}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Activity */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Critical Grievances</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <h4 className="font-medium">Road Repair - Main Street</h4>
                              <p className="text-sm text-gray-600">Hyderabad Village, Secunderabad</p>
                            </div>
                            <Badge variant="destructive">URGENT</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="map" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Interactive Geospatial Heatmap</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div 
                      ref={mapRef} 
                      className="w-full h-[600px] relative"
                      style={{ minHeight: '600px' }}
                    >
                      {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-10">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                            <p className="text-gray-600">Loading map data...</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="caste" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Caste-wise Fund Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {casteData.map((caste) => (
                        <div key={caste.category} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{caste.category}</h4>
                            <p className="text-sm text-gray-600">{caste.grievanceCount} grievances</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatCurrency(caste.fundAmount)}</p>
                            <p className="text-sm text-gray-600">{caste.percentage}% of total</p>
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
                    <CardTitle>Assigned Officers & Contact Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Officer Name</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Constituency</TableHead>
                          <TableHead>Assigned</TableHead>
                          <TableHead>Resolved</TableHead>
                          <TableHead>Contact</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {officers.map((officer) => (
                          <TableRow key={officer.id}>
                            <TableCell className="font-medium">{officer.name}</TableCell>
                            <TableCell>{officer.role}</TableCell>
                            <TableCell>{officer.constituency}</TableCell>
                            <TableCell>{officer.assignedGrievances}</TableCell>
                            <TableCell>{officer.resolvedGrievances}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handlePhoneCall(officer.phone)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Phone className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleWhatsApp(officer.phone, officer.name)}
                                  className="h-8 w-8 p-0"
                                >
                                  <MessageCircle className="h-4 w-4" />
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

              <TabsContent value="reports" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Pre-Visit Summary Report</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold mb-2">Constituency Summary</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Constituency:</span>
                              <span className="font-medium">{selectedConstituencyData.name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>District:</span>
                              <span className="font-medium">{selectedConstituencyData.district}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Total Grievances:</span>
                              <span className="font-medium">{selectedConstituencyData.totalGrievances}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Resolution Rate:</span>
                              <span className="font-medium">{selectedConstituencyData.resolutionRate}%</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Critical Issues</h4>
                          <div className="space-y-2">
                            <Badge variant="destructive" className="mr-2">15 URGENT</Badge>
                            <Badge variant="secondary" className="mr-2">23 HIGH</Badge>
                            <Badge variant="outline">8 OVERDUE</Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t">
                        <Button onClick={handleExportPDF} className="w-full">
                          <Download className="h-4 w-4 mr-2" />
                          Generate Bilingual PDF Report
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>

      {/* Custom CSS for tooltips */}
      <style jsx global>{`
        .custom-tooltip {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          padding: 0;
          font-family: inherit;
        }
        
        .custom-tooltip::before {
          border-top-color: #e5e7eb;
        }
        
        .leaflet-container {
          font-family: inherit;
        }
        
        @media print {
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
