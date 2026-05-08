import { formatMoneyLabel } from '@/src/shared/utils/currency'

// Temporary local data until the activity feed endpoint is implemented.
export const activityItems = [
  {
    amount: formatMoneyLabel('80.00'),
    icon: 'checkmark-circle-outline' as const,
    status: 'Payment confirmed',
    title: 'Marcus paid Dinner & Drinks',
  },
  {
    amount: formatMoneyLabel('350.00'),
    icon: 'receipt-outline' as const,
    status: 'Debt accepted',
    title: 'Sarah accepted Concert Tickets',
  },
  {
    amount: formatMoneyLabel('42.75'),
    icon: 'time-outline' as const,
    status: 'Pending review',
    title: 'John owes Grocery Run',
  },
]
