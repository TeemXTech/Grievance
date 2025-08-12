import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode
} from 'react'
import { useAuth } from '@/lib/auth-context'

export type Notification = {
  id: string
  type: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
  data?: Record<string, any>
}

type NotificationContextType = {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (id: string) => Promise<void>
  refetchNotifications: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [lastFetched, setLastFetched] = useState<Date | null>(null)

  const fetchNotifications = async () => {
    if (!user) return

    try {
      const response = await fetch('/api/notifications')
      if (!response.ok) throw new Error('Failed to fetch notifications')

      const data = await response.json()
      setNotifications(data.notifications)
      setLastFetched(new Date())
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  // Fetch notifications on mount and when user changes
  useEffect(() => {
    if (user) {
      fetchNotifications()
    } else {
      setNotifications([])
    }
  }, [user])

  // Set up polling for new notifications
  useEffect(() => {
    if (!user) return

    const interval = setInterval(() => {
      fetchNotifications()
    }, 30000) // Poll every 30 seconds

    return () => clearInterval(interval)
  }, [user])

  // Set up WebSocket connection for real-time updates
  useEffect(() => {
    if (!user) return

    const ws = new WebSocket(
      `${process.env.NEXT_PUBLIC_WS_URL}/notifications?userId=${user.id}`
    )

    ws.onmessage = (event) => {
      const newNotification = JSON.parse(event.data)
      setNotifications(prev => [newNotification, ...prev])
    }

    return () => {
      ws.close()
    }
  }, [user])

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
      })

      if (!response.ok) throw new Error('Failed to mark notification as read')

      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id
            ? { ...notification, isRead: true }
            : notification
        )
      )
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
      })

      if (!response.ok) throw new Error('Failed to mark all notifications as read')

      setNotifications(prev =>
        prev.map(notification => ({ ...notification, isRead: true }))
      )
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete notification')

      setNotifications(prev =>
        prev.filter(notification => notification.id !== id)
      )
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refetchNotifications: fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}
