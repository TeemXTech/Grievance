"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'

const grievanceSchema = z.object({
  citizenName: z.string().min(2, 'Name must be at least 2 characters'),
  mobileNumber: z.string().regex(/^[0-9]{10}$/, 'Invalid mobile number'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  constituency: z.string().min(1, 'Please select a constituency'),
  grievanceType: z.string().min(1, 'Please select a grievance type'),
  district: z.string().min(1, 'Please select a district'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  assignedOfficerId: z.string().optional(),
  attachments: z.array(z.string()).optional(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number()
  }).optional()
})

type GrievanceFormData = z.infer<typeof grievanceSchema>

export function GrievanceForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [constituencies, setConstituencies] = useState<Array<{ id: string; name: string }>>([])
  const [districts, setDistricts] = useState<Array<{ id: string; name: string }>>([])
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([])
  const [officers, setOfficers] = useState<Array<{ id: string; name: string }>>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<GrievanceFormData>({
    resolver: zodResolver(grievanceSchema)
  })

  const onSubmit = async (data: GrievanceFormData) => {
    try {
      setIsSubmitting(true)
      const response = await fetch('/api/grievances', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to submit grievance')
      }

      toast({
        title: 'Success',
        description: 'Grievance has been submitted successfully',
      })

      reset()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit grievance. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="citizenName">Citizen Name *</Label>
          <Input
            id="citizenName"
            {...register('citizenName')}
            placeholder="Enter citizen's name"
          />
          {errors.citizenName && (
            <p className="text-sm text-red-500">{errors.citizenName.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="mobileNumber">Mobile Number *</Label>
          <Input
            id="mobileNumber"
            {...register('mobileNumber')}
            placeholder="Enter 10-digit mobile number"
          />
          {errors.mobileNumber && (
            <p className="text-sm text-red-500">{errors.mobileNumber.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="email">Email (Optional)</Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="Enter email address"
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="district">District *</Label>
          <Select onValueChange={(value) => register('district').onChange({ target: { value }})}>
            <SelectTrigger>
              <SelectValue placeholder="Select district" />
            </SelectTrigger>
            <SelectContent>
              {districts.map((district) => (
                <SelectItem key={district.id} value={district.id}>
                  {district.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.district && (
            <p className="text-sm text-red-500">{errors.district.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="constituency">Constituency *</Label>
          <Select onValueChange={(value) => register('constituency').onChange({ target: { value }})}>
            <SelectTrigger>
              <SelectValue placeholder="Select constituency" />
            </SelectTrigger>
            <SelectContent>
              {constituencies.map((constituency) => (
                <SelectItem key={constituency.id} value={constituency.id}>
                  {constituency.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.constituency && (
            <p className="text-sm text-red-500">{errors.constituency.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="grievanceType">Grievance Type *</Label>
          <Select onValueChange={(value) => register('grievanceType').onChange({ target: { value }})}>
            <SelectTrigger>
              <SelectValue placeholder="Select grievance type" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.grievanceType && (
            <p className="text-sm text-red-500">{errors.grievanceType.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder="Enter grievance description"
            className="h-32"
          />
          {errors.description && (
            <p className="text-sm text-red-500">{errors.description.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="assignedOfficerId">Assign Officer (Optional)</Label>
          <Select onValueChange={(value) => register('assignedOfficerId').onChange({ target: { value }})}>
            <SelectTrigger>
              <SelectValue placeholder="Select officer" />
            </SelectTrigger>
            <SelectContent>
              {officers.map((officer) => (
                <SelectItem key={officer.id} value={officer.id}>
                  {officer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Grievance'}
        </Button>
      </form>
    </Card>
  )
}
