import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'

type Grievance = {
  id: string
  citizenName: string
  mobileNumber: string
  email: string | null
  constituency: string
  district: string
  categoryId: string
  description: string
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED'
  assignedOfficerId: string | null
  submittedById: string
  createdAt: string
  location: {
    type: string
    coordinates: [number, number]
  } | null
  attachments: string[]
}

export function GrievanceDetails() {
  const params = useParams()
  const [grievance, setGrievance] = useState<Grievance | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    fetchGrievanceDetails()
  }, [params.id])

  const fetchGrievanceDetails = async () => {
    try {
      const response = await fetch(`/api/grievances/${params.id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch grievance details')
      }
      const data = await response.json()
      setGrievance(data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load grievance details',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateStatus = async (newStatus: string) => {
    try {
      setIsUpdating(true)
      const response = await fetch(`/api/grievances/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update status')
      }

      const updatedGrievance = await response.json()
      setGrievance(updatedGrievance)
      toast({
        title: 'Success',
        description: 'Grievance status updated successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update grievance status',
        variant: 'destructive',
      })
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    )
  }

  if (!grievance) {
    return <div>Grievance not found</div>
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Grievance Details</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold">Citizen Name</h3>
            <p>{grievance.citizenName}</p>
          </div>
          
          <div>
            <h3 className="font-semibold">Contact Details</h3>
            <p>Mobile: {grievance.mobileNumber}</p>
            {grievance.email && <p>Email: {grievance.email}</p>}
          </div>
          
          <div>
            <h3 className="font-semibold">Location</h3>
            <p>{grievance.district} - {grievance.constituency}</p>
          </div>
          
          <div>
            <h3 className="font-semibold">Status</h3>
            <div className="flex items-center space-x-2">
              <Select
                disabled={isUpdating}
                onValueChange={updateStatus}
                defaultValue={grievance.status}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="font-semibold">Description</h3>
          <p className="whitespace-pre-wrap">{grievance.description}</p>
        </div>

        {grievance.attachments && grievance.attachments.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Attachments</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {grievance.attachments.map((attachment, index) => (
                <a
                  key={index}
                  href={attachment}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View Attachment {index + 1}
                </a>
              ))}
            </div>
          </div>
        )}
      </Card>

      {grievance.location && (
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Location Map</h3>
          <div className="h-96 relative">
            <MapContainer
              center={[
                grievance.location.coordinates[1],
                grievance.location.coordinates[0]
              ]}
              zoom={13}
              className="h-full w-full"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <Marker
                position={[
                  grievance.location.coordinates[1],
                  grievance.location.coordinates[0]
                ]}
              >
                <Popup>
                  <div>
                    <strong>{grievance.citizenName}</strong>
                    <p>{grievance.description.substring(0, 100)}...</p>
                  </div>
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        </Card>
      )}
    </div>
  )
}
