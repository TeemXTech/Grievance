import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export type NotificationType =
  | 'GRIEVANCE_CREATED'
  | 'GRIEVANCE_UPDATED'
  | 'GRIEVANCE_ASSIGNED'
  | 'STATUS_CHANGED'
  | 'COMMENT_ADDED'
  | 'DUE_DATE_REMINDER'

export interface CreateNotificationParams {
  type: NotificationType
  userId: string
  title: string
  message: string
  data?: Record<string, any>
}

export async function createNotification({
  type,
  userId,
  title,
  message,
  data = {},
}: CreateNotificationParams) {
  try {
    const notification = await prisma.notification.create({
      data: {
        type,
        userId,
        title,
        message,
        data: data as any, // Prisma handles JSON serialization
      },
    })

    return notification
  } catch (error) {
    console.error('Failed to create notification:', error)
    throw error
  }
}

export async function getUserNotifications(
  userId: string,
  page = 1,
  pageSize = 20
) {
  try {
    const [total, notifications] = await Promise.all([
      prisma.notification.count({
        where: { userId },
      }),
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ])

    return {
      notifications,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }
  } catch (error) {
    console.error('Failed to get notifications:', error)
    throw error
  }
}

export async function markNotificationAsRead(
  userId: string,
  notificationId: string
) {
  try {
    await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId, // Ensure the notification belongs to the user
      },
      data: {
        isRead: true,
      },
    })
  } catch (error) {
    console.error('Failed to mark notification as read:', error)
    throw error
  }
}

export async function markAllNotificationsAsRead(userId: string) {
  try {
    await prisma.notification.updateMany({
      where: { userId },
      data: { isRead: true },
    })
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error)
    throw error
  }
}

export async function deleteNotification(
  userId: string,
  notificationId: string
) {
  try {
    await prisma.notification.deleteMany({
      where: {
        id: notificationId,
        userId, // Ensure the notification belongs to the user
      },
    })
  } catch (error) {
    console.error('Failed to delete notification:', error)
    throw error
  }
}

export async function getUnreadCount(userId: string) {
  try {
    return await prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    })
  } catch (error) {
    console.error('Failed to get unread count:', error)
    throw error
  }
}
