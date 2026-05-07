import { ApiErrorResponse, AuthUser } from '@/src/modules/auth/types/authTypes'
import { apiClient } from '@/src/shared/api/client'
import { isAxiosError } from 'axios'

type UserResponse = {
  success: true
  data: {
    user: AuthUser
  }
}

type UserSearchResponse = {
  success: true
  data: {
    users: AuthUser[]
  }
}

export async function searchUsersByUsername(username: string) {
  const response = await apiClient.get<UserSearchResponse>('/v1/users/search', {
    params: { username },
  })
  return response.data.data.users
}

export async function updateUsername(username: string) {
  const response = await apiClient.patch<UserResponse>('/v1/users/me', { username })
  return response.data.data.user
}

export function getUserErrorMessage(error: unknown) {
  if (isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.error?.message ?? 'Unable to update user. Please try again.'
  }

  return 'Unable to update user. Please try again.'
}
