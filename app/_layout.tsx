import { Caveat_700Bold } from '@expo-google-fonts/caveat'
import { PTSans_400Regular, PTSans_700Bold } from '@expo-google-fonts/pt-sans'
import { useFonts } from '@expo-google-fonts/pt-sans/useFonts'
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import 'react-native-reanimated'

import { NotificationsProvider } from '@/src/modules/notifications/context/NotificationsProvider'
import { AppUpdateGate } from '@/src/modules/updates/components/AppUpdateGate'
import { AppThemeProvider, useAppTheme } from '@/src/shared/theme/ThemeContext'

export const unstable_settings = {
  initialRouteName: 'login',
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

  return (
    <ThemeProvider value={navigationTheme}>
      <AppUpdateGate>
        <NotificationsProvider>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="register" options={{ headerShown: false }} />
            <Stack.Screen name="verify-email" options={{ headerShown: false }} />
            <Stack.Screen name="reset-password" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="add-expense" options={{ headerShown: false, presentation: 'modal' }} />
            <Stack.Screen name="debts" options={{ headerShown: false }} />
            <Stack.Screen name="notifications" options={{ animation: 'slide_from_right', headerShown: false }} />
          </Stack>
          <StatusBar backgroundColor={colors.background} style={dark ? 'light' : 'dark'} />
        </NotificationsProvider>
      </AppUpdateGate>
    </ThemeProvider>
  )
}
