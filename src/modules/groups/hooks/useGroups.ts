import { useFocusEffect } from '@react-navigation/native'
import { router } from 'expo-router'
import { useCallback, useEffect, useRef, useState } from 'react'
import { AuthUser } from '@/src/modules/auth/types/authTypes'
import { clearAuthSession, getAuthSession } from '@/src/modules/auth/services/authSession'
import {
  getExpense,
  getExpenseLoadErrorMessage,
  isUnauthorizedExpenseError,
  listGroupExpenses,
} from '@/src/modules/expense/api/expenseApi'
import { Expense, ExpenseListPagination, ExpenseParticipant } from '@/src/modules/expense/types/expenseTypes'
import {
  addGroupMember,
  createGroup,
  getGroup,
  getGroupsErrorMessage,
  isUnauthorizedGroupsError,
  listGroups,
  removeGroupMember,
} from '@/src/modules/groups/api/groupsApi'
import { Group, GroupMember } from '@/src/modules/groups/types/groupTypes'
import { searchUsersByUsername } from '@/src/modules/users/api/usersApi'

type SelectedGroup = {
  group: Group
  members: GroupMember[]
}

type SelectedExpense = {
  expense: Expense
  participants: ExpenseParticipant[]
}

type RemovingMember = {
  groupID: string
  userID: string
}

const expensePageSize = 20

