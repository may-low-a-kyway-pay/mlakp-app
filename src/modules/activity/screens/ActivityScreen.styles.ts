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
})
