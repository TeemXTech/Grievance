import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, hasRole } from '@/lib/auth-middleware'

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!hasRole(user, 'MINISTER', 'PA', 'ADMIN')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { title, date, type, location = 'TBD' } = await request.json()
    if (!title || !date || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const event = await prisma.tourAppointment.create({
      data: {
        title,
        eventType: type,
        startDate: new Date(date),
        location,
        status: 'SCHEDULED',
        createdById: user.id,
      },
    })

    return NextResponse.json({ success: true, event })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const user = await getAuthUser(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!hasRole(user, 'MINISTER', 'PA', 'ADMIN')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { id, title, date, type } = await request.json()
    if (!id) return NextResponse.json({ error: 'Event ID required' }, { status: 400 })

    const event = await prisma.tourAppointment.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(date && { startDate: new Date(date) }),
        ...(type && { eventType: type }),
      },
    })

    return NextResponse.json({ success: true, event })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const user = await getAuthUser(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!hasRole(user, 'MINISTER', 'PA', 'ADMIN')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { id } = await request.json()
    if (!id) return NextResponse.json({ error: 'Event ID required' }, { status: 400 })

    await prisma.tourAppointment.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
