import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '@/src/shared/components/AppHeader';
import { Card } from '@/src/shared/components/Card';
import { Screen } from '@/src/shared/components/Screen';
import { colors } from '@/src/shared/theme/colors';

const settings = [
  {
    bg: colors.primaryBright,
    color: '#ffffff',
    icon: 'person-outline' as const,
    label: 'Profile Information',
    sublabel: 'Update your username and details',
  },
  {
    bg: colors.successSoft,
    color: colors.success,
    icon: 'lock-closed-outline' as const,
    label: 'Security',
    sublabel: 'Change password and auth methods',
  },
  {
    bg: colors.tertiary,
    color: colors.tertiarySoft,
    icon: 'globe-outline' as const,
    label: 'Language',
    sublabel: 'English (US)',
  },
];

export function SettingsScreen() {
  return (
    <Screen contentStyle={styles.content}>
      <AppHeader />
      <View style={styles.inner}>
        <Text style={styles.title}>Settings</Text>
        <Card style={styles.settingsCard}>
          {settings.map((item, index) => (
            <View key={item.label}>
              <Pressable style={styles.settingRow}>
                <View style={[styles.iconCircle, { backgroundColor: item.bg }]}>
                  <Ionicons color={item.color} name={item.icon} size={28} />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>{item.label}</Text>
                  <Text style={styles.settingSublabel}>{item.sublabel}</Text>
                </View>
                <Ionicons color={colors.textSoft} name="chevron-forward" size={28} />
              </Pressable>
              {index < settings.length - 1 ? <View style={styles.divider} /> : null}
            </View>
          ))}

          <View style={styles.divider} />
          <View style={styles.settingRow}>
            <View style={[styles.iconCircle, { backgroundColor: colors.surfaceVariant }]}>
              <Ionicons color={colors.text} name="moon-outline" size={28} />
            </View>
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Dark Theme</Text>
              <Text style={styles.settingSublabel}>Match system default</Text>
            </View>
            <View style={styles.toggle}>
              <View style={styles.toggleKnob} />
            </View>
          </View>
        </Card>

        <Pressable style={styles.signOut}>
          <Ionicons color={colors.danger} name="log-out-outline" size={28} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>
        <Text style={styles.version}>App Version 2.4.1 (Build 890)</Text>
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
    marginBottom: 26,
    marginTop: 22,
  },
  settingsCard: {
    padding: 0,
  },
  settingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 18,
    minHeight: 96,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  iconCircle: {
    alignItems: 'center',
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  settingText: {
    flex: 1,
  },
  settingLabel: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
  },
  settingSublabel: {
    color: colors.textMuted,
    fontSize: 18,
    lineHeight: 25,
    marginTop: 2,
  },
  divider: {
    backgroundColor: colors.surfaceVariant,
    height: StyleSheet.hairlineWidth,
    marginLeft: 88,
  },
  toggle: {
    backgroundColor: colors.surfaceVariant,
    borderColor: colors.outline,
    borderRadius: 18,
    borderWidth: 1,
    height: 34,
    justifyContent: 'center',
    paddingHorizontal: 3,
    width: 62,
  },
  toggleKnob: {
    backgroundColor: colors.textSoft,
    borderRadius: 14,
    height: 28,
    width: 28,
  },
  signOut: {
    alignItems: 'center',
    backgroundColor: colors.dangerSoft,
    borderRadius: 16,
    flexDirection: 'row',
    gap: 12,
    height: 70,
    justifyContent: 'center',
    marginTop: 34,
  },
  signOutText: {
    color: colors.danger,
    fontSize: 20,
    fontWeight: '800',
  },
  version: {
    color: colors.textSoft,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 20,
    textAlign: 'center',
  },
});
