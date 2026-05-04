import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '@/src/shared/components/AppHeader';
import { Avatar } from '@/src/shared/components/Avatar';
import { Card } from '@/src/shared/components/Card';
import { Screen } from '@/src/shared/components/Screen';
import { colors, shadows } from '@/src/shared/theme/colors';

const balances = [
  { amount: '$450.00', icon: 'arrow-up-outline' as const, label: 'You Owe', tone: colors.danger, soft: '#fff2f1' },
  { amount: '$1,200.50', icon: 'arrow-down-outline' as const, label: 'You Get', tone: colors.success, soft: '#f0fff2' },
];

const unsettled = [
  {
    amount: '-$120.00',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=faces',
    label: 'Owed',
    name: 'Marcus L.',
    title: 'Dinner & Drinks',
    type: 'debt',
  },
  {
    amount: '+$350.00',
    initials: 'S',
    label: 'Receivable',
    name: 'Sarah Jenkins',
    tag: 'Entertainment',
    title: 'Concert Tickets',
    type: 'credit',
  },
  {
    amount: '+$85.50',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=faces',
    label: 'Receivable',
    name: 'Emily R.',
    title: 'Utility Bill Split',
    type: 'credit',
  },
];

export function DashboardScreen() {
  return (
    <Screen contentStyle={styles.content}>
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

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Unsettled Balances</Text>
        <Pressable style={styles.viewAll}>
          <Text style={styles.viewAllText}>View all</Text>
          <Ionicons color={colors.primary} name="chevron-forward" size={18} />
        </Pressable>
      </View>

      <View style={styles.list}>
        {unsettled.map((item) => {
          const isDebt = item.type === 'debt';
          return (
            <View key={`${item.name}-${item.amount}`} style={styles.balanceItem}>
              <View style={[styles.statusBar, { backgroundColor: isDebt ? colors.danger : colors.success }]} />
              <View style={styles.itemContent}>
                <View style={styles.itemLeft}>
                  <Avatar initials={item.initials ?? item.name.slice(0, 1)} tone="neutral" uri={item.avatar} />
                  <View style={styles.itemText}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <View style={styles.titleRow}>
                      <Text style={styles.itemTitle}>{item.title}</Text>
                      {item.tag ? <Text style={styles.tag}>{item.tag}</Text> : null}
                    </View>
                  </View>
                </View>
                <View style={styles.itemRight}>
                  <Text style={[styles.itemAmount, { color: isDebt ? colors.danger : colors.success }]}>
                    {item.amount}
                  </Text>
                  <Text style={styles.itemLabel}>{item.label}</Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>

      <Link asChild href="/add-expense">
        <Pressable style={styles.fab}>
          <Ionicons color="#ffffff" name="add" size={40} />
        </Pressable>
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  balanceGrid: {
    flexDirection: 'row',
    gap: 16,
    padding: 18,
  },
  balanceCard: {
    flex: 1,
    gap: 18,
  },
  balanceLabelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  balanceLabel: {
    color: colors.textMuted,
    fontSize: 17,
    fontWeight: '600',
  },
  balanceAmount: {
    fontSize: 34,
    fontWeight: '800',
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 18,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 31,
    fontWeight: '700',
  },
  viewAll: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  viewAllText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  list: {
    gap: 10,
    padding: 18,
  },
  balanceItem: {
    backgroundColor: colors.surface,
    borderColor: colors.surfaceVariant,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    minHeight: 88,
    overflow: 'hidden',
    ...shadows.card,
  },
  statusBar: {
    width: 5,
  },
  itemContent: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  itemLeft: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 14,
  },
  itemText: {
    flex: 1,
  },
  itemName: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  itemTitle: {
    color: colors.textMuted,
    fontSize: 17,
  },
  tag: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 6,
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  itemRight: {
    alignItems: 'flex-end',
    minWidth: 114,
  },
  itemAmount: {
    fontSize: 22,
    fontWeight: '800',
  },
  itemLabel: {
    color: colors.textMuted,
    fontSize: 15,
    fontWeight: '600',
    marginTop: 4,
  },
  fab: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 22,
    bottom: 104,
    height: 74,
    justifyContent: 'center',
    position: 'absolute',
    right: 28,
    width: 74,
    ...shadows.floating,
  },
});
