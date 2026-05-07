import { isAxiosError } from 'axios'
import { ApiErrorResponse } from '@/src/modules/auth/types/authTypes'
import { CreateExpenseRequest, CreateExpenseResponse } from '@/src/modules/expense/types/expenseTypes'
import { apiClient } from '@/src/shared/api/client'

export async function createExpense(payload: CreateExpenseRequest) {
  const response = await apiClient.post<CreateExpenseResponse>('/v1/expenses', payload)
  return response.data.data.expense
}

export function getExpenseErrorMessage(error: unknown) {
  if (isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.error?.message ?? 'Unable to create expense. Please try again.'
  }

  return 'Unable to create expense. Please try again.'
}
