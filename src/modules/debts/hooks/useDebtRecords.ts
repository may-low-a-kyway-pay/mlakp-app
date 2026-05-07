import { router } from 'expo-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { clearAuthSession, getAuthSession } from '@/src/modules/auth/services/authSession'
import {
  getDebtRecordsErrorMessage,
  isUnauthorizedDebtRecordsError,
  listDebtRecords,
} from '@/src/modules/debts/api/debtsApi'
import { DebtRecord, DebtRecordFilters, DebtRecordType, DebtStatus } from '@/src/modules/debts/types/debtTypes'
import { updateDebtStatus } from '@/src/modules/dashboard/api/dashboardApi'

type StatusFilter = 'all' | DebtStatus
type TypeFilter = 'all' | DebtRecordType

export function useDebtRecords() {
  const [records, setRecords] = useState<DebtRecord[]>([])
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [currentUserID, setCurrentUserID] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [updatingDebtID, setUpdatingDebtID] = useState<string | null>(null)

  const filters = useMemo<DebtRecordFilters>(
    () => ({
      status: statusFilter === 'all' ? undefined : statusFilter,
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
      setRecords(await listDebtRecords(filters))
    } catch (caughtError) {
      if (isUnauthorizedDebtRecordsError(caughtError)) {
        await clearAuthSession()
        router.replace('/login')
        return
      }

      setError(getDebtRecordsErrorMessage(caughtError))
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  useEffect(() => {
    void loadRecords()
  }, [loadRecords])

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

  return {
    currentUserID,
    error,
    isLoading,
    loadRecords,
    records,
    setStatusFilter,
    setTypeFilter,
    statusFilter,
    transitionDebt,
    typeFilter,
    updatingDebtID,
  }
}
