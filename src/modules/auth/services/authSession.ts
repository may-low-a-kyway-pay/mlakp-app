import { AuthRefreshData, AuthTokenData } from '@/src/modules/auth/types/authTypes'
import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'

type StoredAuth = {
  accessToken: string
  expiresAt: string
  refreshToken: string
  tokenType: 'Bearer'
  user: AuthTokenData['user']
}

type AuthSessionListener = (session: StoredAuth | null) => void

const authStorageKey = 'mlakp.auth'

let memoryAuth: StoredAuth | null = null
let isClearingAuth = false
const authSessionListeners = new Set<AuthSessionListener>()

function notifyAuthSessionListeners() {
  for (const listener of authSessionListeners) {
    listener(memoryAuth)
  }
}

export function subscribeAuthSession(listener: AuthSessionListener) {
  authSessionListeners.add(listener)
  return () => {
    authSessionListeners.delete(listener)
  }
}

function canUseLocalStorage() {
  return Platform.OS === 'web' && typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

async function readStoredAuth() {
  if (canUseLocalStorage()) {
    return window.localStorage.getItem(authStorageKey)
  }

  if (await SecureStore.isAvailableAsync()) {
    return SecureStore.getItemAsync(authStorageKey)
  }

  return null
}

async function writeStoredAuth(session: StoredAuth) {
  const serializedSession = JSON.stringify(session)

  if (canUseLocalStorage()) {
    window.localStorage.setItem(authStorageKey, serializedSession)
    return
  }

  if (await SecureStore.isAvailableAsync()) {
    await SecureStore.setItemAsync(authStorageKey, serializedSession)
  }
}

async function removeStoredAuth() {
  if (canUseLocalStorage()) {
    window.localStorage.removeItem(authStorageKey)
    return
  }

  if (await SecureStore.isAvailableAsync()) {
    await SecureStore.deleteItemAsync(authStorageKey)
  }
}

export async function saveAuthSession(data: AuthTokenData) {
  memoryAuth = {
    accessToken: data.access_token,
    expiresAt: data.expires_at,
    refreshToken: data.refresh_token,
    tokenType: data.token_type,
    user: data.user,
  }

  await writeStoredAuth(memoryAuth)
  notifyAuthSessionListeners()
}

export async function updateAuthTokens(data: AuthRefreshData) {
  const session = await getAuthSession()
  if (!session) {
    return null
  }

  memoryAuth = {
    ...session,
    accessToken: data.access_token,
    expiresAt: data.expires_at,
    refreshToken: data.refresh_token,
    tokenType: data.token_type,
  }

  await writeStoredAuth(memoryAuth)
  notifyAuthSessionListeners()

  return memoryAuth
}

export async function updateStoredUser(user: StoredAuth['user']) {
  const session = await getAuthSession()
  if (!session) {
    return
  }

  memoryAuth = {
    ...session,
    user,
  }

  await writeStoredAuth(memoryAuth)
  notifyAuthSessionListeners()
}

export async function getAuthSession() {
  if (isClearingAuth) {
    return null
  }
  if (memoryAuth) {
    return memoryAuth
  }

  const rawSession = await readStoredAuth()
  if (!rawSession) {
    return null
  }

  try {
    memoryAuth = JSON.parse(rawSession) as StoredAuth
    return memoryAuth
  } catch {
    // Drop corrupted persisted auth instead of repeatedly failing every API request.
    await removeStoredAuth()
    return null
  }
}

export async function getAccessToken() {
  const session = await getAuthSession()
  return session?.accessToken ?? null
}

export async function getRefreshToken() {
  const session = await getAuthSession()
  return session?.refreshToken ?? null
}

export async function clearAuthSession() {
  isClearingAuth = true
  memoryAuth = null

  try {
    await removeStoredAuth()
  } finally {
    isClearingAuth = false
    notifyAuthSessionListeners()
  }
}
