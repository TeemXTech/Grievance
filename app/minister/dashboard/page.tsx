"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

const TelanganaMap = dynamic(() => import("../../../components/TelanganaMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
      Loading Map...
    </div>
  ),
});

const EventCalendar = dynamic(
  () => import("../../../components/EventCalendar"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] bg-gray-100 rounded-lg flex items-center justify-center">
        Loading Calendar...
      </div>
    ),
  }
);

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Building2,
  Calendar,
  MapPin,
  MessageCircle,
  Send,
  File,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function MinisterDashboard() {
  const [activeView, setActiveView] = useState("dashboard");
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedConstituency, setSelectedConstituency] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showAI, setShowAI] = useState(true);
  const [showFilteredList, setShowFilteredList] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [language, setLanguage] = useState("en");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dataType, setDataType] = useState("grievances");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [selectedProjectAssignee, setSelectedProjectAssignee] = useState(null);
  const [selectedGrievanceAssignee, setSelectedGrievanceAssignee] =
    useState(null);

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
      askQuestion: "Ask about your constituency...",
      send: "Send",
      clear: "Clear",
      all: "All",
      pending: "Pending",
      inProgress: "In Progress",
      resolved: "Resolved",
      completed: "Completed",
      planning: "Planning",
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
      askQuestion: "మీ నియోజకవర్గం గురించి అడగండి...",
      send: "పంపు",
      clear: "క్లియర్",
      all: "అన్నీ",
      pending: "పెండింగ్",
      inProgress: "పురోగతిలో",
      resolved: "పరిష్కరించబడింది",
      completed: "పూర్తయింది",
      planning: "ప్లానింగ్",
    },
  };
  const t = translations[language];

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
      assignedTo: "",
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
      shortDescription: "New bridge over local river",
      description: "New bridge construction",
      createdAt: "2025-01-08",
      assignedTo: "Engineer Kumar",
      hasAttachment: true,
    },
    {
      id: 2,
      projectNumber: "PRJ-W-15-08012025",
      name: "Water Treatment Plant",
      category: "Water",
      status: "Planning",
      budget: "₹75 Lakh",
      location: "Ramagundam",
      district: "Peddapalli",
      constituency: "Ramagundam",
      shortDescription: "Modern water treatment facility",
      description: "Construction of water treatment plant",
      createdAt: "2025-01-08",
      assignedTo: "",
      hasAttachment: false,
    },
  ];

  const teamMembers = [
    { id: 1, name: "PA Srinivas", role: "Personal Assistant" },
    { id: 2, name: "Field Officer Ramesh", role: "Field Officer" },
    { id: 3, name: "Field Officer Kumar", role: "Field Officer" },
    { id: 4, name: "Back Officer Priya", role: "Back Officer" },
  ];

  const telanganaDistricts = [
    {
      name: "Karimnagar",
      constituencies: ["Manthanani", "Karimnagar", "Choppadandi"],
    },
    {
      name: "Peddapalli",
      constituencies: ["Ramagundam", "Peddapalli", "Dharmapuri"],
    },
    {
      name: "Warangal",
      constituencies: ["Warangal East", "Warangal West", "Wardhanapet"],
    },
  ];

  const constituencyToDistrict = {};
  telanganaDistricts.forEach((d) => {
    d.constituencies.forEach((c) => {
      constituencyToDistrict[c] = d.name;
    });
  });

  const dashboardStats = {
    totalGrievances: mockGrievances.length,
    totalProjects: mockProjects.length,
  };

  const projectStatuses = mockProjects.reduce((acc, proj) => {
    acc[proj.status] = (acc[proj.status] || 0) + 1;
    return acc;
  }, {});
  const totalProjects = mockProjects.length;
  const statusData = Object.entries(projectStatuses).map(([name, value]) => ({
    name,
    value,
  }));

  const projectCategories = mockProjects.reduce((acc, proj) => {
    acc[proj.category] = (acc[proj.category] || 0) + 1;
    return acc;
  }, {});
  const categoryData = Object.keys(projectCategories).map((key) => ({
    name: key,
    value: projectCategories[key],
  }));
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  const projectsByAssigned = mockProjects.reduce((acc, proj) => {
    const key = proj.assignedTo || "Unassigned";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const assignedProjectData = Object.entries(projectsByAssigned).map(
    ([name, value]) => ({ name, value })
  );

  const projectsByState = { Telangana: totalProjects };
  const projectsByDistrict = mockProjects.reduce((acc, proj) => {
    acc[proj.district] = (acc[proj.district] || 0) + 1;
    return acc;
  }, {});
  const projectsByConstituency = mockProjects.reduce((acc, proj) => {
    acc[proj.constituency] = (acc[proj.constituency] || 0) + 1;
    return acc;
  }, {});
  const projectsByVillage = mockProjects.reduce((acc, proj) => {
    acc[proj.location] = (acc[proj.location] || 0) + 1;
    return acc;
  }, {});

  const grievancesByAssigned = mockGrievances.reduce((acc, griev) => {
    const key = griev.assignedTo || "Unassigned";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const assignedGrievanceData = Object.entries(grievancesByAssigned).map(
    ([name, value]) => ({ name, value })
  );

  const totalGrievances = mockGrievances.length;
  const grievancesByState = { Telangana: totalGrievances };
  const grievancesByDistrict = mockGrievances.reduce((acc, griev) => {
    acc[griev.district] = (acc[griev.district] || 0) + 1;
    return acc;
  }, {});
  const grievancesByConstituency = mockGrievances.reduce((acc, griev) => {
    acc[griev.constituency] = (acc[griev.constituency] || 0) + 1;
    return acc;
  }, {});
  const grievancesByVillage = mockGrievances.reduce((acc, griev) => {
    acc[griev.location] = (acc[griev.location] || 0) + 1;
    return acc;
  }, {});

  const getFilteredData = () => {
    let data = dataType === "grievances" ? mockGrievances : mockProjects;
    // if (selectedDistrict)
    //   data = data.filter((item) => item.district === selectedDistrict);
    // if (selectedConstituency)
    //   data = data.filter((item) => item.constituency === selectedConstituency);
    // if (statusFilter !== "all")
    //   data = data.filter((item) => item.status.toLowerCase() === statusFilter);
    // if (selectedStatus)
    //   data = data.filter(
    //     (item) => item.status.toLowerCase() === selectedStatus.toLowerCase()
    //   );
    // if (dataType === "projects" && selectedProjectAssignee) {
    //   data = data.filter(
    //     (item) => (item.assignedTo || "Unassigned") === selectedProjectAssignee
    //   );
    // }
    // if (dataType === "grievances" && selectedGrievanceAssignee) {
    //   data = data.filter(
    //     (item) =>
    //       (item.assignedTo || "Unassigned") === selectedGrievanceAssignee
    //   );
    // }
    return data;
  };

  const handleAIQuery = () => {
    if (!aiQuery.trim()) return;
    let response = "";
    const query = aiQuery.toLowerCase();
    if (query.includes("grievance") || query.includes("complaint")) {
      response = `You have ${dashboardStats.totalGrievances} grievances. Common issues: infrastructure and water supply in Manthanani and Ramagundam.`;
    } else if (query.includes("project")) {
      response = `${dashboardStats.totalProjects} projects running with ₹125 Lakh total budget.`;
    } else if (query.includes("calendar") || query.includes("meeting")) {
      response = `${mockCalendarEvents.today.length} events today, ${mockCalendarEvents.week.length} this week, ${mockCalendarEvents.month.length} this month.`;
    } else if (query.includes("district") || query.includes("area")) {
      response = `Constituency covers ${telanganaDistricts.length} districts: Karimnagar, Peddapalli, Warangal.`;
    } else {
      response = `Ask about grievances, projects, events, or districts.`;
    }
    setAiResponse(response);
  };

  const handleMapClick = (district, constituency = null) => {
    setSelectedDistrict(district);
    setSelectedConstituency(constituency);
    setShowFilteredList(true);
  };

  const handleCalendarDateClick = (date) => {
    setSelectedEvent(mockCalendarEvents.today[0]);
    setShowAssignModal(true);
  };

  const handleAssign = (memberName) => {
    setShowAssignModal(false);
    setSelectedEvent(null);
  };

  const handleLocationClick = (type, key) => {
    setShowFilteredList(true);
    if (type === "state") {
      setSelectedDistrict(null);
      setSelectedConstituency(null);
    } else if (type === "district") {
      setSelectedDistrict(key);
      setSelectedConstituency(null);
    } else if (type === "constituency") {
      setSelectedDistrict(constituencyToDistrict[key]);
      setSelectedConstituency(key);
    }
  };

  const handleStatusClick = (status) => {
    setSelectedStatus(status);
    setShowFilteredList(true);
  };

  const handleAssigneeClick = (assignee, type) => {
    if (type === "projects") {
      setSelectedProjectAssignee(assignee);
      setSelectedGrievanceAssignee(null);
    } else {
      setSelectedGrievanceAssignee(assignee);
      setSelectedProjectAssignee(null);
    }
    setShowFilteredList(true);
  };

  
                                                                      
 return (
   <div className="min-h-screen bg-gray-50">
     <div className="bg-white shadow-sm border-b">
       <div className="max-w-7xl mx-auto px-4 py-3">
         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
           <div>
             <h1 className="text-lg font-bold text-gray-900">
               Minister {t.dashboard}
             </h1>
             <p className="text-sm text-gray-600">Manthanani Constituency</p>
           </div>
           <div className="flex items-center gap-2">
             <Select value={language} onValueChange={setLanguage}>
               <SelectTrigger className="w-24">
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
             >
               <Calendar className="w-4 h-4 mr-1" /> {t.calendar}
             </Button>
             <Button
               onClick={() => setShowAI(!showAI)}
               variant={showAI ? "default" : "outline"}
               size="sm"
             >
               <MessageCircle className="w-4 h-4 mr-1" /> {t.aiAssistant}
             </Button>
           </div>
         </div>
       </div>
     </div>

     <div className="max-w-7xl mx-auto px-4 py-4">
       <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
         <div className="lg:col-span-1 space-y-4">
           <Card>
             <CardHeader className="pb-2">
               <CardTitle className="text-sm">Project Status</CardTitle>
             </CardHeader>
             <CardContent className="p-4">
               <div className="space-y-2">
                 {statusData.map(({ name, value }) => (
                   <div
                     key={name}
                     className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded"
                     onClick={() => handleStatusClick(name.toLowerCase())}
                   >
                     <div className="flex-1 text-xs">
                       {t[name.toLowerCase()] || name}
                     </div>
                     <div className="flex-1">
                       <div className="h-2 bg-gray-200 rounded-full">
                         <div
                           className="h-2 bg-blue-500 rounded-full"
                           style={{
                             width: `${(value / totalProjects) * 100}%`,
                           }}
                         ></div>
                       </div>
                     </div>
                     <div className="text-xs font-bold">
                       {value}/{totalProjects}
                     </div>
                   </div>
                 ))}
               </div>
             </CardContent>
           </Card>

           <Card>
             <CardHeader className="pb-2">
               <CardTitle className="text-sm">Projects by Contractor</CardTitle>
             </CardHeader>
             <CardContent className="p-4">
               <div className="space-y-2">
                 {assignedProjectData.map(({ name, value }) => (
                   <div
                     key={name}
                     className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded"
                     onClick={() => handleAssigneeClick(name, "projects")}
                   >
                     <div className="flex-1 text-xs">{name}</div>
                     <div className="flex-1">
                       <div className="h-2 bg-gray-200 rounded-full">
                         <div
                           className="h-2 bg-green-500 rounded-full"
                           style={{
                             width: `${(value / totalProjects) * 100}%`,
                           }}
                         ></div>
                       </div>
                     </div>
                     <div className="text-xs font-bold">
                       {value}/{totalProjects}
                     </div>
                   </div>
                 ))}
               </div>
             </CardContent>
           </Card>

           <Card>
             <CardHeader className="pb-2">
               <CardTitle className="text-sm">
                 Grievances by Contractor
               </CardTitle>
             </CardHeader>
             <CardContent className="p-4">
               <div className="space-y-2">
                 {assignedGrievanceData.map(({ name, value }) => (
                   <div
                     key={name}
                     className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded"
                     onClick={() => handleAssigneeClick(name, "grievances")}
                   >
                     <div className="flex-1 text-xs">{name}</div>
                     <div className="flex-1">
                       <div className="h-2 bg-gray-200 rounded-full">
                         <div
                           className="h-2 bg-yellow-500 rounded-full"
                           style={{
                             width: `${(value / totalGrievances) * 100}%`,
                           }}
                         ></div>
                       </div>
                     </div>
                     <div className="text-xs font-bold">
                       {value}/{totalGrievances}
                     </div>
                   </div>
                 ))}
               </div>
             </CardContent>
           </Card>
         </div>

         <div className="lg:col-span-3 space-y-4">
           <div className="grid grid-cols-2 gap-4">
             <Card
               className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.01] border-l-4 border-l-blue-500"
               onClick={() => {
                 setDataType("grievances");
                 setShowFilteredList(true);
                 setSelectedStatus(null);
                 setSelectedProjectAssignee(null);
                 setSelectedGrievanceAssignee(null);
               }}
             >
               <CardContent className="p-4 bg-gradient-to-br from-blue-50 to-white">
                 <div className="flex items-center justify-between">
                   <div>
                     <p className="text-xs font-medium text-gray-600">
                       {t.totalGrievances}
                     </p>
                     <p className="text-2xl font-bold text-blue-600">
                       {dashboardStats.totalGrievances}
                     </p>
                   </div>
                   <FileText className="w-6 h-6 text-blue-500" />
                 </div>
               </CardContent>
             </Card>
             <Card
               className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.01] border-l-4 border-l-green-500"
               onClick={() => {
                 setDataType("projects");
                 setShowFilteredList(true);
                 setSelectedStatus(null);
                 setSelectedProjectAssignee(null);
                 setSelectedGrievanceAssignee(null);
               }}
             >
               <CardContent className="p-4 bg-gradient-to-br from-green-50 to-white">
                 <div className="flex items-center justify-between">
                   <div>
                     <p className="text-xs font-medium text-gray-600">
                       {t.totalProjects}
                     </p>
                     <p className="text-2xl font-bold text-green-600">
                       {dashboardStats.totalProjects}
                     </p>
                   </div>
                   <Building2 className="w-6 h-6 text-green-500" />
                 </div>
               </CardContent>
             </Card>
           </div>

           <Card>
             <CardHeader className="pb-2">
               <CardTitle className="text-sm">Projects by Category</CardTitle>
             </CardHeader>
             <CardContent>
               <ResponsiveContainer width="100%" height={150}>
                 <PieChart>
                   <Pie
                     data={categoryData}
                     dataKey="value"
                     nameKey="name"
                     cx="50%"
                     cy="50%"
                     innerRadius={30}
                     outerRadius={50}
                     label={{ fontSize: 10 }}
                   >
                     {categoryData.map((entry, index) => (
                       <Cell
                         key={`cell-${index}`}
                         fill={COLORS[index % COLORS.length]}
                       />
                     ))}
                   </Pie>
                   <Tooltip />
                   <Legend wrapperStyle={{ fontSize: 10 }} />
                 </PieChart>
               </ResponsiveContainer>
             </CardContent>
           </Card>

           {dataType === "projects" && (
             <Card>
               <CardHeader className="pb-2">
                 <CardTitle className="text-sm">Projects by Location</CardTitle>
               </CardHeader>
               <CardContent className="p-4">
                 <div className="grid grid-cols-2 gap-2 text-sm">
                   <div>
                     <h4 className="font-semibold mb-1 text-xs">State</h4>
                     <ul className="space-y-1">
                       {Object.entries(projectsByState).map(
                         ([state, count]) => (
                           <li
                             key={state}
                             className="flex justify-between cursor-pointer hover:bg-gray-100 p-1 rounded text-xs"
                             onClick={() => handleLocationClick("state", state)}
                           >
                             <span>{state}</span>
                             <span>{count}</span>
                           </li>
                         )
                       )}
                     </ul>
                   </div>
                   <div>
                     <h4 className="font-semibold mb-1 text-xs">District</h4>
                     <ul className="space-y-1">
                       {Object.entries(projectsByDistrict).map(
                         ([district, count]) => (
                           <li
                             key={district}
                             className="flex justify-between cursor-pointer hover:bg-gray-100 p-1 rounded text-xs"
                             onClick={() =>
                               handleLocationClick("district", district)
                             }
                           >
                             <span>{district}</span>
                             <span>{count}</span>
                           </li>
                         )
                       )}
                     </ul>
                   </div>
                   <div>
                     <h4 className="font-semibold mb-1 text-xs">
                       Constituency
                     </h4>
                     <ul className="space-y-1">
                       {Object.entries(projectsByConstituency).map(
                         ([constituency, count]) => (
                           <li
                             key={constituency}
                             className="flex justify-between cursor-pointer hover:bg-gray-100 p-1 rounded text-xs"
                             onClick={() =>
                               handleLocationClick("constituency", constituency)
                             }
                           >
                             <span>{constituency}</span>
                             <span>{count}</span>
                           </li>
                         )
                       )}
                     </ul>
                   </div>
                   <div>
                     <h4 className="font-semibold mb-1 text-xs">Village</h4>
                     <ul className="space-y-1">
                       {Object.entries(projectsByVillage).map(
                         ([village, count]) => (
                           <li
                             key={village}
                             className="flex justify-between p-1 text-xs"
                           >
                             <span>{village}</span>
                             <span>{count}</span>
                           </li>
                         )
                       )}
                     </ul>
                   </div>
                 </div>
               </CardContent>
             </Card>
           )}

           {dataType === "grievances" && (
             <Card>
               <CardHeader className="pb-2">
                 <CardTitle className="text-sm">
                   Grievances by Location
                 </CardTitle>
               </CardHeader>
               <CardContent className="p-4">
                 <div className="grid grid-cols-2 gap-2 text-sm">
                   <div>
                     <h4 className="font-semibold mb-1 text-xs">State</h4>
                     <ul className="space-y-1">
                       {Object.entries(grievancesByState).map(
                         ([state, count]) => (
                           <li
                             key={state}
                             className="flex justify-between cursor-pointer hover:bg-gray-100 p-1 rounded text-xs"
                             onClick={() => handleLocationClick("state", state)}
                           >
                             <span>{state}</span>
                             <span>{count}</span>
                           </li>
                         )
                       )}
                     </ul>
                   </div>
                   <div>
                     <h4 className="font-semibold mb-1 text-xs">District</h4>
                     <ul className="space-y-1">
                       {Object.entries(grievancesByDistrict).map(
                         ([district, count]) => (
                           <li
                             key={district}
                             className="flex justify-between cursor-pointer hover:bg-gray-100 p-1 rounded text-xs"
                             onClick={() =>
                               handleLocationClick("district", district)
                             }
                           >
                             <span>{district}</span>
                             <span>{count}</span>
                           </li>
                         )
                       )}
                     </ul>
                   </div>
                   <div>
                     <h4 className="font-semibold mb-1 text-xs">
                       Constituency
                     </h4>
                     <ul className="space-y-1">
                       {Object.entries(grievancesByConstituency).map(
                         ([constituency, count]) => (
                           <li
                             key={constituency}
                             className="flex justify-between cursor-pointer hover:bg-gray-100 p-1 rounded text-xs"
                             onClick={() =>
                               handleLocationClick("constiuency", constituency)
                             }
                           >
                             <span>{constituency}</span>
                             <span>{count}</span>
                           </li>
                         )
                       )}
                     </ul>
                   </div>
                   <div>
                     <h4 className="font-semibold mb-1 text-xs">Village</h4>
                     <ul className="space-y-1">
                       {Object.entries(grievancesByVillage).map(
                         ([village, count]) => (
                           <li
                             key={village}
                             className="flex justify-between p-1 text-xs"
                           >
                             <span>{village}</span>
                             <span>{count}</span>
                           </li>
                         )
                       )}
                     </ul>
                   </div>
                 </div>
               </CardContent>
             </Card>
           )}

           {showFilteredList && (
             <Card>
               <CardHeader className="pb-2">
                 <div className="flex justify-between items-center">
                   <CardTitle className="text-sm">
                     {selectedConstituency || selectedDistrict || "All"} -{" "}
                     {dataType === "grievances" ? t.grievances : t.projects}
                   </CardTitle>
                   <div className="flex items-center gap-2">
                     <Select
                       value={statusFilter}
                       onValueChange={setStatusFilter}
                     >
                       <SelectTrigger className="w-28">
                         <SelectValue placeholder="Status" />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="all">{t.all}</SelectItem>
                         <SelectItem value="pending">{t.pending}</SelectItem>
                         <SelectItem value="inProgress">
                           {t.inProgress}
                         </SelectItem>
                         <SelectItem value="resolved">{t.resolved}</SelectItem>
                         <SelectItem value="completed">
                           {t.completed}
                         </SelectItem>
                         <SelectItem value="planning">{t.planning}</SelectItem>
                       </SelectContent>
                     </Select>
                     <Button
                       onClick={() => {
                         setShowFilteredList(false);
                         setSelectedStatus(null);
                         setSelectedProjectAssignee(null);
                         setSelectedGrievanceAssignee(null);
                       }}
                       variant="outline"
                       size="sm"
                     >
                       <X className="w-4 h-4" />
                     </Button>
                   </div>
                 </div>
               </CardHeader>
               <CardContent>
                 <Table>
                   <TableHeader>
                     <TableRow>
                       <TableHead className="text-xs">ID</TableHead>
                       <TableHead className="text-xs">Title</TableHead>
                       <TableHead className="text-xs">Location</TableHead>
                       {dataType === "grievances" ? (
                         <>
                           <TableHead className="text-xs">Created By</TableHead>
                           <TableHead className="text-xs">Date</TableHead>
                           <TableHead className="text-xs">
                             Assigned To
                           </TableHead>
                         </>
                       ) : (
                         <>
                           <TableHead className="text-xs">
                             Description
                           </TableHead>
                           <TableHead className="text-xs">Category</TableHead>
                           <TableHead className="text-xs">Attachment</TableHead>
                           <TableHead className="text-xs">
                             Assigned To
                           </TableHead>
                         </>
                       )}
                       <TableHead className="text-xs">Status</TableHead>
                     </TableRow>
                   </TableHeader>
                   <TableBody>
                     {getFilteredData().map((item) => (
                       <TableRow key={item.id}>
                         <TableCell className="text-xs">
                           {item.trackingNumber || item.projectNumber || "N/A"}
                         </TableCell>
                         <TableCell className="text-xs">
                           {item.title || item.name || "N/A"}
                         </TableCell>
                         <TableCell className="text-xs">
                           {item.location}
                         </TableCell>
                         {dataType === "grievances" ? (
                           <>
                             <TableCell className="text-xs">
                               {item.citizenName || "N/A"}
                             </TableCell>
                             <TableCell className="text-xs">
                               {item.createdAt}
                             </TableCell>
                             <TableCell className="text-xs">
                               {item.assignedTo ? (
                                 item.assignedTo
                               ) : (
                                 <Select>
                                   <SelectTrigger className="w-24 text-xs">
                                     <SelectValue placeholder="Assign" />
                                   </SelectTrigger>
                                   <SelectContent>
                                     {teamMembers.map((member) => (
                                       <SelectItem
                                         key={member.id}
                                         value={member.name}
                                         className="text-xs"
                                       >
                                         {member.name}
                                       </SelectItem>
                                     ))}
                                   </SelectContent>
                                 </Select>
                               )}
                             </TableCell>
                           </>
                         ) : (
                           <>
                             <TableCell className="text-xs">
                               {item.shortDescription || "N/A"}
                             </TableCell>
                             <TableCell className="text-xs">
                               {item.category}
                             </TableCell>
                             <TableCell className="text-xs">
                               {item.hasAttachment && (
                                 <File className="w-4 h-4" />
                               )}
                             </TableCell>
                             <TableCell className="text-xs">
                               {item.assignedTo ? (
                                 item.assignedTo
                               ) : (
                                 <Select>
                                   <SelectTrigger className="w-24 text-xs">
                                     <SelectValue placeholder="Assign" />
                                   </SelectTrigger>
                                   <SelectContent>
                                     {teamMembers.map((member) => (
                                       <SelectItem
                                         key={member.id}
                                         value={member.name}
                                         className="text-xs"
                                       >
                                         {member.name}
                                       </SelectItem>
                                     ))}
                                   </SelectContent>
                                 </Select>
                               )}
                             </TableCell>
                           </>
                         )}
                         <TableCell>
                           <Badge
                             className={`text-xs ${
                               item.status === "Resolved" ||
                               item.status === "Completed"
                                 ? "bg-green-100 text-green-800"
                                 : item.status === "In Progress"
                                 ? "bg-blue-100 text-blue-800"
                                 : item.status === "Planning"
                                 ? "bg-purple-100 text-purple-800"
                                 : "bg-orange-100 text-orange-800"
                             }`}
                           >
                             {t[item.status.toLowerCase()] || item.status}
                           </Badge>
                         </TableCell>
                       </TableRow>
                     ))}
                   </TableBody>
                 </Table>
               </CardContent>
             </Card>
           )}

           <Card>
             <CardHeader className="pb-2">
               <CardTitle className="flex items-center text-sm">
                 <MapPin className="w-4 h-4 mr-1" /> {t.map}
               </CardTitle>
             </CardHeader>
             <CardContent>
               <div className="bg-gradient-to-br from-green-50 to-blue-50 p-3 rounded-lg">
                 <TelanganaMap onDistrictClick={handleMapClick} />
                 {selectedDistrict && (
                   <div className="mt-3 p-3 bg-white rounded-lg border">
                     <div className="flex justify-between items-center">
                       <div>
                         <p className="text-xs text-gray-600">
                           Selected:{" "}
                           <strong className="text-blue-600">
                             {selectedConstituency || selectedDistrict}
                           </strong>
                         </p>
                       </div>
                       <Button
                         size="sm"
                         variant="outline"
                         onClick={() => {
                           setSelectedDistrict(null);
                           setSelectedConstituency(null);
                           setShowFilteredList(true);
                         }}
                       >
                         Clear
                       </Button>
                     </div>
                   </div>
                 )}
               </div>
             </CardContent>
           </Card>

           {showCalendar && (
             <Card>
               <CardHeader className="pb-2">
                 <CardTitle className="flex items-center text-sm">
                   <Calendar className="w-4 h-4 mr-1" /> Event Calendar
                 </CardTitle>
                 <div className="text-xs text-gray-600">
                   <div className="flex items-center gap-2">
                     <div className="flex items-center">
                       <div className="w-2 h-2 bg-green-500 rounded mr-1"></div>{" "}
                       Marriage
                     </div>
                     <div className="flex items-center">
                       <div className="w-2 h-2 bg-yellow-500 rounded mr-1"></div>{" "}
                       Meeting
                     </div>
                     <div className="flex items-center">
                       <div className="w-2 h-2 bg-blue-500 rounded mr-1"></div>{" "}
                       Other
                     </div>
                   </div>
                 </div>
               </CardHeader>
               <CardContent>
                 <EventCalendar
                   key={showCalendar ? "show" : "hide"}
                   onDateClick={handleCalendarDateClick}
                 />
               </CardContent>
             </Card>
           )}

           {showAI && (
             <Card>
               <CardHeader className="pb-2">
                 <CardTitle className="flex items-center text-sm">
                   <MessageCircle className="w-4 h-4 mr-1" /> {t.aiAssistant}
                 </CardTitle>
               </CardHeader>
               <CardContent className="p-4">
                 <div className="space-y-2">
                   <Textarea
                     placeholder={t.askQuestion}
                     value={aiQuery}
                     onChange={(e) => setAiQuery(e.target.value)}
                     rows={2}
                     className="text-sm"
                   />
                   <div className="flex gap-2">
                     <Button
                       onClick={handleAIQuery}
                       size="sm"
                       className="flex-1"
                     >
                       <Send className="w-4 h-4 mr-1" /> {t.send}
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
                     <div className="p-2 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                       <p className="text-xs text-gray-700">{aiResponse}</p>
                     </div>
                   )}
                   {!aiResponse && (
                     <div className="p-2 bg-gray-50 rounded-lg">
                       <p className="text-xs text-gray-600">
                         Ask about: Grievances, Projects, Events, Districts
                       </p>
                     </div>
                   )}
                 </div>
               </CardContent>
             </Card>
           )}
         </div>
       </div>
     </div>

     {showAssignModal && selectedEvent && (
       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
         <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
           <div className="p-3 border-b">
             <h3 className="text-sm font-semibold text-gray-900">
               Assign Event
             </h3>
           </div>
           <div className="p-3">
             <p className="text-xs text-gray-600 mb-2">
               Event: <strong>{selectedEvent.title}</strong>
             </p>
             <p className="text-xs text-gray-600 mb-2">
               Date: <strong>{selectedEvent.date}</strong>
             </p>
             <p className="text-xs text-gray-600 mb-2">
               Time: <strong>{selectedEvent.time}</strong>
             </p>
             <p className="text-xs text-gray-600 mb-2">
               Type: <strong>{selectedEvent.type}</strong>
             </p>
             <Select
               onValueChange={(value) => handleAssign(value)}
               defaultValue={selectedEvent.assignedTo || ""}
             >
               <SelectTrigger className="w-full text-xs">
                 <SelectValue placeholder="Select team member" />
               </SelectTrigger>
               <SelectContent>
                 {teamMembers.map((member) => (
                   <SelectItem
                     key={member.id}
                     value={member.name}
                     className="text-xs"
                   >
                     {member.name} - {member.role}
                   </SelectItem>
                 ))}
               </SelectContent>
             </Select>
           </div>
           <div className="p-3 border-t bg-gray-50">
             <div className="flex gap-2">
               <Button
                 onClick={() => {
                   setShowAssignModal(false);
                   setSelectedEvent(null);
                 }}
                 variant="outline"
                 className="flex-1 text-xs"
               >
                 Cancel
               </Button>
               <Button
                 onClick={() => {
                   setShowAssignModal(false);
                   setSelectedEvent(null);
                 }}
                 className="flex-1 text-xs"
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
