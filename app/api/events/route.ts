import { NextResponse } from 'next/server'

// In-memory storage (replace with database in production)
let events = [
  {
    id: "1",
    title: "Rahul's Wedding",
    start: "2025-01-20",
    type: "marriage",
    assignedTo: null
  },
  {
    id: "2",
    title: "Cabinet Meeting",
    start: "2025-01-21",
    type: "meeting",
    assignedTo: "PA Srinivas"
  },
  {
    id: "3",
    title: "School Visit",
    start: "2025-01-21",
    type: "other",
    assignedTo: null
  }
]

export async function GET() {
  const colorCodedEvents = events.map((event) => ({
    ...event,
    color: event.type === "marriage" ? "#22c55e" : event.type === "meeting" ? "#eab308" : "#3b82f6"
  }))
  
  return NextResponse.json(colorCodedEvents)
}

export function getEvents() {
  return events
}

export function setEvents(newEvents) {
  events = newEvents
}