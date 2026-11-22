import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, hasRole } from '@/lib/auth-middleware'

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request)
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  if (!hasRole(user, 'MINISTER', 'PA', 'ADMIN')) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const type = searchParams.get('type')

    const where: any = {}
    if (date) {
      const start = new Date(date)
      const end = new Date(date)
      end.setDate(end.getDate() + 1)
      where.startDate = { gte: start, lt: end }
    }
    if (type) where.eventType = type

    const events = await prisma.tourAppointment.findMany({
      where,
      orderBy: { startDate: 'asc' },
    })

    // Strip privateNotes for non-privileged roles
    const canSeePrivate = hasRole(user, 'MINISTER', 'PA', 'ADMIN')
    const result = events.map((e) => {
      if (!canSeePrivate) {
        const { privateNotes, ...rest } = e
        return rest
      }
      return e
    })

    return NextResponse.json({ success: true, events: result })
  } catch (error: any) {
    console.error('Events GET error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request)
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  if (!hasRole(user, 'MINISTER', 'PA', 'ADMIN')) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { title, description, eventType = 'VILLAGE_TOUR', startDate, endDate, location, mandalName, villageName, linkedLeaderName, vipGuests, notes, privateNotes } = body

    if (!title || !startDate || !location) {
      return NextResponse.json({ success: false, error: 'title, startDate, and location are required' }, { status: 400 })
    }

    const event = await prisma.tourAppointment.create({
      data: {
        title, description, eventType, location, mandalName, villageName,
        linkedLeaderName, vipGuests, notes,
        privateNotes: hasRole(user, 'MINISTER', 'PA', 'ADMIN') ? privateNotes : undefined,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        status: 'SCHEDULED',
        createdById: user.id,
      },
    })

    return NextResponse.json({ success: true, event })
  } catch (error: any) {
    console.error('Events POST error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const user = await getAuthUser(request)
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  if (!hasRole(user, 'MINISTER', 'PA', 'ADMIN')) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { id, status, notes, privateNotes } = body

    if (!id) return NextResponse.json({ success: false, error: 'Event ID required' }, { status: 400 })

    const existing = await prisma.tourAppointment.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 })

    const updateData: any = {}
    if (status) updateData.status = status
    if (notes !== undefined) updateData.notes = notes
    if (privateNotes !== undefined && hasRole(user, 'MINISTER', 'PA', 'ADMIN')) updateData.privateNotes = privateNotes

    const updated = await prisma.tourAppointment.update({ where: { id }, data: updateData })
    return NextResponse.json({ success: true, event: updated })
  } catch (error: any) {
    console.error('Events PUT error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
