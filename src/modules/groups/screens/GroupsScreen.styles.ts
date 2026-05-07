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
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 22,
    marginTop: 22,
  },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '800',
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
    fontSize: 15,
    fontWeight: '600',
  },
  errorBlock: {
    alignItems: 'center',
    backgroundColor: colors.dangerSoft,
    gap: 12,
    padding: 16,
  },
  errorText: {
    color: colors.danger,
    fontSize: 15,
    fontWeight: '700',
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
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  emptyCard: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 28,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 21,
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
    fontSize: 20,
    fontWeight: '700',
  },
  groupMembers: {
    color: colors.textMuted,
    fontSize: 15,
    marginTop: 4,
  },
  right: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  modalOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(25, 28, 30, 0.34)',
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
    fontSize: 22,
    fontWeight: '800',
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
    fontSize: 16,
    fontWeight: '700',
  },
  input: {
    borderColor: colors.outline,
    borderRadius: 12,
    borderWidth: 1,
    color: colors.text,
    fontSize: 17,
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
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
})
