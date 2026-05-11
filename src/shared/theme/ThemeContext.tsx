import * as SecureStore from 'expo-secure-store'
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react'
import { Platform, useColorScheme } from 'react-native'

import { AppTheme, appThemes } from '@/src/shared/theme/colors'

export type ThemePreference = 'system' | 'light' | 'dark'

type ThemeContextValue = AppTheme & {
  isReady: boolean
  preference: ThemePreference
  setPreference: (preference: ThemePreference) => Promise<void>
  toggleDarkMode: () => Promise<void>
}

const themePreferenceKey = 'mlakp.themePreference'

const ThemeContext = createContext<ThemeContextValue | null>(null)

function isThemePreference(value: string | null): value is ThemePreference {
  return value === 'system' || value === 'light' || value === 'dark'
}

async function getStoredPreference() {
  if (Platform.OS === 'web') {
    return globalThis.localStorage?.getItem(themePreferenceKey) ?? null
  }

  if (!(await SecureStore.isAvailableAsync())) {
    return null
  }

  return SecureStore.getItemAsync(themePreferenceKey)
}

async function saveStoredPreference(preference: ThemePreference) {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.setItem(themePreferenceKey, preference)
    return
  }

  if (await SecureStore.isAvailableAsync()) {
    await SecureStore.setItemAsync(themePreferenceKey, preference)
  }
}

export function AppThemeProvider({ children }: PropsWithChildren) {
  const systemScheme = useColorScheme()
  const [preference, setPreferenceState] = useState<ThemePreference>('system')
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadPreference() {
      const storedPreference = await getStoredPreference()

      if (isMounted) {
        setPreferenceState(isThemePreference(storedPreference) ? storedPreference : 'system')
        setIsReady(true)
      }
    }

    loadPreference()

    return () => {
      isMounted = false
    }
  }, [])

  const resolvedScheme = preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference
  const theme = appThemes[resolvedScheme]

  const value = useMemo<ThemeContextValue>(
    () => ({
      ...theme,
      isReady,
      preference,
      setPreference: async (nextPreference: ThemePreference) => {
        setPreferenceState(nextPreference)
        await saveStoredPreference(nextPreference)
      },
      toggleDarkMode: async () => {
        const nextPreference: ThemePreference = theme.dark ? 'light' : 'dark'
        setPreferenceState(nextPreference)
        await saveStoredPreference(nextPreference)
      },
    }),
    [isReady, preference, theme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useAppTheme() {
  const value = useContext(ThemeContext)

  if (!value) {
    throw new Error('useAppTheme must be used inside AppThemeProvider')
  }

  return value
}
