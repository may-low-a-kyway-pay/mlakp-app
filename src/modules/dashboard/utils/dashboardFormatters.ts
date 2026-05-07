import { DashboardUnsettledBalance } from '@/src/modules/dashboard/types/dashboardTypes'

export function moneyLabel(amount: string, sign?: '+' | '-') {
  return `${sign ?? ''}$${amount}`
}

export function shortID(id: string) {
  return id.slice(0, 6).toUpperCase()
}

export function statusLabel(status: DashboardUnsettledBalance['status']) {
  if (status === 'partially_settled') {
    return 'Partially settled'
  }

  return status.charAt(0).toUpperCase() + status.slice(1)
}
