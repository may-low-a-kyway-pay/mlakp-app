import { useFocusEffect } from '@react-navigation/native'
import { router } from 'expo-router'
import { useCallback, useState } from 'react'
import { clearAuthSession, getAuthSession } from '@/src/modules/auth/services/authSession'
import {
  createGroup,
  getGroupsErrorMessage,
  isUnauthorizedGroupsError,
  listGroups,
} from '@/src/modules/groups/api/groupsApi'
import { Group } from '@/src/modules/groups/types/groupTypes'

export function useGroups() {
  const [groups, setGroups] = useState<Group[]>([])
  const [error, setError] = useState<string | null>(null)
  const [groupName, setGroupName] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const loadGroups = useCallback(async () => {
    setError(null)
    setIsLoading(true)

    const session = await getAuthSession()
    if (!session) {
      router.replace('/login')
      return
    }

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

  return {
    error,
    groupName,
    groups,
    isCreateOpen,
    isCreating,
    isLoading,
    loadGroups,
    setGroupName,
    setIsCreateOpen,
    submitGroup,
  }
}