export function useGroups() {
  const [groups, setGroups] = useState<Group[]>([])
  const [error, setError] = useState<string | null>(null)
  const [memberError, setMemberError] = useState<string | null>(null)
  const [groupName, setGroupName] = useState('')
  const [memberUsername, setMemberUsername] = useState('')
  const [memberSearchResults, setMemberSearchResults] = useState<AuthUser[]>([])
  const [pendingMemberUsers, setPendingMemberUsers] = useState<AuthUser[]>([])
  const [peopleQuery, setPeopleQuery] = useState('')
  const [peopleSearchResults, setPeopleSearchResults] = useState<AuthUser[]>([])
  const [currentUserID, setCurrentUserID] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [isLoadingExpenseDetails, setIsLoadingExpenseDetails] = useState(false)
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(false)
  const [isAddingMember, setIsAddingMember] = useState(false)
  const [removingMember, setRemovingMember] = useState<RemovingMember | null>(null)
  const [isSearchingMembers, setIsSearchingMembers] = useState(false)
  const [isSearchingPeople, setIsSearchingPeople] = useState(false)
  const [groupExpenses, setGroupExpenses] = useState<Expense[]>([])
  const [groupExpensePagination, setGroupExpensePagination] = useState<ExpenseListPagination | null>(null)
  const [hasLoadedGroupExpenses, setHasLoadedGroupExpenses] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<SelectedExpense | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<SelectedGroup | null>(null)
  const selectedGroupIDRef = useRef<string | null>(null)

  const canManageMembers = Boolean(
    currentUserID &&
    selectedGroup?.members.some((member) => member.user_id === currentUserID && member.role === 'owner'),
  )
  const removingMemberID =
    removingMember && removingMember.groupID === selectedGroup?.group.id ? removingMember.userID : null
  const isRemovingMember = Boolean(removingMember)
  const isMutatingMembers = isAddingMember || isRemovingMember

  const loadGroups = useCallback(async () => {
    setError(null)
    setIsLoading(true)

    const session = await getAuthSession()
    if (!session) {
      router.replace('/login')
      return
    }
    setCurrentUserID(session.user.id)

    try {
      setGroups(await listGroups())
    } catch (caughtError) {
      // A 401 means the stored session is no longer usable, so clear it before returning to auth.
      if (isUnauthorizedGroupsError(caughtError) || isUnauthorizedExpenseError(caughtError)) {
        await clearAuthSession()
        router.replace('/login')
        return
      }

      setError(getGroupsErrorMessage(caughtError))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      void loadGroups()
    }, [loadGroups]),
  )

  useEffect(() => {
    const query = memberUsername.trim().toLowerCase()

    if (!isDetailsOpen || query.length < 2) {
      setMemberSearchResults([])
      setIsSearchingMembers(false)
      return
    }

    let isActive = true
    setIsSearchingMembers(true)

    const timer = setTimeout(() => {
      searchUsersByUsername(query)
        .then((users) => {
          if (isActive) {
            setMemberSearchResults(
              users.filter(
                (user) =>
                  !selectedGroup?.members.some((member) => member.user_id === user.id) &&
                  !pendingMemberUsers.some((pendingUser) => pendingUser.id === user.id),
              ),
            )
          }
        })
        .catch(() => {
          if (isActive) {
            setMemberSearchResults([])
          }
        })
        .finally(() => {
          if (isActive) {
            setIsSearchingMembers(false)
          }
        })
    }, 250)

    return () => {
      isActive = false
      clearTimeout(timer)
    }
  }, [isDetailsOpen, memberUsername, pendingMemberUsers, selectedGroup?.members])

  useEffect(() => {
    const query = peopleQuery.trim().toLowerCase()

    if (query.length < 2) {
      setPeopleSearchResults([])
      setIsSearchingPeople(false)
      return
    }

    let isActive = true
    setIsSearchingPeople(true)

    const timer = setTimeout(() => {
      searchUsersByUsername(query)
        .then((users) => {
          if (isActive) {
            setPeopleSearchResults(users)
          }
        })
        .catch(() => {
          if (isActive) {
            setPeopleSearchResults([])
          }
        })
        .finally(() => {
          if (isActive) {
            setIsSearchingPeople(false)
          }
        })
    }, 250)

    return () => {
      isActive = false
      clearTimeout(timer)
    }
  }, [peopleQuery])

  async function submitGroup() {
    const trimmedName = groupName.trim()
    if (!trimmedName) {
      setError('Group name is required.')
      return
    }

    setError(null)
    setIsCreating(true)

    try {
      const created = await createGroup(trimmedName)
      // Optimistically place the new group first so the list reflects creation without another fetch.
      setGroups((current) => [created, ...current.filter((group) => group.id !== created.id)])
      setGroupName('')
      setIsCreateOpen(false)
    } catch (caughtError) {
      if (isUnauthorizedGroupsError(caughtError)) {
        await clearAuthSession()
        router.replace('/login')
        return
      }

      setError(getGroupsErrorMessage(caughtError))
    } finally {
      setIsCreating(false)
    }
  }

  async function openGroupDetails(group: Group) {
    selectedGroupIDRef.current = group.id
    setIsDetailsOpen(true)
    setIsLoadingDetails(true)
    setIsLoadingExpenseDetails(false)
    setIsLoadingExpenses(false)
    setIsAddingMember(false)
    setGroupExpenses([])
    setGroupExpensePagination(null)
    setHasLoadedGroupExpenses(false)
    setMemberError(null)
    setMemberUsername('')
    setMemberSearchResults([])
    setPendingMemberUsers([])
    setSelectedExpense(null)
    setSelectedGroup({ group, members: [] })

    const session = await getAuthSession()
    if (!session) {
      router.replace('/login')
      return
    }
    setCurrentUserID(session.user.id)

    try {
      const details = await getGroup(group.id)
      if (selectedGroupIDRef.current === group.id) {
        setSelectedGroup(details)
      }
    } catch (caughtError) {
      if (isUnauthorizedGroupsError(caughtError) || isUnauthorizedExpenseError(caughtError)) {
        await clearAuthSession()
        router.replace('/login')
        return
      }

      if (selectedGroupIDRef.current === group.id) {
        setMemberError(getGroupsErrorMessage(caughtError))
      }
    } finally {
      if (selectedGroupIDRef.current === group.id) {
        setIsLoadingDetails(false)
      }
    }
  }

  function closeGroupDetails() {
    selectedGroupIDRef.current = null
    setIsDetailsOpen(false)
    setIsLoadingDetails(false)
    setIsLoadingExpenseDetails(false)
    setIsLoadingExpenses(false)
    setIsAddingMember(false)
    setSelectedGroup(null)
    setMemberError(null)
    setMemberUsername('')
    setMemberSearchResults([])
    setPendingMemberUsers([])
    setGroupExpenses([])
    setGroupExpensePagination(null)
    setHasLoadedGroupExpenses(false)
    setSelectedExpense(null)
  }

  async function loadGroupExpenses(page = 1) {
    if (!selectedGroup || isLoadingExpenses) {
      return
    }

    const groupID = selectedGroup.group.id
    setIsLoadingExpenses(true)
    setMemberError(null)

    try {
      const result = await listGroupExpenses(groupID, {
        page,
        perPage: expensePageSize,
      })
      if (selectedGroupIDRef.current === groupID) {
        setGroupExpenses((current) => (page === 1 ? result.expenses : [...current, ...result.expenses]))
        setGroupExpensePagination(result.pagination)
        setHasLoadedGroupExpenses(true)
      }
    } catch (caughtError) {
      if (isUnauthorizedExpenseError(caughtError)) {
        await clearAuthSession()
        router.replace('/login')
        return
      }

      if (selectedGroupIDRef.current === groupID) {
        setMemberError(getExpenseLoadErrorMessage(caughtError))
      }
    } finally {
      if (selectedGroupIDRef.current === groupID) {
        setIsLoadingExpenses(false)
      }
    }
  }

  function loadNextGroupExpenses() {
    if (!groupExpensePagination || groupExpensePagination.page >= groupExpensePagination.total_pages) {
      return
    }

    void loadGroupExpenses(groupExpensePagination.page + 1)
  }

  async function openExpenseDetails(expense: Expense) {
    const groupID = selectedGroup?.group.id
    if (!groupID) {
      return
    }

    setIsLoadingExpenseDetails(true)
    setMemberError(null)

    try {
      const details = await getExpense(expense.id)
      if (selectedGroupIDRef.current === groupID) {
        setSelectedExpense({ expense: details.expense, participants: details.participants })
      }
    } catch (caughtError) {
      if (isUnauthorizedExpenseError(caughtError)) {
        await clearAuthSession()
        router.replace('/login')
        return
      }

      if (selectedGroupIDRef.current === groupID) {
        setMemberError(getExpenseLoadErrorMessage(caughtError))
      }
    } finally {
      if (selectedGroupIDRef.current === groupID) {
        setIsLoadingExpenseDetails(false)
      }
    }
  }

  function closeExpenseDetails() {
    setSelectedExpense(null)
  }

  function selectMemberUser(user: AuthUser) {
    const isAlreadyMember = selectedGroup?.members.some((member) => member.user_id === user.id)
    const isAlreadyPending = pendingMemberUsers.some((pendingUser) => pendingUser.id === user.id)
    if (isAlreadyMember || isAlreadyPending) {
      return
    }

    setPendingMemberUsers((current) => [...current, user])
    setMemberUsername('')
    setMemberSearchResults([])
    setMemberError(null)
  }

  function removePendingMember(userID: string) {
    setPendingMemberUsers((current) => current.filter((user) => user.id !== userID))
  }

  function updateMemberUsername(value: string) {
    setMemberUsername(value)
  }

  async function submitMember() {
    if (!selectedGroup || isRemovingMember) {
      return
    }
    if (pendingMemberUsers.length === 0) {
      setMemberError('Select at least one user to add.')
      return
    }

    const groupID = selectedGroup.group.id
    setMemberError(null)
    setIsAddingMember(true)

    try {
      const failedUsers: AuthUser[] = []
      for (const user of pendingMemberUsers) {
        try {
          await addGroupMember(groupID, user.username)
        } catch (caughtError) {
          if (isUnauthorizedGroupsError(caughtError)) {
            await clearAuthSession()
            router.replace('/login')
            return
          }

          failedUsers.push(user)
        }
      }

      const details = await getGroup(groupID)
      if (selectedGroupIDRef.current === groupID) {
        setSelectedGroup(details)
        setMemberUsername('')
        setMemberSearchResults([])
        setPendingMemberUsers(failedUsers)

        if (failedUsers.length > 0) {
          setMemberError(`Could not add: ${failedUsers.map((user) => `@${user.username}`).join(', ')}`)
        }
      }
    } catch (caughtError) {
      if (isUnauthorizedGroupsError(caughtError)) {
        await clearAuthSession()
        router.replace('/login')
        return
      }

      if (selectedGroupIDRef.current === groupID) {
        setMemberError(getGroupsErrorMessage(caughtError))
      }
    } finally {
      if (selectedGroupIDRef.current === groupID) {
        setIsAddingMember(false)
      }
    }
  }

  async function removeMember(member: GroupMember) {
    if (!selectedGroup || member.role === 'owner' || isMutatingMembers) {
      return
    }

    const groupID = selectedGroup.group.id
    setMemberError(null)
    setRemovingMember({ groupID, userID: member.user_id })

    try {
      await removeGroupMember(groupID, member.user_id)
      setSelectedGroup((current) =>
        current?.group.id === groupID
          ? {
              ...current,
              members: current.members.filter((currentMember) => currentMember.user_id !== member.user_id),
            }
          : current,
      )
    } catch (caughtError) {
      if (isUnauthorizedGroupsError(caughtError)) {
        await clearAuthSession()
        router.replace('/login')
        return
      }

      if (selectedGroupIDRef.current === groupID) {
        setMemberError(getGroupsErrorMessage(caughtError))
      }
    } finally {
      setRemovingMember((current) =>
        current?.groupID === groupID && current.userID === member.user_id ? null : current,
      )
    }
  }

  return {
    canManageMembers,
    closeExpenseDetails,
    closeGroupDetails,
    error,
    groupName,
    groupExpensePagination,
    groupExpenses,
    groups,
    hasLoadedGroupExpenses,
    isAddingMember,
    isCreateOpen,
    isCreating,
    isDetailsOpen,
    isLoading,
    isLoadingDetails,
    isLoadingExpenseDetails,
    isLoadingExpenses,
    isMutatingMembers,
    isSearchingMembers,
    isSearchingPeople,
    loadGroups,
    memberError,
    memberSearchResults,
    memberUsername,
    loadGroupExpenses,
    loadNextGroupExpenses,
    openExpenseDetails,
    openGroupDetails,
    peopleQuery,
    peopleSearchResults,
    pendingMemberUsers,
    removeMember,
    removePendingMember,
    removingMemberID,
    selectMemberUser,
    selectedExpense,
    selectedGroup,
    setGroupName,
    setIsCreateOpen,
    setMemberUsername: updateMemberUsername,
    setPeopleQuery,
    submitMember,
    submitGroup,
  }
}
