import { StyleSheet } from 'react-native'
import { colors, shadows } from '@/src/shared/theme/colors'

export const styles = StyleSheet.create({
  screen: {
    justifyContent: 'center',
    padding: 18,
  },
  keyboard: {
    width: '100%',
  },
  card: {
    gap: 18,
    overflow: 'hidden',
    padding: 28,
  },
  iconMark: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.primaryBright,
    borderRadius: 18,
    height: 82,
    justifyContent: 'center',
    width: 82,
    ...shadows.card,
  },
  heading: {
    color: colors.text,
    fontSize: 40,
    fontWeight: '800',
    textAlign: 'center',
  },
  subheading: {
    color: colors.textMuted,
    fontSize: 17,
    lineHeight: 24,
    textAlign: 'center',
  },
  form: {
    gap: 18,
    marginTop: 10,
  },
  fieldGroup: {
    gap: 8,
  },
  passwordLabelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  linkText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  inputShell: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderColor: colors.outline,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    height: 58,
    paddingHorizontal: 18,
  },
  input: {
    color: colors.text,
    flex: 1,
    fontSize: 18,
  },
  errorText: {
    color: colors.danger,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 28,
    flexDirection: 'row',
    gap: 10,
    height: 60,
    justifyContent: 'center',
    marginTop: 2,
    ...shadows.floating,
  },
  disabledButton: {
    opacity: 0.72,
  },
  primaryText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  dividerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 18,
    marginTop: 14,
  },
  divider: {
    backgroundColor: colors.surfaceVariant,
    flex: 1,
    height: 1,
  },
  dividerText: {
    color: colors.textSoft,
    fontSize: 14,
    fontWeight: '700',
  },
  registerText: {
    color: colors.textMuted,
    fontSize: 17,
    textAlign: 'center',
  },
  registerLink: {
    color: colors.primary,
    fontWeight: '700',
  },
  terms: {
    color: colors.textSoft,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 26,
    paddingHorizontal: 18,
    textAlign: 'center',
  },
  underline: {
    textDecorationLine: 'underline',
  },
})
