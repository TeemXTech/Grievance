import { NextResponse } from "next/server"

// Mock WhatsApp messages for development
const mockWhatsAppMessages = [
  {
    id: 1,
    phone: "+919876543210",
    raw_text: "Road repair needed on Main Street near bus stop. Large potholes causing problems for vehicles.",
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    phone: "+919876543211", 
    raw_text: "Water supply issue in Sector 12. No water for 3 days. Please help urgently.",
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 3,
    phone: "+919876543212",
    raw_text: "Street lights not working in our colony. Very dark at night, safety concern.",
    created_at: new Date(Date.now() - 172800000).toISOString(),
  }
]

export async function GET() {
  try {
    // In a real implementation, this would fetch from WhatsApp Business API
    // For now, return mock data
    return NextResponse.json(mockWhatsAppMessages)
  } catch (error) {
    console.error("Error fetching WhatsApp messages:", error)
    return NextResponse.json(
      { error: "Failed to fetch WhatsApp messages" },
      { status: 500 }
    )
  }
}