export type PaymentStatus = 'pending_confirmation' | 'confirmed' | 'rejected'

export type Payment = {
  id: string
  debt_id: string
  paid_by: string
  received_by: string
  amount: string
  amount_minor: number
  status: PaymentStatus
  note: string | null
  confirmed_at: string | null
  rejected_at: string | null
  created_at: string
  updated_at: string
}

export type PaymentTypeFilter = 'received' | 'sent' | 'all'

export type PaymentListItem = Payment & {
  expense_id: string
  expense_title: string
  paid_by_name: string
  received_by_name: string
  debt_remaining_amount: string
  debt_remaining_amount_minor: number
  debt_status: 'accepted' | 'partially_settled' | 'settled'
}

export type MarkPaymentRequest = {
  amount: string
  note?: string | null
}

export type BulkMarkPaymentRequest = MarkPaymentRequest & {
  received_by: string
}

export type ReviewPaymentType = 'confirm' | 'reject'

export type PaymentResponse = {
  success: true
  data: {
    payment: Payment
  }
}

export type PaymentsResponse = {
  success: true
  data: {
    payments: PaymentListItem[]
  }
}

export type BulkPaymentResponse = {
  success: true
  data: {
    payments: Payment[]
  }
}
