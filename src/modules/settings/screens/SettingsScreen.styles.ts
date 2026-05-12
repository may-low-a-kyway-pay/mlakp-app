import { StyleSheet } from 'react-native'
import { AppTheme } from '@/src/shared/theme/colors'
import { typography } from '@/src/shared/theme/typography'

export function createStyles({ colors, shadows }: AppTheme) {
  return StyleSheet.create({
    content: {
      paddingHorizontal: 0,
      paddingTop: 0,
    },
    inner: {
      padding: 18,
    },
    title: {
      color: colors.text,
      fontFamily: typography.familyBold,
      fontSize: typography.size.screenTitle,
      fontWeight: typography.weight.bold,
      marginBottom: 26,
      marginTop: 22,
    },
    settingsCard: {
      padding: 0,
    },
    settingRow: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 14,
      minHeight: 82,
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    settingRowDisabled: {
      opacity: 0.55,
    },
    iconCircle: {
      alignItems: 'center',
      borderRadius: 24,
      height: 48,
      justifyContent: 'center',
      width: 48,
    },
    settingText: {
      flex: 1,
    },
    trailingSpace: {
      width: 24,
    },
    settingLabel: {
      color: colors.text,
      fontFamily: typography.familyBold,
      fontSize: typography.size.bodyLarge,
      fontWeight: typography.weight.semibold,
    },
    settingSublabel: {
      color: colors.textMuted,
      fontFamily: typography.family,
      fontSize: typography.size.bodySmall,
      lineHeight: typography.lineHeight.bodySmall,
      marginTop: 2,
    },
    divider: {
      backgroundColor: colors.surfaceVariant,
      height: StyleSheet.hairlineWidth,
      marginLeft: 78,
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
    toggleDisabled: {
      opacity: 0.55,
    },
    signOut: {
      alignItems: 'center',
      backgroundColor: colors.dangerSoft,
      borderRadius: 14,
      flexDirection: 'row',
      gap: 10,
      height: 58,
      justifyContent: 'center',
      marginTop: 28,
    },
    disabled: {
      opacity: 0.65,
    },
    signOutText: {
      color: colors.danger,
      fontFamily: typography.familyBold,
      fontSize: typography.size.bodyLarge,
      fontWeight: typography.weight.bold,
    },
    version: {
      color: colors.textSoft,
      fontFamily: typography.familyBold,
      fontSize: typography.size.label,
      fontWeight: typography.weight.semibold,
      marginTop: 20,
      textAlign: 'center',
    },
    modalOverlay: {
      alignItems: 'center',
      backgroundColor: colors.overlay,
      flex: 1,
      justifyContent: 'center',
      padding: 18,
    },
    modalCard: {
      borderRadius: 14,
      gap: 18,
      width: '100%',
    },
    modalHeader: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    modalTitle: {
      color: colors.text,
      fontFamily: typography.familyBold,
      fontSize: typography.size.title,
      fontWeight: typography.weight.bold,
    },
    closeButton: {
      alignItems: 'center',
      height: 48,
      justifyContent: 'center',
      width: 48,
    },
    fieldGroup: {
      gap: 8,
    },
    label: {
      color: colors.text,
      fontFamily: typography.familyBold,
      fontSize: typography.size.body,
      fontWeight: typography.weight.semibold,
    },
    input: {
      borderColor: colors.outline,
      borderRadius: 12,
      borderWidth: 1,
      color: colors.text,
      fontFamily: typography.family,
      fontSize: typography.size.bodyLarge,
      height: 54,
      paddingHorizontal: 16,
    },
    errorText: {
      color: colors.danger,
      fontFamily: typography.familyBold,
      fontSize: typography.size.bodySmall,
      fontWeight: typography.weight.semibold,
    },
    saveButton: {
      alignItems: 'center',
      backgroundColor: colors.primary,
      borderRadius: 24,
      flexDirection: 'row',
      gap: 8,
      height: 52,
      justifyContent: 'center',
    },
    saveText: {
      color: colors.white,
      fontFamily: typography.familyBold,
      fontSize: typography.size.body,
      fontWeight: typography.weight.bold,
    },
  })
}
