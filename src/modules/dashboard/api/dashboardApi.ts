import { ApiErrorResponse } from '@/src/modules/auth/types/authTypes'
import {
  DashboardDebtResponse,
  DashboardResponse,
  DashboardTotals,
  DebtTransitionType,
} from '@/src/modules/dashboard/types/dashboardTypes'
import { apiClient } from '@/src/shared/api/client'
import { isAxiosError } from 'axios'

const emptyAmount = { amount: '0.00', amount_minor: 0, debt_count: 0 }

function normalizeDashboard(dashboard: Partial<DashboardTotals> | undefined): DashboardTotals {
  // Mobile clients can briefly run against different backend versions, so normalize optional fields before rendering.
  return {
    unsettled_balances: dashboard?.unsettled_balances ?? [],
    you_get: dashboard?.you_get ?? emptyAmount,
    you_owe: dashboard?.you_owe ?? emptyAmount,
  }
}

export async function getDashboardSnapshot() {
  const response = await apiClient.get<DashboardResponse>('/v1/dashboard')
  return normalizeDashboard(response.data.data.dashboard)
}

export async function updateDebtStatus(debtID: string, type: DebtTransitionType) {
  const response = await apiClient.post<DashboardDebtResponse>(`/v1/debts/${debtID}`, { type })
  return response.data.data.debt
}

export function getDashboardErrorMessage(error: unknown) {
  if (isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.error?.message ?? 'Unable to load your dashboard. Please try again.'
  }

  return 'Unable to load your dashboard. Please try again.'
}

export function isUnauthorizedDashboardError(error: unknown) {
  return isAxiosError(error) && error.response?.status === 401
}
