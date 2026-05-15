import { Ionicons } from '@expo/vector-icons'
import Constants from 'expo-constants'
import * as Linking from 'expo-linking'
import { ReactNode, useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { fetchUpdateManifest, UpdateManifest } from '@/src/modules/updates/api/updateApi'
import { iconSize, touchTarget } from '@/src/shared/theme/metrics'
import { useAppTheme } from '@/src/shared/theme/ThemeContext'
import { typography } from '@/src/shared/theme/typography'

const updateManifestUrl = process.env.EXPO_PUBLIC_UPDATE_MANIFEST_URL

type UpdateState =
  | { status: 'checking' }
  | { status: 'current' }
  | { manifest: UpdateManifest; status: 'soft-update' | 'force-update' }

export function AppUpdateGate({ children }: { children: ReactNode }) {
  const { colors, shadows } = useAppTheme()
  const [state, setState] = useState<UpdateState>({ status: shouldCheckUpdates() ? 'checking' : 'current' })
  const [softUpdateDismissed, setSoftUpdateDismissed] = useState(false)
  const styles = useMemo(() => createStyles(colors, shadows), [colors, shadows])

  useEffect(() => {
    if (!shouldCheckUpdates() || !updateManifestUrl) {
      setState({ status: 'current' })
      return
    }

    let mounted = true

    fetchUpdateManifest(updateManifestUrl)
      .then((manifest) => {
        if (!mounted) {
          return
        }

        const currentVersionCode = getCurrentVersionCode()
        // The manifest lets a hosted JSON file control soft vs required updates
        // without rebuilding the installed APK.
        if (
          currentVersionCode < manifest.min_supported_version_code ||
          (Boolean(manifest.force_update) && currentVersionCode < manifest.latest_version_code)
        ) {
          setState({ manifest, status: 'force-update' })
          return
        }

        if (currentVersionCode < manifest.latest_version_code) {
          setState({ manifest, status: 'soft-update' })
          return
        }

        setState({ status: 'current' })
      })
      .catch(() => {
        if (mounted) {
          setState({ status: 'current' })
        }
      })

    return () => {
      mounted = false
    }
  }, [])

  if (state.status === 'checking') {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <ActivityIndicator color={colors.primary} size="large" />
      </SafeAreaView>
    )
  }

  if (state.status === 'force-update') {
    return <UpdateRequiredScreen manifest={state.manifest} />
  }

  return (
    <>
      {children}
      {state.status === 'soft-update' && !softUpdateDismissed ? (
        <UpdateModal manifest={state.manifest} onDismiss={() => setSoftUpdateDismissed(true)} />
      ) : null}
    </>
  )
}

function UpdateRequiredScreen({ manifest }: { manifest: UpdateManifest }) {
  const { colors, shadows } = useAppTheme()
  const styles = useMemo(() => createStyles(colors, shadows), [colors, shadows])

  return (
    <SafeAreaView style={styles.forceScreen}>
      <View style={styles.forceContent}>
        <View style={styles.iconCircle}>
          <Ionicons color={colors.primary} name="cloud-download-outline" size={iconSize.empty} />
        </View>
        <Text style={styles.title}>Update required</Text>
        <Text style={styles.message}>
          Version {manifest.latest_version} is required before you can continue using MLAKP.
        </Text>
        <ReleaseNotes manifest={manifest} />
        <UpdateButton manifest={manifest} />
      </View>
    </SafeAreaView>
  )
}

function UpdateModal({ manifest, onDismiss }: { manifest: UpdateManifest; onDismiss: () => void }) {
  const { colors, shadows } = useAppTheme()
  const styles = useMemo(() => createStyles(colors, shadows), [colors, shadows])

  return (
    <Modal animationType="fade" onRequestClose={onDismiss} transparent visible>
      <View style={styles.modalOverlay}>
        <View accessibilityViewIsModal style={styles.modalCard}>
          <View style={styles.iconCircle}>
            <Ionicons color={colors.primary} name="sparkles-outline" size={iconSize.standard} />
          </View>
          <Text style={styles.title}>Update available</Text>
          <Text style={styles.message}>
            Version {manifest.latest_version} is ready to download. You can update now or continue with this version.
          </Text>
          <ReleaseNotes manifest={manifest} />
          <View style={styles.modalActions}>
            <Pressable
              accessibilityLabel="Dismiss update prompt"
              accessibilityRole="button"
              onPress={onDismiss}
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
            >
              <Text style={styles.secondaryButtonText}>Later</Text>
            </Pressable>
            <UpdateButton compact manifest={manifest} />
          </View>
        </View>
      </View>
    </Modal>
  )
}

function ReleaseNotes({ manifest }: { manifest: UpdateManifest }) {
  const { colors, shadows } = useAppTheme()
  const styles = useMemo(() => createStyles(colors, shadows), [colors, shadows])
  const notes = manifest.release_notes?.filter(Boolean).slice(0, 4)

  if (notes?.length) {
    return (
      <View style={styles.notes}>
        {notes.map((note) => (
          <View key={note} style={styles.noteRow}>
            <View style={styles.noteDot} />
            <Text style={styles.noteText}>{note}</Text>
          </View>
        ))}
      </View>
    )
  }

  if (!manifest.message) {
    return null
  }

  return <Text style={styles.noteMessage}>{manifest.message}</Text>
}

