import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '@/src/shared/components/AppHeader';
import { Avatar } from '@/src/shared/components/Avatar';
import { Card } from '@/src/shared/components/Card';
import { Screen } from '@/src/shared/components/Screen';
import { colors } from '@/src/shared/theme/colors';

const groups = [
  { members: '5 members', name: 'Housemates', total: '$685.50' },
  { members: '4 members', name: 'Weekend Trip', total: '$240.00' },
  { members: '3 members', name: 'Office Lunch', total: '$96.75' },
];

export function GroupsScreen() {
  return (
    <Screen contentStyle={styles.content}>
      <AppHeader />
      <View style={styles.inner}>
        <Text style={styles.title}>Groups</Text>
        <View style={styles.list}>
          {groups.map((group, index) => (
            <Card key={group.name} style={styles.groupCard}>
              <View style={styles.left}>
                <Avatar
                  initials={group.name.slice(0, 2).toUpperCase()}
                  tone={index === 0 ? 'blue' : index === 1 ? 'orange' : 'green'}
                />
                <View>
                  <Text style={styles.groupName}>{group.name}</Text>
                  <Text style={styles.groupMembers}>{group.members}</Text>
                </View>
              </View>
              <View style={styles.right}>
                <Text style={styles.groupTotal}>{group.total}</Text>
                <Ionicons color={colors.textSoft} name="chevron-forward" size={24} />
              </View>
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
  groupCard: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  left: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
  },
  groupName: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
  },
  groupMembers: {
    color: colors.textMuted,
    fontSize: 16,
    marginTop: 4,
  },
  right: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  groupTotal: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '800',
  },
});
