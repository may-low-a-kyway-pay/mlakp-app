import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { ActivityIndicator, FlatList, Modal, Pressable, Text, TextInput, View } from 'react-native'
import { useDebtRecords } from '@/src/modules/debts/hooks/useDebtRecords'
import { createStyles } from '@/src/modules/debts/screens/DebtRecordsScreen.styles'
import { DebtRecordType, DebtStatus } from '@/src/modules/debts/types/debtTypes'
import { counterpartyName, moneyLabel, recordType, statusLabel } from '@/src/modules/debts/utils/debtFormatters'
import { Avatar } from '@/src/shared/components/Avatar'
import { Card } from '@/src/shared/components/Card'
import { KeyboardAvoidingContainer } from '@/src/shared/components/KeyboardAvoidingContainer'
import { Screen } from '@/src/shared/components/Screen'
import { useAppTheme } from '@/src/shared/theme/ThemeContext'
import { appCurrency } from '@/src/shared/utils/currency'

const statusOptions: { label: string; value: 'active' | 'all' | DebtStatus }[] = [
  { label: 'Active', value: 'active' },
  { label: 'Pending', value: 'pending' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'Partial', value: 'partially_settled' },
  { label: 'Settled', value: 'settled' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'All', value: 'all' },
]

const typeOptions: { label: string; value: 'all' | DebtRecordType }[] = [
  { label: 'All', value: 'all' },
  { label: 'You Owe', value: 'owed' },
  { label: 'You Get', value: 'receivable' },
]

