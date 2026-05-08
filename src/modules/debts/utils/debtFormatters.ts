import { DebtRecord } from '@/src/modules/debts/types/debtTypes'
import { formatMoneyLabel } from '@/src/shared/utils/currency'

export function statusLabel(status: DebtRecord['status']) {
  return status
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function moneyLabel(amount: string, sign = '') {
  return formatMoneyLabel(amount, sign)
}

export function recordType(record: DebtRecord, currentUserID: string | null) {
  return record.debtor_id === currentUserID ? 'owed' : 'receivable'
}

export function counterpartyName(record: DebtRecord, currentUserID: string | null) {
  return record.debtor_id === currentUserID ? (record.creditor_name ?? 'Creditor') : (record.debtor_name ?? 'Debtor')
}
