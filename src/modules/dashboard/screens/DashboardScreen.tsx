import { Ionicons } from '@expo/vector-icons'
import { Link } from 'expo-router'
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native'
import { moneyLabel, shortID, statusLabel } from '@/src/modules/dashboard/utils/dashboardFormatters'
import { styles } from '@/src/modules/dashboard/screens/DashboardScreen.styles'
import { useDashboard } from '@/src/modules/dashboard/hooks/useDashboard'
import { AppHeader } from '@/src/shared/components/AppHeader'
import { Avatar } from '@/src/shared/components/Avatar'
import { Card } from '@/src/shared/components/Card'
import { Screen } from '@/src/shared/components/Screen'
import { colors } from '@/src/shared/theme/colors'

export function DashboardScreen() {
  const { balances, error, isLoading, loadDashboard, transitionDebt, unsettled, updatingDebtID } = useDashboard()

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
            <Pressable onPress={loadDashboard} style={styles.retryButton}>
              <Ionicons color={colors.white} name="refresh" size={18} />
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Unsettled Balances</Text>
          <Pressable style={styles.viewAll}>
            <Text style={styles.viewAllText}>View all</Text>
            <Ionicons color={colors.primary} name="chevron-forward" size={18} />
          </Pressable>
        </View>

        <View style={styles.list}>
          {!isLoading && !error && unsettled.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Ionicons color={colors.textSoft} name="checkmark-done-circle-outline" size={30} />
              <Text style={styles.emptyTitle}>No unsettled balances</Text>
              <Text style={styles.emptyText}>Pending and accepted debts with remaining balance will appear here.</Text>
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
          })}
        </View>
      </ScrollView>

      <Link asChild href="/add-expense">
        <Pressable style={styles.fab}>
          <Ionicons color={colors.white} name="add" size={40} />
        </Pressable>
      </Link>
    </Screen>
  )
}