export function DebtRecordsScreen() {
  const theme = useAppTheme()
  const { colors } = theme
  const styles = createStyles(theme)
  const {
    canSubmitPayment,
    closePayment,
    currentUserID,
    error,
    isPaymentOpen,
    isPartialPayment,
    isLoading,
    isSubmittingPayment,
    loadRecords,
    openPayment,
    paymentAmount,
    paymentDebt,
    paymentNote,
    pendingPaymentDebtIDs,
    records,
    setPaymentAmount,
    setPaymentNote,
    setStatusFilter,
    setTypeFilter,
    statusFilter,
    submitPayment,
    transitionDebt,
    typeFilter,
    updatingDebtID,
    useFullPaymentAmount,
  } = useDebtRecords()

  return (
    <Screen contentStyle={styles.root} scroll={false}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Go back"
          accessibilityRole="button"
          onPress={() => router.back()}
          style={styles.iconButton}
        >
          <Ionicons color={colors.text} name="chevron-back" size={24} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.title}>All Balances</Text>
          <Text style={styles.subtitle}>{records.length} records</Text>
        </View>
        <Pressable
          accessibilityLabel="Refresh balances"
          accessibilityRole="button"
          disabled={isLoading}
          onPress={loadRecords}
          style={styles.iconButton}
        >
          <Ionicons color={colors.primary} name="refresh" size={22} />
        </Pressable>
      </View>

      <View style={styles.filters}>
        <View style={styles.filterRow}>
          {typeOptions.map((option) => (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: typeFilter === option.value }}
              key={option.value}
              onPress={() => setTypeFilter(option.value)}
              style={[styles.filterChip, typeFilter === option.value && styles.filterChipActive]}
            >
              <Text style={[styles.filterText, typeFilter === option.value && styles.filterTextActive]}>
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.filterRow}>
          {statusOptions.map((option) => (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: statusFilter === option.value }}
              key={option.value}
              onPress={() => setStatusFilter(option.value)}
              style={[styles.filterChip, statusFilter === option.value && styles.filterChipActive]}
            >
              <Text style={[styles.filterText, statusFilter === option.value && styles.filterTextActive]}>
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {error ? (
        <View style={styles.errorBlock}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {isLoading ? (
        <View style={styles.stateBlock}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.stateText}>Loading records...</Text>
        </View>
      ) : null}

      <FlatList
        contentContainerStyle={styles.list}
        data={records}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          !isLoading && !error ? (
            <Card style={styles.emptyCard}>
              <Ionicons color={colors.textSoft} name="receipt-outline" size={30} />
              <Text style={styles.emptyTitle}>No records found</Text>
              <Text style={styles.emptyText}>
                {statusFilter === 'active'
                  ? 'Settled and rejected records stay available in their filters.'
                  : 'Try another status or type filter.'}
              </Text>
            </Card>
          ) : null
        }
        renderItem={({ item }) => {
          const type = recordType(item, currentUserID)
          const isDebt = type === 'owed'
          const isClosed = item.status === 'settled' || item.status === 'rejected'
          const displayAmount = isClosed ? item.original_amount : item.remaining_amount
          const displaySign = isClosed ? '' : isDebt ? '-' : '+'
          const displayColor =
            item.status === 'rejected' ? colors.textMuted : isDebt && !isClosed ? colors.danger : colors.success
          const amountLabel = isClosed ? statusLabel(item.status) : isDebt ? 'Owed' : 'Receivable'
          const canReview = isDebt && item.status === 'pending'
          const hasPendingPayment = pendingPaymentDebtIDs.has(item.id)
          const canPay =
            isDebt && (item.status === 'accepted' || item.status === 'partially_settled') && !hasPendingPayment
          const isUpdating = updatingDebtID === item.id

          return (
            <View style={styles.recordItem}>
              <View style={[styles.statusBar, { backgroundColor: isDebt ? colors.danger : colors.success }]} />
              <View style={styles.itemShell}>
                <View style={styles.itemContent}>
                  <View style={styles.itemLeft}>
                    <Avatar initials={isDebt ? 'O' : 'R'} tone="neutral" />
                    <View style={styles.itemText}>
                      <Text style={styles.itemName}>{counterpartyName(item, currentUserID)}</Text>
                      <View style={styles.titleRow}>
                        <Text style={styles.itemTitle}>{item.expense_title ?? 'Expense'}</Text>
                        <Text style={styles.tag}>{statusLabel(item.status)}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.itemRight}>
                    <Text style={[styles.itemAmount, { color: displayColor }]}>
                      {moneyLabel(displayAmount, displaySign)}
                    </Text>
                    <Text style={styles.itemLabel}>{amountLabel}</Text>
                  </View>
                </View>

                {canReview ? (
                  <View style={styles.reviewActions}>
                    <Pressable
                      disabled={isUpdating}
                      onPress={() => transitionDebt(item.id, 'reject')}
                      style={({ pressed }) => [
                        styles.reviewButton,
                        styles.rejectButton,
                        (pressed || isUpdating) && styles.actionPressed,
                      ]}
                    >
                      <Ionicons color={colors.danger} name="close" size={16} />
                      <Text style={[styles.reviewButtonText, styles.rejectButtonText]}>Reject</Text>
                    </Pressable>
                    <Pressable
                      disabled={isUpdating}
                      onPress={() => transitionDebt(item.id, 'accept')}
                      style={({ pressed }) => [
                        styles.reviewButton,
                        styles.acceptButton,
                        (pressed || isUpdating) && styles.actionPressed,
                      ]}
                    >
                      <Ionicons color={colors.white} name="checkmark" size={16} />
                      <Text style={[styles.reviewButtonText, styles.acceptButtonText]}>
                        {isUpdating ? 'Updating' : 'Accept'}
                      </Text>
                    </Pressable>
                  </View>
                ) : null}

                {canPay ? (
                  <View style={styles.reviewActions}>
                    <Pressable
                      onPress={() => openPayment(item)}
                      style={({ pressed }) => [styles.payButton, pressed && styles.actionPressed]}
                    >
                      <Ionicons color={colors.white} name="card-outline" size={17} />
                      <Text style={styles.payButtonText}>Pay</Text>
                    </Pressable>
                  </View>
                ) : null}

                {hasPendingPayment ? (
                  <View style={styles.reviewActions}>
                    <View style={styles.pendingPaymentPill}>
                      <Ionicons color={colors.tertiary} name="time-outline" size={17} />
                      <Text style={styles.pendingPaymentText}>Payment pending review</Text>
                    </View>
                  </View>
                ) : null}
              </View>
            </View>
          )
        }}
        showsVerticalScrollIndicator={false}
      />

      <Modal animationType="fade" onRequestClose={closePayment} transparent visible={isPaymentOpen}>
        <KeyboardAvoidingContainer style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleBlock}>
                <Text style={styles.modalTitle}>Pay Debt</Text>
                <Text style={styles.modalSubtitle}>
                  {paymentDebt ? `You owe ${moneyLabel(paymentDebt.remaining_amount)}` : 'Accepted debt'}
                </Text>
              </View>
              <Pressable onPress={closePayment} style={styles.closeButton}>
                <Ionicons color={colors.textMuted} name="close" size={24} />
              </Pressable>
            </View>

            <View style={styles.paymentAmountBlock}>
              <Text style={styles.paymentLabel}>Amount</Text>
              <View style={styles.paymentAmountRow}>
                <Text style={styles.currency}>{appCurrency.symbol}</Text>
                <TextInput
                  keyboardType="decimal-pad"
                  onChangeText={setPaymentAmount}
                  placeholder="0.00"
                  placeholderTextColor={colors.outline}
                  style={styles.paymentAmountInput}
                  value={paymentAmount}
                />
              </View>
              {paymentDebt ? (
                <Text style={styles.paymentHelper}>
                  Enter any amount up to {moneyLabel(paymentDebt.remaining_amount)}.
                </Text>
              ) : null}
              <View style={styles.quickActionRow}>
                <Pressable onPress={useFullPaymentAmount} style={styles.quickActionButton}>
                  <Ionicons color={colors.primary} name="refresh" size={16} />
                  <Text style={styles.quickActionText}>Full Amount</Text>
                </Pressable>
              </View>
              {isPartialPayment ? (
                <Text style={styles.partialPaymentNote}>Partial payments reduce this debt.</Text>
              ) : null}
            </View>

            <View style={styles.paymentField}>
              <Text style={styles.paymentLabel}>Note</Text>
              <TextInput
                multiline
                onChangeText={setPaymentNote}
                placeholder="Transfer note (optional)"
                placeholderTextColor={colors.outline}
                style={styles.noteInput}
                value={paymentNote}
              />
            </View>

            <Pressable
              disabled={!canSubmitPayment}
              onPress={submitPayment}
              style={[styles.submitPaymentButton, !canSubmitPayment && styles.submitPaymentButtonDisabled]}
            >
              {isSubmittingPayment ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <>
                  <Ionicons color={colors.white} name="checkmark-circle-outline" size={22} />
                  <Text style={styles.submitPaymentText}>Submit Payment</Text>
                </>
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingContainer>
      </Modal>
    </Screen>
  )
}
