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
import { listDebtRecords } from '@/src/modules/debts/api/debtsApi'
import { DebtRecord } from '@/src/modules/debts/types/debtTypes'
import { isUnauthorizedPaymentError, listPayments, reviewPayment } from '@/src/modules/payments/api/paymentsApi'
import { PaymentListItem } from '@/src/modules/payments/types/paymentTypes'
import { clearAuthSession } from '@/src/modules/auth/services/authSession'
import { Card } from '@/src/shared/components/Card'
import { Screen } from '@/src/shared/components/Screen'
import { AppColors } from '@/src/shared/theme/colors'
import { iconSize, touchTarget } from '@/src/shared/theme/metrics'
import { useAppTheme } from '@/src/shared/theme/ThemeContext'
import { typography } from '@/src/shared/theme/typography'

type NotificationAction = 'accept-debt' | 'reject-debt' | 'confirm-payment' | 'reject-payment'

type NotificationContext = {
  debt?: DebtRecord
  payment?: PaymentListItem
}

function actionSetFor(notification: AppNotification, context: NotificationContext) {
  if (
    notification.entity_type === 'debt' &&
    context.debt?.status === 'pending' &&
    (notification.type === 'expense.created' || notification.type === 'debt.resent')
  ) {
    return ['reject-debt', 'accept-debt'] satisfies NotificationAction[]
  }

  if (
    notification.entity_type === 'payment' &&
    context.payment?.status === 'pending_confirmation' &&
    notification.type === 'payment.marked'
  ) {
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

function indexByID<T extends { id: string }>(records: T[]) {
  return records.reduce<Record<string, T>>((index, record) => {
    index[record.id] = record
    return index
  }, {})
}

function contextFor(
  notification: AppNotification,
  debtByID: Record<string, DebtRecord>,
  paymentByID: Record<string, PaymentListItem>,
): NotificationContext {
  if (notification.entity_type === 'debt') {
    return { debt: debtByID[notification.entity_id] }
  }

  if (notification.entity_type === 'payment') {
    return { payment: paymentByID[notification.entity_id] }
  }

  return {}
}

function notificationIcon(notification: AppNotification, hasActions: boolean) {
  if (hasActions) {
    return 'alert-circle-outline'
  }

  switch (notification.entity_type) {
    case 'debt':
      return 'receipt-outline'
    case 'payment':
      return 'card-outline'
    case 'expense':
      return 'wallet-outline'
  }
}

function formatNotificationTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const diffMs = Date.now() - date.getTime()
  const diffMinutes = Math.floor(diffMs / 60000)
  if (diffMinutes < 1) {
    return 'Just now'
  }
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`
  }

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) {
    return `${diffHours}h ago`
  }

  return new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short' }).format(date)
}

function debtNotificationTitle(notification: AppNotification, expenseTitle: string) {
  switch (notification.type) {
    case 'expense.created':
      return `Review ${expenseTitle}`
    case 'debt.resent':
      return `Review updated ${expenseTitle}`
    case 'debt.accepted':
      return `${expenseTitle} accepted`
    case 'debt.rejected':
      return `${expenseTitle} rejected`
    default:
      return expenseTitle
  }
}

function paymentNotificationTitle(notification: AppNotification, expenseTitle: string) {
  switch (notification.type) {
    case 'payment.marked':
      return `Confirm payment for ${expenseTitle}`
    case 'payment.confirmed':
      return `Payment confirmed for ${expenseTitle}`
    case 'payment.rejected':
      return `Payment rejected for ${expenseTitle}`
    default:
      return expenseTitle
  }
}

function notificationDetails(notification: AppNotification, context: NotificationContext) {
  if (context.debt) {
    const isDebtorAction = notification.type === 'expense.created' || notification.type === 'debt.resent'
    const actorName = isDebtorAction ? context.debt.creditor_name : context.debt.debtor_name
    const actorPrefix = isDebtorAction ? 'From' : 'By'
    const expenseTitle = context.debt.expense_title ?? notification.title
    const status = context.debt.status.replaceAll('_', ' ')
    return {
      actor: actorName ? `${actorPrefix} ${actorName}` : 'Shared expense',
      amount: context.debt.remaining_amount,
      description: notification.body,
      status,
      title: debtNotificationTitle(notification, expenseTitle),
    }
  }

  if (context.payment) {
    const isReceiverAction = notification.type === 'payment.marked'
    const actorName = isReceiverAction ? context.payment.paid_by_name : context.payment.received_by_name
    const actorPrefix = isReceiverAction ? 'From' : 'By'
    const status = context.payment.status.replaceAll('_', ' ')
    return {
      actor: actorName ? `${actorPrefix} ${actorName}` : 'Payment update',
      amount: context.payment.amount,
      description: notification.body,
      status,
      title: paymentNotificationTitle(notification, context.payment.expense_title),
    }
  }

  return {
    actor: notification.entity_type,
    amount: null,
    description: notification.body,
    status: notification.type.replace('.', ' / '),
    title: notification.title,
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
  const [debtByID, setDebtByID] = useState<Record<string, DebtRecord>>({})
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [paymentByID, setPaymentByID] = useState<Record<string, PaymentListItem>>({})
  const [updatingNotificationID, setUpdatingNotificationID] = useState<string | null>(null)

  const unreadCount = notifications.filter((notification) => notification.read_at === null).length

  const loadNotifications = useCallback(async () => {
    setError(null)
    setIsLoading(true)

    try {
      const [data, debts, payments] = await Promise.all([listNotifications(100), listDebtRecords({}), listPayments({})])
      setNotifications(data.notifications)
      setDebtByID(indexByID(debts))
      setPaymentByID(indexByID(payments))
      await refreshNotifications()
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
        if (
          isUnauthorizedNotificationError(caughtError) ||
          isUnauthorizedDashboardError(caughtError) ||
          isUnauthorizedPaymentError(caughtError)
        ) {
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
          accessibilityLabel="Mark all notifications as read"
          accessibilityRole="button"
          accessibilityState={{ disabled: isMarkingAllRead || unreadCount === 0 }}
          disabled={isMarkingAllRead || unreadCount === 0}
          onPress={markAllRead}
          style={styles.markAllButton}
        >
          <Ionicons
            color={unreadCount === 0 ? colors.textSoft : colors.primary}
            name="checkmark-done"
            size={iconSize.small}
          />
          <Text style={[styles.markAllText, unreadCount === 0 && styles.markAllTextDisabled]}>Mark all</Text>
        </Pressable>
      </View>

      {error ? (
        <View style={styles.errorBlock}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable accessibilityRole="button" onPress={loadNotifications} style={styles.retryButton}>
            <Ionicons color={colors.white} name="refresh" size={iconSize.small} />
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
              <Ionicons color={colors.textSoft} name="notifications-outline" size={iconSize.empty} />
              <Text style={styles.emptyTitle}>No notifications</Text>
              <Text style={styles.emptyText}>New expense, debt, and payment updates will appear here.</Text>
            </Card>
          ) : null
        }
        renderItem={({ item }) => {
          const context = contextFor(item, debtByID, paymentByID)
          const actions = actionSetFor(item, context)
          const details = notificationDetails(item, context)
          const isUnread = item.read_at === null
          const isUpdating = updatingNotificationID === item.id
          const iconName = notificationIcon(item, actions.length > 0)

          return (
            <Card style={[styles.notificationCard, isUnread && styles.unreadCard]}>
              <View style={styles.notificationHeader}>
                <View style={[styles.notificationIcon, actions.length > 0 && styles.notificationIconAction]}>
                  <Ionicons
                    color={actions.length > 0 ? colors.tertiary : colors.primary}
                    name={iconName}
                    size={iconSize.standard}
                  />
                </View>
                <View style={styles.notificationTitleBlock}>
                  <View style={styles.notificationTitleRow}>
                    <Text style={styles.notificationTitle}>{details.title}</Text>
                    {isUnread ? <View style={styles.unreadDot} /> : null}
                  </View>
                  <Text style={styles.notificationActor}>{details.actor}</Text>
                  <Text style={styles.notificationBody}>{details.description}</Text>
                </View>
              </View>

              <View style={styles.notificationFooter}>
                <View style={styles.metaRow}>
                  <Text style={styles.notificationMeta}>{formatNotificationTime(item.created_at)}</Text>
                  {details.amount ? <Text style={styles.notificationAmount}>{details.amount}</Text> : null}
                  <Text style={styles.statusPill}>{actions.length > 0 ? 'Needs action' : details.status}</Text>
                </View>
                {isUnread && actions.length === 0 ? (
                  <Pressable
                    accessibilityLabel="Mark notification as read"
                    accessibilityRole="button"
                    accessibilityState={{ disabled: isUpdating }}
                    disabled={isUpdating}
                    onPress={() => markRead(item.id)}
                    style={styles.markReadButton}
                  >
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
                        accessibilityLabel={`${actionLabel(action)} notification`}
                        accessibilityRole="button"
                        accessibilityState={{ disabled: isUpdating }}
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
                          size={iconSize.small}
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
      fontSize: typography.size.label,
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
      fontSize: typography.size.bodySmall,
      lineHeight: typography.lineHeight.bodySmall,
      textAlign: 'center',
    },
    emptyTitle: {
      color: colors.text,
      fontFamily: typography.familyBold,
      fontSize: typography.size.bodyLarge,
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
      fontSize: typography.size.bodySmall,
      lineHeight: typography.lineHeight.bodySmall,
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
      fontSize: typography.size.label,
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
      fontSize: typography.size.label,
      fontWeight: typography.weight.bold,
    },
    metaRow: {
      alignItems: 'center',
      flex: 1,
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    negativeButton: {
      backgroundColor: colors.dangerSoft,
    },
    negativeText: {
      color: colors.danger,
    },
    notificationActor: {
      color: colors.text,
      fontFamily: typography.familyBold,
      fontSize: typography.size.bodySmall,
      fontWeight: typography.weight.semibold,
      marginTop: 4,
    },
    notificationAmount: {
      color: colors.text,
      fontFamily: typography.familyBold,
      fontSize: typography.size.caption,
      fontWeight: typography.weight.bold,
    },
    notificationBody: {
      color: colors.textMuted,
      fontFamily: typography.family,
      fontSize: typography.size.bodySmall,
      lineHeight: typography.lineHeight.bodySmall,
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
    notificationIcon: {
      alignItems: 'center',
      backgroundColor: colors.primarySoft,
      borderRadius: 24,
      height: touchTarget.minimum,
      justifyContent: 'center',
      width: touchTarget.minimum,
    },
    notificationIconAction: {
      backgroundColor: colors.tertiarySoft,
    },
    notificationMeta: {
      color: colors.textSoft,
      fontFamily: typography.family,
      fontSize: typography.size.caption,
    },
    notificationTitle: {
      color: colors.text,
      fontFamily: typography.familyBold,
      fontSize: typography.size.bodyLarge,
      fontWeight: typography.weight.bold,
    },
    notificationTitleBlock: {
      flex: 1,
    },
    notificationTitleRow: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 8,
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
      fontSize: typography.size.label,
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
      fontSize: typography.size.bodySmall,
    },
    statusPill: {
      backgroundColor: colors.surfaceVariant,
      borderRadius: 999,
      color: colors.textMuted,
      fontFamily: typography.familyBold,
      fontSize: typography.size.caption,
      fontWeight: typography.weight.semibold,
      overflow: 'hidden',
      paddingHorizontal: 8,
      paddingVertical: 3,
      textTransform: 'capitalize',
    },
    subtitle: {
      color: colors.textMuted,
      fontFamily: typography.family,
      fontSize: typography.size.label,
      marginTop: 2,
    },
    title: {
      color: colors.text,
      fontFamily: typography.familyBold,
      fontSize: typography.size.title,
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
