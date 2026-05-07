import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useState } from 'react'
import { ActivityIndicator, Pressable, Text, View } from 'react-native'
import { logout } from '@/src/modules/auth/api/authApi'
import { clearAuthSession } from '@/src/modules/auth/services/authSession'
import { settingsItems } from '@/src/modules/settings/data/settingsData'
import { styles } from '@/src/modules/settings/screens/SettingsScreen.styles'
import { AppHeader } from '@/src/shared/components/AppHeader'
import { Card } from '@/src/shared/components/Card'
import { Screen } from '@/src/shared/components/Screen'
import { colors } from '@/src/shared/theme/colors'

export function SettingsScreen() {
  const [isSigningOut, setIsSigningOut] = useState(false)

  async function signOut() {
    if (isSigningOut) {
      return
    }

    setIsSigningOut(true)

    try {
      await logout()
    } catch {
      // Still clear the local session so stale or unreachable server sessions do not trap the user.
    } finally {
      await clearAuthSession()
      setIsSigningOut(false)
      router.replace('/login')
    }
  }

  return (
    <Screen contentStyle={styles.content}>
      <AppHeader />
      <View style={styles.inner}>
        <Text style={styles.title}>Settings</Text>
        <Card style={styles.settingsCard}>
          {settingsItems.map((item, index) => (
            <View key={item.label}>
              <Pressable style={styles.settingRow}>
                <View style={[styles.iconCircle, { backgroundColor: item.bg }]}>
                  <Ionicons color={item.color} name={item.icon} size={28} />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>{item.label}</Text>
                  <Text style={styles.settingSublabel}>{item.sublabel}</Text>
                </View>
                <Ionicons color={colors.textSoft} name="chevron-forward" size={28} />
              </Pressable>
              {index < settingsItems.length - 1 ? <View style={styles.divider} /> : null}
            </View>
          ))}

          <View style={styles.divider} />
          <View style={styles.settingRow}>
            <View style={[styles.iconCircle, { backgroundColor: colors.surfaceVariant }]}>
              <Ionicons color={colors.text} name="moon-outline" size={28} />
            </View>
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Dark Theme</Text>
              <Text style={styles.settingSublabel}>Match system default</Text>
            </View>
            <View style={styles.toggle}>
              <View style={styles.toggleKnob} />
            </View>
          </View>
        </Card>

        <Pressable disabled={isSigningOut} onPress={signOut} style={[styles.signOut, isSigningOut && styles.disabled]}>
          {isSigningOut ? (
            <ActivityIndicator color={colors.danger} />
          ) : (
            <Ionicons color={colors.danger} name="log-out-outline" size={28} />
          )}
          <Text style={styles.signOutText}>{isSigningOut ? 'Signing Out' : 'Sign Out'}</Text>
        </Pressable>
        <Text style={styles.version}>App Version 2.4.1 (Build 890)</Text>
      </View>
    </Screen>
  )
}
