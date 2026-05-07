import { ApiErrorResponse } from '@/src/modules/auth/types/authTypes'
import { GroupDetailsResponse, GroupListResponse, GroupResponse } from '@/src/modules/groups/types/groupTypes'
import { apiClient } from '@/src/shared/api/client'
import { isAxiosError } from 'axios'

export async function listGroups() {
  const response = await apiClient.get<GroupListResponse>('/v1/groups')
  return response.data.data.groups
}

export async function createGroup(name: string) {
  const response = await apiClient.post<GroupResponse>('/v1/groups', { name })
  return response.data.data.group
}

export async function getGroup(groupID: string) {
  const response = await apiClient.get<GroupDetailsResponse>(`/v1/groups/${groupID}`)
  return response.data.data
}

export function getGroupsErrorMessage(error: unknown) {
  if (isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.error?.message ?? 'Unable to load your groups. Please try again.'
  }

  return 'Unable to load your groups. Please try again.'
}

export function isUnauthorizedGroupsError(error: unknown) {
  return isAxiosError(error) && error.response?.status === 401
}
