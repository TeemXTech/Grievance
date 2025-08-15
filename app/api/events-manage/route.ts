import { NextRequest, NextResponse } from 'next/server'
import { getEvents, setEvents } from '../events/route'

export async function POST(request: NextRequest) {
  try {
    const { title, date, type } = await request.json()
    
    if (!title || !date || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    const events = getEvents()
    const newEvent = {
      id: Date.now().toString(),
      title,
      start: date,
      type,
      assignedTo: null
    }
    
    setEvents([...events, newEvent])
    return NextResponse.json({ success: true, event: newEvent })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, title, date, type } = await request.json()
    
    if (!id || !title || !date || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    const events = getEvents()
    const updatedEvents = events.map((event) =>
      event.id === id ? { ...event, title, start: date, type } : event
    )
    
    setEvents(updatedEvents)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json()
    
    if (!id) {
      return NextResponse.json({ error: 'Event ID required' }, { status: 400 })
    }
    
    const events = getEvents()
    const filteredEvents = events.filter((event) => event.id !== id)
    
    setEvents(filteredEvents)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 })
  }
}