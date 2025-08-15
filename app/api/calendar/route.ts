import { NextRequest, NextResponse } from 'next/server'

// Mock calendar data - in real app this would be in database
let calendarEvents = [
  { 
    id: 1, 
    title: "Village Meeting", 
    date: "2025-01-10", 
    time: "10:00", 
    endTime: "12:00",
    location: "Manthanani Community Hall", 
    bookedBy: "PA Srinivas", 
    paId: "pa1",
    type: "meeting",
    status: "confirmed",
    description: "Monthly village development meeting"
  },
  { 
    id: 2, 
    title: "Project Review", 
    date: "2025-01-12", 
    time: "14:00", 
    endTime: "16:00",
    location: "District Office", 
    bookedBy: "PA Ramesh", 
    paId: "pa2",
    type: "review",
    status: "confirmed",
    description: "Infrastructure project progress review"
  }
]

// Helper function to check time conflicts
function hasTimeConflict(newEvent: any, existingEvents: any[]) {
  const newStart = new Date(`${newEvent.date}T${newEvent.time}:00`)
  const newEnd = new Date(`${newEvent.date}T${newEvent.endTime}:00`)
  
  return existingEvents.some(event => {
    if (event.date !== newEvent.date) return false
    
    const existingStart = new Date(`${event.date}T${event.time}:00`)
    const existingEnd = new Date(`${event.date}T${event.endTime}:00`)
    
    return (newStart < existingEnd && newEnd > existingStart)
  })
}

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      events: calendarEvents
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch calendar events'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, date, time, endTime, location, type, description, paId, bookedBy } = body
    
    // Check for time conflicts
    if (hasTimeConflict({ date, time, endTime }, calendarEvents)) {
      return NextResponse.json({
        success: false,
        error: 'Time slot already booked. Please choose a different time.'
      }, { status: 409 })
    }
    
    // Create new event
    const newEvent = {
      id: calendarEvents.length + 1,
      title,
      date,
      time,
      endTime,
      location,
      type: type || 'meeting',
      description: description || '',
      paId,
      bookedBy,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    }
    
    calendarEvents.push(newEvent)
    
    return NextResponse.json({
      success: true,
      message: 'Event booked successfully',
      event: newEvent
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to create calendar event'
    }, { status: 500 })
  }
}