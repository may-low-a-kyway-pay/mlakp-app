import { Pagination } from '@/src/shared/types/apiTypes'

export type DebtStatus = 'pending' | 'accepted' | 'rejected' | 'partially_settled' | 'settled'

export type DebtRecordType = 'owed' | 'receivable'

export type DebtRecord = {
  id: string
  expense_id: string
  expense_title?: string
  debtor_id: string
  debtor_name?: string
  debtor_username?: string
  creditor_id: string
  creditor_name?: string
  creditor_username?: string
  original_amount: string
  original_amount_minor: number
  remaining_amount: string
  remaining_amount_minor: number
  status: DebtStatus
  accepted_at: string | null
  rejected_at: string | null
  settled_at: string | null
  created_at: string
  updated_at: string
}

export type DebtRecordsResponse = {
  success: true
  data: {
    debts: DebtRecord[]
  }
  pagination: Pagination
}

export type DebtRecordFilters = {
  status?: DebtStatus
  type?: DebtRecordType
}

export type DebtRecordsResult = {
  debts: DebtRecord[]
  pagination: Pagination
}
