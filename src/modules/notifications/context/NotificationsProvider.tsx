import { PropsWithChildren, createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { AppState } from 'react-native'
import { getAuthSession, subscribeAuthSession } from '@/src/modules/auth/services/authSession'
import { listNotifications, markAllNotificationsRead } from '@/src/modules/notifications/api/notificationsApi'
import { RealtimeNotificationEvent } from '@/src/modules/notifications/types/notificationTypes'

type AuthSession = Awaited<ReturnType<typeof getAuthSession>>

type NotificationsContextValue = {
  latestRealtimeEvent: RealtimeNotificationEvent | null
  markAllRead: () => Promise<void>
  refreshNotifications: () => Promise<void>
  syncUnreadCount: (unreadCount: number) => void
  unreadCount: number
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null)

const initialReconnectDelayMs = 1000
const maxReconnectDelayMs = 30000
const notificationPollMs = 60000

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
  const activeSession = useRef<AuthSession>(null)
  const appIsActive = useRef(AppState.currentState === 'active')
  const reconnectAttempts = useRef(0)
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const socketRef = useRef<WebSocket | null>(null)
  const isDisposed = useRef(false)
  const latestNotificationID = useRef<string | null>(null)

  const refreshNotifications = useCallback(async (publishNewNotification = false) => {
    const session = await getAuthSession()
    if (!session) {
      latestNotificationID.current = null
      setUnreadCount(0)
      return
    }

    const data = await listNotifications(20)
    if (
      activeSession.current?.accessToken !== session.accessToken ||
      activeSession.current?.user.id !== session.user.id
    ) {
      return
    }
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

  const syncUnreadCount = useCallback((count: number) => {
    setUnreadCount(count)
  }, [])

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current)
      reconnectTimer.current = null
    }
  }, [])

  const closeSocket = useCallback(() => {
    clearReconnectTimer()
    const socket = socketRef.current
    if (socket) {
      socketRef.current = null
      socket.close()
    }
  }, [clearReconnectTimer])

  const clearRealtimeState = useCallback(() => {
    activeSession.current = null
    latestNotificationID.current = null
    setLatestRealtimeEvent(null)
    setUnreadCount(0)
    closeSocket()
  }, [closeSocket])

  const connect = useCallback(() => {
    const session = activeSession.current
    if (isDisposed.current || !appIsActive.current || socketRef.current || !session) {
      return
    }

    clearReconnectTimer()
    const socket = new WebSocket(realtimeURL(session.accessToken))
    socketRef.current = socket

    socket.onopen = () => {
      if (socketRef.current !== socket) {
        return
      }
      reconnectAttempts.current = 0
      void refreshNotifications(true).catch(() => {
        // The open socket and fallback polling can recover the snapshot later.
      })
    }

    socket.onmessage = (message) => {
      if (socketRef.current !== socket) {
        return
      }
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
      if (socketRef.current !== socket) {
        return
      }
      socketRef.current = null
      if (!isDisposed.current && appIsActive.current && activeSession.current) {
        const delay = Math.min(initialReconnectDelayMs * 2 ** reconnectAttempts.current, maxReconnectDelayMs)
        reconnectAttempts.current += 1
        reconnectTimer.current = setTimeout(connect, delay)
      }
    }

    socket.onerror = () => {
      if (socketRef.current === socket) {
        socket.close()
      }
    }
  }, [clearReconnectTimer, refreshNotifications])

  const markAllRead = useCallback(async () => {
    const data = await markAllNotificationsRead()
    setUnreadCount(data.unread_count)
  }, [])

  useEffect(() => {
    isDisposed.current = false
    let authSessionChanged = false

    void getAuthSession().then((session) => {
      if (authSessionChanged || isDisposed.current) {
        return
      }
      activeSession.current = session
      if (!session) {
        clearRealtimeState()
        return
      }
      void refreshNotifications().catch(() => setUnreadCount(0))
      connect()
    })

    const unsubscribeAuth = subscribeAuthSession((session) => {
      authSessionChanged = true
      const previous = activeSession.current
      const connectionChanged = previous?.accessToken !== session?.accessToken || previous?.user.id !== session?.user.id
      activeSession.current = session
      if (!session) {
        clearRealtimeState()
        return
      }

      if (previous?.user.id !== session.user.id) {
        latestNotificationID.current = null
        setLatestRealtimeEvent(null)
        setUnreadCount(0)
      }
      if (connectionChanged) {
        closeSocket()
        if (appIsActive.current) {
          void refreshNotifications().catch(() => {
            // Keep the current badge until the next successful refresh.
          })
          connect()
        }
      }
    })

    const appStateSubscription = AppState.addEventListener('change', (nextState) => {
      const wasActive = appIsActive.current
      appIsActive.current = nextState === 'active'
      if (!appIsActive.current) {
        closeSocket()
        return
      }
      if (!wasActive) {
        void refreshNotifications(true).catch(() => {
          // Realtime reconnect and polling can recover later.
        })
        connect()
      }
    })

    const notificationPoll = setInterval(() => {
      if (!appIsActive.current || socketRef.current) {
        return
      }
      void refreshNotifications(true).catch(() => {
        // Keep the current badge until the next successful refresh.
      })
    }, notificationPollMs)

    return () => {
      isDisposed.current = true
      clearInterval(notificationPoll)
      unsubscribeAuth()
      appStateSubscription.remove()
      closeSocket()
    }
  }, [clearRealtimeState, closeSocket, connect, refreshNotifications])

  const value = useMemo(
    () => ({
      latestRealtimeEvent,
      markAllRead,
      refreshNotifications,
      syncUnreadCount,
      unreadCount,
    }),
    [latestRealtimeEvent, markAllRead, refreshNotifications, syncUnreadCount, unreadCount],
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
