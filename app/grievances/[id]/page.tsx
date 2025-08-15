"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar, User, Phone } from "lucide-react"

const categoryColors = {
  'Water': '#3B82F6',
  'Electricity': '#F59E0B',
  'Roads': '#10B981',
  'Health': '#EF4444',
  'Infrastructure': '#8B5CF6',
  'Other': '#6B7280'
};

const statusColors = {
  'Pending': '#F87171',
  'In Progress': '#FBBF24',
  'Resolved': '#34D399'
};

export default function GrievanceDetailsPage({ params }: { params: { id: string } }) {
  const [grievance, setGrievance] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchGrievance = async () => {
      try {
        const res = await fetch(`/api/grievances/${params.id}`)
        if (res.ok) {
          const data = await res.json()
          setGrievance(data.grievance)
        }
      } catch (error) {
        console.error('Failed to fetch grievance:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchGrievance()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading grievance details...</p>
        </div>
      </div>
    )
  }

  if (!grievance) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Grievance Not Found</h2>
            <p className="text-gray-600">The requested grievance could not be found.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold text-gray-900">
                Grievance Details
              </CardTitle>
              <Badge 
                className="text-white"
                style={{ backgroundColor: statusColors[grievance.status] || '#6B7280' }}
              >
                {grievance.status}
              </Badge>
            </div>
            <p className="text-gray-600">Tracking Number: {grievance.tracking_number}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Grievance Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Title</label>
                    <p className="text-gray-900">{grievance.title}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Category</label>
                    <div className="flex items-center mt-1">
                      <Badge 
                        className="text-white"
                        style={{ backgroundColor: categoryColors[grievance.category] || '#6B7280' }}
                      >
                        {grievance.category}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Description</label>
                    <p className="text-gray-900">{grievance.description}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <User className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-gray-900">{grievance.citizen_name}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-gray-900">{grievance.citizen_mobile}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-gray-900">{grievance.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-gray-900">
                      {new Date(grievance.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {grievance.assigned_to && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Assignment</h3>
                <p className="text-gray-700">Assigned to: {grievance.assigned_to}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}