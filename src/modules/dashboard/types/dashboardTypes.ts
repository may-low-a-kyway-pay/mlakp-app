export type DashboardAmount = {
  amount: string
  amount_minor: number
  debt_count: number
}

export type DashboardTotals = {
  person_balances: DashboardPersonBalance[]
  unsettled_balances: DashboardUnsettledBalance[]
  you_get: DashboardAmount
  you_owe: DashboardAmount
}

export type DashboardResponse = {
  success: true
  data: {
    dashboard: DashboardTotals
  }
}

export type DebtTransitionType = 'accept' | 'reject'

export type DashboardDebtResponse = {
  success: true
  data: {
    debt: {
      id: string
      status: string
      updated_at: string
    }
  }
}

export type DashboardBalanceStatus = 'pending' | 'accepted' | 'partially_settled'

export type DashboardBalanceType = 'owed' | 'receivable'

export type DashboardUser = {
  id: string
  name: string
}

export type DashboardUnsettledBalance = {
  id: string
  expense_id: string
  expense_title: string
  type: DashboardBalanceType
  other_user: DashboardUser
  remaining_amount: string
  remaining_amount_minor: number
  status: DashboardBalanceStatus
  updated_at: string
}

export type DashboardPersonBalance = {
  type: DashboardBalanceType
  other_user: DashboardUser
  remaining_amount: string
  remaining_amount_minor: number
  debt_count: number
  has_pending_payment: boolean
}
