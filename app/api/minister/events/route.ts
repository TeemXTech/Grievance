import { NextResponse } from 'next/server'

// Mock events data - in production this would come from database
const mockEvents = [
  {
    id: 1,
    title: "Public Meeting - Water Issues",
    date: "2024-01-15",
    time: "10:00 AM",
    endTime: "12:00 PM",
    place: "Manthanani Town Hall",
    type: "meeting",
    color: "bg-blue-500",
    priority: "High",
    attendees: 150,
    canDelegate: true,
    delegatedTo: null,
    agenda: "Discuss water supply issues in Jaipur and surrounding areas",
    relatedGrievances: ["GRV-2024-MAN-001"]
  },
  {
    id: 2,
    title: "Project Inspection - PHC",
    date: "2024-01-16",
    time: "2:00 PM",
    endTime: "4:00 PM",
    place: "Ramagundam PHC",
    type: "inspection",
    color: "bg-green-500",
    priority: "Medium",
    canDelegate: true,
    delegatedTo: "PA Srinivas",
    agenda: "Final inspection of completed PHC upgrade project",
    relatedProjects: [2]
  },
  {
    id: 3,
    title: "Grievance Hearing",
    date: "2024-01-17",
    time: "11:00 AM",
    endTime: "1:00 PM",
    place: "Collectorate",
    type: "hearing",
    color: "bg-red-500",
    priority: "High",
    canDelegate: false,
    agenda: "Weekly grievance hearing session",
    expectedGrievances: 25
  },
  {
    id: 4,
    title: "Marriage Inauguration",
    date: "2024-01-18",
    time: "6:00 PM",
    endTime: "8:00 PM",
    place: "Community Hall, Pegadapally",
    type: "inauguration",
    color: "bg-pink-500",
    priority: "Low",
    canDelegate: true,
    delegatedTo: null,
    agenda: "Community marriage program inauguration"
  },
  {
    id: 5,
    title: "Press Meet - Development Updates",
    date: "2024-01-19",
    time: "11:00 AM",
    endTime: "12:00 PM",
    place: "Press Club, Peddapalli",
    type: "press",
    color: "bg-purple-500",
    priority: "High",
    canDelegate: false,
    agenda: "Quarterly development progress announcement"
  }
]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const type = searchParams.get('type')

    let filteredEvents = mockEvents

    if (date) {
      filteredEvents = filteredEvents.filter(event => event.date === date)
    }

    if (type) {
      filteredEvents = filteredEvents.filter(event => event.type === type)
    }

    return NextResponse.json(filteredEvents)
  } catch (error) {
    console.error('Events API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const newEvent = {
      id: mockEvents.length + 1,
      ...body,
      delegatedTo: null
    }

    mockEvents.push(newEvent)

    return NextResponse.json(newEvent)
  } catch (error) {
    console.error('Create event error:', error)
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, delegatedTo } = body

    const eventIndex = mockEvents.findIndex(event => event.id === id)
    if (eventIndex === -1) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    mockEvents[eventIndex] = { ...mockEvents[eventIndex], delegatedTo }

    return NextResponse.json(mockEvents[eventIndex])
  } catch (error) {
    console.error('Update event error:', error)
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    )
  }
}