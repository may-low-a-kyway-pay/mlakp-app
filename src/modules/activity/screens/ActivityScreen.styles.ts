import { StyleSheet } from 'react-native'
import { colors } from '@/src/shared/theme/colors'
import { typography } from '@/src/shared/theme/typography'

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
    fontFamily: typography.family,
    fontSize: typography.size.screenTitle,
    fontWeight: typography.weight.bold,
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
    fontFamily: typography.family,
    fontSize: typography.size.titleSmall,
    fontWeight: typography.weight.semibold,
  },
  status: {
    color: colors.textMuted,
    fontFamily: typography.family,
    fontSize: typography.size.bodySmall,
    marginTop: 4,
  },
  amount: {
    color: colors.success,
    fontFamily: typography.family,
    fontSize: typography.size.bodyLarge,
    fontWeight: typography.weight.bold,
  },
})
