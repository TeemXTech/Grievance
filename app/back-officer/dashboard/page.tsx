"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GovernmentHeader } from "@/components/ui/government-header"
import { GrievanceCaptureForm } from "@/components/forms/grievance-capture-form"
import { GovernmentProjectForm } from "@/components/forms/government-project-form"
import { EnhancedGrievanceForm } from "@/components/forms/enhanced-grievance-form"
import { EnhancedProjectForm } from "@/components/forms/enhanced-project-form"
import { FileText, Building2, BarChart3, Users } from "lucide-react"

export default function BackOfficerDashboard() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState("grievances")

  return (
    <div className="min-h-screen bg-gray-50">
      <GovernmentHeader
        title="Back Officer Dashboard"
        description="Data Entry & Project Management"
        userName={session?.user?.name}
        userRole={session?.user?.role}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="grievances" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Grievance Entry
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Government Projects
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="management" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Data Management
            </TabsTrigger>
          </TabsList>

          <TabsContent value="grievances">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Grievance Entry</CardTitle>
                </CardHeader>
                <CardContent>
                  <GrievanceCaptureForm />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>WhatsApp Messages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 border rounded bg-green-50">
                      <div className="text-sm font-medium">+91 9876543210</div>
                      <div className="text-sm text-gray-600">Road problem in our village, please help</div>
                      <div className="flex gap-2 mt-2">
                        <Button size="sm">Convert to Grievance</Button>
                        <Button size="sm" variant="outline">Ignore</Button>
                      </div>
                    </div>
                    <div className="p-3 border rounded bg-blue-50">
                      <div className="text-sm font-medium">+91 9876543211</div>
                      <div className="text-sm text-gray-600">Need job recommendation letter</div>
                      <div className="flex gap-2 mt-2">
                        <Button size="sm">Convert to Grievance</Button>
                        <Button size="sm" variant="outline">Ignore</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="projects">
            <GovernmentProjectForm />
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Reports & Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Reports functionality will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="management">
            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Data management tools will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}