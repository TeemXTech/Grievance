"use client"

import { GovernmentHeader } from "@/components/ui/government-header"
import { GovernmentCard } from "@/components/ui/government-card"
import { Button } from "@/components/ui/button"
import { Users, FileText, MessageSquare, BarChart3, ArrowRight, Shield, Clock, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <GovernmentHeader />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Minister's Grievance System</h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Efficient Management of Citizen Requests and Grievances
            </p>
            <p className="text-lg mb-8 text-blue-200 max-w-3xl mx-auto">
              A comprehensive digital platform for the Government of Telangana to manage, track, and resolve citizen
              grievances with transparency and efficiency.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                  Access Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">1,247</h3>
            <p className="text-gray-600">Total Requests Processed</p>
          </div>
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">3.2</h3>
            <p className="text-gray-600">Average Resolution Time (Days)</p>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">94.2%</h3>
            <p className="text-gray-600">Citizen Satisfaction Rate</p>
          </div>
        </div>

        {/* System Overview */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Telangana Minister Grievance System</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            A comprehensive digital platform for efficient management of citizen grievances and government projects. 
            Designed for internal use by ministerial staff, PA officers, field officers, and administrators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <GovernmentCard
            title="Grievance Management"
            description="Comprehensive intake, assignment, and tracking system"
            icon={<FileText className="h-8 w-8" />}
            href="/dashboard/grievances"
            className="border-blue-200 hover:border-blue-300"
          />

          <GovernmentCard
            title="Project Tracking"
            description="Monitor government projects and milestones"
            icon={<BarChart3 className="h-8 w-8" />}
            href="/dashboard"
            className="border-green-200 hover:border-green-300"
          />

          <GovernmentCard
            title="WhatsApp Integration"
            description="Auto-capture and process citizen messages"
            icon={<MessageSquare className="h-8 w-8" />}
            href="/dashboard"
            className="border-purple-200 hover:border-purple-300"
          />
        </div>

        {/* Staff Access */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Staff Access</h3>
          <p className="text-gray-600">Direct access to different dashboards</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <GovernmentCard
            title="Minister"
            description="Executive dashboard"
            icon={<Users className="h-6 w-6" />}
            href="/minister/dashboard"
            className="border-red-200 hover:border-red-300 text-sm"
          />

          <GovernmentCard
            title="PA Officer"
            description="Assistant workflow"
            icon={<FileText className="h-6 w-6" />}
            href="/pa/dashboard"
            className="border-blue-200 hover:border-blue-300 text-sm"
          />

          <GovernmentCard
            title="Back Officer"
            description="Backend operations"
            icon={<Shield className="h-6 w-6" />}
            href="/back-officer/dashboard"
            className="border-yellow-200 hover:border-yellow-300 text-sm"
          />

          <GovernmentCard
            title="Field Officer"
            description="Ground operations"
            icon={<MessageSquare className="h-6 w-6" />}
            href="/field/dashboard"
            className="border-green-200 hover:border-green-300 text-sm"
          />

          <GovernmentCard
            title="Admin"
            description="System administration"
            icon={<BarChart3 className="h-6 w-6" />}
            href="/admin/dashboard"
            className="border-purple-200 hover:border-purple-300 text-sm"
          />
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Key Features</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive tools for efficient grievance management and citizen service delivery
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">WhatsApp Integration</h3>
              <p className="text-gray-600">Direct citizen communication through WhatsApp with automated parsing</p>
            </div>

            <div className="text-center p-6">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Real-time Analytics</h3>
              <p className="text-gray-600">Comprehensive dashboards with performance metrics and trends</p>
            </div>

            <div className="text-center p-6">
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Secure & Compliant</h3>
              <p className="text-gray-600">Government-grade security with audit trails and compliance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-300">© 2024 Government of Telangana. All rights reserved.</p>
            <p className="text-gray-400 text-sm mt-2">Developed for efficient citizen service delivery</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
