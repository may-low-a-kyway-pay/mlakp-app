import { Ionicons } from '@expo/vector-icons'
import { ActivityIndicator, Pressable, Text, View } from 'react-native'
import {
  ActivityFilter,
  ActivityHistoryStatusFilter,
  usePaymentActivity,
} from '@/src/modules/activity/hooks/usePaymentActivity'
import { AppHeader } from '@/src/shared/components/AppHeader'
import { Card } from '@/src/shared/components/Card'
import { Screen } from '@/src/shared/components/Screen'
import { styles } from '@/src/modules/activity/screens/ActivityScreen.styles'
import { colors } from '@/src/shared/theme/colors'
import { formatMoneyLabel } from '@/src/shared/utils/currency'

const filterOptions: { label: string; value: ActivityFilter }[] = [
  { label: 'To review', value: 'review' },
  { label: 'Submitted', value: 'sent' },
  { label: 'History', value: 'history' },
]

const historyStatusOptions: { label: string; value: ActivityHistoryStatusFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Rejected', value: 'rejected' },
]

function paymentStatusLabel(status: string) {
  if (status === 'pending_confirmation') {
    return 'Pending confirmation'
  }
  return status.charAt(0).toUpperCase() + status.slice(1)
}

function paymentTitle(paidByName: string, currentUserID: string | null, paidByID: string) {
  return paidByID === currentUserID ? 'You submitted a payment' : `${paidByName} submitted a payment`
}

export function ActivityScreen() {
  const {
    currentUserID,
    error,
    filter,
    historyStatusFilter,
    isLoading,
    loadPayments,
    payments,
    review,
    reviewingPaymentID,
    setFilter,
    setHistoryStatusFilter,
  } = usePaymentActivity()

  return (
    <Screen contentStyle={styles.content}>
      <AppHeader />
      <View style={styles.inner}>
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.title}>Activity</Text>
            <Text style={styles.subtitle}>{payments.length} payment records</Text>
          </View>
          <Pressable disabled={isLoading} onPress={loadPayments} style={styles.refreshButton}>
            <Ionicons color={colors.primary} name="refresh" size={22} />
          </Pressable>
        </View>

        <View style={styles.filterRow}>
          {filterOptions.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => setFilter(option.value)}
              style={[styles.filterChip, filter === option.value && styles.filterChipActive]}
            >
              <Text style={[styles.filterText, filter === option.value && styles.filterTextActive]}>
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {filter === 'history' ? (
          <View style={styles.filterRow}>
            {historyStatusOptions.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => setHistoryStatusFilter(option.value)}
                style={[styles.filterChipSmall, historyStatusFilter === option.value && styles.filterChipActive]}
              >
                <Text style={[styles.filterText, historyStatusFilter === option.value && styles.filterTextActive]}>
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        {error ? (
          <View style={styles.errorBlock}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {isLoading ? (
          <View style={styles.stateBlock}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.stateText}>Loading activity...</Text>
          </View>
        ) : null}

        <View style={styles.list}>
          {!isLoading && !error && payments.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Ionicons color={colors.textSoft} name="receipt-outline" size={30} />
              <Text style={styles.emptyTitle}>No payment activity</Text>
              <Text style={styles.emptyText}>
                {filter === 'review'
                  ? 'Payments submitted to you for confirmation will appear here.'
                  : 'Submitted and reviewed payments will appear here.'}
              </Text>
            </Card>
          ) : null}

          {payments.map((payment) => {
            const isReceived = payment.received_by === currentUserID
            const isPendingReview = isReceived && payment.status === 'pending_confirmation'
            const isReviewing = reviewingPaymentID === payment.id

            return (
              <Card key={payment.id} style={styles.item}>
                <View style={styles.itemHeader}>
                  <View style={styles.iconCircle}>
                    <Ionicons
                      color={isPendingReview ? colors.tertiary : colors.primary}
                      name={isPendingReview ? 'time-outline' : 'card-outline'}
                      size={24}
                    />
                  </View>
                  <View style={styles.itemText}>
                    <Text style={styles.itemTitle}>
                      {paymentTitle(payment.paid_by_name, currentUserID, payment.paid_by)}
                    </Text>
                    <Text style={styles.status}>
                      {payment.expense_title} · {paymentStatusLabel(payment.status)}
                    </Text>
                  </View>
                  <Text
                    style={[styles.amount, { color: payment.status === 'rejected' ? colors.danger : colors.success }]}
                  >
                    {formatMoneyLabel(payment.amount)}
                  </Text>
                </View>

                <View style={styles.metaRow}>
                  <Text style={styles.metaText}>From {payment.paid_by_name}</Text>
                  <Text style={styles.metaText}>Remaining {formatMoneyLabel(payment.debt_remaining_amount)}</Text>
                </View>

                {payment.note ? <Text style={styles.noteText}>{payment.note}</Text> : null}

                {isPendingReview ? (
                  <View style={styles.reviewActions}>
                    <Pressable
                      disabled={isReviewing}
                      onPress={() => review(payment.id, 'reject')}
                      style={({ pressed }) => [
                        styles.reviewButton,
                        styles.rejectButton,
                        (pressed || isReviewing) && styles.actionPressed,
                      ]}
                    >
                      <Ionicons color={colors.danger} name="close" size={16} />
                      <Text style={[styles.reviewButtonText, styles.rejectButtonText]}>Reject</Text>
                    </Pressable>
                    <Pressable
                      disabled={isReviewing}
                      onPress={() => review(payment.id, 'confirm')}
                      style={({ pressed }) => [
                        styles.reviewButton,
                        styles.confirmButton,
                        (pressed || isReviewing) && styles.actionPressed,
                      ]}
                    >
                      {isReviewing ? (
                        <ActivityIndicator color={colors.white} />
                      ) : (
                        <>
                          <Ionicons color={colors.white} name="checkmark" size={16} />
                          <Text style={[styles.reviewButtonText, styles.confirmButtonText]}>Confirm</Text>
                        </>
                      )}
                    </Pressable>
                  </View>
                ) : null}
              </Card>
            )
          })}
        </View>
      </View>
    </Screen>
  )
}
