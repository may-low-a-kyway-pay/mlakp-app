import { useFocusEffect } from '@react-navigation/native'
import { router } from 'expo-router'
import { useCallback, useMemo, useState } from 'react'
import { clearAuthSession, getAuthSession } from '@/src/modules/auth/services/authSession'
import {
  getDashboardErrorMessage,
  getDashboardSnapshot,
  isUnauthorizedDashboardError,
  updateDebtStatus,
} from '@/src/modules/dashboard/api/dashboardApi'
import { moneyLabel } from '@/src/modules/dashboard/utils/dashboardFormatters'
import {
  DashboardPersonBalance,
  DashboardTotals,
  DebtTransitionType,
} from '@/src/modules/dashboard/types/dashboardTypes'
import {
  bulkMarkPayment,
  getPaymentErrorMessage,
  isUnauthorizedPaymentError,
} from '@/src/modules/payments/api/paymentsApi'
import { colors } from '@/src/shared/theme/colors'

const emptyDashboard: DashboardTotals = {
  person_balances: [],
  unsettled_balances: [],
  you_get: { amount: '0.00', amount_minor: 0, debt_count: 0 },
  you_owe: { amount: '0.00', amount_minor: 0, debt_count: 0 },
}

function parseAmountMinor(value: string) {
  const trimmed = value.trim()
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) {
    return null
  }

  const [whole, decimal = ''] = trimmed.split('.')
  return Number(whole) * 100 + Number(decimal.padEnd(2, '0'))
}

export function useDashboard() {
  const [dashboard, setDashboard] = useState<DashboardTotals>(emptyDashboard)
  const [error, setError] = useState<string | null>(null)
  const [updatingDebtID, setUpdatingDebtID] = useState<string | null>(null)
  const [bulkPaymentPerson, setBulkPaymentPerson] = useState<DashboardPersonBalance | null>(null)
  const [bulkPaymentAmount, setBulkPaymentAmount] = useState('')
  const [bulkPaymentNote, setBulkPaymentNote] = useState('')
  const [isBulkPaymentOpen, setIsBulkPaymentOpen] = useState(false)
  const [isSubmittingBulkPayment, setIsSubmittingBulkPayment] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const loadDashboard = useCallback(async () => {
    setError(null)
    setIsLoading(true)

    const session = await getAuthSession()
    if (!session) {
      router.replace('/login')
      return
    }

    try {
      setDashboard(await getDashboardSnapshot())
    } catch (caughtError) {
      // A 401 means the stored session is no longer usable, so clear it before returning to auth.
      if (isUnauthorizedDashboardError(caughtError)) {
        await clearAuthSession()
        router.replace('/login')
        return
      }

      setError(getDashboardErrorMessage(caughtError))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      void loadDashboard()
    }, [loadDashboard]),
  )

  const transitionDebt = useCallback(
    async (debtID: string, type: DebtTransitionType) => {
      setError(null)
      setUpdatingDebtID(debtID)

      try {
        await updateDebtStatus(debtID, type)
        await loadDashboard()
      } catch (caughtError) {
        if (isUnauthorizedDashboardError(caughtError)) {
          await clearAuthSession()
          router.replace('/login')
          return
        }

        setError(getDashboardErrorMessage(caughtError))
      } finally {
        setUpdatingDebtID(null)
      }
    },
    [loadDashboard],
  )

  const bulkPaymentAmountMinor = useMemo(() => parseAmountMinor(bulkPaymentAmount), [bulkPaymentAmount])

  const canSubmitBulkPayment = useMemo(() => {
    return Boolean(
      bulkPaymentPerson &&
      bulkPaymentAmountMinor !== null &&
      bulkPaymentAmountMinor > 0 &&
      bulkPaymentAmountMinor <= bulkPaymentPerson.remaining_amount_minor &&
      !isSubmittingBulkPayment,
    )
  }, [bulkPaymentAmountMinor, bulkPaymentPerson, isSubmittingBulkPayment])

  const openBulkPayment = useCallback((person: DashboardPersonBalance) => {
    setError(null)
    setBulkPaymentPerson(person)
    setBulkPaymentAmount(person.remaining_amount)
    setBulkPaymentNote('')
    setIsBulkPaymentOpen(true)
  }, [])

  const closeBulkPayment = useCallback(() => {
    if (isSubmittingBulkPayment) {
      return
    }

    setIsBulkPaymentOpen(false)
    setBulkPaymentPerson(null)
    setBulkPaymentAmount('')
    setBulkPaymentNote('')
  }, [isSubmittingBulkPayment])

  const submitBulkPayment = useCallback(async () => {
    if (!bulkPaymentPerson || bulkPaymentAmountMinor === null || bulkPaymentAmountMinor <= 0) {
      setError('Enter a valid payment amount.')
      return
    }

    if (bulkPaymentAmountMinor > bulkPaymentPerson.remaining_amount_minor) {
      setError('Payment amount cannot exceed the amount owed to this person.')
      return
    }

    setError(null)
    setIsSubmittingBulkPayment(true)

    try {
      await bulkMarkPayment({
        received_by: bulkPaymentPerson.other_user.id,
        amount: Number(bulkPaymentAmount).toFixed(2),
        note: bulkPaymentNote.trim() ? bulkPaymentNote.trim() : null,
      })
      setIsBulkPaymentOpen(false)
      setBulkPaymentPerson(null)
      setBulkPaymentAmount('')
      setBulkPaymentNote('')
      await loadDashboard()
    } catch (caughtError) {
      if (isUnauthorizedPaymentError(caughtError)) {
        await clearAuthSession()
        router.replace('/login')
        return
      }

      setError(getPaymentErrorMessage(caughtError))
    } finally {
      setIsSubmittingBulkPayment(false)
    }
  }, [bulkPaymentAmount, bulkPaymentAmountMinor, bulkPaymentNote, bulkPaymentPerson, loadDashboard])

  const balances = useMemo(
    () => [
      {
        amount: moneyLabel(dashboard.you_owe.amount),
        icon: 'arrow-up-outline' as const,
        label: 'You Owe',
        tone: colors.danger,
        soft: colors.dangerSoft,
      },
      {
        amount: moneyLabel(dashboard.you_get.amount),
        icon: 'arrow-down-outline' as const,
        label: 'You Get',
        tone: colors.success,
        soft: colors.successSoft,
      },
    ],
    [dashboard],
  )

  return {
    balances,
    bulkPaymentAmount,
    bulkPaymentNote,
    bulkPaymentPerson,
    canSubmitBulkPayment,
    closeBulkPayment,
    error,
    isBulkPaymentOpen,
    isLoading,
    isSubmittingBulkPayment,
    loadDashboard,
    openBulkPayment,
    personBalances: dashboard.person_balances ?? [],
    setBulkPaymentAmount,
    setBulkPaymentNote,
    submitBulkPayment,
    transitionDebt,
    unsettled: dashboard.unsettled_balances ?? [],
    updatingDebtID,
  }
}
