import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth-middleware'
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from '@/lib/notifications'
import { z } from 'zod'

const paginationSchema = z.object({
  page: z.coerce.number().optional(),
  pageSize: z.coerce.number().optional(),
})

// GET /api/notifications - Get user's notifications
export async function GET(request: NextRequest) {
  return withAuth(request, async (req: NextRequest) => {
    try {
      const userId = req.headers.get('x-user-id')!
      const url = new URL(req.url)
      const params = Object.fromEntries(url.searchParams)
      const { page, pageSize } = paginationSchema.parse(params)

      const notifications = await getUserNotifications(
        userId,
        page,
        pageSize
      )

      return NextResponse.json(notifications)
    } catch (error) {
      console.error('Get notifications error:', error)
      return NextResponse.json(
        { error: 'Failed to get notifications' },
        { status: 500 }
      )
    }
  })
}

// PATCH /api/notifications/:id - Mark notification as read
export async function PATCH(request: NextRequest) {
  return withAuth(request, async (req: NextRequest) => {
    try {
      const userId = req.headers.get('x-user-id')!
      const id = req.url.split('/').pop()

      if (!id) {
        return NextResponse.json(
          { error: 'Notification ID is required' },
          { status: 400 }
        )
      }

      await markNotificationAsRead(userId, id)

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error('Mark notification read error:', error)
      return NextResponse.json(
        { error: 'Failed to mark notification as read' },
        { status: 500 }
      )
    }
  })
}

// POST /api/notifications/mark-all-read - Mark all notifications as read
export async function POST(request: NextRequest) {
  return withAuth(request, async (req: NextRequest) => {
    try {
      const userId = req.headers.get('x-user-id')!
      await markAllNotificationsAsRead(userId)
      return NextResponse.json({ success: true })
    } catch (error) {
      console.error('Mark all notifications read error:', error)
      return NextResponse.json(
        { error: 'Failed to mark notifications as read' },
        { status: 500 }
      )
    }
  })
}

// DELETE /api/notifications/:id - Delete notification
export async function DELETE(request: NextRequest) {
  return withAuth(request, async (req: NextRequest) => {
    try {
      const userId = req.headers.get('x-user-id')!
      const id = req.url.split('/').pop()

      if (!id) {
        return NextResponse.json(
          { error: 'Notification ID is required' },
          { status: 400 }
        )
      }

      await deleteNotification(userId, id)

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error('Delete notification error:', error)
      return NextResponse.json(
        { error: 'Failed to delete notification' },
        { status: 500 }
      )
    }
  })
}
