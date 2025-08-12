"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GovernmentHeader } from "@/components/ui/government-header"
import { MapPin, Users, FileText, TrendingUp, ArrowLeft } from "lucide-react"
import Link from "next/link"

// Declare Leaflet types for TypeScript
declare global {
  interface Window {
    L: any
  }
}

interface DistrictData {
  district: string
  constituency: string
  total_grievances: number
  pending: number
  resolved: number
  in_progress: number
  total_cost: number
}

interface MapState {
  selectedDistrict: DistrictData | null
  zoomLevel: number
  center: [number, number]
}

export default function InteractiveMap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const [mapState, setMapState] = useState<MapState>({
    selectedDistrict: null,
    zoomLevel: 7,
    center: [17.3850, 78.4867]
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Initialize map when the component mounts
    const loadMap = async () => {
      try {
        if (!mapRef.current || !window.L) return;
        
        // Set up map container styles
        mapRef.current.style.height = '600px';
        mapRef.current.style.width = '100%';
        mapRef.current.style.zIndex = '1';

        // Initialize map
        const map = window.L.map(mapRef.current).setView(mapState.center, mapState.zoomLevel);
        mapInstanceRef.current = map;

        // Add OpenStreetMap tiles
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);

        // Load GeoJSON data
        const response = await fetch('/telangana_districts.geojson');
        const geojsonData = await response.json();

        // Style function for districts
        function getColor(value: number) {
          return value > 1000 ? '#2563eb' :
                 value > 750  ? '#3b82f6' :
                 value > 500  ? '#60a5fa' :
                 value > 250  ? '#93c5fd' :
                              '#bfdbfe';
        }

        function style(feature: any) {
          return {
            fillColor: getColor(feature.properties.total_grievances),
            weight: 2,
            opacity: 1,
            color: '#1e40af',
            dashArray: '3',
            fillOpacity: 0.7
          };
        }

        // Create GeoJSON layer
        window.L.geoJSON(geojsonData, {
          style: style,
          onEachFeature: (feature, layer) => {
            layer.on({
              mouseover: (e) => {
                const layer = e.target;
                layer.setStyle({
                  weight: 4,
                  color: '#1e40af',
                  dashArray: '',
                  fillOpacity: 0.9
                });
                layer.bringToFront();
              },
              mouseout: (e) => {
                const layer = e.target;
                layer.setStyle(style(feature));
              },
              click: (e) => {
                setMapState(prev => ({
                  ...prev,
                  selectedDistrict: feature.properties
                }));
                map.fitBounds(e.target.getBounds());
              }
            });
          }
        }).addTo(map);

        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing map:', error);
        setIsLoading(false);
      }
    };

    loadMap();
  }, [])

  const initializeMap = async () => {
    if (!mapRef.current || !window.L) return

    // Initialize map
    const map = window.L.map(mapRef.current).setView([17.3850, 78.4867], 7)
    mapInstanceRef.current = map

    // Add OpenStreetMap tiles
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map)

    try {
      // Load GeoJSON data
      const response = await fetch('/telangana_districts.geojson')
      const geojsonData = await response.json()

      // Style function for districts
      const style = (feature: any) => {
        const grievances = feature.properties.total_grievances
        const intensity = Math.min(grievances / 1000, 1) // Normalize to 0-1
        
        return {
          fillColor: `rgba(59, 130, 246, ${0.3 + intensity * 0.4})`, // Blue with varying opacity
          weight: 2,
          opacity: 1,
          color: '#3b82f6',
          fillOpacity: 0.6
        }
      }

      // Create GeoJSON layer
      const geojsonLayer = window.L.geoJSON(geojsonData, {
        style: style,
        onEachFeature: (feature: any, layer: any) => {
          const props = feature.properties
          
          // Tooltip on hover
          layer.bindTooltip(`
            <div class="p-2">
              <h3 class="font-bold text-lg">${props.district}</h3>
              <p class="text-sm text-gray-600">Constituency: ${props.constituency}</p>
              <div class="mt-2 space-y-1">
                <div class="flex justify-between">
                  <span>Total Grievances:</span>
                  <span class="font-semibold">${props.total_grievances}</span>
                </div>
                <div class="flex justify-between">
                  <span>Pending:</span>
                  <span class="text-orange-600">${props.pending}</span>
                </div>
                <div class="flex justify-between">
                  <span>Resolved:</span>
                  <span class="text-green-600">${props.resolved}</span>
                </div>
                <div class="flex justify-between">
                  <span>In Progress:</span>
                  <span class="text-blue-600">${props.in_progress}</span>
                </div>
                <div class="flex justify-between">
                  <span>Total Cost:</span>
                  <span class="font-semibold">₹${(props.total_cost / 1000000).toFixed(1)}M</span>
                </div>
              </div>
            </div>
          `, {
            className: 'custom-tooltip',
            sticky: true
          })

          // Click handler
          layer.on('click', () => {
            setMapState(prev => ({
              ...prev,
              selectedDistrict: props
            }))
          })

          // Hover effects
          layer.on('mouseover', function() {
            this.setStyle({
              fillOpacity: 0.8,
              weight: 3
            })
          })

          layer.on('mouseout', function() {
            this.setStyle(style(feature))
          })
        }
      }).addTo(map)

      // Add legend
      const legend = window.L.control({ position: 'bottomright' })
      legend.onAdd = function() {
        const div = window.L.DomUtil.create('div', 'info legend')
        div.style.backgroundColor = 'white'
        div.style.padding = '10px'
        div.style.borderRadius = '5px'
        div.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'
        div.innerHTML = `
          <h4 class="font-bold mb-2">Grievance Density</h4>
          <div class="space-y-1">
            <div class="flex items-center">
              <div style="width: 20px; height: 20px; background: rgba(59, 130, 246, 0.3); border: 2px solid #3b82f6;"></div>
              <span class="ml-2 text-sm">Low (0-500)</span>
            </div>
            <div class="flex items-center">
              <div style="width: 20px; height: 20px; background: rgba(59, 130, 246, 0.5); border: 2px solid #3b82f6;"></div>
              <span class="ml-2 text-sm">Medium (500-1000)</span>
            </div>
            <div class="flex items-center">
              <div style="width: 20px; height: 20px; background: rgba(59, 130, 246, 0.7); border: 2px solid #3b82f6;"></div>
              <span class="ml-2 text-sm">High (1000+)</span>
            </div>
          </div>
        `
        return div
      }
      legend.addTo(map)

      setIsLoading(false)
    } catch (error) {
      console.error('Error loading map data:', error)
      setIsLoading(false)
    }
  }

  const handleDistrictClick = (district: DistrictData) => {
    // Navigate to district analytics page
    window.location.href = `/dashboard/analytics?constituency=${district.constituency}&district=${district.district}`
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 1
    }).format(amount / 1000000) + 'M'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <GovernmentHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Telangana Grievance Map</h1>
              <p className="text-gray-600">Interactive visualization of grievance distribution across districts</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-sm">
            <MapPin className="h-3 w-3 mr-1" />
            Real-time Data
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Map Container */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  District-wise Grievance Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div 
                  ref={mapRef} 
                  className="w-full h-[600px] relative"
                  style={{ minHeight: '600px' }}
                >
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-10">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-gray-600">Loading map data...</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Selected District Info */}
            {mapState.selectedDistrict && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Selected District</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg text-blue-600">
                      {mapState.selectedDistrict.district}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Constituency: {mapState.selectedDistrict.constituency}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Grievances</span>
                      <Badge variant="outline" className="font-semibold">
                        {mapState.selectedDistrict.total_grievances}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center">
                          <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                          Pending
                        </span>
                        <span className="font-semibold text-orange-600">
                          {mapState.selectedDistrict.pending}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center">
                          <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                          In Progress
                        </span>
                        <span className="font-semibold text-blue-600">
                          {mapState.selectedDistrict.in_progress}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center">
                          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                          Resolved
                        </span>
                        <span className="font-semibold text-green-600">
                          {mapState.selectedDistrict.resolved}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Total Cost</span>
                        <span className="font-semibold text-green-700">
                          {formatCurrency(mapState.selectedDistrict.total_cost)}
                        </span>
                      </div>
                    </div>

                    <Button 
                      onClick={() => handleDistrictClick(mapState.selectedDistrict!)}
                      className="w-full"
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      View Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Map Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Map Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-gray-600">
                  <p className="mb-2">• Hover over districts to see details</p>
                  <p className="mb-2">• Click on districts to select</p>
                  <p className="mb-2">• Use mouse wheel to zoom</p>
                  <p>• Drag to pan around the map</p>
                </div>

                <div className="pt-2 border-t">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
                      if (mapInstanceRef.current) {
                        mapInstanceRef.current.setView([17.3850, 78.4867], 7)
                        setMapState(prev => ({
                          ...prev,
                          selectedDistrict: null
                        }))
                      }
                    }}
                  >
                    Reset View
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Districts</span>
                  <Badge variant="secondary">10</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Grievances</span>
                  <Badge variant="destructive">1,247</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Resolution Rate</span>
                  <Badge variant="default">71.5%</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Custom CSS for tooltips */}
      <style jsx global>{`
        .custom-tooltip {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          padding: 0;
          font-family: inherit;
        }
        
        .custom-tooltip::before {
          border-top-color: #e5e7eb;
        }
        
        .leaflet-container {
          font-family: inherit;
        }
        
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
        }
        
        .leaflet-control-zoom a {
          background: white !important;
          color: #374151 !important;
          border: 1px solid #e5e7eb !important;
        }
        
        .leaflet-control-zoom a:hover {
          background: #f9fafb !important;
        }
      `}</style>
    </div>
  )
}
