"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import TelanganaMap to avoid SSR issues with Leaflet
const TelanganaMap = dynamic(() => import("../../../components/TelanganaMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] bg-gray-100 rounded-lg flex items-center justify-center">Loading Map...</div>
  ),
});

// Dynamically import EventCalendar to avoid SSR issues
const EventCalendar = dynamic(() => import("../../../components/EventCalendar"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">Loading Calendar...</div>
  ),
});
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  FileText,
  Building2,
  BarChart3,
  Clock,
  Plus,
  Download,
  Languages,
  Search,
  Edit,
  Check,
  X,
  ArrowLeft,
  Calendar,
  MapPin,
  MessageCircle,
  Send,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function MinisterDashboard() {
  const [activeView, setActiveView] = useState("dashboard");
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedConstituency, setSelectedConstituency] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [language, setLanguage] = useState("en");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilteredList, setShowFilteredList] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [dataType, setDataType] = useState("grievances");
  const [calendarView, setCalendarView] = useState("today");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const translations = {
    en: {
      dashboard: "Dashboard",
      grievances: "Grievances",
      projects: "Projects",
      totalGrievances: "Total Grievances",
      totalProjects: "Total Projects",
      // pendingItems: "Pending Items", completedItems: "Completed Items",
      calendar: "Calendar",
      map: "Telangana Map",
      aiAssistant: "AI Assistant",
      askQuestion: "Ask me anything about your constituency...",
      send: "Send",
      clear: "Clear",
    },
    te: {
      dashboard: "డ్యాష్బోర్డ్",
      grievances: "ఫిర్యాదులు",
      projects: "ప్రాజెక్టులు",
      totalGrievances: "మొత్తం ఫిర్యాదులు",
      totalProjects: "మొత్తం ప్రాజెక్టులు",
      pendingItems: "పెండింగ్ అంశలు",
      completedItems: "పూర్తయిన అంశలు",
      calendar: "క్యాలెండర్",
      map: "తెలంగాణ మ్యాప్",
      aiAssistant: "AI సహాయకుడు",
      askQuestion: "మీ నియోజకవర్గం గురించి ఏదైనా అడగండి...",
      send: "పంపు",
      clear: "క్లియర్",
    },
  };

  const t = translations[language];

  // Mock data with district/constituency mapping
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
      district: "Karimnagar",
      constituency: "Manthanani",
      description: "Main road has multiple potholes",
      createdAt: "2025-01-08",
      assignedTo: "Field Officer Ramesh",
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
      district: "Peddapalli",
      constituency: "Ramagundam",
      description: "Irregular water supply",
      createdAt: "2025-01-07",
      assignedTo: "PA Srinivas",
    },
  ];

  const mockProjects = [
    {
      id: 1,
      projectNumber: "PRJ-I-12-08012025",
      name: "Bridge Construction",
      category: "Infrastructure",
      status: "In Progress",
      budget: "₹50 Lakh",
      location: "Manthanani",
      district: "Karimnagar",
      constituency: "Manthanani",
      description: "New bridge construction",
      createdAt: "2025-01-08",
      assignedTo: "Engineer Kumar",
    },
  ];

  const mockCalendarEvents = {
    today: [
      {
        id: 1,
        time: "09:00",
        title: "Village Visit - Manthanani",
        type: "visit",
        assignedTo: "PA Srinivas",
        status: "confirmed",
      },
      {
        id: 2,
        time: "14:00",
        title: "Grievance Review Meeting",
        type: "meeting",
        assignedTo: "Field Officer Ramesh",
        status: "pending",
      },
      {
        id: 3,
        time: "16:30",
        title: "Project Inspection - Bridge",
        type: "inspection",
        assignedTo: null,
        status: "unassigned",
      },
    ],
    week: [
      {
        id: 4,
        date: "2025-01-09",
        time: "10:00",
        title: "District Collector Meeting",
        type: "meeting",
        assignedTo: "PA Srinivas",
        status: "confirmed",
      },
      {
        id: 5,
        date: "2025-01-10",
        time: "15:00",
        title: "Public Hearing",
        type: "hearing",
        assignedTo: "Field Officer Kumar",
        status: "confirmed",
      },
      {
        id: 6,
        date: "2025-01-11",
        time: "11:00",
        title: "Hospital Inauguration",
        type: "event",
        assignedTo: null,
        status: "unassigned",
      },
    ],
    month: [
      {
        id: 7,
        date: "2025-01-15",
        time: "09:00",
        title: "Budget Review",
        type: "meeting",
        assignedTo: "PA Srinivas",
        status: "confirmed",
      },
      {
        id: 8,
        date: "2025-01-20",
        time: "14:00",
        title: "School Opening Ceremony",
        type: "event",
        assignedTo: "Field Officer Ramesh",
        status: "confirmed",
      },
      {
        id: 9,
        date: "2025-01-25",
        time: "10:30",
        title: "Road Project Launch",
        type: "event",
        assignedTo: null,
        status: "unassigned",
      },
    ],
  };

  const teamMembers = [
    { id: 1, name: "PA Srinivas", role: "Personal Assistant" },
    { id: 2, name: "Field Officer Ramesh", role: "Field Officer" },
    { id: 3, name: "Field Officer Kumar", role: "Field Officer" },
    { id: 4, name: "Back Officer Priya", role: "Back Officer" },
  ];

  const telanganaDistricts = [
    { name: "Karimnagar", constituencies: ["Manthanani", "Karimnagar", "Choppadandi"] },
    { name: "Peddapalli", constituencies: ["Ramagundam", "Peddapalli", "Dharmapuri"] },
    { name: "Warangal", constituencies: ["Warangal East", "Warangal West", "Wardhanapet"] },
  ];

  const dashboardStats = {
    totalGrievances: mockGrievances.length,
    totalProjects: mockProjects.length,
    pendingItems:
      mockGrievances.filter((g) => g.status === "Pending").length +
      mockProjects.filter((p) => p.status === "Planning").length,
    completedItems:
      mockGrievances.filter((g) => g.status === "Resolved").length +
      mockProjects.filter((p) => p.status === "Completed").length,
  };

  const getFilteredData = () => {
    let data = dataType === "grievances" ? mockGrievances : mockProjects;

    if (selectedDistrict) {
      data = data.filter((item) => item.district === selectedDistrict);
    }
    if (selectedConstituency) {
      data = data.filter((item) => item.constituency === selectedConstituency);
    }

    return data;
  };

  const handleAIQuery = () => {
    if (!aiQuery.trim()) return;

    // Simple AI responses based on keywords
    let response = "";
    const query = aiQuery.toLowerCase();

    if (query.includes("grievance") || query.includes("complaint")) {
      response = `You have ${dashboardStats.totalGrievances} total grievances, with ${dashboardStats.pendingItems} pending. Most common issues are infrastructure and water supply problems in Manthanani and Ramagundam areas.`;
    } else if (query.includes("project")) {
      response = `Currently ${dashboardStats.totalProjects} projects are running with budget allocation of ₹52 Lakh total. Bridge construction in Manthanani is in progress.`;
    } else if (query.includes("calendar") || query.includes("meeting")) {
      response = `You have ${mockCalendarEvents.today.length} events today, ${mockCalendarEvents.week.length} this week, and ${mockCalendarEvents.month.length} this month. Next event is ${mockCalendarEvents.today[0]?.title} at ${mockCalendarEvents.today[0]?.time}.`;
    } else if (query.includes("district") || query.includes("area")) {
      response = `Your constituency covers ${telanganaDistricts.length} main districts: Karimnagar, Peddapalli, and Warangal with multiple constituencies under each.`;
    } else {
      response = `I can help you with information about grievances, projects, calendar events, and constituency data. Please ask specific questions about these topics.`;
    }

    setAiResponse(response);
  };

  const handleMapClick = (district, constituency = null) => {
    setSelectedDistrict(district);
    setSelectedConstituency(constituency);
    setShowFilteredList(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <div className="min-w-0">
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900 truncate">Minister {t.dashboard}</h1>
              <p className="text-sm lg:text-base text-gray-600 truncate">Manthanani Constituency Management</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-28 lg:w-32">
                  <Languages className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="te">తెలుగు</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={() => setShowCalendar(!showCalendar)}
                variant={showCalendar ? "default" : "outline"}
                size="sm"
                className="text-xs lg:text-sm"
              >
                <Calendar className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                <span className="hidden sm:inline">{t.calendar}</span>
              </Button>
              <Button
                onClick={() => setShowAI(!showAI)}
                variant={showAI ? "default" : "outline"}
                size="sm"
                className="text-xs lg:text-sm"
              >
                <MessageCircle className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                <span className="hidden sm:inline">{t.aiAssistant}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Dashboard */}
          <div className="xl:col-span-2 space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              <Card
                className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] border-l-4 border-l-blue-500"
                onClick={() => {
                  setDataType("grievances");
                  setShowFilteredList(true);
                }}
              >
                <CardContent className="p-4 lg:p-6 bg-gradient-to-br from-blue-50 to-white">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs lg:text-sm font-medium text-gray-600 truncate">{t.totalGrievances}</p>
                      <p className="text-2xl lg:text-3xl font-bold text-blue-600">{dashboardStats.totalGrievances}</p>
                    </div>
                    <FileText className="w-6 h-6 lg:w-8 lg:h-8 text-blue-500 flex-shrink-0 ml-2" />
                  </div>
                </CardContent>
              </Card>
              <Card
                className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] border-l-4 border-l-green-500"
                onClick={() => {
                  setDataType("projects");
                  setShowFilteredList(true);
                }}
              >
                <CardContent className="p-4 lg:p-6 bg-gradient-to-br from-green-50 to-white">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs lg:text-sm font-medium text-gray-600 truncate">{t.totalProjects}</p>
                      <p className="text-2xl lg:text-3xl font-bold text-green-600">{dashboardStats.totalProjects}</p>
                    </div>
                    <Building2 className="w-6 h-6 lg:w-8 lg:h-8 text-green-500 flex-shrink-0 ml-2" />
                  </div>
                </CardContent>
              </Card>
              {/* <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] border-l-4 border-l-orange-500">
                <CardContent className="p-4 lg:p-6 bg-gradient-to-br from-orange-50 to-white">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs lg:text-sm font-medium text-gray-600 truncate">{t.pendingItems}</p>
                      <p className="text-2xl lg:text-3xl font-bold text-orange-600">{dashboardStats.pendingItems}</p>
                    </div>
                    <Clock className="w-6 h-6 lg:w-8 lg:h-8 text-orange-500 flex-shrink-0 ml-2" />
                  </div>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] border-l-4 border-l-purple-500">
                <CardContent className="p-4 lg:p-6 bg-gradient-to-br from-purple-50 to-white">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs lg:text-sm font-medium text-gray-600 truncate">{t.completedItems}</p>
                      <p className="text-2xl lg:text-3xl font-bold text-purple-600">{dashboardStats.completedItems}</p>
                    </div>
                    <Check className="w-6 h-6 lg:w-8 lg:h-8 text-purple-500 flex-shrink-0 ml-2" />
                  </div>
                </CardContent>
              </Card> */}
            </div>

            {/* Filtered List */}
            {showFilteredList && (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>
                      {selectedConstituency || selectedDistrict || "All"} -{" "}
                      {dataType === "grievances" ? t.grievances : t.projects}
                    </CardTitle>
                    <Button onClick={() => setShowFilteredList(false)} variant="outline" size="sm">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Assigned To</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getFilteredData().map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.trackingNumber || item.projectNumber}</TableCell>
                          <TableCell>{item.title || item.name}</TableCell>
                          <TableCell>{item.location}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                item.status === "Resolved" || item.status === "Completed"
                                  ? "bg-green-100 text-green-800"
                                  : item.status === "In Progress"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-orange-100 text-orange-800"
                              }
                            >
                              {item.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{item.assignedTo}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* Telangana Map */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  {t.map} - Interactive District View
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-br from-green-50 to-blue-50 p-4 rounded-lg">
                  <TelanganaMap onDistrictClick={handleMapClick} />
                  {selectedDistrict && (
                    <div className="mt-4 p-4 bg-white rounded-lg border shadow-sm">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-600">
                            Selected:{" "}
                            <strong className="text-blue-600">{selectedConstituency || selectedDistrict}</strong>
                            {selectedDistrict && ` District`}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Click on districts to view detailed information and statistics
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedDistrict(null);
                            setSelectedConstituency(null);
                          }}
                        >
                          Clear Selection
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Interactive Calendar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Interactive Event Calendar
                </CardTitle>
                <div className="text-sm text-gray-600 mt-2">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                      <span>Marriage</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
                      <span>Meeting</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                      <span>Other</span>
                    </div>
                  </div>
                  <p className="text-xs mt-2">Click on any date to view and assign events</p>
                </div>
              </CardHeader>
              <CardContent>
                <EventCalendar />
              </CardContent>
            </Card>

            {/* AI Assistant - Always Show */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  {t.aiAssistant}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea
                    placeholder={t.askQuestion}
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    rows={3}
                  />
                  <div className="flex space-x-2">
                    <Button onClick={handleAIQuery} size="sm" className="flex-1">
                      <Send className="w-4 h-4 mr-2" />
                      {t.send}
                    </Button>
                    <Button
                      onClick={() => {
                        setAiQuery("");
                        setAiResponse("");
                      }}
                      variant="outline"
                      size="sm"
                    >
                      {t.clear}
                    </Button>
                  </div>
                  {aiResponse && (
                    <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                      <p className="text-sm text-gray-700">{aiResponse}</p>
                    </div>
                  )}
                  {!aiResponse && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600">
                        ✨ Ask me about:
                        <br />
                        • Grievance statistics
                        <br />
                        • Project updates
                        <br />
                        • Calendar events
                        <br />• District information
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Assignment Modal */}
      {showAssignModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Assign Event</h3>
            </div>
            <div className="p-4">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Event: <strong className="text-gray-900">{selectedEvent.title}</strong>
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Time:{" "}
                  <strong className="text-gray-900">
                    {selectedEvent.date && `${selectedEvent.date} `}
                    {selectedEvent.time}
                  </strong>
                </p>
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select team member" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers.map((member) => (
                      <SelectItem key={member.id} value={member.name}>
                        {member.name} - {member.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="p-4 border-t bg-gray-50">
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedEvent(null);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    // Here you would update the event assignment
                    setShowAssignModal(false);
                    setSelectedEvent(null);
                  }}
                  className="flex-1"
                >
                  Assign
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
