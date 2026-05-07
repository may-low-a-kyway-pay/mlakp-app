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
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 22,
    marginTop: 22,
  },
  title: {
    color: colors.text,
    fontFamily: typography.family,
    fontSize: typography.size.screenTitle,
    fontWeight: typography.weight.bold,
  },
  addButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  stateBlock: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 28,
  },
  stateText: {
    color: colors.textMuted,
    fontFamily: typography.family,
    fontSize: typography.size.bodySmall,
    fontWeight: typography.weight.medium,
  },
  errorBlock: {
    alignItems: 'center',
    backgroundColor: colors.dangerSoft,
    gap: 12,
    padding: 16,
  },
  errorText: {
    color: colors.danger,
    fontFamily: typography.family,
    fontSize: typography.size.bodySmall,
    fontWeight: typography.weight.semibold,
    textAlign: 'center',
  },
  retryButton: {
    alignItems: 'center',
    backgroundColor: colors.danger,
    borderRadius: 8,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  retryText: {
    color: colors.white,
    fontFamily: typography.family,
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
  },
  emptyCard: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 28,
  },
  emptyTitle: {
    color: colors.text,
    fontFamily: typography.family,
    fontSize: typography.size.titleSmall,
    fontWeight: typography.weight.bold,
  },
  emptyText: {
    color: colors.textMuted,
    fontFamily: typography.family,
    fontSize: typography.size.bodySmall,
    lineHeight: typography.lineHeight.bodySmall,
    textAlign: 'center',
  },
  list: {
    gap: 12,
  },
  groupCard: {
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 82,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  left: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 14,
  },
  groupText: {
    flex: 1,
  },
  groupName: {
    color: colors.text,
    fontFamily: typography.family,
    fontSize: typography.size.titleSmall,
    fontWeight: typography.weight.semibold,
  },
  groupMembers: {
    color: colors.textMuted,
    fontFamily: typography.family,
    fontSize: typography.size.bodySmall,
    marginTop: 4,
  },
  right: {
    alignItems: 'center',
    flexDirection: 'row',
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
    fontFamily: typography.family,
    fontSize: typography.size.title,
    fontWeight: typography.weight.bold,
  },
  closeButton: {
    alignItems: 'center',
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    color: colors.text,
    fontFamily: typography.family,
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
  createButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 24,
    flexDirection: 'row',
    gap: 8,
    height: 52,
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.72,
  },
  createText: {
    color: colors.white,
    fontFamily: typography.family,
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
  },
})
