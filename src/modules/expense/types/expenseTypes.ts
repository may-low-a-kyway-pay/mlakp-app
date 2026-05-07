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
  total_amount: string
  total_amount_minor: number
  currency: string
  paid_by: string
  split_type: ExpenseSplitType
  created_by: string
  created_at: string
  updated_at: string
}

export type CreateExpenseResponse = {
  success: true
  data: {
    expense: Expense
  }
}
