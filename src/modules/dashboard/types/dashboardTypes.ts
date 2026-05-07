export type DashboardAmount = {
  amount: string
  amount_minor: number
  debt_count: number
}

export type DashboardTotals = {
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
