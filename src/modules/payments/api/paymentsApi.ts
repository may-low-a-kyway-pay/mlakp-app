import { ApiErrorResponse } from '@/src/modules/auth/types/authTypes'
import {
  BulkMarkPaymentRequest,
  BulkPaymentResponse,
  MarkPaymentRequest,
  PaymentResponse,
  PaymentsResponse,
  PaymentsResult,
  PaymentStatus,
  PaymentTypeFilter,
  ReviewPaymentType,
} from '@/src/modules/payments/types/paymentTypes'
import { apiClient } from '@/src/shared/api/client'
import { isAxiosError } from 'axios'

type ListPaymentsFilters = {
  status?: PaymentStatus
  type?: PaymentTypeFilter
}

type ListPaymentsOptions = {
  page?: number
  perPage?: number
}

export async function listPayments(
  filters: ListPaymentsFilters,
  options: ListPaymentsOptions = {},
): Promise<PaymentsResult> {
  const response = await apiClient.get<PaymentsResponse>('/v1/payments', {
    params: {
      status: filters.status,
      type: filters.type,
      page: options.page,
      per_page: options.perPage,
    },
  })
  return {
    payments: response.data.data.payments,
    pagination: response.data.pagination,
  }
}

export async function markDebtPayment(debtID: string, payload: MarkPaymentRequest) {
  const response = await apiClient.post<PaymentResponse>(`/v1/debts/${debtID}/payments`, payload)
  return response.data.data.payment
}

export async function bulkMarkPayment(payload: BulkMarkPaymentRequest) {
  const response = await apiClient.post<BulkPaymentResponse>('/v1/payments/bulk', payload)
  return response.data.data.payments
}

export async function reviewPayment(paymentID: string, type: ReviewPaymentType) {
  const response = await apiClient.post<PaymentResponse>(`/v1/payments/${paymentID}`, { type })
  return response.data.data.payment
}

export function getPaymentErrorMessage(error: unknown) {
  if (isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.error?.message ?? 'Unable to update payment. Please try again.'
  }

  return 'Unable to update payment. Please try again.'
}

export function isUnauthorizedPaymentError(error: unknown) {
  return isAxiosError(error) && error.response?.status === 401
}
