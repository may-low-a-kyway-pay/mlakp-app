import { useFocusEffect } from '@react-navigation/native'
import { router } from 'expo-router'
import { useCallback, useMemo, useState } from 'react'
import { clearAuthSession, getAuthSession } from '@/src/modules/auth/services/authSession'
import { AuthUser } from '@/src/modules/auth/types/authTypes'
import { ExpenseSplitType } from '@/src/modules/expense/types/expenseTypes'
import { createExpense, getExpenseErrorMessage } from '@/src/modules/expense/api/expenseApi'
import {
  getGroup,
  getGroupsErrorMessage,
  isUnauthorizedGroupsError,
  listGroups,
} from '@/src/modules/groups/api/groupsApi'
import { Group, GroupMember } from '@/src/modules/groups/types/groupTypes'
import { displayNameForMember } from '@/src/modules/groups/utils/memberFormatters'

const defaultCurrency = 'THB'

type SplitParticipant = {
  id: string
  name: string
}

function parseAmountMinor(value: string) {
  const trimmed = value.trim()
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) {
    return null
  }

  const [whole, decimal = ''] = trimmed.split('.')
  return Number(whole) * 100 + Number(decimal.padEnd(2, '0'))
}

function formatAmount(minor: number) {
  return (minor / 100).toFixed(2)
}

export function useAddExpense() {
  const [amount, setAmount] = useState('')
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [groups, setGroups] = useState<Group[]>([])
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [isLoadingMembers, setIsLoadingMembers] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [members, setMembers] = useState<GroupMember[]>([])
  const [shareAmounts, setShareAmounts] = useState<Record<string, string>>({})
  const [selectedGroupID, setSelectedGroupID] = useState<string | null>(null)
  const [selectedUserIDs, setSelectedUserIDs] = useState<string[]>([])
  const [splitType, setSplitType] = useState<ExpenseSplitType>('equal')
  const [title, setTitle] = useState('')

  const loadMembers = useCallback(
    async (groupIDOverride?: string) => {
      setError(null)
      setIsLoadingMembers(true)

      const session = await getAuthSession()
      if (!session) {
        router.replace('/login')
        return
      }

      setCurrentUser(session.user)

      try {
        const loadedGroups = await listGroups()
        setGroups(loadedGroups)

        const activeGroupID = groupIDOverride ?? selectedGroupID ?? loadedGroups[0]?.id ?? null
        setSelectedGroupID(activeGroupID)

        if (!activeGroupID) {
          setMembers([])
          setSelectedUserIDs([])
          return
        }

        const details = await getGroup(activeGroupID)
        const debtorMembers = details.members.filter((member) => member.user_id !== session.user.id)

        setMembers(debtorMembers)
        setSelectedUserIDs((previous) => {
          const validIDs = new Set(debtorMembers.map((member) => member.user_id))
          return previous.filter((userID) => validIDs.has(userID))
        })
      } catch (caughtError) {
        if (isUnauthorizedGroupsError(caughtError)) {
          await clearAuthSession()
          router.replace('/login')
          return
        }

        setError(getGroupsErrorMessage(caughtError))
      } finally {
        setIsLoadingMembers(false)
      }
    },
    [selectedGroupID],
  )

  useFocusEffect(
    useCallback(() => {
      void loadMembers()
    }, [loadMembers]),
  )

  function selectGroup(groupID: string) {
    if (groupID === selectedGroupID) {
      return
    }

    setSelectedGroupID(groupID)
    setMembers([])
    setSelectedUserIDs([])
    setShareAmounts({})
    void loadMembers(groupID)
  }

  function toggleUser(userID: string) {
    setSelectedUserIDs((previous) =>
      previous.includes(userID) ? previous.filter((selectedID) => selectedID !== userID) : [...previous, userID],
    )
  }

  function setShareAmount(userID: string, value: string) {
    setShareAmounts((previous) => ({
      ...previous,
      [userID]: value,
    }))
  }

  const selectedParticipants = useMemo<SplitParticipant[]>(() => {
    return selectedUserIDs
      .map((userID) => members.find((member) => member.user_id === userID))
      .filter((member): member is GroupMember => Boolean(member))
      .map((member) => ({
        id: member.user_id,
        name: displayNameForMember(member),
      }))
  }, [members, selectedUserIDs])

  const totalAmountMinor = useMemo(() => parseAmountMinor(amount), [amount])

  const exactSplitTotalMinor = useMemo(() => {
    return selectedParticipants.reduce((total, participant) => {
      const parsed = parseAmountMinor(shareAmounts[participant.id] ?? '')
      return parsed === null ? total : total + parsed
    }, 0)
  }, [selectedParticipants, shareAmounts])

  const exactRemainingAmount = useMemo(() => {
    if (totalAmountMinor === null) {
      return null
    }

    return formatAmount(totalAmountMinor - exactSplitTotalMinor)
  }, [exactSplitTotalMinor, totalAmountMinor])

  const exactSplitIsValid = useMemo(() => {
    if (splitType !== 'manual' || totalAmountMinor === null || totalAmountMinor <= 0) {
      return splitType === 'equal'
    }

    return (
      selectedParticipants.length > 0 &&
      selectedParticipants.every((participant) => {
        const parsed = parseAmountMinor(shareAmounts[participant.id] ?? '')
        return parsed !== null && parsed > 0
      }) &&
      exactSplitTotalMinor === totalAmountMinor
    )
  }, [exactSplitTotalMinor, selectedParticipants, shareAmounts, splitType, totalAmountMinor])

  const canSubmit = useMemo(() => {
    return Boolean(
      currentUser &&
      selectedGroupID &&
      title.trim() &&
      totalAmountMinor !== null &&
      totalAmountMinor > 0 &&
      selectedUserIDs.length > 0 &&
      exactSplitIsValid &&
      !isSubmitting,
    )
  }, [currentUser, exactSplitIsValid, isSubmitting, selectedGroupID, selectedUserIDs.length, title, totalAmountMinor])

  async function submit() {
    if (!currentUser || !selectedGroupID) {
      setError('Choose a group before creating an expense.')
      return
    }

    if (!canSubmit) {
      setError('Enter a valid amount, title, and at least one participant.')
      return
    }

    setError(null)
    setIsSubmitting(true)

    try {
      const participants = selectedParticipants.map((participant) => ({
        user_id: participant.id,
        ...(splitType === 'manual' ? { share_amount: Number(shareAmounts[participant.id]).toFixed(2) } : {}),
      }))

      await createExpense({
        group_id: selectedGroupID,
        title: title.trim(),
        total_amount: Number(amount).toFixed(2),
        currency: defaultCurrency,
        paid_by: currentUser.id,
        split_type: splitType,
        participants,
      })

      router.back()
    } catch (caughtError) {
      setError(getExpenseErrorMessage(caughtError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    amount,
    canSubmit,
    currentUser,
    error,
    exactRemainingAmount,
    exactSplitTotalAmount: formatAmount(exactSplitTotalMinor),
    groups,
    isLoadingMembers,
    isPickerOpen,
    isSubmitting,
    members,
    refresh: loadMembers,
    selectGroup,
    selectedParticipants,
    selectedGroupID,
    selectedUserIDs,
    setAmount,
    setIsPickerOpen,
    setShareAmount,
    setSplitType,
    setTitle,
    shareAmounts,
    splitType,
    submit,
    title,
    toggleUser,
  }
}
