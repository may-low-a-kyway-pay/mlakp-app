import { Redirect } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'

import { getAuthSession } from '@/src/modules/auth/services/authSession'
import { useAppTheme } from '@/src/shared/theme/ThemeContext'

export default function WebAppEntryScreen() {
  const { colors } = useAppTheme()
  const [hasSession, setHasSession] = useState<boolean | null>(null)

  useEffect(() => {
    let mounted = true

    void getAuthSession().then((session) => {
      if (mounted) {
        setHasSession(Boolean(session))
      }
    })

    return () => {
      mounted = false
    }
  }, [])

  if (hasSession === null) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    )
  }

  return <Redirect href={hasSession ? '/dashboard' : '/login'} />
}

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
})
