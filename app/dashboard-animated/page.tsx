"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { 
  FileText, 
  Users, 
  MapPin, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Phone,
  MessageCircle,
  Download,
  Printer,
  Eye,
  Filter,
  Search,
  Calendar,
  IndianRupee,
  BarChart3,
  PieChart,
  Activity,
  Settings
} from "lucide-react"
import { AnimatedLayout, AnimatedSection, AnimatedGrid } from "@/components/layout/animated-layout"
import { AnimatedNavigation } from "@/components/navigation/animated-navigation"
import { AnimatedCard } from "@/components/ui/animated-card"
import { AnimatedButton } from "@/components/ui/animated-button"
import { AnimatedModal } from "@/components/ui/animated-modal"
import { AnimatedSidebar } from "@/components/ui/animated-sidebar"
import { LoadingSkeleton, SkeletonCard, SkeletonText } from "@/components/ui/loading-skeleton"
import { GovernmentHeader } from "@/components/ui/government-header"

export default function AnimatedDashboard() {
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  const stats = [
    {
      title: "Total Grievances",
      value: "1,247",
      change: "+12%",
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Active Officers",
      value: "45",
      change: "+5%",
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Resolution Rate",
      value: "78.5%",
      change: "+3.2%",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      title: "Pending Issues",
      value: "156",
      change: "-8%",
      icon: AlertTriangle,
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    }
  ]

  const recentGrievances = [
    {
      id: "GRV-2024-001",
      title: "Road Repair - Main Street",
      status: "In Progress",
      priority: "High",
      location: "Hyderabad Central",
      date: "2024-01-15"
    },
    {
      id: "GRV-2024-002",
      title: "Water Supply Issue",
      status: "Pending",
      priority: "Urgent",
      location: "Warangal East",
      date: "2024-01-14"
    },
    {
      id: "GRV-2024-003",
      title: "Street Light Repair",
      status: "Resolved",
      priority: "Medium",
      location: "Karimnagar",
      date: "2024-01-13"
    }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <SkeletonText lines={2} className="max-w-md" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <AnimatedLayout>
      <GovernmentHeader />
      
      {/* Main Navigation */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <img 
                src="/telangana-logo.png" 
                alt="Telangana Government" 
                className="h-8 w-auto"
              />
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Grievance Management System
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <AnimatedNavigation />
              
              <AnimatedButton
                variant="ghost"
                size="icon"
                icon={<Phone className="h-5 w-5" />}
                onClick={() => setIsModalOpen(true)}
              />
              
              <AnimatedButton
                variant="government"
                icon={<Eye className="h-4 w-4" />}
                onClick={() => setIsSidebarOpen(true)}
              >
                Quick Actions
              </AnimatedButton>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <AnimatedSection delay={0.1} direction="up">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome back, Minister
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Here's an overview of your constituency's grievance management status
            </p>
          </div>
        </AnimatedSection>

        {/* Stats Grid */}
        <AnimatedGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <AnimatedCard key={stat.title} delay={index * 0.1}>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stat.value}
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-400">
                        {stat.change} from last month
                      </p>
                    </div>
                    <div className={`p-3 rounded-full ${stat.bgColor}`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </div>
              </AnimatedCard>
            )
          })}
        </AnimatedGrid>

        {/* Charts and Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Status Distribution Chart */}
          <AnimatedSection delay={0.3} direction="left">
            <AnimatedCard>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Grievance Status Distribution
                  </h3>
                  <AnimatedButton
                    variant="outline"
                    size="sm"
                    icon={<BarChart3 className="h-4 w-4" />}
                  >
                    View Details
                  </AnimatedButton>
                </div>
                
                {/* Mock Chart */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Resolved</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-green-500"
                          initial={{ width: 0 }}
                          animate={{ width: "78%" }}
                          transition={{ duration: 1, delay: 0.5 }}
                        />
                      </div>
                      <span className="text-sm font-medium">78%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">In Progress</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-blue-500"
                          initial={{ width: 0 }}
                          animate={{ width: "15%" }}
                          transition={{ duration: 1, delay: 0.7 }}
                        />
                      </div>
                      <span className="text-sm font-medium">15%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="text-sm">Pending</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-orange-500"
                          initial={{ width: 0 }}
                          animate={{ width: "7%" }}
                          transition={{ duration: 1, delay: 0.9 }}
                        />
                      </div>
                      <span className="text-sm font-medium">7%</span>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedCard>
          </AnimatedSection>

          {/* Recent Activity */}
          <AnimatedSection delay={0.4} direction="right">
            <AnimatedCard>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Recent Activity
                  </h3>
                  <AnimatedButton
                    variant="outline"
                    size="sm"
                    icon={<Activity className="h-4 w-4" />}
                  >
                    View All
                  </AnimatedButton>
                </div>
                
                <div className="space-y-4">
                  {recentGrievances.map((grievance, index) => (
                    <motion.div
                      key={grievance.id}
                      className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                    >
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {grievance.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {grievance.location} • {grievance.date}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          grievance.priority === 'Urgent' ? 'bg-red-100 text-red-800' :
                          grievance.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {grievance.priority}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          grievance.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                          grievance.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {grievance.status}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </AnimatedCard>
          </AnimatedSection>
        </div>

        {/* Action Buttons */}
        <AnimatedSection delay={0.5} direction="up">
          <div className="flex flex-wrap gap-4 justify-center">
            <AnimatedButton
              variant="government"
              size="lg"
              icon={<MapPin className="h-5 w-5" />}
            >
              View Map
            </AnimatedButton>
            
            <AnimatedButton
              variant="outline"
              size="lg"
              icon={<FileText className="h-5 w-5" />}
            >
              Create Grievance
            </AnimatedButton>
            
            <AnimatedButton
              variant="outline"
              size="lg"
              icon={<Download className="h-5 w-5" />}
            >
              Export Report
            </AnimatedButton>
            
            <AnimatedButton
              variant="outline"
              size="lg"
              icon={<Printer className="h-5 w-5" />}
            >
              Print Summary
            </AnimatedButton>
          </div>
        </AnimatedSection>
      </main>

      {/* Animated Modal */}
      <AnimatedModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Contact Information"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <Phone className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Emergency Helpline</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">+91-1800-425-1234</p>
            </div>
            <AnimatedButton
              variant="outline"
              size="sm"
              icon={<Phone className="h-4 w-4" />}
            >
              Call
            </AnimatedButton>
          </div>
          
          <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">WhatsApp Support</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">+91-98765-43210</p>
            </div>
            <AnimatedButton
              variant="outline"
              size="sm"
              icon={<MessageCircle className="h-4 w-4" />}
            >
              Message
            </AnimatedButton>
          </div>
        </div>
      </AnimatedModal>

      {/* Animated Sidebar */}
      <AnimatedSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        title="Quick Actions"
        position="right"
        width="400px"
      >
        <div className="space-y-4">
          <AnimatedButton
            variant="government"
            className="w-full"
            icon={<MapPin className="h-4 w-4" />}
          >
            View Geospatial Map
          </AnimatedButton>
          
          <AnimatedButton
            variant="outline"
            className="w-full"
            icon={<BarChart3 className="h-4 w-4" />}
          >
            Analytics Dashboard
          </AnimatedButton>
          
          <AnimatedButton
            variant="outline"
            className="w-full"
            icon={<Users className="h-4 w-4" />}
          >
            Officer Directory
          </AnimatedButton>
          
          <AnimatedButton
            variant="outline"
            className="w-full"
            icon={<Download className="h-4 w-4" />}
          >
            Download Reports
          </AnimatedButton>
          
          <AnimatedButton
            variant="outline"
            className="w-full"
            icon={<Settings className="h-4 w-4" />}
          >
            System Settings
          </AnimatedButton>
        </div>
      </AnimatedSidebar>
    </AnimatedLayout>
  )
}
