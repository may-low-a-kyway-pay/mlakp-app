import { Ionicons } from '@expo/vector-icons'
import Constants from 'expo-constants'
import { Image } from 'expo-image'
import * as Linking from 'expo-linking'
import { ComponentProps, useMemo } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native'

import { iconSize, touchTarget } from '@/src/shared/theme/metrics'
import { useAppTheme } from '@/src/shared/theme/ThemeContext'
import { typography } from '@/src/shared/theme/typography'

const androidApkUrl = process.env.EXPO_PUBLIC_ANDROID_APK_URL ?? '/downloads/mlakp-v1.0.0.apk'
const releaseDate = process.env.EXPO_PUBLIC_RELEASE_DATE ?? 'Latest release'

type IoniconName = ComponentProps<typeof Ionicons>['name']

const highlights: {
  icon: IoniconName
  label: string
  description: string
}[] = [
  {
    icon: 'people-outline',
    label: 'Shared Groups',
    description: 'Create groups, add members by username, and keep every expense tied to the right people.',
  },
  {
    icon: 'receipt-outline',
    label: 'Expense Splits',
    description: "Record who paid, split the amount, and track each person's remaining balance in one place.",
  },
  {
    icon: 'notifications-outline',
    label: 'Live Activity',
    description: 'See payment updates, reviews, and notifications as the group settles up.',
  },
]

const releaseFacts: {
  icon: IoniconName
  label: string
  value: string
}[] = [
  {
    icon: 'lock-closed-outline',
    label: 'Distribution',
    value: 'Private APK',
  },
  {
    icon: 'sync-outline',
    label: 'Updates',
    value: 'In-app checks',
  },
  {
    icon: 'server-outline',
    label: 'Backend',
    value: 'Production ready',
  },
]

