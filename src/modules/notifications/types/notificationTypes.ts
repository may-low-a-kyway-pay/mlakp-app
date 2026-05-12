export type NotificationEntityType = 'expense' | 'debt' | 'payment'

export type AppNotification = {
  id: string
  user_id: string
  type: string
  title: string
  body: string
  entity_type: NotificationEntityType
  entity_id: string
  metadata: Record<string, unknown>
  read_at: string | null
  created_at: string
}

export type NotificationsResponse = {
  data: {
    notifications: AppNotification[]
    unread_count: number
  }
  success: true
}

export type NotificationReadResponse = {
  data: {
    notification: AppNotification
    unread_count: number
  }
  success: true
}

export type NotificationsReadAllResponse = {
  data: {
    unread_count: number
  }
  success: true
}

export type RealtimeNotificationEvent = {
  kind: 'notification.created' | 'notification.read' | 'notifications.read_all'
  notification?: AppNotification
  unread_count: number
}
