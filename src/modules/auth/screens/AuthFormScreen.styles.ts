import { StyleSheet } from 'react-native'
import { AppTheme } from '@/src/shared/theme/colors'
import { typography } from '@/src/shared/theme/typography'

export function createStyles({ colors, shadows }: AppTheme) {
  return StyleSheet.create({
    screen: {
      justifyContent: 'center',
      padding: 18,
      paddingBottom: 32,
    },
    keyboard: {
      width: '100%',
    },
    card: {
      gap: 16,
      overflow: 'hidden',
      padding: 24,
    },
    iconMark: {
      alignItems: 'center',
      alignSelf: 'center',
      borderRadius: 16,
      height: 64,
      justifyContent: 'center',
      overflow: 'hidden',
      width: 64,
      ...shadows.card,
    },
    logoImage: {
      height: 64,
      width: 64,
    },
    heading: {
      color: colors.text,
      fontFamily: typography.familyBold,
      fontSize: typography.size.screenTitle,
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
    label: {
      color: colors.text,
      fontFamily: typography.familyBold,
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
      height: 54,
      paddingHorizontal: 18,
    },
    input: {
      color: colors.text,
      flex: 1,
      fontFamily: typography.familyBold,
      fontSize: typography.size.bodyLarge,
    },
    passwordIconButton: {
      alignItems: 'center',
      height: 48,
      justifyContent: 'center',
      width: 48,
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
      height: 56,
      justifyContent: 'center',
      marginTop: 2,
      ...shadows.floating,
    },
    disabledButton: {
      opacity: 0.72,
    },
    primaryText: {
      color: colors.white,
      fontFamily: typography.familyBold,
      fontSize: typography.size.body,
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
      fontFamily: typography.familyBold,
      fontSize: typography.size.label,
      fontWeight: typography.weight.semibold,
    },
    secondaryAction: {
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 48,
    },
    textAction: {
      alignSelf: 'flex-end',
      minHeight: 36,
      justifyContent: 'center',
    },
    textActionLabel: {
      color: colors.primary,
      fontFamily: typography.familyBold,
      fontSize: typography.size.bodySmall,
      fontWeight: typography.weight.semibold,
    },
    registerText: {
      color: colors.textMuted,
      fontFamily: typography.familyBold,
      fontSize: typography.size.body,
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
    successText: {
      color: colors.success,
      fontFamily: typography.familyBold,
      fontSize: typography.size.bodySmall,
      fontWeight: typography.weight.semibold,
      lineHeight: typography.lineHeight.bodySmall,
    },
  })
}
