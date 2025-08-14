"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { GovernmentHeader } from "@/components/ui/government-header"
import { BarChart, Users, MapPin, Clock, TrendingUp, Phone, Calendar, Filter, Mic, MicOff, TreePine, Eye, FileText, Camera, Navigation, Wifi, WifiOff } from "lucide-react"

export default function EnhancedMinisterDashboard() {
  const { data: session } = useSession()
  const [selectedDistrict, setSelectedDistrict] = useState("all")
  const [selectedVillage, setSelectedVillage] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [analytics, setAnalytics] = useState<any>({})
  const [grievances, setGrievances] = useState([])
  const [isListening, setIsListening] = useState(false)
  const [isOffline, setIsOffline] = useState(false)
  const [speechMode, setSpeechMode] = useState(false)
  const [drillDownView, setDrillDownView] = useState('overview')
  const [currentLocation, setCurrentLocation] = useState<any>(null)

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
    } catch (error) {
      console.error("Failed to load analytics:", error)
    }
  }

  useEffect(() => {
    let isMounted = true
    const loadData = async () => {
      if (isMounted) {
        await loadAnalytics()
      }
    }
    loadData()
    return () => { isMounted = false }
  }, [selectedDistrict, selectedVillage, selectedCategory])

  // Voice Search Implementation
  const startVoiceSearch = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'
      
      recognition.onstart = () => setIsListening(true)
      recognition.onend = () => setIsListening(false)
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase()
        processVoiceCommand(transcript)
      }
      
      recognition.start()
    }
  }

  const processVoiceCommand = (command: string) => {
    if (command.includes('show grievances for')) {
      const village = command.split('show grievances for ')[1]
      setSelectedVillage(village)
    } else if (command.includes('filter by')) {
      const category = command.split('filter by ')[1]
      setSelectedCategory(category)
    }
  }

  // Offline Detection
  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // GPS Location Detection
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
      })
    }
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "RESOLVED": return "bg-green-500 text-white"
      case "IN_PROGRESS": return "bg-blue-500 text-white"
      case "PENDING": return "bg-red-500 text-white"
      default: return "bg-gray-500 text-white"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <GovernmentHeader
        title="Minister Dashboard - Enhanced"
        description="Real-World Field Operations Interface"
        userName={session?.user?.name}
        userRole={session?.user?.role}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Bar */}
        <div className="flex justify-between items-center mb-4 p-3 bg-white rounded-lg shadow">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${isOffline ? 'text-red-600' : 'text-green-600'}`}>
              {isOffline ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
              <span className="text-sm">{isOffline ? 'Offline Mode' : 'Online'}</span>
            </div>
            {currentLocation && (
              <div className="flex items-center gap-2 text-blue-600">
                <Navigation className="w-4 h-4" />
                <span className="text-sm">Location Detected</span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button 
              variant={speechMode ? "default" : "outline"} 
              size="sm"
              onClick={() => setSpeechMode(!speechMode)}
            >
              <FileText className="w-4 h-4 mr-2" />
              Speech Mode
            </Button>
            <Button 
              variant={isListening ? "default" : "outline"} 
              size="sm"
              onClick={startVoiceSearch}
              disabled={isListening}
            >
              {isListening ? <Mic className="w-4 h-4 mr-2" /> : <MicOff className="w-4 h-4 mr-2" />}
              {isListening ? 'Listening...' : 'Voice Search'}
            </Button>
          </div>
        </div>

        {/* Drill-Down Navigation */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <TreePine className="w-5 h-5" />
              <span className="font-medium">Quick Drill-Down</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button 
                variant={drillDownView === 'overview' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setDrillDownView('overview')}
              >
                State Overview
              </Button>
              <Button 
                variant={drillDownView === 'district' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setDrillDownView('district')}
              >
                District View
              </Button>
              <Button 
                variant={drillDownView === 'mandal' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setDrillDownView('mandal')}
              >
                Mandal View
              </Button>
              <Button 
                variant={drillDownView === 'village' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setDrillDownView('village')}
              >
                Village View
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Speech Mode Briefing */}
        {speechMode && (
          <Card className="mb-6 bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-800">Speech Briefing for {selectedVillage !== 'all' ? selectedVillage : selectedDistrict}</span>
              </div>
              <div className="text-sm space-y-2">
                <p><strong>Key Points:</strong></p>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>In {selectedVillage !== 'all' ? selectedVillage : selectedDistrict}, {analytics.resolvedGrievances || 0} grievances were resolved last month</li>
                  <li>{analytics.pendingGrievances || 0} are ongoing in health and infrastructure</li>
                  <li>₹{(analytics.totalSpent || 0).toLocaleString()} lakhs was spent on development projects</li>
                  <li>Top contributors: Sarpanch Ramesh, Dr. Priya Sharma, Teacher Suresh</li>
                  <li>Recent achievements: Road construction (₹2.5 Cr), School building (₹1.2 Cr)</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Metrics with Visual Indicators */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Total Grievances</p>
                  <p className="text-3xl font-bold">{analytics.totalGrievances || 0}</p>
                  <div className="w-full bg-blue-400 rounded-full h-2 mt-2">
                    <div 
                      className="bg-white h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min((analytics.totalGrievances || 0) / 100 * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                <BarChart className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white relative">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Resolved</p>
                  <p className="text-3xl font-bold">{analytics.resolvedGrievances || 0}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-8 h-8 rounded-full bg-green-400 flex items-center justify-center">
                      <span className="text-xs font-bold text-white">
                        {analytics.totalGrievances ? Math.round((analytics.resolvedGrievances / analytics.totalGrievances) * 100) : 0}%
                      </span>
                    </div>
                    <span className="text-sm text-green-100">Success Rate</span>
                  </div>
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

        <Tabs defaultValue="leaders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="leaders">Key People</TabsTrigger>
            <TabsTrigger value="interactions">Field Notes</TabsTrigger>
            <TabsTrigger value="briefing">Quick Briefing</TabsTrigger>
          </TabsList>

          <TabsContent value="leaders">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Key People & Leaders
                  <Button size="sm" variant="outline">
                    <Eye className="w-4 h-4 mr-2" />
                    Flashcard Mode
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { name: "Sarpanch Ramesh", role: "Village Head", phone: "+91 9876543210", issues: 12, photo: "👨💼", achievements: "Led road construction project" },
                    { name: "Dr. Priya Sharma", role: "PHC Doctor", phone: "+91 9876543211", issues: 8, photo: "👩⚕️", achievements: "Reduced infant mortality by 40%" },
                    { name: "Teacher Suresh", role: "School Principal", phone: "+91 9876543212", issues: 5, photo: "👨🏫", achievements: "100% enrollment achieved" },
                    { name: "Farmer Krishnan", role: "Farmer Leader", phone: "+91 9876543213", issues: 15, photo: "👨🌾", achievements: "Introduced organic farming" },
                    { name: "SHG President Lakshmi", role: "Women's Group", phone: "+91 9876543214", issues: 7, photo: "👩💼", achievements: "₹50L in women's savings" },
                    { name: "Youth Leader Arjun", role: "Youth Association", phone: "+91 9876543215", issues: 9, photo: "👨💻", achievements: "Digital literacy program" }
                  ].map((leader, index) => (
                    <Card key={index} className="p-4 hover:shadow-lg transition-shadow">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="text-2xl">{leader.photo}</div>
                        <div>
                          <div className="font-medium">{leader.name}</div>
                          <div className="text-sm text-gray-600">{leader.role}</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 flex items-center mb-2">
                        <Phone className="w-3 h-3 mr-1" />
                        {leader.phone}
                      </div>
                      <div className="text-xs text-green-600 mb-2">
                        ✓ {leader.achievements}
                      </div>
                      <div className="text-sm text-blue-600">
                        {leader.issues} issues raised
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="interactions">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Field Interaction Notes
                  <Button size="sm">
                    <Camera className="w-4 h-4 mr-2" />
                    Add Note
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      date: "Today, 2:30 PM",
                      location: "Kondapur Village Square",
                      type: "Public Meeting",
                      notes: "Met with 50+ villagers. Discussed water supply issues. Promised bore well within 2 weeks.",
                      people: ["Sarpanch Ramesh", "Dr. Priya", "15 farmers"],
                      followUp: "Check bore well progress on Friday"
                    },
                    {
                      date: "Yesterday, 4:15 PM",
                      location: "Primary School",
                      type: "Infrastructure Visit",
                      notes: "Inspected new classroom construction. 70% complete. Quality looks good.",
                      people: ["Teacher Suresh", "Contractor Ravi"],
                      followUp: "Final inspection next week"
                    }
                  ].map((interaction, index) => (
                    <Card key={index} className="p-4 border-l-4 border-l-blue-500">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-medium">{interaction.type}</div>
                          <div className="text-sm text-gray-600">{interaction.location}</div>
                        </div>
                        <div className="text-sm text-gray-500">{interaction.date}</div>
                      </div>
                      <p className="text-sm mb-3">{interaction.notes}</p>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {interaction.people.map((person, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {person}
                          </Badge>
                        ))}
                      </div>
                      <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
                        <strong>Follow-up:</strong> {interaction.followUp}
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="briefing">
            <Card>
              <CardHeader>
                <CardTitle>Auto-Generated Briefing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-lg leading-relaxed">
                    <strong>Village Summary:</strong> In Kondapur village, 12 grievances were resolved last month, 
                    3 are ongoing in health sector, and ₹2.4 lakhs was spent on road repairs. 
                    Key achievements include completion of the primary school building and installation of 5 new bore wells. 
                    Sarpanch Ramesh has been instrumental in coordinating development activities, 
                    while Dr. Priya Sharma has improved healthcare delivery significantly.
                  </p>
                  
                  <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                    <h3 className="font-semibold text-yellow-800 mb-2">Urgent Items for Today's Visit:</h3>
                    <ul className="list-disc list-inside text-yellow-700 space-y-1">
                      <li>Water supply restoration (promised 2 weeks ago)</li>
                      <li>School building inauguration ceremony</li>
                      <li>Meet with farmers about crop insurance</li>
                      <li>Review PHC medicine stock with Dr. Priya</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}