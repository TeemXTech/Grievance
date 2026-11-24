import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth-middleware'

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const { title, description, category, requesterName, requesterPhone, village, mandal, district, priority = 'MEDIUM' } = body

    if (!title || !description) {
      return NextResponse.json({ error: 'title and description are required' }, { status: 400 })
    }

    const count = await prisma.grievance.count()
    const referenceNumber = `GRV-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`

    const grievance = await prisma.grievance.create({
      data: {
        referenceNumber,
        title,
        description,
        requesterName: requesterName || user.name,
        requesterPhone: requesterPhone || '',
        village,
        mandal,
        district,
        priority,
        grievanceCategory: category || 'OTHER',
        status: 'PENDING',
        assignedToId: null,
      },
    })

    return NextResponse.json({ success: true, grievance })
  } catch (error: any) {
    console.error('Error creating grievance:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
