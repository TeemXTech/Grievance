"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Calendar, User } from "lucide-react"

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

interface GrievanceCardProps {
  grievance: {
    id: number;
    tracking_number: string;
    title: string;
    category: string;
    status: string;
    citizen_name: string;
    location: string;
    created_at: string;
  };
  onClick?: () => void;
}

export default function GrievanceCard({ grievance, onClick }: GrievanceCardProps) {
  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]" 
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 truncate">{grievance.title}</h3>
            <p className="text-sm text-gray-600 font-mono">{grievance.tracking_number}</p>
          </div>
          <Badge 
            className="text-white text-xs ml-2 flex-shrink-0"
            style={{ backgroundColor: statusColors[grievance.status] || '#6B7280' }}
          >
            {grievance.status}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center">
            <Badge 
              className="text-white text-xs"
              style={{ backgroundColor: categoryColors[grievance.category] || '#6B7280' }}
            >
              {grievance.category}
            </Badge>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <User className="w-3 h-3 mr-1" />
            <span className="truncate">{grievance.citizen_name}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-3 h-3 mr-1" />
            <span className="truncate">{grievance.location}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-3 h-3 mr-1" />
            <span>{new Date(grievance.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}