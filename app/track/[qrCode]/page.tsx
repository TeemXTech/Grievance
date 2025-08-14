"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GovernmentHeader } from "@/components/ui/government-header"
import { CheckCircle, Clock, MapPin, Phone, Calendar, FileText, User } from "lucide-react"

export default function TrackGrievance() {
  const params = useParams()
  const qrCode = params.qrCode as string
  const [grievance, setGrievance] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchGrievance = async () => {
      try {
        const response = await fetch(`/api/track/${qrCode}`)
        if (response.ok) {
          const data = await response.json()
          setGrievance(data)
        } else {
          setError('Grievance not found')
        }
      } catch (err) {
        setError('Failed to load grievance details')
      } finally {
        setLoading(false)
      }
    }

    if (qrCode) {
      fetchGrievance()
    }
  }, [qrCode])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RESOLVED': return 'bg-green-100 text-green-800'
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800'
      case 'WIP': return 'bg-yellow-100 text-yellow-800'
      case 'ASSIGNED': return 'bg-purple-100 text-purple-800'
      case 'PENDING': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusSteps = (currentStatus: string) => {
    const steps = [
      { key: 'PENDING', label: 'Submitted', icon: FileText },
      { key: 'ASSIGNED', label: 'Assigned', icon: User },
      { key: 'IN_PROGRESS', label: 'In Progress', icon: Clock },
      { key: 'RESOLVED', label: 'Resolved', icon: CheckCircle }
    ]

    const currentIndex = steps.findIndex(step => step.key === currentStatus)
    
    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      current: index === currentIndex
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !grievance) {
    return (
      <div className="min-h-screen bg-gray-50">
        <GovernmentHeader title="Track Grievance" />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Grievance Not Found</h1>
          <p className="text-gray-600">The QR code you scanned is invalid or the grievance has been removed.</p>
        </div>
      </div>
    )
  }

  const statusSteps = getStatusSteps(grievance.status)

  return (
    <div className="min-h-screen bg-gray-50">
      <GovernmentHeader 
        title="Track Your Grievance" 
        description="Real-time status tracking"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Card */}
        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl text-blue-900">
                  {grievance.title}
                </CardTitle>
                <p className="text-blue-700 font-mono text-lg mt-1">
                  {grievance.referenceNumber}
                </p>
              </div>
              <Badge className={`text-lg px-4 py-2 ${getStatusColor(grievance.status)}`}>
                {grievance.status.replace('_', ' ')}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Status Timeline */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Status Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              {statusSteps.map((step, index) => {
                const Icon = step.icon
                return (
                  <div key={step.key} className="flex flex-col items-center flex-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                      step.completed 
                        ? 'bg-green-500 text-white' 
                        : step.current 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-200 text-gray-500'
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-sm font-medium ${
                      step.completed || step.current ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {step.label}
                    </span>
                    {index < statusSteps.length - 1 && (
                      <div className={`h-1 w-full mt-2 ${
                        step.completed ? 'bg-green-500' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Grievance Details */}
          <Card>
            <CardHeader>
              <CardTitle>Grievance Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Description</label>
                <p className="mt-1 text-gray-900">{grievance.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Category</label>
                  <p className="mt-1 text-gray-900">{grievance.grievanceCategory || 'General'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Priority</label>
                  <Badge className={`mt-1 ${
                    grievance.priority === 'URGENT' ? 'bg-red-100 text-red-800' :
                    grievance.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {grievance.priority}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Submitted On</label>
                <div className="flex items-center mt-1 text-gray-900">
                  <Calendar className="w-4 h-4 mr-2" />
                  {new Date(grievance.createdAt).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact & Location */}
          <Card>
            <CardHeader>
              <CardTitle>Contact & Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Requester</label>
                <p className="mt-1 text-gray-900 font-medium">{grievance.requesterName}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Phone Number</label>
                <div className="flex items-center mt-1 text-gray-900">
                  <Phone className="w-4 h-4 mr-2" />
                  {grievance.requesterPhone}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Location</label>
                <div className="flex items-center mt-1 text-gray-900">
                  <MapPin className="w-4 h-4 mr-2" />
                  {grievance.village || grievance.district || 'Not specified'}
                </div>
              </div>

              {grievance.assignedTo && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Assigned Officer</label>
                  <p className="mt-1 text-gray-900 font-medium">{grievance.assignedTo.name}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Status Updates */}
        {grievance.statusUpdates && grievance.statusUpdates.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Status Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {grievance.statusUpdates.map((update: any, index: number) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <Badge className={getStatusColor(update.newStatus)}>
                          {update.newStatus.replace('_', ' ')}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {new Date(update.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {update.remarks && (
                        <p className="mt-1 text-gray-700">{update.remarks}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}