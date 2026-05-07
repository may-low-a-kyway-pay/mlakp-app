import { useFocusEffect } from '@react-navigation/native'
import { router } from 'expo-router'
import { useCallback, useMemo, useState } from 'react'
import { clearAuthSession, getAuthSession } from '@/src/modules/auth/services/authSession'
import {
  getDashboardErrorMessage,
  getDashboardSnapshot,
  isUnauthorizedDashboardError,
} from '@/src/modules/dashboard/api/dashboardApi'
import { moneyLabel } from '@/src/modules/dashboard/utils/dashboardFormatters'
import { DashboardTotals } from '@/src/modules/dashboard/types/dashboardTypes'
import { colors } from '@/src/shared/theme/colors'

const emptyDashboard: DashboardTotals = {
  unsettled_balances: [],
  you_get: { amount: '0.00', amount_minor: 0, debt_count: 0 },
  you_owe: { amount: '0.00', amount_minor: 0, debt_count: 0 },
}

export function useDashboard() {
  const [dashboard, setDashboard] = useState<DashboardTotals>(emptyDashboard)
  const [error, setError] = useState<string | null>(null)
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

  const balances = useMemo(
    () => [
      {
        amount: moneyLabel(dashboard.you_owe.amount),
        icon: 'arrow-up-outline' as const,
        label: 'You Owe',
        tone: colors.danger,
        soft: '#fff2f1',
      },
      {
        amount: moneyLabel(dashboard.you_get.amount),
        icon: 'arrow-down-outline' as const,
        label: 'You Get',
        tone: colors.success,
        soft: '#f0fff2',
      },
    ],
    [dashboard],
  )

  return {
    balances,
    error,
    isLoading,
    loadDashboard,
    unsettled: dashboard.unsettled_balances ?? [],
  }
}
