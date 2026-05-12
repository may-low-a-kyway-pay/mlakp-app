import { ApiErrorResponse } from '@/src/modules/auth/types/authTypes'
import {
  NotificationReadResponse,
  NotificationsReadAllResponse,
  NotificationsResponse,
} from '@/src/modules/notifications/types/notificationTypes'
import { apiClient } from '@/src/shared/api/client'
import { isAxiosError } from 'axios'

export async function listNotifications(limit = 50) {
  const response = await apiClient.get<NotificationsResponse>('/v1/notifications', {
    params: { limit },
  })
  return response.data.data
}

export async function markNotificationRead(notificationID: string) {
  const response = await apiClient.post<NotificationReadResponse>(`/v1/notifications/${notificationID}/read`)
  return response.data.data
}

export async function markAllNotificationsRead() {
  const response = await apiClient.post<NotificationsReadAllResponse>('/v1/notifications/read-all')
  return response.data.data
}

export function getNotificationErrorMessage(error: unknown) {
  if (isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.error?.message ?? 'Unable to load notifications. Please try again.'
  }

  return 'Unable to load notifications. Please try again.'
}

export function isUnauthorizedNotificationError(error: unknown) {
  return isAxiosError(error) && error.response?.status === 401
}
