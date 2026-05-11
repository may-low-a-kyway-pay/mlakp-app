import { useFocusEffect } from '@react-navigation/native'
import { router } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { AuthUser } from '@/src/modules/auth/types/authTypes'
import { clearAuthSession, getAuthSession } from '@/src/modules/auth/services/authSession'
import {
  addGroupMember,
  createGroup,
  getGroup,
  getGroupsErrorMessage,
  isUnauthorizedGroupsError,
  listGroups,
} from '@/src/modules/groups/api/groupsApi'
import { Group, GroupMember } from '@/src/modules/groups/types/groupTypes'
import { searchUsersByUsername } from '@/src/modules/users/api/usersApi'

type SelectedGroup = {
  group: Group
  members: GroupMember[]
}

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
  const [isAddingMember, setIsAddingMember] = useState(false)
  const [isSearchingMembers, setIsSearchingMembers] = useState(false)
  const [isSearchingPeople, setIsSearchingPeople] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<SelectedGroup | null>(null)

  const canAddMembers = Boolean(
    currentUserID &&
    selectedGroup?.members.some((member) => member.user_id === currentUserID && member.role === 'owner'),
  )

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
      if (isUnauthorizedGroupsError(caughtError)) {
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
    setIsDetailsOpen(true)
    setIsLoadingDetails(true)
    setMemberError(null)
    setMemberUsername('')
    setMemberSearchResults([])
    setPendingMemberUsers([])
    setSelectedGroup({ group, members: [] })

    const session = await getAuthSession()
    if (!session) {
      router.replace('/login')
      return
    }
    setCurrentUserID(session.user.id)

    try {
      setSelectedGroup(await getGroup(group.id))
    } catch (caughtError) {
      if (isUnauthorizedGroupsError(caughtError)) {
        await clearAuthSession()
        router.replace('/login')
        return
      }

      setMemberError(getGroupsErrorMessage(caughtError))
    } finally {
      setIsLoadingDetails(false)
    }
  }

  function closeGroupDetails() {
    setIsDetailsOpen(false)
    setSelectedGroup(null)
    setMemberError(null)
    setMemberUsername('')
    setMemberSearchResults([])
    setPendingMemberUsers([])
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
    if (!selectedGroup) {
      return
    }
    if (pendingMemberUsers.length === 0) {
      setMemberError('Select at least one user to add.')
      return
    }

    setMemberError(null)
    setIsAddingMember(true)

    try {
      const failedUsers: AuthUser[] = []
      for (const user of pendingMemberUsers) {
        try {
          await addGroupMember(selectedGroup.group.id, user.username)
        } catch (caughtError) {
          if (isUnauthorizedGroupsError(caughtError)) {
            await clearAuthSession()
            router.replace('/login')
            return
          }

          failedUsers.push(user)
        }
      }

      const details = await getGroup(selectedGroup.group.id)
      setSelectedGroup(details)
      setMemberUsername('')
      setMemberSearchResults([])
      setPendingMemberUsers(failedUsers)

      if (failedUsers.length > 0) {
        setMemberError(`Could not add: ${failedUsers.map((user) => `@${user.username}`).join(', ')}`)
      }
    } catch (caughtError) {
      if (isUnauthorizedGroupsError(caughtError)) {
        await clearAuthSession()
        router.replace('/login')
        return
      }

      setMemberError(getGroupsErrorMessage(caughtError))
    } finally {
      setIsAddingMember(false)
    }
  }

  return {
    canAddMembers,
    closeGroupDetails,
    error,
    groupName,
    groups,
    isAddingMember,
    isCreateOpen,
    isCreating,
    isDetailsOpen,
    isLoading,
    isLoadingDetails,
    isSearchingMembers,
    isSearchingPeople,
    loadGroups,
    memberError,
    memberSearchResults,
    memberUsername,
    openGroupDetails,
    peopleQuery,
    peopleSearchResults,
    pendingMemberUsers,
    removePendingMember,
    selectMemberUser,
    selectedGroup,
    setGroupName,
    setIsCreateOpen,
    setMemberUsername: updateMemberUsername,
    setPeopleQuery,
    submitMember,
    submitGroup,
  }
}
