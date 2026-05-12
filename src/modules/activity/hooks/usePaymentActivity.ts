import { useFocusEffect } from '@react-navigation/native'
import { router } from 'expo-router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { clearAuthSession, getAuthSession } from '@/src/modules/auth/services/authSession'
import { useNotifications } from '@/src/modules/notifications/context/NotificationsProvider'
import {
  getPaymentErrorMessage,
  isUnauthorizedPaymentError,
  listPayments,
  reviewPayment,
} from '@/src/modules/payments/api/paymentsApi'
import { PaymentListItem, PaymentStatus, ReviewPaymentType } from '@/src/modules/payments/types/paymentTypes'

export type ActivityFilter = 'review' | 'sent' | 'history'
export type ActivityHistoryStatusFilter = 'all' | 'confirmed' | 'rejected'

export function usePaymentActivity() {
  const { latestRealtimeEvent } = useNotifications()
  const handledRealtimeEvent = useRef<unknown>(null)
  const [currentUserID, setCurrentUserID] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<ActivityFilter>('review')
  const [historyStatusFilter, setHistoryStatusFilter] = useState<ActivityHistoryStatusFilter>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [payments, setPayments] = useState<PaymentListItem[]>([])
  const [reviewingPaymentID, setReviewingPaymentID] = useState<string | null>(null)

  const requestFilters = useMemo(() => {
    if (filter === 'review') {
      return { status: 'pending_confirmation' as PaymentStatus, type: 'received' as const }
    }
    if (filter === 'sent') {
      return { status: 'pending_confirmation' as PaymentStatus, type: 'sent' as const }
    }
    if (historyStatusFilter !== 'all') {
      return { status: historyStatusFilter as PaymentStatus, type: 'all' as const }
    }
    return { type: 'all' as const }
  }, [filter, historyStatusFilter])

  const loadPayments = useCallback(async () => {
    setError(null)
    setIsLoading(true)

    const session = await getAuthSession()
    if (!session) {
      router.replace('/login')
      return
    }

    setCurrentUserID(session.user.id)

    try {
      const loadedPayments = await listPayments(requestFilters)
      setPayments(
        filter === 'history' && historyStatusFilter === 'all'
          ? loadedPayments.filter((payment) => payment.status !== 'pending_confirmation')
          : loadedPayments,
      )
    } catch (caughtError) {
      if (isUnauthorizedPaymentError(caughtError)) {
        await clearAuthSession()
        router.replace('/login')
        return
      }

      setError(getPaymentErrorMessage(caughtError))
    } finally {
      setIsLoading(false)
    }
  }, [filter, historyStatusFilter, requestFilters])

  useFocusEffect(
    useCallback(() => {
      void loadPayments()
    }, [loadPayments]),
  )

  useEffect(() => {
    if (!latestRealtimeEvent || handledRealtimeEvent.current === latestRealtimeEvent) {
      return
    }
    handledRealtimeEvent.current = latestRealtimeEvent

    if (
      latestRealtimeEvent?.kind === 'notification.created' &&
      latestRealtimeEvent.notification?.entity_type === 'payment'
    ) {
      void loadPayments()
    }
  }, [latestRealtimeEvent, loadPayments])

  const review = useCallback(
    async (paymentID: string, type: ReviewPaymentType) => {
      setError(null)
      setReviewingPaymentID(paymentID)

      try {
        await reviewPayment(paymentID, type)
        await loadPayments()
      } catch (caughtError) {
        if (isUnauthorizedPaymentError(caughtError)) {
          await clearAuthSession()
          router.replace('/login')
          return
        }

        setError(getPaymentErrorMessage(caughtError))
      } finally {
        setReviewingPaymentID(null)
      }
    },
    [loadPayments],
  )

  return {
    currentUserID,
    error,
    filter,
    historyStatusFilter,
    isLoading,
    loadPayments,
    payments,
    review,
    reviewingPaymentID,
    setFilter,
    setHistoryStatusFilter,
  }
}
