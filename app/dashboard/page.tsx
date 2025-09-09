"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  TrendingUp,
  BarChart3,
  Activity,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Building2,
  X,
  Languages,
  File,
} from "lucide-react";

// Dynamically import TelanganaMap to avoid SSR issues with Leaflet
const TelanganaMap = dynamic(() => import("../../components/TelanganaMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] bg-gray-100 rounded-lg flex items-center justify-center">Loading Map...</div>
  ),
});

// Dynamically import EventCalendar to avoid SSR issues
const EventCalendar = dynamic(() => import("../../components/EventCalendar"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">Loading Calendar...</div>
  ),
});

const translations = {
  en: {
    dashboard: "Dashboard",
    grievances: "Grievances",
    projects: "Projects",
    totalGrievances: "Total Grievances",
    totalProjects: "Total Projects",
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
    calendar: "క్యాలెండర్",
    map: "తెలంగాణ మ్యాప్",
    aiAssistant: "AI సహాయకుడు",
    askQuestion: "మీ నియోజకవర్గం గురించి ఏదైనా అడగండి...",
    send: "పంపు",
    clear: "క్లియర్",
  },
};

export default function DashboardPage() {
  const [language, setLanguage] = useState("en");
  const [showFilteredList, setShowFilteredList] = useState(false);
  const [dataType, setDataType] = useState("grievances");
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedConstituency, setSelectedConstituency] = useState(null);
  const [assignments, setAssignments] = useState({});

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
      createdOn: "01-09-2025",
      completedOn: "",
      pendingSince: "9 days",
      citizenName: "Rajesh Kumar",
      citizenPhone: "+91-9876543210",
      location: "Manthanani Village",
      district: "Karimnagar",
      constituency: "Manthanani",
      description: "Main road has multiple potholes",
      assignedTo: "Field Officer Ramesh",
    },
    {
      id: 2,
      trackingNumber: "GRI-H-45-07012025",
      title: "Water Supply Issue",
      category: "Water",
      status: "In Progress",
      priority: "Medium",
      createdOn: "01-08-2025",
      completedOn: "11-08-2025",
      citizenName: "Sita Devi",
      citizenPhone: "+91-9876543211",
      location: "Ramagundam",
      district: "Peddapalli",
      constituency: "Ramagundam",
      description: "Irregular water supply",
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
      projectValue: "₹0.5 Crore",
      amountPaid: "₹0.2 Crore",
      comission: "₹0.01 Crore",
      startedOn: "01-09-2025",
      completedOn: "",
      location: "Manthanani",
      district: "Karimnagar",
      constituency: "Manthanani",
      description: "New bridge construction",
      assignedTo: "Engineer Kumar",
      pdfIcon: <File className="h-4 w-4 mr-2" />,
    },
  ];

  const teamMembers = [
    "Field Officer Ramesh",
    "PA Srinivas",
    "Engineer Kumar",
    "Officer Priya",
    "Officer Anil",
    "Officer Suresh",
    "Officer Lakshmi",
    "Officer Raju",
    "Officer Meena",
    "Officer Vijay",
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

  const stats = [
    {
      title: t.totalGrievances,
      value: dashboardStats.totalGrievances,
      change: "+12%",
      changeType: "positive",
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: t.totalProjects,
      value: dashboardStats.totalProjects,
      change: "+5%",
      changeType: "positive",
      icon: Building2,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
  ];

  const grievanceColumns = [
    { header: "ID", field: "trackingNumber", special: null },
    { header: "Title", field: "title", special: null },
    { header: "Requestor", field: "citizenName", special: null },
    { header: "Requestor Mobile", field: "citizenPhone", special: null },
    { header: "Created On", field: "createdOn", special: null },
    { header: "Completed On", field: "completedOn", special: null },
    { header: "Pending Since", field: "pendingSince", special: null },
    { header: "Location", field: "location", special: null },
    { header: "Status", field: "status", special: "badge" },
    { header: "Assigned To", field: "assignedTo", special: "select" },
  ];

  const projectColumns = [
    { header: "ID", field: "projectNumber", special: null },
    { header: "Name", field: "name", special: null },
    { header: "Started On", field: "startedOn", special: null },
    { header: "Completed On", field: "completedOn", special: null },
    { header: "Project Value", field: "projectValue", special: null },
    { header: "Amount Paid", field: "amountPaid", special: null },
    { header: "Comission", field: "comission", special: null },
    { header: "Location", field: "location", special: null },
    { header: "Status", field: "status", special: "badge" },
    { header: "Assigned To", field: "assignedTo", special: "select" },
  ];

  const recentGrievances = [
    {
      id: "GRV-001",
      title: "Road Repair on Main Street",
      status: "In Progress",
      priority: "High",
      category: "Infrastructure",
      assignedTo: "Officer Kumar",
      createdAt: "2 hours ago",
      location: "Hyderabad",
    },
    {
      id: "GRV-002",
      title: "Water Supply Disruption",
      status: "Pending",
      priority: "High",
      category: "Utilities",
      assignedTo: "Officer Sharma",
      createdAt: "4 hours ago",
      location: "Secunderabad",
    },
    {
      id: "GRV-003",
      title: "Street Light Repair",
      status: "Resolved",
      priority: "Medium",
      category: "Infrastructure",
      assignedTo: "Officer Patel",
      createdAt: "1 day ago",
      location: "Warangal",
    },
  ];

  const categoryStats = [
    { name: "Infrastructure", count: 456, percentage: 36.6 },
    { name: "Utilities", count: 234, percentage: 18.8 },
    { name: "Healthcare", count: 189, percentage: 15.2 },
    { name: "Education", count: 156, percentage: 12.5 },
    { name: "Others", count: 212, percentage: 17.0 },
  ];

  const telanganaDistricts = [
    { name: "Karimnagar", constituencies: ["Manthanani", "Karimnagar", "Choppadandi"] },
    { name: "Peddapalli", constituencies: ["Ramagundam", "Peddapalli", "Dharmapuri"] },
    { name: "Warangal", constituencies: ["Warangal East", "Warangal West", "Wardhanapet"] },
  ];

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

  const handleMapClick = (district, constituency = null) => {
    setSelectedDistrict(district);
    setSelectedConstituency(constituency);
    setShowFilteredList(true);
  };

  const handleAssignChange = (itemId, value) => {
    setAssignments((prev) => ({
      ...prev,
      [itemId]: value,
    }));
    // Update the mock data (in a real app, this would typically involve an API call)
    if (dataType === "grievances") {
      const updatedGrievances = mockGrievances.map((item) =>
        item.id === itemId ? { ...item, assignedTo: value } : item
      );
      mockGrievances.splice(0, mockGrievances.length, ...updatedGrievances);
    } else {
      const updatedProjects = mockProjects.map((item) =>
        item.id === itemId ? { ...item, assignedTo: value } : item
      );
      mockProjects.splice(0, mockProjects.length, ...updatedProjects);
    }
  };

  const columns = dataType === "grievances" ? grievanceColumns : projectColumns;

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header with Language Selector */}
      <div className="bg-white shadow-sm border-b p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900 truncate">{t.dashboard}</h1>
            <p className="text-sm lg:text-base text-gray-600 truncate">Manthanani Constituency Management</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-28 lg:w-32">
                <Languages className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="te">తెలుగు</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {stats.map((stat) => (
          <Card
            key={stat.title}
            className={`cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] border-l-4 ${
              stat.title === t.totalGrievances
                ? "border-l-blue-500"
                : stat.title === t.totalProjects
                ? "border-l-green-500"
                : stat.title === "Pending"
                ? "border-l-orange-500"
                : "border-l-purple-500"
            }`}
            onClick={() => {
              if (stat.title === t.totalGrievances) {
                setDataType("grievances");
                setShowFilteredList(true);
              } else if (stat.title === t.totalProjects) {
                setDataType("projects");
                setShowFilteredList(true);
              }
            }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs text-gray-500 mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                {stat.change} from last month
              </div>
            </CardContent>
          </Card>
        ))}
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
                  {columns.map((col) => (
                    <TableHead key={col.header}>{col.header}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {getFilteredData().map((item) => (
                  <TableRow key={item.id}>
                    {columns.map((col) => (
                      <TableCell key={col.header} className={col.header === "ID" ? "font-medium" : ""}>
                        {col.special === "badge" ? (
                          <Badge
                            className={
                              item[col.field] === "Resolved" || item[col.field] === "Completed"
                                ? "bg-green-100 text-green-800"
                                : item[col.field] === "In Progress"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-orange-100 text-orange-800"
                            }
                          >
                            {item[col.field]}
                          </Badge>
                        ) : col.special === "select" ? (
                          <Select
                            value={assignments[item.id] || item[col.field] || ""}
                            onValueChange={(value) => handleAssignChange(item.id, value)}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Select assignee" />
                            </SelectTrigger>
                            <SelectContent>
                              {teamMembers.map((member) => (
                                <SelectItem key={member} value={member}>
                                  {member}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          item[col.field] || "N/A"
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Grievances and Map */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Grievances */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Grievances
              </CardTitle>
              <CardDescription>Latest grievances and their current status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentGrievances.map((grievance) => (
                  <div key={grievance.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{grievance.title}</h4>
                        <Badge
                          variant={
                            grievance.status === "Resolved"
                              ? "default"
                              : grievance.status === "In Progress"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {grievance.status}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={
                            grievance.priority === "High"
                              ? "border-red-500 text-red-700"
                              : grievance.priority === "Medium"
                              ? "border-yellow-500 text-yellow-700"
                              : "border-green-500 text-green-700"
                          }
                        >
                          {grievance.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {grievance.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {grievance.assignedTo}
                        </span>
                        <span>{grievance.createdAt}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

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

        {/* Right Column: Category Distribution, Calendar, and Quick Actions */}
        <div className="space-y-6">
          {/* Category Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Category Distribution
              </CardTitle>
              <CardDescription>Grievances by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryStats.map((category) => (
                  <div key={category.name} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{category.name}</span>
                      <span className="text-gray-500">{category.count}</span>
                    </div>
                    <Progress value={category.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

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

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Create New Grievance
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Assign Grievances
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <BarChart3 className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Meeting
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Average Resolution Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.2 days</div>
            <p className="text-xs text-gray-500 mt-1">Target: 5 days</p>
            <Progress value={64} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Citizen Satisfaction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2%</div>
            <p className="text-xs text-gray-500 mt-1">Based on 1,158 responses</p>
            <Progress value={94.2} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.7%</div>
            <p className="text-xs text-gray-500 mt-1">Within 24 hours</p>
            <Progress value={98.7} className="mt-2" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
