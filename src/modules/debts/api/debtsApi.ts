import { ApiErrorResponse } from '@/src/modules/auth/types/authTypes'
import { DebtRecordFilters, DebtRecordsResponse, DebtRecordsResult } from '@/src/modules/debts/types/debtTypes'
import { apiClient } from '@/src/shared/api/client'
import { isAxiosError } from 'axios'

type ListDebtRecordsOptions = {
  page?: number
  perPage?: number
}

export async function listDebtRecords(
  filters: DebtRecordFilters,
  options: ListDebtRecordsOptions = {},
): Promise<DebtRecordsResult> {
  const response = await apiClient.get<DebtRecordsResponse>('/v1/debts', {
    params: {
      status: filters.status,
      type: filters.type,
      page: options.page,
      per_page: options.perPage,
    },
  })
  return {
    debts: response.data.data.debts,
    pagination: response.data.pagination,
  }
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
