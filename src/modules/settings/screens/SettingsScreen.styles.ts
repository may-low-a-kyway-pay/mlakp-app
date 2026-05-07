import { StyleSheet } from 'react-native'
import { colors } from '@/src/shared/theme/colors'

export const styles = StyleSheet.create({
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
  disabled: {
    opacity: 0.65,
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
})