function UpdateButton({ compact = false, manifest }: { compact?: boolean; manifest: UpdateManifest }) {
  const { colors, shadows } = useAppTheme()
  const styles = useMemo(() => createStyles(colors, shadows), [colors, shadows])

  const handlePress = () => {
    void Linking.openURL(manifest.apk_url)
  }

  return (
    <Pressable
      accessibilityLabel={`Download version ${manifest.latest_version}`}
      accessibilityRole="link"
      accessibilityHint="Opens the APK download in your browser"
      onPress={handlePress}
      style={({ pressed }) => [styles.primaryButton, compact && styles.compactButton, pressed && styles.buttonPressed]}
    >
      <Ionicons color={colors.white} name="download-outline" size={iconSize.medium} />
      <Text style={styles.primaryButtonText}>Download update</Text>
    </Pressable>
  )
}

function shouldCheckUpdates() {
  // Website-distributed APK updates only apply to Android; iOS needs an Apple-approved distribution path.
  return Platform.OS === 'android' && Boolean(updateManifestUrl)
}

function getCurrentVersionCode() {
  const androidConfig = Constants.expoConfig?.android as { versionCode?: number } | undefined

  return androidConfig?.versionCode ?? 1
}

function createStyles(
  colors: ReturnType<typeof useAppTheme>['colors'],
  shadows: ReturnType<typeof useAppTheme>['shadows'],
) {
  return StyleSheet.create({
    loadingScreen: {
      alignItems: 'center',
      backgroundColor: colors.background,
      flex: 1,
      justifyContent: 'center',
    },
    forceScreen: {
      alignItems: 'center',
      backgroundColor: colors.background,
      flex: 1,
      justifyContent: 'center',
      padding: 24,
    },
    forceContent: {
      alignItems: 'center',
      maxWidth: 420,
      width: '100%',
    },
    modalOverlay: {
      alignItems: 'center',
      backgroundColor: colors.overlay,
      flex: 1,
      justifyContent: 'center',
      padding: 20,
    },
    modalCard: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderColor: colors.surfaceVariant,
      borderRadius: 8,
      borderWidth: 1,
      maxWidth: 430,
      padding: 24,
      width: '100%',
      ...shadows.floating,
    },
    iconCircle: {
      alignItems: 'center',
      backgroundColor: colors.primarySoft,
      borderRadius: 999,
      height: 64,
      justifyContent: 'center',
      width: 64,
    },
    title: {
      color: colors.text,
      fontFamily: typography.familyBold,
      fontSize: typography.size.section,
      marginTop: 18,
      textAlign: 'center',
    },
    message: {
      color: colors.textMuted,
      fontFamily: typography.family,
      fontSize: typography.size.body,
      lineHeight: typography.lineHeight.body,
      marginTop: 10,
      textAlign: 'center',
    },
    notes: {
      alignSelf: 'stretch',
      gap: 10,
      marginTop: 18,
    },
    noteRow: {
      alignItems: 'flex-start',
      flexDirection: 'row',
      gap: 10,
    },
    noteDot: {
      backgroundColor: colors.primary,
      borderRadius: 4,
      height: 7,
      marginTop: 8,
      width: 7,
    },
    noteText: {
      color: colors.textMuted,
      flex: 1,
      fontFamily: typography.family,
      fontSize: typography.size.bodySmall,
      lineHeight: typography.lineHeight.bodySmall,
    },
    noteMessage: {
      color: colors.textMuted,
      fontFamily: typography.family,
      fontSize: typography.size.bodySmall,
      lineHeight: typography.lineHeight.bodySmall,
      marginTop: 18,
      textAlign: 'center',
    },
    modalActions: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 12,
      marginTop: 24,
      width: '100%',
    },
    primaryButton: {
      alignItems: 'center',
      backgroundColor: colors.primary,
      borderRadius: 8,
      flexDirection: 'row',
      gap: 8,
      minHeight: touchTarget.minimum,
      justifyContent: 'center',
      marginTop: 24,
      paddingHorizontal: 16,
      width: '100%',
    },
    compactButton: {
      flex: 1,
      marginTop: 0,
    },
    primaryButtonText: {
      color: colors.white,
      fontFamily: typography.familyBold,
      fontSize: typography.size.body,
    },
    secondaryButton: {
      alignItems: 'center',
      borderColor: colors.outline,
      borderRadius: 8,
      borderWidth: 1,
      flex: 1,
      minHeight: touchTarget.minimum,
      justifyContent: 'center',
      paddingHorizontal: 16,
    },
    secondaryButtonText: {
      color: colors.text,
      fontFamily: typography.familyBold,
      fontSize: typography.size.body,
    },
    buttonPressed: {
      opacity: 0.74,
    },
  })
}
