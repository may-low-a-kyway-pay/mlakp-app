import { Ionicons } from '@expo/vector-icons'
import { useCallback, useMemo } from 'react'
import { ActivityIndicator, Alert, FlatList, Platform, Pressable, Text, View } from 'react-native'
import {
  ActivityFilter,
  ActivityHistoryStatusFilter,
  usePaymentActivity,
} from '@/src/modules/activity/hooks/usePaymentActivity'
import { AppHeader } from '@/src/shared/components/AppHeader'
import { Card } from '@/src/shared/components/Card'
import { Screen } from '@/src/shared/components/Screen'
import { createStyles } from '@/src/modules/activity/screens/ActivityScreen.styles'
import { iconSize } from '@/src/shared/theme/metrics'
import { useAppTheme } from '@/src/shared/theme/ThemeContext'
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
  const theme = useAppTheme()
  const { colors } = theme
  const styles = useMemo(() => createStyles(theme), [theme])
  const {
    currentUserID,
    error,
    filter,
    historyStatusFilter,
    isReviewingAll,
    isLoading,
    isLoadingMore,
    loadNextPayments,
    loadPayments,
    payments,
    paymentsPagination,
    review,
    reviewAll,
    reviewingPaymentID,
    setFilter,
    setHistoryStatusFilter,
  } = usePaymentActivity()

  const reviewablePaymentCount = useMemo(
    () =>
      payments.filter((payment) => payment.received_by === currentUserID && payment.status === 'pending_confirmation')
        .length,
    [currentUserID, payments],
  )
  const confirmAllDisabled = reviewablePaymentCount === 0 || isLoading || isReviewingAll || Boolean(reviewingPaymentID)

  const confirmAll = useCallback(() => {
    if (confirmAllDisabled) {
      return
    }
    const message = `Confirm ${reviewablePaymentCount} pending ${reviewablePaymentCount === 1 ? 'payment' : 'payments'}?`

    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm(message)) {
        void reviewAll()
      }
      return
    }

    Alert.alert('Confirm all payments', message, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Confirm all', isPreferred: true, onPress: () => void reviewAll(), style: 'default' },
    ])
  }, [confirmAllDisabled, reviewAll, reviewablePaymentCount])

  return (
    <Screen contentStyle={styles.content} scroll={false}>
      <AppHeader />
      <View style={styles.inner}>
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.title}>Activity</Text>
            <Text style={styles.subtitle}>{payments.length} payment records</Text>
          </View>
          <Pressable
            accessibilityLabel="Refresh activity"
            accessibilityRole="button"
            disabled={isLoading}
            onPress={() => loadPayments(1)}
            style={styles.refreshButton}
          >
            <Ionicons color={colors.primary} name="refresh" size={22} />
          </Pressable>
        </View>

        <View style={styles.filterRow}>
          {filterOptions.map((option) => (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: filter === option.value }}
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
                accessibilityRole="button"
                accessibilityState={{ selected: historyStatusFilter === option.value }}
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

        {filter === 'review' ? (
          <View style={styles.bulkReviewRow}>
            <View style={styles.bulkReviewTextBlock}>
              <Text style={styles.bulkReviewTitle}>Pending review</Text>
              <Text style={styles.bulkReviewText}>
                {reviewablePaymentCount} {reviewablePaymentCount === 1 ? 'payment' : 'payments'}
              </Text>
            </View>
            <Pressable
              accessibilityLabel="Confirm all pending payments"
              accessibilityRole="button"
              accessibilityState={{ disabled: confirmAllDisabled }}
              disabled={confirmAllDisabled}
              onPress={confirmAll}
              style={({ pressed }) => [
                styles.confirmAllButton,
                (pressed || confirmAllDisabled) && styles.actionPressed,
              ]}
            >
              {isReviewingAll ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <>
                  <Ionicons color={colors.white} name="checkmark-done" size={iconSize.small} />
                  <Text style={styles.confirmAllButtonText}>Confirm all</Text>
                </>
              )}
            </Pressable>
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

        <FlatList
          contentContainerStyle={styles.list}
          data={payments}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            !isLoading && !error ? (
              <Card style={styles.emptyCard}>
                <Ionicons color={colors.textSoft} name="receipt-outline" size={30} />
                <Text style={styles.emptyTitle}>No payment activity</Text>
                <Text style={styles.emptyText}>
                  {filter === 'review'
                    ? 'Payments submitted to you for confirmation will appear here.'
                    : 'Submitted and reviewed payments will appear here.'}
                </Text>
              </Card>
            ) : null
          }
          ListFooterComponent={
            paymentsPagination && paymentsPagination.page < paymentsPagination.total_pages ? (
              <Pressable
                accessibilityLabel="Load more payment activity"
                accessibilityRole="button"
                accessibilityState={{ disabled: isLoadingMore }}
                disabled={isLoadingMore}
                onPress={loadNextPayments}
                style={styles.loadMoreButton}
              >
                {isLoadingMore ? (
                  <ActivityIndicator color={colors.primary} />
                ) : (
                  <Text style={styles.loadMoreText}>Load more</Text>
                )}
              </Pressable>
            ) : null
          }
          renderItem={({ item: payment }) => {
            const isReceived = payment.received_by === currentUserID
            const isPendingReview = isReceived && payment.status === 'pending_confirmation'
            const isReviewingThisPayment = reviewingPaymentID === payment.id
            const isReviewActionDisabled = isReviewingThisPayment || isReviewingAll

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
                      accessibilityLabel={`Reject payment from ${payment.paid_by_name}`}
                      accessibilityRole="button"
                      accessibilityState={{ disabled: isReviewActionDisabled }}
                      disabled={isReviewActionDisabled}
                      onPress={() => review(payment.id, 'reject')}
                      style={({ pressed }) => [
                        styles.reviewButton,
                        styles.rejectButton,
                        (pressed || isReviewActionDisabled) && styles.actionPressed,
                      ]}
                    >
                      <Ionicons color={colors.danger} name="close" size={iconSize.small} />
                      <Text style={[styles.reviewButtonText, styles.rejectButtonText]}>Reject</Text>
                    </Pressable>
                    <Pressable
                      accessibilityLabel={`Confirm payment from ${payment.paid_by_name}`}
                      accessibilityRole="button"
                      accessibilityState={{ disabled: isReviewActionDisabled }}
                      disabled={isReviewActionDisabled}
                      onPress={() => review(payment.id, 'confirm')}
                      style={({ pressed }) => [
                        styles.reviewButton,
                        styles.confirmButton,
                        (pressed || isReviewActionDisabled) && styles.actionPressed,
                      ]}
                    >
                      {isReviewingThisPayment ? (
                        <ActivityIndicator color={colors.white} />
                      ) : (
                        <>
                          <Ionicons color={colors.white} name="checkmark" size={iconSize.small} />
                          <Text style={[styles.reviewButtonText, styles.confirmButtonText]}>Confirm</Text>
                        </>
                      )}
                    </Pressable>
                  </View>
                ) : null}
              </Card>
            )
          }}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </Screen>
  )
}
