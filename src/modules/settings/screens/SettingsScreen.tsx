import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useState } from 'react'
import { ActivityIndicator, Modal, Pressable, Text, TextInput, View } from 'react-native'
import { logout } from '@/src/modules/auth/api/authApi'
import { clearAuthSession, getAuthSession, updateStoredUser } from '@/src/modules/auth/services/authSession'
import { settingsItems } from '@/src/modules/settings/data/settingsData'
import { styles } from '@/src/modules/settings/screens/SettingsScreen.styles'
import { getUserErrorMessage, updateUsername } from '@/src/modules/users/api/usersApi'
import { AppHeader } from '@/src/shared/components/AppHeader'
import { Card } from '@/src/shared/components/Card'
import { Screen } from '@/src/shared/components/Screen'
import { colors } from '@/src/shared/theme/colors'

export function SettingsScreen() {
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isSavingUsername, setIsSavingUsername] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [username, setUsername] = useState('')

  async function openProfile() {
    const session = await getAuthSession()
    setUsername(session?.user.username ?? '')
    setProfileError(null)
    setIsProfileOpen(true)
  }

  async function saveUsername() {
    const trimmedUsername = username.trim()
    if (!trimmedUsername) {
      setProfileError('Username is required.')
      return
    }

    setProfileError(null)
    setIsSavingUsername(true)

    try {
      const user = await updateUsername(trimmedUsername)
      await updateStoredUser(user)
      setIsProfileOpen(false)
    } catch (caughtError) {
      setProfileError(getUserErrorMessage(caughtError))
    } finally {
      setIsSavingUsername(false)
    }
  }

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
          {settingsItems.map((item, index) => {
            const isEnabled = item.action === 'profile'

            return (
              <View key={item.label}>
                <Pressable
                  disabled={!isEnabled}
                  onPress={isEnabled ? openProfile : undefined}
                  style={[styles.settingRow, !isEnabled && styles.settingRowDisabled]}
                >
                  <View style={[styles.iconCircle, { backgroundColor: item.bg }]}>
                    <Ionicons color={item.color} name={item.icon} size={24} />
                  </View>
                  <View style={styles.settingText}>
                    <Text style={styles.settingLabel}>{item.label}</Text>
                    <Text style={styles.settingSublabel}>{item.sublabel}</Text>
                  </View>
                  {isEnabled ? (
                    <Ionicons color={colors.textSoft} name="chevron-forward" size={24} />
                  ) : (
                    <View style={styles.trailingSpace} />
                  )}
                </Pressable>
                {index < settingsItems.length - 1 ? <View style={styles.divider} /> : null}
              </View>
            )
          })}

          <View style={styles.divider} />
          <View style={[styles.settingRow, styles.settingRowDisabled]}>
            <View style={[styles.iconCircle, { backgroundColor: colors.surfaceVariant }]}>
              <Ionicons color={colors.text} name="moon-outline" size={24} />
            </View>
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Dark Theme</Text>
              <Text style={styles.settingSublabel}>Match system default</Text>
            </View>
            <View style={[styles.toggle, styles.toggleDisabled]}>
              <View style={styles.toggleKnob} />
            </View>
          </View>
        </Card>

        <Pressable disabled={isSigningOut} onPress={signOut} style={[styles.signOut, isSigningOut && styles.disabled]}>
          {isSigningOut ? (
            <ActivityIndicator color={colors.danger} />
          ) : (
            <Ionicons color={colors.danger} name="log-out-outline" size={24} />
          )}
          <Text style={styles.signOutText}>{isSigningOut ? 'Signing Out' : 'Sign Out'}</Text>
        </Pressable>
        <Text style={styles.version}>App Version 2.4.1 (Build 890)</Text>
      </View>

      <Modal animationType="fade" onRequestClose={() => setIsProfileOpen(false)} transparent visible={isProfileOpen}>
        <View style={styles.modalOverlay}>
          <Card style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Profile Information</Text>
              <Pressable onPress={() => setIsProfileOpen(false)} style={styles.closeButton}>
                <Ionicons color={colors.textMuted} name="close" size={24} />
              </Pressable>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                autoCapitalize="none"
                onChangeText={setUsername}
                placeholder="username"
                placeholderTextColor={colors.outline}
                style={styles.input}
                value={username}
              />
            </View>

            {profileError ? <Text style={styles.errorText}>{profileError}</Text> : null}

            <Pressable
              disabled={isSavingUsername}
              onPress={saveUsername}
              style={[styles.saveButton, isSavingUsername && styles.disabled]}
            >
              {isSavingUsername ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Ionicons color={colors.white} name="checkmark" size={22} />
              )}
              {!isSavingUsername ? <Text style={styles.saveText}>Save Username</Text> : null}
            </Pressable>
          </Card>
        </View>
      </Modal>
    </Screen>
  )
}
