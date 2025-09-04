"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Users, CheckCircle } from "lucide-react"

interface MinisterCardProps {
  imageUrl?: string
  name?: string
  title?: string
  department?: string
  experience?: string
  initiatives?: string
}

export default function MinisterCard({
  imageUrl = "/placeholder-minister.jpg",
  name = "Shri D. Sridhar Babu",
  title = "Hon'ble IT Minister",
  department = "IT, Electronics & Communications",
  experience = "15+",
  initiatives = "50+"
}: MinisterCardProps) {
  return (
    <Card className="bg-white/10 backdrop-blur-md border border-white/20 overflow-hidden">
      <CardContent className="p-0">
        {/* Minister Photo */}
        <div className="relative h-80 bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
          <div className="w-48 h-48 bg-white/20 rounded-full flex items-center justify-center overflow-hidden">
            <img 
              src={imageUrl}
              alt={name}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to icon if image fails to load
                e.currentTarget.style.display = 'none'
                e.currentTarget.nextElementSibling?.classList.remove('hidden')
              }}
            />
            <Users className="w-24 h-24 text-white/80 hidden" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
            <h3 className="text-2xl font-bold text-white mb-1">{title}</h3>
            <p className="text-blue-200">{name}</p>
            <p className="text-blue-300 text-sm">{department}</p>
          </div>
        </div>
        
        {/* Minister Info */}
        <div className="p-6 text-white">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-300 mb-1">{experience}</div>
              <div className="text-sm text-gray-300">Years Experience</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-300 mb-1">{initiatives}</div>
              <div className="text-sm text-gray-300">IT Initiatives</div>
            </div>
          </div>
          
          <div className="space-y-3 text-sm">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
              <span className="text-gray-300">Digital Transformation Leader</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
              <span className="text-gray-300">IT Infrastructure Modernization</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
              <span className="text-gray-300">E-Governance Pioneer</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}