import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { qrCode: string } }
) {
  try {
    const { qrCode } = params

    const grievance = await prisma.grievance.findFirst({
      where: { qrCode },
      include: {
        assignedTo: {
          select: { name: true, role: true }
        },
        statusUpdates: {
          include: {
            user: {
              select: { name: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        category: {
          select: { name: true }
        }
      }
    })

    if (!grievance) {
      return NextResponse.json({ error: 'Grievance not found' }, { status: 404 })
    }

    return NextResponse.json(grievance)

  } catch (error) {
    console.error('Track grievance error:', error)
    return NextResponse.json({ error: 'Failed to fetch grievance' }, { status: 500 })
  }
}