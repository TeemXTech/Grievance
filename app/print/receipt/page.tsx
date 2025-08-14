"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { ReceiptTemplate } from "@/components/print/receipt-template"

export default function PrintReceiptPage() {
  const searchParams = useSearchParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const id = searchParams.get("id")
  const type = searchParams.get("type") || "patient"
  const language = searchParams.get("lang") as 'en' | 'te' || 'en'

  useEffect(() => {
    if (id) {
      fetch(`/api/print/receipt?id=${id}&type=${type}`)
        .then(res => res.json())
        .then(result => {
          setData(result.data)
          setLoading(false)
        })
        .catch(error => {
          console.error("Error loading receipt:", error)
          setLoading(false)
        })
    }
  }, [id, type])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading receipt...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">Receipt not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <ReceiptTemplate data={data} language={language} />
    </div>
  )
}