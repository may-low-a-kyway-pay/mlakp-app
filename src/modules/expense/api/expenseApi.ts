import { isAxiosError } from 'axios'
import { ApiErrorResponse } from '@/src/modules/auth/types/authTypes'
import {
  CreateExpenseRequest,
  CreateExpenseResponse,
  ExpenseDetailsResponse,
  ListExpensesResponse,
} from '@/src/modules/expense/types/expenseTypes'
import { apiClient } from '@/src/shared/api/client'

export async function createExpense(payload: CreateExpenseRequest) {
  const response = await apiClient.post<CreateExpenseResponse>('/v1/expenses', payload)
  return response.data.data.expense
}

type ListGroupExpensesParams = {
  page?: number
  perPage?: number
}

export async function listGroupExpenses(groupID: string, params: ListGroupExpensesParams = {}) {
  const response = await apiClient.get<ListExpensesResponse>(`/v1/groups/${groupID}/expenses`, {
    params: {
      page: params.page,
      per_page: params.perPage,
    },
  })
  return {
    expenses: response.data.data.expenses,
    pagination: response.data.pagination,
  }
}

export async function getExpense(expenseID: string) {
  const response = await apiClient.get<ExpenseDetailsResponse>(`/v1/expenses/${expenseID}`)
  return response.data.data
}

export function getExpenseErrorMessage(error: unknown) {
  if (isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.error?.message ?? 'Unable to create expense. Please try again.'
  }

  return 'Unable to create expense. Please try again.'
}

export function getExpenseLoadErrorMessage(error: unknown) {
  if (isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.error?.message ?? 'Unable to load expenses. Please try again.'
  }

  return 'Unable to load expenses. Please try again.'
}

export function isUnauthorizedExpenseError(error: unknown) {
  return isAxiosError(error) && error.response?.status === 401
}
