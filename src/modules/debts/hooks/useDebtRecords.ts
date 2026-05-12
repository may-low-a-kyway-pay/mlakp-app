import { router } from 'expo-router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { clearAuthSession, getAuthSession } from '@/src/modules/auth/services/authSession'
import {
  getDebtRecordsErrorMessage,
  isUnauthorizedDebtRecordsError,
  listDebtRecords,
} from '@/src/modules/debts/api/debtsApi'
import { DebtRecord, DebtRecordFilters, DebtRecordType, DebtStatus } from '@/src/modules/debts/types/debtTypes'
import { updateDebtStatus } from '@/src/modules/dashboard/api/dashboardApi'
import {
  getPaymentErrorMessage,
  isUnauthorizedPaymentError,
  listPayments,
  markDebtPayment,
} from '@/src/modules/payments/api/paymentsApi'
import { useNotifications } from '@/src/modules/notifications/context/NotificationsProvider'

type StatusFilter = 'active' | 'all' | DebtStatus
type TypeFilter = 'all' | DebtRecordType

const activeStatuses: DebtStatus[] = ['pending', 'accepted', 'partially_settled']

function parseAmountMinor(value: string) {
  const trimmed = value.trim()
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) {
    return null
  }

  const [whole, decimal = ''] = trimmed.split('.')
  return Number(whole) * 100 + Number(decimal.padEnd(2, '0'))
}

export function useDebtRecords() {
  const { latestRealtimeEvent } = useNotifications()
  const handledRealtimeEvent = useRef<unknown>(null)
  const [records, setRecords] = useState<DebtRecord[]>([])
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('active')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [currentUserID, setCurrentUserID] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentDebt, setPaymentDebt] = useState<DebtRecord | null>(null)
  const [paymentNote, setPaymentNote] = useState('')
  const [pendingPaymentDebtIDs, setPendingPaymentDebtIDs] = useState<Set<string>>(new Set())
  const [updatingDebtID, setUpdatingDebtID] = useState<string | null>(null)

  const filters = useMemo<DebtRecordFilters>(
    () => ({
      status: statusFilter === 'all' || statusFilter === 'active' ? undefined : statusFilter,
      type: typeFilter === 'all' ? undefined : typeFilter,
    }),
    [statusFilter, typeFilter],
  )

  const loadRecords = useCallback(async () => {
    setError(null)
    setIsLoading(true)

    const session = await getAuthSession()
    if (!session) {
      router.replace('/login')
      return
    }

    setCurrentUserID(session.user.id)

    try {
      const [loadedRecords, pendingPayments] = await Promise.all([
        listDebtRecords(filters),
        listPayments({ status: 'pending_confirmation', type: 'sent' }),
      ])
      setRecords(
        statusFilter === 'active'
          ? loadedRecords.filter((record) => activeStatuses.includes(record.status))
          : loadedRecords,
      )
      setPendingPaymentDebtIDs(new Set(pendingPayments.map((payment) => payment.debt_id)))
    } catch (caughtError) {
      if (isUnauthorizedDebtRecordsError(caughtError) || isUnauthorizedPaymentError(caughtError)) {
        await clearAuthSession()
        router.replace('/login')
        return
      }

      setError(getDebtRecordsErrorMessage(caughtError))
    } finally {
      setIsLoading(false)
    }
  }, [filters, statusFilter])

  useEffect(() => {
    void loadRecords()
  }, [loadRecords])

  useEffect(() => {
    if (!latestRealtimeEvent || handledRealtimeEvent.current === latestRealtimeEvent) {
      return
    }
    handledRealtimeEvent.current = latestRealtimeEvent

    if (
      latestRealtimeEvent?.kind === 'notification.created' &&
      ['expense', 'debt', 'payment'].includes(latestRealtimeEvent.notification?.entity_type ?? '')
    ) {
      void loadRecords()
    }
  }, [latestRealtimeEvent, loadRecords])

  const transitionDebt = useCallback(
    async (debtID: string, type: 'accept' | 'reject') => {
      setError(null)
      setUpdatingDebtID(debtID)

      try {
        await updateDebtStatus(debtID, type)
        await loadRecords()
      } catch (caughtError) {
        if (isUnauthorizedDebtRecordsError(caughtError)) {
          await clearAuthSession()
          router.replace('/login')
          return
        }

        setError(getDebtRecordsErrorMessage(caughtError))
      } finally {
        setUpdatingDebtID(null)
      }
    },
    [loadRecords],
  )

  const openPayment = useCallback((record: DebtRecord) => {
    setError(null)
    setPaymentDebt(record)
    setPaymentAmount(record.remaining_amount)
    setPaymentNote('')
    setIsPaymentOpen(true)
  }, [])

  const useFullPaymentAmount = useCallback(() => {
    if (!paymentDebt) {
      return
    }

    setPaymentAmount(paymentDebt.remaining_amount)
  }, [paymentDebt])

  const closePayment = useCallback(() => {
    if (isSubmittingPayment) {
      return
    }

    setIsPaymentOpen(false)
    setPaymentDebt(null)
    setPaymentAmount('')
    setPaymentNote('')
  }, [isSubmittingPayment])

  const paymentAmountMinor = useMemo(() => parseAmountMinor(paymentAmount), [paymentAmount])

  const canSubmitPayment = useMemo(() => {
    return Boolean(
      paymentDebt &&
      paymentAmountMinor !== null &&
      paymentAmountMinor > 0 &&
      paymentAmountMinor <= paymentDebt.remaining_amount_minor &&
      !isSubmittingPayment,
    )
  }, [isSubmittingPayment, paymentAmountMinor, paymentDebt])

  const submitPayment = useCallback(async () => {
    if (!paymentDebt || paymentAmountMinor === null || paymentAmountMinor <= 0) {
      setError('Enter a valid payment amount.')
      return
    }

    if (paymentAmountMinor > paymentDebt.remaining_amount_minor) {
      setError('Payment amount cannot exceed the remaining balance.')
      return
    }

    setError(null)
    setIsSubmittingPayment(true)

    try {
      await markDebtPayment(paymentDebt.id, {
        amount: Number(paymentAmount).toFixed(2),
        note: paymentNote.trim() ? paymentNote.trim() : null,
      })
      setIsPaymentOpen(false)
      setPaymentDebt(null)
      setPaymentAmount('')
      setPaymentNote('')
      await loadRecords()
    } catch (caughtError) {
      if (isUnauthorizedDebtRecordsError(caughtError)) {
        await clearAuthSession()
        router.replace('/login')
        return
      }

      setError(getPaymentErrorMessage(caughtError))
    } finally {
      setIsSubmittingPayment(false)
    }
  }, [loadRecords, paymentAmount, paymentAmountMinor, paymentDebt, paymentNote])

  return {
    canSubmitPayment,
    closePayment,
    currentUserID,
    error,
    isPaymentOpen,
    isPartialPayment:
      Boolean(paymentDebt) &&
      paymentAmountMinor !== null &&
      paymentAmountMinor > 0 &&
      paymentAmountMinor < (paymentDebt?.remaining_amount_minor ?? 0),
    isLoading,
    isSubmittingPayment,
    loadRecords,
    openPayment,
    paymentAmount,
    paymentDebt,
    paymentNote,
    pendingPaymentDebtIDs,
    records,
    setStatusFilter,
    setPaymentAmount,
    setPaymentNote,
    setTypeFilter,
    statusFilter,
    submitPayment,
    transitionDebt,
    typeFilter,
    updatingDebtID,
    useFullPaymentAmount,
  }
}
