import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native'
import { useDebtRecords } from '@/src/modules/debts/hooks/useDebtRecords'
import { styles } from '@/src/modules/debts/screens/DebtRecordsScreen.styles'
import { DebtRecordType, DebtStatus } from '@/src/modules/debts/types/debtTypes'
import { counterpartyName, moneyLabel, recordType, statusLabel } from '@/src/modules/debts/utils/debtFormatters'
import { Avatar } from '@/src/shared/components/Avatar'
import { Card } from '@/src/shared/components/Card'
import { Screen } from '@/src/shared/components/Screen'
import { colors } from '@/src/shared/theme/colors'

const statusOptions: { label: string; value: 'all' | DebtStatus }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'Partial', value: 'partially_settled' },
  { label: 'Settled', value: 'settled' },
  { label: 'Rejected', value: 'rejected' },
]

const typeOptions: { label: string; value: 'all' | DebtRecordType }[] = [
  { label: 'All', value: 'all' },
  { label: 'You Owe', value: 'owed' },
  { label: 'You Get', value: 'receivable' },
]

export function DebtRecordsScreen() {
  const {
    currentUserID,
    error,
    isLoading,
    loadRecords,
    records,
    setStatusFilter,
    setTypeFilter,
    statusFilter,
    transitionDebt,
    typeFilter,
    updatingDebtID,
  } = useDebtRecords()

  return (
    <Screen contentStyle={styles.root} scroll={false}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons color={colors.text} name="chevron-back" size={24} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.title}>All Balances</Text>
          <Text style={styles.subtitle}>{records.length} records</Text>
        </View>
        <Pressable disabled={isLoading} onPress={loadRecords} style={styles.iconButton}>
          <Ionicons color={colors.primary} name="refresh" size={22} />
        </Pressable>
      </View>

      <View style={styles.filters}>
        <View style={styles.filterRow}>
          {typeOptions.map((option) => (
            <Pressable
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
            </Card>
          ) : null
        }
        renderItem={({ item }) => {
          const type = recordType(item, currentUserID)
          const isDebt = type === 'owed'
          const canReview = isDebt && item.status === 'pending'
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
                    <Text style={[styles.itemAmount, { color: isDebt ? colors.danger : colors.success }]}>
                      {moneyLabel(item.remaining_amount, isDebt ? '-' : '+')}
                    </Text>
                    <Text style={styles.itemLabel}>{isDebt ? 'Owed' : 'Receivable'}</Text>
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
              </View>
            </View>
          )
        }}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  )
}
