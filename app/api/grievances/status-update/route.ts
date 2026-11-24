import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth-middleware'

export async function PUT(request: NextRequest) {
  const user = await getAuthUser(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id, status, assignedToId, remarks } = await request.json()

    if (!id || !status) return NextResponse.json({ error: 'id and status are required' }, { status: 400 })

    const existing = await prisma.grievance.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Grievance not found' }, { status: 404 })

    const updated = await prisma.grievance.update({
      where: { id },
      data: {
        status,
        ...(assignedToId && { assignedToId }),
      },
    })

    await prisma.grievanceStatusUpdate.create({
      data: {
        grievanceId: id,
        userId: user.id,
        oldStatus: existing.status,
        newStatus: status,
        remarks,
      },
    })

    return NextResponse.json({ success: true, grievance: updated })
  } catch (error: any) {
    console.error('Error updating grievance status:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
