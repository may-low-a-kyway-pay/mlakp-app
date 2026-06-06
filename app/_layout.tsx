import { Caveat_700Bold } from '@expo-google-fonts/caveat'
import { PTSans_400Regular, PTSans_700Bold } from '@expo-google-fonts/pt-sans'
import { useFonts } from '@expo-google-fonts/pt-sans/useFonts'
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useEffect, useState } from 'react'
import 'react-native-reanimated'

import { getAuthSession, subscribeAuthSession } from '@/src/modules/auth/services/authSession'
import { NotificationsProvider } from '@/src/modules/notifications/context/NotificationsProvider'
import { AppUpdateGate } from '@/src/modules/updates/components/AppUpdateGate'
import { AppThemeProvider, useAppTheme } from '@/src/shared/theme/ThemeContext'

export const unstable_settings = {
  initialRouteName: 'index',
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Caveat_700Bold,
    PTSans_400Regular,
    PTSans_700Bold,
  })

  if (!fontsLoaded) {
    return null
  }

  return (
    <AppThemeProvider>
      <RootNavigator />
    </AppThemeProvider>
  )
}

function RootNavigator() {
  const { colors, dark } = useAppTheme()
  const [hasSession, setHasSession] = useState<boolean | null>(null)
  const baseTheme = dark ? DarkTheme : DefaultTheme
  const navigationTheme = {
    ...baseTheme,
    dark,
    colors: {
      ...baseTheme.colors,
      background: colors.background,
      border: colors.surfaceVariant,
      card: colors.surface,
      primary: colors.primary,
      text: colors.text,
    },
  }

  useEffect(() => {
    let sessionChanged = false

    void getAuthSession().then((session) => {
      if (!sessionChanged) {
        setHasSession(Boolean(session))
      }
    })

    return subscribeAuthSession((session) => {
      sessionChanged = true
      setHasSession(Boolean(session))
    })
  }, [])

  if (hasSession === null) {
    return null
  }

  return (
    <ThemeProvider value={navigationTheme}>
      <AppUpdateGate>
        <NotificationsProvider>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="web-app" options={{ headerShown: false }} />
            <Stack.Protected guard={!hasSession}>
              <Stack.Screen name="login" options={{ headerShown: false }} />
              <Stack.Screen name="register" options={{ headerShown: false }} />
              <Stack.Screen name="verify-email" options={{ headerShown: false }} />
            </Stack.Protected>
            <Stack.Screen name="reset-password" options={{ headerShown: false }} />
            <Stack.Protected guard={hasSession}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="add-expense" options={{ headerShown: false, presentation: 'modal' }} />
              <Stack.Screen name="debts" options={{ headerShown: false }} />
              <Stack.Screen name="notifications" options={{ animation: 'slide_from_right', headerShown: false }} />
            </Stack.Protected>
          </Stack>
          <StatusBar backgroundColor={colors.background} style={dark ? 'light' : 'dark'} />
        </NotificationsProvider>
      </AppUpdateGate>
    </ThemeProvider>
  )
}
