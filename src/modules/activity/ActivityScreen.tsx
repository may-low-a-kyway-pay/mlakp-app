import { AppHeader } from '@/src/shared/components/AppHeader';
import { Card } from '@/src/shared/components/Card';
import { Screen } from '@/src/shared/components/Screen';
import { colors } from '@/src/shared/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

const activity = [
  {
    amount: '$80.00',
    icon: 'checkmark-circle-outline' as const,
    status: 'Payment confirmed',
    title: 'Marcus paid Dinner & Drinks',
  },
  {
    amount: '$350.00',
    icon: 'receipt-outline' as const,
    status: 'Debt accepted',
    title: 'Sarah accepted Concert Tickets',
  },
  {
    amount: '$42.75',
    icon: 'time-outline' as const,
    status: 'Pending review',
    title: 'John owes Grocery Run',
  },
];

export function ActivityScreen() {
  return (
    <Screen contentStyle={styles.content}>
      <AppHeader />
      <View style={styles.inner}>
        <Text style={styles.title}>Activity</Text>
        <View style={styles.list}>
          {activity.map((item) => (
            <Card key={item.title} style={styles.item}>
              <View style={styles.iconCircle}>
                <Ionicons color={colors.primary} name={item.icon} size={26} />
              </View>
              <View style={styles.itemText}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.status}>{item.status}</Text>
              </View>
              <Text style={styles.amount}>{item.amount}</Text>
            </Card>
          ))}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  inner: {
    padding: 18,
  },
  title: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '800',
    marginBottom: 22,
    marginTop: 22,
  },
  list: {
    gap: 12,
  },
  item: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
  },
  iconCircle: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  itemText: {
    flex: 1,
  },
  itemTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  status: {
    color: colors.textMuted,
    fontSize: 15,
    marginTop: 4,
  },
  amount: {
    color: colors.success,
    fontSize: 17,
    fontWeight: '800',
  },
});
