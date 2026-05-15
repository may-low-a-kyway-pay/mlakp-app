import { Redirect } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native'

import { getAuthSession } from '@/src/modules/auth/services/authSession'
import { LoginScreen } from '@/src/modules/auth/screens/LoginScreen'
import { DownloadLandingScreen } from '@/src/modules/landing/screens/DownloadLandingScreen'
import { useAppTheme } from '@/src/shared/theme/ThemeContext'

export default function IndexScreen() {
  if (Platform.OS === 'web') {
    return <DownloadLandingScreen />
  }

  return <NativeIndexScreen />
}

function NativeIndexScreen() {
  const { colors } = useAppTheme()
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const [hasSession, setHasSession] = useState(false)

  useEffect(() => {
    let isMounted = true

    getAuthSession()
      .then((session) => {
        if (isMounted) {
          setHasSession(Boolean(session))
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsCheckingSession(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  if (isCheckingSession) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    )
  }

  if (hasSession) {
    return <Redirect href="/dashboard" />
  }

  return <LoginScreen />
}

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
})
