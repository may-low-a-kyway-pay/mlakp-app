import { AuthTokenData } from '@/src/modules/auth/types/authTypes'

type StoredAuth = {
  accessToken: string
  expiresAt: string
  refreshToken: string
  tokenType: 'Bearer'
  user: AuthTokenData['user']
}

const authStorageKey = 'mlakp.auth'

let memoryAuth: StoredAuth | null = null

function canUseLocalStorage() {
  // React Native native runtimes do not expose window.localStorage; keep in-memory auth as the safe fallback.
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

export async function saveAuthSession(data: AuthTokenData) {
  memoryAuth = {
    accessToken: data.access_token,
    expiresAt: data.expires_at,
    refreshToken: data.refresh_token,
    tokenType: data.token_type,
    user: data.user,
  }

  if (canUseLocalStorage()) {
    window.localStorage.setItem(authStorageKey, JSON.stringify(memoryAuth))
  }
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

  if (canUseLocalStorage()) {
    window.localStorage.setItem(authStorageKey, JSON.stringify(memoryAuth))
  }
}

export async function getAuthSession() {
  if (memoryAuth) {
    return memoryAuth
  }

  if (!canUseLocalStorage()) {
    return null
  }

  const rawSession = window.localStorage.getItem(authStorageKey)
  if (!rawSession) {
    return null
  }

  try {
    memoryAuth = JSON.parse(rawSession) as StoredAuth
    return memoryAuth
  } catch {
    // Drop corrupted persisted auth instead of repeatedly failing every API request.
    window.localStorage.removeItem(authStorageKey)
    return null
  }
}

export async function getAccessToken() {
  const session = await getAuthSession()
  return session?.accessToken ?? null
}

export async function clearAuthSession() {
  memoryAuth = null

  if (canUseLocalStorage()) {
    window.localStorage.removeItem(authStorageKey)
  }
}
