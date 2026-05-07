import { ApiErrorResponse } from '@/src/modules/auth/types/authTypes'
import { DebtRecordFilters, DebtRecordsResponse } from '@/src/modules/debts/types/debtTypes'
import { apiClient } from '@/src/shared/api/client'
import { isAxiosError } from 'axios'

export async function listDebtRecords(filters: DebtRecordFilters) {
  const response = await apiClient.get<DebtRecordsResponse>('/v1/debts', {
    params: {
      status: filters.status,
      type: filters.type,
    },
  })
  return response.data.data.debts
}

export function getDebtRecordsErrorMessage(error: unknown) {
  if (isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.error?.message ?? 'Unable to load records. Please try again.'
  }

  return 'Unable to load records. Please try again.'
}

export function isUnauthorizedDebtRecordsError(error: unknown) {
  return isAxiosError(error) && error.response?.status === 401
}
