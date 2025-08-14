import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Mock places data
    const places = [
      { id: 1, name: "Manthanani Town", projects: 12, grievances: 25 },
      { id: 2, name: "Ramagundam", projects: 8, grievances: 18 },
      { id: 3, name: "Pegadapally", projects: 6, grievances: 15 },
      { id: 4, name: "Jaipur", projects: 5, grievances: 12 },
      { id: 5, name: "Godavarikhani", projects: 9, grievances: 22 },
      { id: 6, name: "Sultanabad", projects: 5, grievances: 16 }
    ]

    return NextResponse.json(places)
  } catch (error) {
    console.error('Places API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch places' },
      { status: 500 }
    )
  }
}