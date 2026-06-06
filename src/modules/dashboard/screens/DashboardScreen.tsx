import { Ionicons } from '@expo/vector-icons'
import { Link } from 'expo-router'
import { useMemo, useState } from 'react'
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { moneyLabel, shortID, statusLabel } from '@/src/modules/dashboard/utils/dashboardFormatters'
import { createStyles } from '@/src/modules/dashboard/screens/DashboardScreen.styles'
import { useDashboard } from '@/src/modules/dashboard/hooks/useDashboard'
import { DashboardBalanceType } from '@/src/modules/dashboard/types/dashboardTypes'
import { AppHeader } from '@/src/shared/components/AppHeader'
import { Avatar } from '@/src/shared/components/Avatar'
import { Card } from '@/src/shared/components/Card'
import { KeyboardAvoidingContainer } from '@/src/shared/components/KeyboardAvoidingContainer'
import { Screen } from '@/src/shared/components/Screen'
import { iconSize } from '@/src/shared/theme/metrics'
import { useAppTheme } from '@/src/shared/theme/ThemeContext'
import { appCurrency } from '@/src/shared/utils/currency'

type PersonFilter = 'all' | DashboardBalanceType
type DashboardTab = 'balances' | 'person'

const personFilterOptions: { label: string; value: PersonFilter }[] = [
  { label: 'You Owe', value: 'owed' },
  { label: 'You Get', value: 'receivable' },
  { label: 'All', value: 'all' },
]

const dashboardTabOptions: { label: string; value: DashboardTab }[] = [
  { label: 'Balances', value: 'balances' },
  { label: 'By Person', value: 'person' },
]

