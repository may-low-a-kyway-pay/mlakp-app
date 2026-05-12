import { PropsWithChildren, createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { getAccessToken, getAuthSession } from '@/src/modules/auth/services/authSession'
import { listNotifications, markAllNotificationsRead } from '@/src/modules/notifications/api/notificationsApi'
import { RealtimeNotificationEvent } from '@/src/modules/notifications/types/notificationTypes'

type NotificationsContextValue = {
  latestRealtimeEvent: RealtimeNotificationEvent | null
  markAllRead: () => Promise<void>
  refreshNotifications: () => Promise<void>
  unreadCount: number
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null)

const reconnectDelayMs = 5000
const notificationPollMs = 5000

function realtimeURL(accessToken: string) {
  const baseURL = process.env.EXPO_PUBLIC_API_BASE_URL
  if (!baseURL) {
    throw new Error('EXPO_PUBLIC_API_BASE_URL is required')
  }

  const url = new URL('/v1/realtime', baseURL)
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
  url.searchParams.set('access_token', accessToken)
  return url.toString()
}

export function NotificationsProvider({ children }: PropsWithChildren) {
  const [latestRealtimeEvent, setLatestRealtimeEvent] = useState<RealtimeNotificationEvent | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const activeUserID = useRef<string | null>(null)
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const socketRef = useRef<WebSocket | null>(null)
  const isDisposed = useRef(false)
  const latestNotificationID = useRef<string | null>(null)
  const shouldReconnect = useRef(true)

  const refreshNotifications = useCallback(async (publishNewNotification = false) => {
    const session = await getAuthSession()
    if (!session) {
      latestNotificationID.current = null
      setUnreadCount(0)
      return
    }

    const data = await listNotifications(20)
    const newestNotification = data.notifications[0] ?? null
    const previousNotificationID = latestNotificationID.current
    latestNotificationID.current = newestNotification?.id ?? null
    setUnreadCount(data.unread_count)

    if (publishNewNotification && newestNotification && newestNotification.id !== previousNotificationID) {
      setLatestRealtimeEvent({
        kind: 'notification.created',
        notification: newestNotification,
        unread_count: data.unread_count,
      })
    }
  }, [])

  const closeSocket = useCallback((reconnect = true) => {
    shouldReconnect.current = reconnect
    if (socketRef.current) {
      socketRef.current.close()
      socketRef.current = null
    }
  }, [])

  const clearRealtimeState = useCallback(() => {
    activeUserID.current = null
    latestNotificationID.current = null
    setLatestRealtimeEvent(null)
    setUnreadCount(0)
    closeSocket(false)
  }, [closeSocket])

  const connect = useCallback(async () => {
    if (isDisposed.current || socketRef.current) {
      return
    }

    const session = await getAuthSession()
    if (!session) {
      clearRealtimeState()
      return
    }

    activeUserID.current = session.user.id
    const accessToken = await getAccessToken()

    if (!accessToken || activeUserID.current !== session.user.id) {
      return
    }

    const socket = new WebSocket(realtimeURL(accessToken))
    socketRef.current = socket

    socket.onmessage = (message) => {
      try {
        const event = JSON.parse(String(message.data)) as RealtimeNotificationEvent
        latestNotificationID.current = event.notification?.id ?? latestNotificationID.current
        setLatestRealtimeEvent(event)
        setUnreadCount(event.unread_count)
      } catch {
        // Ignore malformed realtime payloads; the next API refresh remains the source of truth.
      }
    }

    socket.onclose = () => {
      socketRef.current = null
      if (!isDisposed.current && shouldReconnect.current) {
        reconnectTimer.current = setTimeout(() => {
          void connect()
        }, reconnectDelayMs)
      }
      shouldReconnect.current = true
    }

    socket.onerror = () => {
      closeSocket()
    }
  }, [clearRealtimeState, closeSocket])

  const markAllRead = useCallback(async () => {
    const data = await markAllNotificationsRead()
    setUnreadCount(data.unread_count)
    await refreshNotifications()
  }, [refreshNotifications])

  useEffect(() => {
    isDisposed.current = false
    void refreshNotifications().catch(() => {
      setUnreadCount(0)
    })
    void connect()

    const sessionPoll = setInterval(() => {
      void getAuthSession().then((session) => {
        if (!session) {
          clearRealtimeState()
          return
        }

        if (activeUserID.current && activeUserID.current !== session.user.id) {
          closeSocket(false)
          setLatestRealtimeEvent(null)
          setUnreadCount(0)
        }

        void connect()
      })
    }, reconnectDelayMs)

    const notificationPoll = setInterval(() => {
      void refreshNotifications(true).catch(() => {
        setUnreadCount(0)
      })
    }, notificationPollMs)

    return () => {
      isDisposed.current = true
      clearInterval(sessionPoll)
      clearInterval(notificationPoll)
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current)
      }
      closeSocket(false)
    }
  }, [clearRealtimeState, closeSocket, connect, refreshNotifications])

  const value = useMemo(
    () => ({
      latestRealtimeEvent,
      markAllRead,
      refreshNotifications,
      unreadCount,
    }),
    [latestRealtimeEvent, markAllRead, refreshNotifications, unreadCount],
  )

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
}

export function useNotifications() {
  const value = useContext(NotificationsContext)
  if (!value) {
    throw new Error('useNotifications must be used inside NotificationsProvider')
  }
  return value
}