export function DownloadLandingScreen() {
  const { colors, dark, toggleDarkMode } = useAppTheme()
  const { width } = useWindowDimensions()
  const version = Constants.expoConfig?.version ?? '1.0.0'
  const currentYear = new Date().getFullYear()
  const isCompact = width < 820
  const isTablet = width >= 820 && width < 1120

  const styles = useMemo(() => createStyles(colors, dark, isCompact, isTablet), [colors, dark, isCompact, isTablet])

  const handleDownload = () => {
    void Linking.openURL(androidApkUrl)
  }

  return (
    <ScrollView contentContainerStyle={styles.page} style={styles.root}>
      <View style={styles.topBar}>
        <View style={styles.brandLockup}>
          <Image contentFit="contain" source={require('../../../../assets/images/logo.png')} style={styles.brandLogo} />
          <View>
            <Text style={styles.brandName}>MLAKP</Text>
            <Text style={styles.brandMeta}>Private expense settlement</Text>
          </View>
        </View>
        <Pressable
          accessibilityLabel={dark ? 'Use light theme' : 'Use dark theme'}
          accessibilityRole="button"
          onPress={toggleDarkMode}
          style={({ pressed }) => [styles.themeButton, pressed && styles.themeButtonPressed]}
        >
          <Ionicons color={colors.text} name={dark ? 'sunny-outline' : 'moon-outline'} size={iconSize.standard} />
        </Pressable>
      </View>

      <View style={styles.hero}>
        <View style={styles.heroContent}>
          <View style={styles.badge}>
            <Ionicons color={colors.primary} name="logo-android" size={iconSize.small} />
            <Text style={styles.badgeText}>Android APK private release</Text>
          </View>

          <Text adjustsFontSizeToFit minimumFontScale={0.78} numberOfLines={isCompact ? 2 : 1} style={styles.title}>
            May Low A Kyway Pay
          </Text>
          <Text style={styles.subtitle}>
            Split group expenses, review debt requests, and settle payments without losing track of who owes what.
          </Text>

          <View style={styles.actions}>
            <Pressable
              accessibilityHint="Opens the Android APK download"
              accessibilityLabel={`Download MLAKP version ${version} APK`}
              accessibilityRole="link"
              onPress={handleDownload}
              style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
            >
              <Ionicons color={colors.white} name="download-outline" size={iconSize.medium} />
              <Text style={styles.primaryButtonText}>Download APK</Text>
            </Pressable>
            <View style={styles.versionBlock}>
              <Text style={styles.versionLabel}>Version {version}</Text>
              <Text style={styles.versionText}>{releaseDate}</Text>
            </View>
          </View>

          <View style={styles.installNote}>
            <Ionicons color={colors.tertiary} name="shield-checkmark-outline" size={iconSize.medium} />
            <Text style={styles.installNoteText}>
              If Android blocks installation, allow installs from this browser in Android settings and open the APK
              again.
            </Text>
          </View>

          <View style={styles.releaseGrid}>
            {releaseFacts.map((item) => (
              <View key={item.label} style={styles.releaseFact}>
                <Ionicons color={colors.primary} name={item.icon} size={iconSize.medium} />
                <View style={styles.releaseFactText}>
                  <Text style={styles.releaseFactLabel}>{item.label}</Text>
                  <Text style={styles.releaseFactValue}>{item.value}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.phoneStage}>
          <View style={styles.phone}>
            <View style={styles.phoneChrome}>
              <View style={styles.phoneCamera} />
            </View>
            <View style={styles.phoneHeader}>
              <Image
                contentFit="contain"
                source={require('../../../../assets/images/logo.png')}
                style={styles.appIcon}
              />
              <View>
                <Text style={styles.phoneAppName}>MLAKP</Text>
                <Text style={styles.phoneMuted}>Today&apos;s balance</Text>
              </View>
            </View>
            <Text style={styles.phoneAmount}>THB 2,450</Text>
            <View style={styles.phoneMetricRow}>
              <PhoneMetric label="You owe" value="THB 620" />
              <PhoneMetric label="To receive" value="THB 1,830" />
            </View>
            <View style={styles.settlementPanel}>
              <View style={styles.settlementPanelHeader}>
                <Text style={styles.settlementTitle}>Ready to settle</Text>
                <Text style={styles.settlementBadge}>2 pending</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={styles.progressFill} />
              </View>
            </View>
            <View style={styles.phoneList}>
              <PhoneItem color={colors.primary} label="Dinner split" value="4 members" />
              <PhoneItem color={colors.success} label="Payment reviewed" value="Approved" />
              <PhoneItem color={colors.tertiary} label="Weekend trip" value="Pending" />
            </View>
          </View>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionEyebrow}>Built for private groups</Text>
        <Text style={styles.sectionTitle}>Everything you need to settle clearly</Text>
      </View>

      <View style={styles.section}>
        {highlights.map((item) => (
          <View key={item.label} style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <Ionicons color={colors.primary} name={item.icon} size={iconSize.standard} />
            </View>
            <Text style={styles.featureTitle}>{item.label}</Text>
            <Text style={styles.featureDescription}>{item.description}</Text>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.copyright}>© Copyright {currentYear} Kyaw Zin Htet. All rights reserved.</Text>
      </View>
    </ScrollView>
  )
}

function PhoneMetric({ label, value }: { label: string; value: string }) {
  const { colors } = useAppTheme()

  return (
    <View style={[stylesStatic.phoneMetric, { borderColor: colors.surfaceVariant }]}>
      <Text style={[stylesStatic.phoneMetricLabel, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[stylesStatic.phoneMetricValue, { color: colors.text }]}>{value}</Text>
    </View>
  )
}

function PhoneItem({ color, label, value }: { color: string; label: string; value: string }) {
  const { colors } = useAppTheme()

  return (
    <View style={stylesStatic.phoneItem}>
      <View style={[stylesStatic.phoneItemDot, { backgroundColor: color }]} />
      <Text style={[stylesStatic.phoneItemLabel, { color: colors.text }]}>{label}</Text>
      <Text style={[stylesStatic.phoneItemValue, { color: colors.textMuted }]}>{value}</Text>
    </View>
  )
}

function createStyles(
  colors: ReturnType<typeof useAppTheme>['colors'],
  dark: boolean,
  isCompact: boolean,
  isTablet: boolean,
) {
  const titleSize = isCompact ? 52 : isTablet ? 66 : 78

  return StyleSheet.create({
    root: {
      backgroundColor: colors.background,
    },
    page: {
      flexGrow: 1,
      minHeight: '100%',
      paddingHorizontal: isCompact ? 20 : 24,
      paddingVertical: isCompact ? 22 : 28,
    },
    topBar: {
      alignItems: 'center',
      alignSelf: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      maxWidth: 1180,
      width: '100%',
    },
    brandLockup: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 10,
      minWidth: 0,
    },
    brandLogo: {
      height: 42,
      tintColor: colors.primaryBright,
      width: 42,
    },
    brandName: {
      color: colors.primaryBright,
      fontFamily: typography.familyBrand,
      fontSize: 28,
      lineHeight: 30,
    },
    brandMeta: {
      color: colors.textSoft,
      fontFamily: typography.family,
      fontSize: typography.size.caption,
      lineHeight: 15,
      maxWidth: 190,
    },
    themeButton: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderColor: colors.surfaceVariant,
      borderRadius: 24,
      borderWidth: 1,
      height: touchTarget.minimum,
      justifyContent: 'center',
      width: touchTarget.minimum,
    },
    themeButtonPressed: {
      opacity: 0.72,
    },
    hero: {
      alignItems: 'center',
      alignSelf: 'center',
      flexDirection: isCompact ? 'column' : 'row',
      gap: isCompact ? 44 : 42,
      justifyContent: 'space-between',
      maxWidth: 1180,
      minHeight: isCompact ? 0 : 660,
      paddingBottom: isCompact ? 46 : 0,
      paddingTop: isCompact ? 28 : 48,
      width: '100%',
    },
    heroContent: {
      alignItems: isCompact ? 'center' : 'flex-start',
      flexBasis: isCompact ? undefined : isTablet ? 560 : 680,
      flex: 1,
      flexShrink: 1,
      maxWidth: isCompact ? 620 : isTablet ? 590 : 700,
      width: isCompact ? '100%' : undefined,
    },
    badge: {
      alignItems: 'center',
      alignSelf: isCompact ? 'center' : 'flex-start',
      backgroundColor: colors.primarySoft,
      borderRadius: 999,
      flexDirection: 'row',
      gap: 8,
      paddingHorizontal: 14,
      paddingVertical: 8,
    },
    badgeText: {
      color: colors.primary,
      fontFamily: typography.familyBold,
      fontSize: typography.size.label,
    },
    title: {
      color: colors.text,
      fontFamily: typography.familyBrand,
      fontSize: titleSize,
      lineHeight: isCompact ? 58 : isTablet ? 72 : 84,
      marginTop: isCompact ? 18 : 22,
      maxWidth: isCompact ? 620 : 700,
      textAlign: isCompact ? 'center' : 'left',
    },
    subtitle: {
      color: colors.textMuted,
      fontFamily: typography.family,
      fontSize: isCompact ? 18 : 21,
      lineHeight: isCompact ? 26 : 31,
      marginTop: isCompact ? 12 : 10,
      maxWidth: 560,
      textAlign: isCompact ? 'center' : 'left',
    },
    actions: {
      alignItems: 'center',
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: isCompact ? 14 : 18,
      justifyContent: isCompact ? 'center' : 'flex-start',
      marginTop: isCompact ? 28 : 34,
      width: isCompact ? '100%' : undefined,
    },
    primaryButton: {
      alignItems: 'center',
      backgroundColor: colors.primary,
      borderRadius: 8,
      flexDirection: 'row',
      gap: 10,
      minHeight: 54,
      justifyContent: 'center',
      paddingHorizontal: 24,
      paddingVertical: 14,
      shadowColor: dark ? '#000000' : colors.primary,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: dark ? 0.24 : 0.22,
      shadowRadius: 18,
    },
    primaryButtonText: {
      color: colors.white,
      fontFamily: typography.familyBold,
      fontSize: typography.size.bodyLarge,
    },
    primaryButtonPressed: {
      opacity: 0.82,
    },
    versionBlock: {
      gap: 2,
      minWidth: isCompact ? 120 : undefined,
    },
    versionLabel: {
      color: colors.text,
      fontFamily: typography.familyBold,
      fontSize: typography.size.body,
    },
    versionText: {
      color: colors.textMuted,
      fontFamily: typography.family,
      fontSize: typography.size.label,
    },
    installNote: {
      alignItems: 'flex-start',
      backgroundColor: colors.surface,
      borderColor: colors.surfaceVariant,
      borderRadius: 8,
      borderWidth: 1,
      flexDirection: 'row',
      gap: 10,
      marginTop: 28,
      maxWidth: 570,
      padding: isCompact ? 15 : 16,
      width: '100%',
    },
    installNoteText: {
      color: colors.textMuted,
      flex: 1,
      fontFamily: typography.family,
      fontSize: typography.size.bodySmall,
      lineHeight: typography.lineHeight.bodySmall,
    },
    releaseGrid: {
      flexDirection: isCompact ? 'column' : 'row',
      gap: 10,
      marginTop: 14,
      marginBottom: isCompact ? 8 : 0,
      maxWidth: 570,
      width: '100%',
    },
    releaseFact: {
      alignItems: 'center',
      backgroundColor: colors.surfaceMuted,
      borderColor: colors.surfaceVariant,
      borderRadius: 8,
      borderWidth: 1,
      flex: 1,
      flexDirection: 'row',
      gap: 10,
      minHeight: isCompact ? 58 : 62,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    releaseFactText: {
      flex: 1,
      minWidth: 0,
    },
    releaseFactLabel: {
      color: colors.textSoft,
      fontFamily: typography.family,
      fontSize: typography.size.caption,
      lineHeight: 15,
    },
    releaseFactValue: {
      color: colors.text,
      fontFamily: typography.familyBold,
      fontSize: typography.size.bodySmall,
      lineHeight: 20,
      marginTop: 1,
    },
    phoneStage: {
      alignItems: 'center',
      flex: isCompact ? 1 : 0,
      flexBasis: isCompact ? undefined : 360,
      flexShrink: 0,
      justifyContent: 'center',
      marginTop: isCompact ? 4 : 0,
      minWidth: isCompact ? 0 : 310,
      position: 'relative',
      zIndex: 0,
      width: isCompact ? '100%' : undefined,
    },
    phone: {
      backgroundColor: colors.surface,
      borderColor: colors.surfaceVariant,
      borderRadius: 34,
      borderWidth: 1,
      maxWidth: isCompact ? 340 : 360,
      minHeight: isCompact ? 500 : 560,
      padding: isCompact ? 18 : 24,
      shadowColor: dark ? '#000000' : '#0052d4',
      shadowOffset: { width: 0, height: isCompact ? 14 : 20 },
      shadowOpacity: dark ? 0.42 : 0.18,
      shadowRadius: isCompact ? 26 : 36,
      width: '100%',
    },
    phoneChrome: {
      alignItems: 'center',
      height: 12,
      marginBottom: 12,
    },
    phoneCamera: {
      backgroundColor: colors.surfaceVariant,
      borderRadius: 4,
      height: 5,
      width: 46,
    },
    phoneHeader: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 12,
      marginBottom: isCompact ? 24 : 32,
    },
    appIcon: {
      height: 52,
      width: 52,
    },
    phoneAppName: {
      color: colors.text,
      fontFamily: typography.familyBold,
      fontSize: typography.size.title,
    },
    phoneMuted: {
      color: colors.textMuted,
      fontFamily: typography.family,
      fontSize: typography.size.label,
    },
    phoneAmount: {
      color: colors.text,
      fontFamily: typography.familyBold,
      fontSize: isCompact ? 32 : 42,
      lineHeight: isCompact ? 40 : 50,
    },
    phoneMetricRow: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 20,
    },
    settlementPanel: {
      backgroundColor: colors.surfaceMuted,
      borderColor: colors.surfaceVariant,
      borderRadius: 8,
      borderWidth: 1,
      marginTop: 18,
      padding: 14,
    },
    settlementPanelHeader: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    settlementTitle: {
      color: colors.text,
      fontFamily: typography.familyBold,
      fontSize: typography.size.bodySmall,
    },
    settlementBadge: {
      color: colors.primary,
      fontFamily: typography.familyBold,
      fontSize: typography.size.caption,
    },
    progressTrack: {
      backgroundColor: colors.surfaceVariant,
      borderRadius: 999,
      height: 8,
      marginTop: 12,
      overflow: 'hidden',
    },
    progressFill: {
      backgroundColor: colors.primary,
      borderRadius: 999,
      height: 8,
      width: '68%',
    },
    phoneList: {
      gap: 12,
      marginTop: 24,
    },
    sectionHeader: {
      alignSelf: 'center',
      maxWidth: 1180,
      paddingBottom: 18,
      width: '100%',
    },
    sectionEyebrow: {
      color: colors.primary,
      fontFamily: typography.familyBold,
      fontSize: typography.size.label,
      textAlign: isCompact ? 'center' : 'left',
    },
    sectionTitle: {
      color: colors.text,
      fontFamily: typography.familyBold,
      fontSize: isCompact ? typography.size.section : typography.size.screenTitle,
      lineHeight: isCompact ? 30 : 36,
      marginTop: 4,
      textAlign: isCompact ? 'center' : 'left',
    },
    section: {
      alignSelf: 'center',
      flexDirection: isCompact ? 'column' : 'row',
      flexWrap: 'wrap',
      gap: 16,
      maxWidth: 1180,
      width: '100%',
    },
    featureCard: {
      backgroundColor: colors.surface,
      borderColor: colors.surfaceVariant,
      borderRadius: 8,
      borderWidth: 1,
      flex: 1,
      minWidth: 240,
      padding: 24,
    },
    featureIcon: {
      alignItems: 'center',
      backgroundColor: colors.primarySoft,
      borderRadius: 8,
      height: 44,
      justifyContent: 'center',
      width: 44,
    },
    featureTitle: {
      color: colors.text,
      fontFamily: typography.familyBold,
      fontSize: typography.size.titleSmall,
      marginTop: 16,
    },
    featureDescription: {
      color: colors.textMuted,
      fontFamily: typography.family,
      fontSize: typography.size.body,
      lineHeight: typography.lineHeight.body,
      marginTop: 8,
    },
    footer: {
      alignItems: 'center',
      alignSelf: 'center',
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      justifyContent: 'center',
      marginTop: 'auto',
      maxWidth: 1180,
      paddingBottom: 18,
      paddingTop: 34,
      width: '100%',
    },
    copyright: {
      color: colors.textSoft,
      fontFamily: typography.family,
      fontSize: typography.size.label,
      textAlign: 'center',
    },
  })
}

const stylesStatic = StyleSheet.create({
  phoneMetric: {
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    padding: 12,
  },
  phoneMetricLabel: {
    fontFamily: typography.family,
    fontSize: typography.size.caption,
  },
  phoneMetricValue: {
    fontFamily: typography.familyBold,
    fontSize: typography.size.bodySmall,
    marginTop: 4,
  },
  phoneItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    minHeight: 42,
  },
  phoneItemDot: {
    borderRadius: 6,
    height: 12,
    width: 12,
  },
  phoneItemLabel: {
    flex: 1,
    fontFamily: typography.familyBold,
    fontSize: typography.size.body,
  },
  phoneItemValue: {
    fontFamily: typography.family,
    fontSize: typography.size.label,
  },
})
