import { AuthRefreshResponse } from '@/src/modules/auth/types/authTypes'
import {
  clearAuthSession,
  getAccessToken,
  getRefreshToken,
  updateAuthTokens,
} from '@/src/modules/auth/services/authSession'
import { create, isAxiosError } from 'axios'

declare module 'axios' {
  export interface AxiosRequestConfig {
    skipAuth?: boolean
    skipAuthRefresh?: boolean
    _authRetry?: boolean
  }
}

function requiredEnv(name: string, value: string | undefined) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

function requiredNumberEnv(name: string, rawValue: string | undefined) {
  const value = Number(requiredEnv(name, rawValue))

  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`Environment variable ${name} must be a positive number`)
  }

  return value
}

export const apiClient = create({
  baseURL: requiredEnv('EXPO_PUBLIC_API_BASE_URL', process.env.EXPO_PUBLIC_API_BASE_URL),
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: requiredNumberEnv('EXPO_PUBLIC_API_TIMEOUT_MS', process.env.EXPO_PUBLIC_API_TIMEOUT_MS),
})

let refreshPromise: Promise<string | null> | null = null

async function refreshAuthSession() {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshToken = await getRefreshToken()
      if (!refreshToken) {
        return null
      }

      const response = await apiClient.post<AuthRefreshResponse>(
        '/v1/auth/refresh',
        { refresh_token: refreshToken },
        { skipAuth: true, skipAuthRefresh: true },
      )
      const session = await updateAuthTokens(response.data.data)

      return session?.accessToken ?? null
    })().finally(() => {
      refreshPromise = null
    })
  }

  return refreshPromise
}

apiClient.interceptors.request.use(async (config) => {
  if (config.skipAuth) {
    return config
  }

  // Keep auth attachment centralized so feature modules only describe endpoint-specific payloads.
  const accessToken = await getAccessToken()

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!isAxiosError(error) || error.response?.status !== 401 || !error.config || error.config.skipAuthRefresh) {
      return Promise.reject(error)
    }

    const originalRequest = error.config
    if (originalRequest._authRetry) {
      await clearAuthSession()
      return Promise.reject(error)
    }

    originalRequest._authRetry = true

    try {
      const accessToken = await refreshAuthSession()
      if (!accessToken) {
        await clearAuthSession()
        return Promise.reject(error)
      }

      originalRequest.headers.Authorization = `Bearer ${accessToken}`
      return apiClient(originalRequest)
    } catch {
      await clearAuthSession()
      return Promise.reject(error)
    }
  },
)
