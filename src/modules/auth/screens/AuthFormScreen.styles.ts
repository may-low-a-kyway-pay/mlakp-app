import { StyleSheet } from 'react-native'
import { colors, shadows } from '@/src/shared/theme/colors'
import { typography } from '@/src/shared/theme/typography'

export const styles = StyleSheet.create({
  screen: {
    justifyContent: 'center',
    padding: 18,
    paddingBottom: 32,
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
    fontFamily: typography.family,
    fontSize: typography.size.hero,
    fontWeight: typography.weight.bold,
    textAlign: 'center',
  },
  subheading: {
    color: colors.textMuted,
    fontFamily: typography.family,
    fontSize: typography.size.bodyLarge,
    lineHeight: typography.lineHeight.bodyLarge,
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
    fontFamily: typography.family,
    fontSize: typography.size.titleSmall,
    fontWeight: typography.weight.medium,
  },
  linkText: {
    color: colors.primary,
    fontFamily: typography.family,
    fontSize: typography.size.body,
    fontWeight: typography.weight.medium,
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
    fontFamily: typography.family,
    fontSize: typography.size.titleSmall,
  },
  errorText: {
    color: colors.danger,
    fontFamily: typography.family,
    fontSize: typography.size.bodySmall,
    fontWeight: typography.weight.medium,
    lineHeight: typography.lineHeight.bodySmall,
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
    color: colors.white,
    fontFamily: typography.family,
    fontSize: typography.size.titleSmall,
    fontWeight: typography.weight.semibold,
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
    fontFamily: typography.family,
    fontSize: typography.size.label,
    fontWeight: typography.weight.semibold,
  },
  registerText: {
    color: colors.textMuted,
    fontFamily: typography.family,
    fontSize: typography.size.bodyLarge,
    textAlign: 'center',
  },
  registerLink: {
    color: colors.primary,
    fontWeight: typography.weight.semibold,
  },
  terms: {
    color: colors.textSoft,
    fontFamily: typography.family,
    fontSize: typography.size.bodySmall,
    lineHeight: typography.lineHeight.body,
    marginTop: 26,
    paddingHorizontal: 18,
    textAlign: 'center',
  },
  underline: {
    textDecorationLine: 'underline',
  },
})