export function DashboardScreen() {
  const theme = useAppTheme()
  const { colors } = theme
  const styles = useMemo(() => createStyles(theme), [theme])
  const {
    balances,
    bulkPaymentAmount,
    bulkPaymentNote,
    bulkPaymentPerson,
    canSubmitBulkPayment,
    closeBulkPayment,
    error,
    isBulkPaymentOpen,
    isLoading,
    isPartialBulkPayment,
    isSubmittingBulkPayment,
    loadDashboard,
    openBulkPayment,
    personBalances,
    setBulkPaymentAmount,
    setBulkPaymentNote,
    submitBulkPayment,
    transitionDebt,
    unsettled,
    updatingDebtID,
    useFullBulkPaymentAmount,
  } = useDashboard()
  const [dashboardTab, setDashboardTab] = useState<DashboardTab>('balances')
  const [personFilter, setPersonFilter] = useState<PersonFilter>('owed')
  const filteredPersonBalances = useMemo(
    () => (personFilter === 'all' ? personBalances : personBalances.filter((balance) => balance.type === personFilter)),
    [personBalances, personFilter],
  )

  return (
    <Screen contentStyle={styles.root} scroll={false}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader />

        <View style={styles.balanceGrid}>
          {balances.map((balance) => (
            <Card key={balance.label} style={[styles.balanceCard, { backgroundColor: balance.soft }]}>
              <View style={styles.balanceLabelRow}>
                <Ionicons color={balance.tone} name={balance.icon} size={22} />
                <Text style={styles.balanceLabel}>{balance.label}</Text>
              </View>
              <Text style={[styles.balanceAmount, { color: balance.tone }]}>{balance.amount}</Text>
            </Card>
          ))}
        </View>

        {isLoading ? (
          <View style={styles.stateBlock}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.stateText}>Loading dashboard...</Text>
          </View>
        ) : null}

        {error ? (
          <View style={styles.errorBlock}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable accessibilityRole="button" onPress={loadDashboard} style={styles.retryButton}>
              <Ionicons color={colors.white} name="refresh" size={18} />
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.tabRow}>
          {dashboardTabOptions.map((option) => (
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected: dashboardTab === option.value }}
              key={option.value}
              onPress={() => setDashboardTab(option.value)}
              style={[styles.tabButton, dashboardTab === option.value && styles.tabButtonActive]}
            >
              <Text style={[styles.tabText, dashboardTab === option.value && styles.tabTextActive]}>
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {dashboardTab === 'balances' ? (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Unsettled Balances</Text>
              <Link asChild href="/debts">
                <Pressable accessibilityRole="link" style={styles.viewAll}>
                  <Text style={styles.viewAllText}>View all</Text>
                  <Ionicons color={colors.primary} name="chevron-forward" size={18} />
                </Pressable>
              </Link>
            </View>

            <View style={styles.list}>
              {!isLoading && !error && unsettled.length === 0 ? (
                <Card style={styles.emptyCard}>
                  <Ionicons color={colors.textSoft} name="checkmark-done-circle-outline" size={30} />
                  <Text style={styles.emptyTitle}>No unsettled balances</Text>
                  <Text style={styles.emptyText}>
                    Pending and accepted debts with remaining balance will appear here.
                  </Text>
                </Card>
              ) : null}

              {unsettled.map((item) => {
                const isDebt = item.type === 'owed'
                const canReview = isDebt && item.status === 'pending'
                const isUpdating = updatingDebtID === item.id
                return (
                  <View key={item.id} style={styles.balanceItem}>
                    <View style={[styles.statusBar, { backgroundColor: isDebt ? colors.danger : colors.success }]} />
                    <View style={styles.itemShell}>
                      <View style={styles.itemContent}>
                        <View style={styles.itemLeft}>
                          <Avatar initials={isDebt ? 'O' : 'R'} tone="neutral" />
                          <View style={styles.itemText}>
                            <Text style={styles.itemName}>{item.other_user.name}</Text>
                            <View style={styles.titleRow}>
                              <Text style={styles.itemTitle}>
                                {item.expense_title || `Expense ${shortID(item.expense_id)}`}
                              </Text>
                              <Text style={styles.tag}>{statusLabel(item.status)}</Text>
                            </View>
                          </View>
                        </View>
                        <View style={styles.itemRight}>
                          <Text style={[styles.itemAmount, { color: isDebt ? colors.danger : colors.success }]}>
                            {moneyLabel(item.remaining_amount, isDebt ? '-' : '+')}
                          </Text>
                          <Text style={styles.itemLabel}>{isDebt ? 'Owed' : 'Receivable'}</Text>
                        </View>
                      </View>

                      {canReview ? (
                        <View style={styles.reviewActions}>
                          <Pressable
                            accessibilityLabel={`Reject ${item.other_user.name}'s debt`}
                            accessibilityRole="button"
                            accessibilityState={{ disabled: isUpdating }}
                            disabled={isUpdating}
                            onPress={() => transitionDebt(item.id, 'reject')}
                            style={({ pressed }) => [
                              styles.reviewButton,
                              styles.rejectButton,
                              (pressed || isUpdating) && styles.actionPressed,
                            ]}
                          >
                            <Ionicons color={colors.danger} name="close" size={iconSize.small} />
                            <Text style={[styles.reviewButtonText, styles.rejectButtonText]}>Reject</Text>
                          </Pressable>
                          <Pressable
                            accessibilityLabel={`Accept ${item.other_user.name}'s debt`}
                            accessibilityRole="button"
                            accessibilityState={{ disabled: isUpdating }}
                            disabled={isUpdating}
                            onPress={() => transitionDebt(item.id, 'accept')}
                            style={({ pressed }) => [
                              styles.reviewButton,
                              styles.acceptButton,
                              (pressed || isUpdating) && styles.actionPressed,
                            ]}
                          >
                            <Ionicons color={colors.white} name="checkmark" size={iconSize.small} />
                            <Text style={[styles.reviewButtonText, styles.acceptButtonText]}>
                              {isUpdating ? 'Updating' : 'Accept'}
                            </Text>
                          </Pressable>
                        </View>
                      ) : null}
                    </View>
                  </View>
                )
              })}
            </View>
          </>
        ) : (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>By Person</Text>
            </View>

            <View style={styles.filterRow}>
              {personFilterOptions.map((option) => (
                <Pressable
                  key={option.value}
                  accessibilityRole="button"
                  accessibilityState={{ selected: personFilter === option.value }}
                  onPress={() => setPersonFilter(option.value)}
                  style={[styles.filterChip, personFilter === option.value && styles.filterChipActive]}
                >
                  <Text style={[styles.filterText, personFilter === option.value && styles.filterTextActive]}>
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.list}>
              {!isLoading && !error && filteredPersonBalances.length === 0 ? (
                <Card style={styles.emptyCard}>
                  <Ionicons color={colors.textSoft} name="people-outline" size={30} />
                  <Text style={styles.emptyTitle}>No person balances</Text>
                  <Text style={styles.emptyText}>Accepted debts grouped by person will appear here.</Text>
                </Card>
              ) : null}

              {filteredPersonBalances.map((person) => {
                const isDebt = person.type === 'owed'
                // Debt totals remain visible while submitted payments wait for creditor review.
                const hasPendingPayment = person.has_pending_payment
                return (
                  <View key={`${person.type}-${person.other_user.id}`} style={styles.personItem}>
                    <View style={styles.itemContent}>
                      <View style={styles.itemLeft}>
                        <Avatar initials={isDebt ? 'O' : 'R'} tone="neutral" />
                        <View style={styles.itemText}>
                          <Text style={styles.itemName}>{person.other_user.name}</Text>
                          <Text style={styles.itemTitle}>
                            {person.debt_count} {person.debt_count === 1 ? 'debt' : 'debts'}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.itemRight}>
                        <Text style={[styles.itemAmount, { color: isDebt ? colors.danger : colors.success }]}>
                          {moneyLabel(person.remaining_amount, isDebt ? '-' : '+')}
                        </Text>
                        <Text style={styles.itemLabel}>{isDebt ? 'Owed' : 'Receivable'}</Text>
                      </View>
                    </View>

                    {isDebt ? (
                      <View style={styles.reviewActions}>
                        <Pressable
                          accessibilityLabel={
                            hasPendingPayment
                              ? `Payment to ${person.other_user.name} is pending review`
                              : `Pay ${person.other_user.name}`
                          }
                          accessibilityRole="button"
                          accessibilityState={{ disabled: hasPendingPayment }}
                          disabled={hasPendingPayment}
                          onPress={() => openBulkPayment(person)}
                          style={({ pressed }) => [
                            styles.payButton,
                            hasPendingPayment && styles.payButtonDisabled,
                            (pressed || hasPendingPayment) && styles.actionPressed,
                          ]}
                        >
                          <Ionicons
                            color={colors.white}
                            name={hasPendingPayment ? 'time-outline' : 'card-outline'}
                            size={iconSize.small}
                          />
                          <Text style={styles.payButtonText}>{hasPendingPayment ? 'Pending Review' : 'Pay'}</Text>
                        </Pressable>
                      </View>
                    ) : null}
                  </View>
                )
              })}
            </View>
          </>
        )}
      </ScrollView>

      <Link asChild href="/add-expense">
        <Pressable accessibilityLabel="Add expense" accessibilityRole="button" style={styles.fab}>
          <Ionicons color={colors.white} name="add" size={40} />
        </Pressable>
      </Link>

      <Modal animationType="fade" onRequestClose={closeBulkPayment} transparent visible={isBulkPaymentOpen}>
        <KeyboardAvoidingContainer style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleBlock}>
                <Text style={styles.modalTitle}>
                  {bulkPaymentPerson ? `Pay ${bulkPaymentPerson.other_user.name}` : 'Pay Person'}
                </Text>
                <Text style={styles.modalSubtitle}>
                  {bulkPaymentPerson ? `You owe ${moneyLabel(bulkPaymentPerson.remaining_amount)}` : 'Selected person'}
                </Text>
              </View>
              <Pressable
                accessibilityLabel="Close payment form"
                accessibilityRole="button"
                onPress={closeBulkPayment}
                style={styles.closeButton}
              >
                <Ionicons color={colors.textMuted} name="close" size={24} />
              </Pressable>
            </View>

            <View style={styles.paymentAmountBlock}>
              <Text style={styles.paymentLabel}>Amount</Text>
              <View style={styles.paymentAmountRow}>
                <Text style={styles.currency}>{appCurrency.symbol}</Text>
                <TextInput
                  autoComplete="off"
                  inputMode="decimal"
                  keyboardType="decimal-pad"
                  onChangeText={setBulkPaymentAmount}
                  placeholder="0.00"
                  placeholderTextColor={colors.outline}
                  returnKeyType="done"
                  style={styles.paymentAmountInput}
                  value={bulkPaymentAmount}
                />
              </View>
              {bulkPaymentPerson ? (
                <Text style={styles.paymentHelper}>
                  Enter any amount up to {moneyLabel(bulkPaymentPerson.remaining_amount)}.
                </Text>
              ) : null}
              <View style={styles.quickActionRow}>
                <Pressable
                  accessibilityRole="button"
                  onPress={useFullBulkPaymentAmount}
                  style={styles.quickActionButton}
                >
                  <Ionicons color={colors.primary} name="refresh" size={iconSize.small} />
                  <Text style={styles.quickActionText}>Full Amount</Text>
                </Pressable>
              </View>
              {isPartialBulkPayment ? (
                <Text style={styles.partialPaymentNote}>Partial payments are applied to oldest debts first.</Text>
              ) : null}
            </View>

            <View style={styles.paymentField}>
              <Text style={styles.paymentLabel}>Note</Text>
              <TextInput
                autoComplete="off"
                multiline
                onChangeText={setBulkPaymentNote}
                placeholder="Transfer note (optional)"
                placeholderTextColor={colors.outline}
                style={styles.noteInput}
                value={bulkPaymentNote}
              />
            </View>

            <Pressable
              accessibilityLabel="Submit payment"
              accessibilityRole="button"
              accessibilityState={{ disabled: !canSubmitBulkPayment }}
              disabled={!canSubmitBulkPayment}
              onPress={submitBulkPayment}
              style={[styles.submitPaymentButton, !canSubmitBulkPayment && styles.submitPaymentButtonDisabled]}
            >
              {isSubmittingBulkPayment ? (
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
