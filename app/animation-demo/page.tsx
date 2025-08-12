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
  Settings,
  Home,
  Menu,
  X
} from "lucide-react"
import { AnimatedLayout, AnimatedSection, AnimatedGrid } from "@/components/layout/animated-layout"
import { AnimatedCard } from "@/components/ui/animated-card"
import { AnimatedButton } from "@/components/ui/animated-button"
import { AnimatedModal } from "@/components/ui/animated-modal"
import { AnimatedSidebar } from "@/components/ui/animated-sidebar"
import { LoadingSkeleton, SkeletonCard, SkeletonText } from "@/components/ui/loading-skeleton"
import { GovernmentHeader } from "@/components/ui/government-header"

export default function AnimationDemo() {
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [showSkeletons, setShowSkeletons] = React.useState(false)

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

  const handleLoadingDemo = () => {
    setShowSkeletons(true)
    setTimeout(() => setShowSkeletons(false), 3000)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <GovernmentHeader />
      
      {/* Header */}
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
                Animation Demo - Grievance Management System
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
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
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Animation Components Demo
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Explore the smooth animations and transitions in the Telangana Government Grievance Management System
            </p>
          </div>
        </AnimatedSection>

        {/* Demo Controls */}
        <AnimatedSection delay={0.2} direction="up">
          <div className="flex flex-wrap gap-4 justify-center mb-8">
            <AnimatedButton
              variant="government"
              size="lg"
              icon={<Menu className="h-5 w-5" />}
              onClick={() => setIsSidebarOpen(true)}
            >
              Open Sidebar
            </AnimatedButton>
            
            <AnimatedButton
              variant="outline"
              size="lg"
              icon={<Phone className="h-5 w-5" />}
              onClick={() => setIsModalOpen(true)}
            >
              Open Modal
            </AnimatedButton>
            
            <AnimatedButton
              variant="outline"
              size="lg"
              icon={<Activity className="h-5 w-5" />}
              onClick={handleLoadingDemo}
            >
              Show Loading
            </AnimatedButton>
            
            <AnimatedButton
              variant="outline"
              size="lg"
              icon={<Download className="h-5 w-5" />}
              loading={isLoading}
              onClick={() => {
                setIsLoading(true)
                setTimeout(() => setIsLoading(false), 2000)
              }}
            >
              Loading Demo
            </AnimatedButton>
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

        {/* Loading Skeletons Demo */}
        {showSkeletons && (
          <AnimatedSection delay={0.3} direction="up">
            <AnimatedCard>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Loading Skeletons Demo
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Text Skeleton</h4>
                    <SkeletonText lines={3} />
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Card Skeleton</h4>
                    <SkeletonCard />
                  </div>
                </div>
              </div>
            </AnimatedCard>
          </AnimatedSection>
        )}

        {/* Animation Examples */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Button Variants */}
          <AnimatedSection delay={0.4} direction="left">
            <AnimatedCard>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Button Animation Variants
                </h3>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <AnimatedButton variant="default">Default</AnimatedButton>
                    <AnimatedButton variant="government">Government</AnimatedButton>
                    <AnimatedButton variant="success">Success</AnimatedButton>
                    <AnimatedButton variant="warning">Warning</AnimatedButton>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <AnimatedButton variant="outline" size="sm">Small</AnimatedButton>
                    <AnimatedButton variant="outline" size="default">Default</AnimatedButton>
                    <AnimatedButton variant="outline" size="lg">Large</AnimatedButton>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <AnimatedButton variant="ghost" size="icon" icon={<Home className="h-4 w-4" />} />
                    <AnimatedButton variant="ghost" size="icon" icon={<Settings className="h-4 w-4" />} />
                    <AnimatedButton variant="ghost" size="icon" icon={<Menu className="h-4 w-4" />} />
                  </div>
                </div>
              </div>
            </AnimatedCard>
          </AnimatedSection>

          {/* Interactive Cards */}
          <AnimatedSection delay={0.5} direction="right">
            <AnimatedCard>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Interactive Card Animations
                </h3>
                <div className="space-y-4">
                  <AnimatedCard interactive={true}>
                    <div className="p-4">
                      <h4 className="font-medium">Hover me!</h4>
                      <p className="text-sm text-gray-600">This card has hover animations</p>
                    </div>
                  </AnimatedCard>
                  <AnimatedCard interactive={true}>
                    <div className="p-4">
                      <h4 className="font-medium">Another interactive card</h4>
                      <p className="text-sm text-gray-600">Try hovering and clicking</p>
                    </div>
                  </AnimatedCard>
                </div>
              </div>
            </AnimatedCard>
          </AnimatedSection>
        </div>

        {/* Progress Animations */}
        <AnimatedSection delay={0.6} direction="up">
          <AnimatedCard>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Animated Progress Bars
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Resolution Rate</span>
                  <span className="text-sm font-medium">78%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-green-500"
                    initial={{ width: 0 }}
                    animate={{ width: "78%" }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Pending Issues</span>
                  <span className="text-sm font-medium">15%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-orange-500"
                    initial={{ width: 0 }}
                    animate={{ width: "15%" }}
                    transition={{ duration: 1, delay: 0.7 }}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">In Progress</span>
                  <span className="text-sm font-medium">7%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-blue-500"
                    initial={{ width: 0 }}
                    animate={{ width: "7%" }}
                    transition={{ duration: 1, delay: 0.9 }}
                  />
                </div>
              </div>
            </div>
          </AnimatedCard>
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
    </div>
  )
}
