"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { ReportTemplate } from "@/components/print/report-template"

export default function PrintReportPage() {
  const searchParams = useSearchParams()
  const [data, setData] = useState([])
  const [filters, setFilters] = useState({})
  const [loading, setLoading] = useState(true)

  const type = searchParams.get("type") || "grievance"
  const language = searchParams.get("lang") as 'en' | 'te' || 'en'

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    fetch(`/api/print/report?${params.toString()}`)
      .then(res => res.json())
      .then(result => {
        setData(result.data)
        setFilters(result.filters)
        setLoading(false)
      })
      .catch(error => {
        console.error("Error loading report:", error)
        setLoading(false)
      })
  }, [searchParams])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Generating report...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <ReportTemplate 
        type={type as any} 
        data={data} 
        filters={filters}
        language={language} 
      />
    </div>
  )
}