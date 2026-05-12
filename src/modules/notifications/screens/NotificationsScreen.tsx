import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import {
  getNotificationErrorMessage,
  isUnauthorizedNotificationError,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/src/modules/notifications/api/notificationsApi'
import { AppNotification } from '@/src/modules/notifications/types/notificationTypes'
import { useNotifications } from '@/src/modules/notifications/context/NotificationsProvider'
import { isUnauthorizedDashboardError, updateDebtStatus } from '@/src/modules/dashboard/api/dashboardApi'
import { isUnauthorizedPaymentError, reviewPayment } from '@/src/modules/payments/api/paymentsApi'
import { clearAuthSession } from '@/src/modules/auth/services/authSession'
import { Card } from '@/src/shared/components/Card'
import { Screen } from '@/src/shared/components/Screen'
import { AppColors } from '@/src/shared/theme/colors'
import { useAppTheme } from '@/src/shared/theme/ThemeContext'
import { typography } from '@/src/shared/theme/typography'

type NotificationAction = 'accept-debt' | 'reject-debt' | 'confirm-payment' | 'reject-payment'

function actionSetFor(notification: AppNotification) {
  if (
    notification.entity_type === 'debt' &&
    (notification.type === 'expense.created' || notification.type === 'debt.resent')
  ) {
    return ['reject-debt', 'accept-debt'] satisfies NotificationAction[]
  }

  if (notification.entity_type === 'payment' && notification.type === 'payment.marked') {
    return ['reject-payment', 'confirm-payment'] satisfies NotificationAction[]
  }

  return []
}

function actionLabel(action: NotificationAction) {
  switch (action) {
    case 'accept-debt':
      return 'Accept'
    case 'reject-debt':
      return 'Reject'
    case 'confirm-payment':
      return 'Confirm'
    case 'reject-payment':
      return 'Reject'
  }
}

function actionIcon(action: NotificationAction) {
  switch (action) {
    case 'accept-debt':
    case 'confirm-payment':
      return 'checkmark'
    case 'reject-debt':
    case 'reject-payment':
      return 'close'
  }
}

export function NotificationsScreen() {
  const theme = useAppTheme()
  const { colors } = theme
  const styles = useMemo(() => createStyles(colors), [colors])
  const { latestRealtimeEvent, refreshNotifications } = useNotifications()
  const handledRealtimeEvent = useRef<unknown>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false)
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [updatingNotificationID, setUpdatingNotificationID] = useState<string | null>(null)

  const unreadCount = notifications.filter((notification) => notification.read_at === null).length

  const loadNotifications = useCallback(async () => {
    setError(null)
    setIsLoading(true)

    try {
      const data = await listNotifications(100)
      setNotifications(data.notifications)
      await refreshNotifications()
    } catch (caughtError) {
      if (isUnauthorizedNotificationError(caughtError)) {
        await clearAuthSession()
        router.replace('/login')
        return
      }

      setError(getNotificationErrorMessage(caughtError))
    } finally {
      setIsLoading(false)
    }
  }, [refreshNotifications])

  useEffect(() => {
    void loadNotifications()
  }, [loadNotifications])

  useEffect(() => {
    if (!latestRealtimeEvent || handledRealtimeEvent.current === latestRealtimeEvent) {
      return
    }
    handledRealtimeEvent.current = latestRealtimeEvent
    void loadNotifications()
  }, [latestRealtimeEvent, loadNotifications])

  const markAllRead = useCallback(async () => {
    setIsMarkingAllRead(true)
    setError(null)

    try {
      await markAllNotificationsRead()
      await loadNotifications()
    } catch (caughtError) {
      if (isUnauthorizedNotificationError(caughtError)) {
        await clearAuthSession()
        router.replace('/login')
        return
      }

      setError(getNotificationErrorMessage(caughtError))
    } finally {
      setIsMarkingAllRead(false)
    }
  }, [loadNotifications])

  const markRead = useCallback(
    async (notificationID: string) => {
      setUpdatingNotificationID(notificationID)
      setError(null)

      try {
        await markNotificationRead(notificationID)
        await loadNotifications()
      } catch (caughtError) {
        if (
          isUnauthorizedNotificationError(caughtError) ||
          isUnauthorizedDashboardError(caughtError) ||
          isUnauthorizedPaymentError(caughtError)
        ) {
          await clearAuthSession()
          router.replace('/login')
          return
        }

        setError(getNotificationErrorMessage(caughtError))
      } finally {
        setUpdatingNotificationID(null)
      }
    },
    [loadNotifications],
  )

  const runAction = useCallback(
    async (notification: AppNotification, action: NotificationAction) => {
      setUpdatingNotificationID(notification.id)
      setError(null)

      try {
        switch (action) {
          case 'accept-debt':
            await updateDebtStatus(notification.entity_id, 'accept')
            break
          case 'reject-debt':
            await updateDebtStatus(notification.entity_id, 'reject')
            break
          case 'confirm-payment':
            await reviewPayment(notification.entity_id, 'confirm')
            break
          case 'reject-payment':
            await reviewPayment(notification.entity_id, 'reject')
            break
        }

        await markNotificationRead(notification.id)
        await loadNotifications()
      } catch (caughtError) {
        if (isUnauthorizedNotificationError(caughtError)) {
          await clearAuthSession()
          router.replace('/login')
          return
        }

        setError('Unable to update this notification. Please refresh and try again.')
      } finally {
        setUpdatingNotificationID(null)
      }
    },
    [loadNotifications],
  )

  return (
    <Screen contentStyle={styles.root} scroll={false}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Go back"
          accessibilityRole="button"
          onPress={() => router.back()}
          style={styles.iconButton}
        >
          <Ionicons color={colors.text} name="chevron-back" size={24} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.title}>Notifications</Text>
          <Text style={styles.subtitle}>{unreadCount} unread</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          disabled={isMarkingAllRead || unreadCount === 0}
          onPress={markAllRead}
          style={styles.markAllButton}
        >
          <Ionicons color={unreadCount === 0 ? colors.textSoft : colors.primary} name="checkmark-done" size={18} />
          <Text style={[styles.markAllText, unreadCount === 0 && styles.markAllTextDisabled]}>Mark all read</Text>
        </Pressable>
      </View>

      {error ? (
        <View style={styles.errorBlock}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={loadNotifications} style={styles.retryButton}>
            <Ionicons color={colors.white} name="refresh" size={18} />
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : null}

      {isLoading ? (
        <View style={styles.stateBlock}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.stateText}>Loading notifications...</Text>
        </View>
      ) : null}

      <FlatList
        contentContainerStyle={styles.list}
        data={notifications}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          !isLoading && !error ? (
            <Card style={styles.emptyCard}>
              <Ionicons color={colors.textSoft} name="notifications-outline" size={32} />
              <Text style={styles.emptyTitle}>No notifications</Text>
              <Text style={styles.emptyText}>New expense, debt, and payment updates will appear here.</Text>
            </Card>
          ) : null
        }
        renderItem={({ item }) => {
          const actions = actionSetFor(item)
          const isUnread = item.read_at === null
          const isUpdating = updatingNotificationID === item.id

          return (
            <Card style={[styles.notificationCard, isUnread && styles.unreadCard]}>
              <View style={styles.notificationHeader}>
                <View style={styles.notificationTitleBlock}>
                  <Text style={styles.notificationTitle}>{item.title}</Text>
                  <Text style={styles.notificationBody}>{item.body}</Text>
                </View>
                {isUnread ? <View style={styles.unreadDot} /> : null}
              </View>

              <View style={styles.notificationFooter}>
                <Text style={styles.notificationMeta}>{item.type.replace('.', ' / ')}</Text>
                {isUnread && actions.length === 0 ? (
                  <Pressable disabled={isUpdating} onPress={() => markRead(item.id)} style={styles.markReadButton}>
                    <Text style={styles.markReadText}>{isUpdating ? 'Updating' : 'Mark read'}</Text>
                  </Pressable>
                ) : null}
              </View>

              {actions.length > 0 ? (
                <View style={styles.actionRow}>
                  {actions.map((action) => {
                    const isPositive = action === 'accept-debt' || action === 'confirm-payment'
                    return (
                      <Pressable
                        disabled={isUpdating}
                        key={action}
                        onPress={() => runAction(item, action)}
                        style={({ pressed }) => [
                          styles.actionButton,
                          isPositive ? styles.positiveButton : styles.negativeButton,
                          (pressed || isUpdating) && styles.actionPressed,
                        ]}
                      >
                        <Ionicons
                          color={isPositive ? colors.white : colors.danger}
                          name={actionIcon(action)}
                          size={16}
                        />
                        <Text style={[styles.actionText, isPositive ? styles.positiveText : styles.negativeText]}>
                          {isUpdating ? 'Updating' : actionLabel(action)}
                        </Text>
                      </Pressable>
                    )
                  })}
                </View>
              ) : null}
            </Card>
          )
        }}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  )
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    actionButton: {
      alignItems: 'center',
      borderRadius: 8,
      flex: 1,
      flexDirection: 'row',
      gap: 6,
      justifyContent: 'center',
      minHeight: 48,
      paddingHorizontal: 12,
    },
    actionPressed: {
      opacity: 0.72,
    },
    actionRow: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 14,
    },
    actionText: {
      fontFamily: typography.familyBold,
      fontSize: 13,
      fontWeight: typography.weight.bold,
    },
    emptyCard: {
      alignItems: 'center',
      gap: 8,
      paddingVertical: 28,
    },
    emptyText: {
      color: colors.textMuted,
      fontFamily: typography.family,
      fontSize: 14,
      lineHeight: 20,
      textAlign: 'center',
    },
    emptyTitle: {
      color: colors.text,
      fontFamily: typography.familyBold,
      fontSize: 16,
      fontWeight: typography.weight.bold,
    },
    errorBlock: {
      backgroundColor: colors.dangerSoft,
      borderColor: colors.danger,
      borderRadius: 8,
      borderWidth: StyleSheet.hairlineWidth,
      gap: 10,
      marginHorizontal: 18,
      marginTop: 14,
      padding: 14,
    },
    errorText: {
      color: colors.danger,
      fontFamily: typography.family,
      fontSize: 14,
      lineHeight: 20,
    },
    header: {
      alignItems: 'center',
      backgroundColor: colors.background,
      borderBottomColor: colors.surfaceVariant,
      borderBottomWidth: StyleSheet.hairlineWidth,
      flexDirection: 'row',
      gap: 12,
      minHeight: 64,
      paddingHorizontal: 18,
    },
    headerText: {
      flex: 1,
    },
    iconButton: {
      alignItems: 'center',
      borderRadius: 24,
      height: 48,
      justifyContent: 'center',
      width: 48,
    },
    list: {
      gap: 12,
      padding: 18,
      paddingBottom: 32,
    },
    markAllButton: {
      alignItems: 'center',
      borderRadius: 8,
      flexDirection: 'row',
      gap: 6,
      justifyContent: 'center',
      minHeight: 48,
      paddingHorizontal: 10,
    },
    markAllText: {
      color: colors.primary,
      fontFamily: typography.familyBold,
      fontSize: 13,
      fontWeight: typography.weight.bold,
    },
    markAllTextDisabled: {
      color: colors.textSoft,
    },
    markReadButton: {
      alignItems: 'center',
      borderRadius: 8,
      justifyContent: 'center',
      minHeight: 48,
      paddingHorizontal: 10,
    },
    markReadText: {
      color: colors.primary,
      fontFamily: typography.familyBold,
      fontSize: 13,
      fontWeight: typography.weight.bold,
    },
    negativeButton: {
      backgroundColor: colors.dangerSoft,
    },
    negativeText: {
      color: colors.danger,
    },
    notificationBody: {
      color: colors.textMuted,
      fontFamily: typography.family,
      fontSize: 14,
      lineHeight: 20,
      marginTop: 3,
    },
    notificationCard: {
      borderColor: colors.surfaceVariant,
      borderWidth: StyleSheet.hairlineWidth,
    },
    notificationFooter: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 12,
    },
    notificationHeader: {
      alignItems: 'flex-start',
      flexDirection: 'row',
      gap: 12,
    },
    notificationMeta: {
      color: colors.textSoft,
      fontFamily: typography.family,
      fontSize: 12,
    },
    notificationTitle: {
      color: colors.text,
      fontFamily: typography.familyBold,
      fontSize: 16,
      fontWeight: typography.weight.bold,
    },
    notificationTitleBlock: {
      flex: 1,
    },
    positiveButton: {
      backgroundColor: colors.primary,
    },
    positiveText: {
      color: colors.white,
    },
    retryButton: {
      alignItems: 'center',
      alignSelf: 'flex-start',
      backgroundColor: colors.danger,
      borderRadius: 8,
      flexDirection: 'row',
      gap: 6,
      minHeight: 48,
      paddingHorizontal: 12,
      paddingVertical: 9,
    },
    retryText: {
      color: colors.white,
      fontFamily: typography.familyBold,
      fontSize: 13,
      fontWeight: typography.weight.bold,
    },
    root: {
      backgroundColor: colors.background,
      flex: 1,
    },
    stateBlock: {
      alignItems: 'center',
      gap: 10,
      padding: 24,
    },
    stateText: {
      color: colors.textMuted,
      fontFamily: typography.family,
      fontSize: 14,
    },
    subtitle: {
      color: colors.textMuted,
      fontFamily: typography.family,
      fontSize: 13,
      marginTop: 2,
    },
    title: {
      color: colors.text,
      fontFamily: typography.familyBold,
      fontSize: 20,
      fontWeight: typography.weight.bold,
    },
    unreadCard: {
      borderColor: colors.primary,
    },
    unreadDot: {
      backgroundColor: colors.danger,
      borderRadius: 5,
      height: 10,
      marginTop: 4,
      width: 10,
    },
  })
}
