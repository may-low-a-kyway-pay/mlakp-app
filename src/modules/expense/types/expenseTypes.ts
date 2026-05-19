import { Pagination } from '@/src/shared/types/apiTypes'

export type ExpenseSplitType = 'equal' | 'manual'

export type CreateExpenseParticipant = {
  user_id: string
  share_amount?: string
}

export type CreateExpenseRequest = {
  group_id: string
  title: string
  description?: string
  total_amount: string
  currency: string
  paid_by: string
  split_type: ExpenseSplitType
  participants: CreateExpenseParticipant[]
}

export type Expense = {
  id: string
  group_id: string
  title: string
  description?: string | null
  total_amount: string
  total_amount_minor: number
  currency: string
  paid_by: string
  split_type: ExpenseSplitType
  receipt_url?: string | null
  expense_date?: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export type ExpenseParticipant = {
  id: string
  expense_id: string
  user_id: string
  share_amount: string
  share_amount_minor: number
  created_at: string
}

export type CreateExpenseResponse = {
  success: true
  data: {
    expense: Expense
    participants: ExpenseParticipant[]
  }
}

export type ExpenseDetailsResponse = {
  success: true
  data: {
    expense: Expense
    participants: ExpenseParticipant[]
  }
}

export type ListExpensesResponse = {
  success: true
  data: {
    expenses: Expense[]
  }
  pagination: Pagination
}

export type ExpenseListPagination = ListExpensesResponse['pagination']
