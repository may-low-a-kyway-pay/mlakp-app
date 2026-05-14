import { Ionicons } from '@expo/vector-icons'
import Constants from 'expo-constants'
import { Image } from 'expo-image'
import * as Linking from 'expo-linking'
import { ComponentProps, useMemo } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native'

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

export function DownloadLandingScreen() {
  const { colors, dark } = useAppTheme()
  const { width } = useWindowDimensions()
  const version = Constants.expoConfig?.version ?? '1.0.0'
  const isCompact = width < 820

  const styles = useMemo(() => createStyles(colors, dark, isCompact), [colors, dark, isCompact])

  const handleDownload = () => {
    void Linking.openURL(androidApkUrl)
  }

  return (
    <ScrollView contentContainerStyle={styles.page} style={styles.root}>
      <View style={styles.hero}>
        <View style={styles.heroContent}>
          <View style={styles.badge}>
            <Ionicons color={colors.primary} name="logo-android" size={18} />
            <Text style={styles.badgeText}>Android APK</Text>
          </View>

          <Text style={styles.title}>May Low A Kyway Pay</Text>
          <Text style={styles.subtitle}>
            Split group expenses, review debt requests, and settle payments without losing track of who owes what.
          </Text>

          <View style={styles.actions}>
            <Pressable accessibilityRole="link" onPress={handleDownload} style={styles.primaryButton}>
              <Ionicons color={colors.white} name="download-outline" size={21} />
              <Text style={styles.primaryButtonText}>Download APK</Text>
            </Pressable>
            <View style={styles.versionBlock}>
              <Text style={styles.versionLabel}>Version {version}</Text>
              <Text style={styles.versionText}>{releaseDate}</Text>
            </View>
          </View>

          <View style={styles.installNote}>
            <Ionicons color={colors.tertiary} name="shield-checkmark-outline" size={20} />
            <Text style={styles.installNoteText}>
              If Android blocks installation, allow installs from this browser in Android settings and open the APK
              again.
            </Text>
          </View>
        </View>

        <View style={styles.phoneStage}>
          <View style={styles.phone}>
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
            <View style={styles.phoneList}>
              <PhoneItem color={colors.primary} label="Dinner split" value="4 members" />
              <PhoneItem color={colors.success} label="Payment reviewed" value="Approved" />
              <PhoneItem color={colors.tertiary} label="Weekend trip" value="Pending" />
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        {highlights.map((item) => (
          <View key={item.label} style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <Ionicons color={colors.primary} name={item.icon} size={23} />
            </View>
            <Text style={styles.featureTitle}>{item.label}</Text>
            <Text style={styles.featureDescription}>{item.description}</Text>
          </View>
        ))}
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

function createStyles(colors: ReturnType<typeof useAppTheme>['colors'], dark: boolean, isCompact: boolean) {
  return StyleSheet.create({
    root: {
      backgroundColor: colors.background,
    },
    page: {
      minHeight: '100%',
      paddingHorizontal: isCompact ? 18 : 24,
      paddingVertical: 28,
    },
    hero: {
      alignItems: 'center',
      alignSelf: 'center',
      flexDirection: isCompact ? 'column' : 'row',
      gap: isCompact ? 30 : 42,
      justifyContent: 'space-between',
      maxWidth: 1120,
      minHeight: isCompact ? 0 : 610,
      paddingBottom: isCompact ? 36 : 0,
      paddingTop: isCompact ? 16 : 0,
      width: '100%',
    },
    heroContent: {
      flex: 1,
      maxWidth: 590,
    },
    badge: {
      alignItems: 'center',
      alignSelf: 'flex-start',
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
      fontFamily: typography.familyBold,
      fontSize: isCompact ? 42 : 64,
      lineHeight: isCompact ? 48 : 70,
      marginTop: 26,
      maxWidth: 620,
    },
    subtitle: {
      color: colors.textMuted,
      fontFamily: typography.family,
      fontSize: isCompact ? 18 : 21,
      lineHeight: isCompact ? 26 : 31,
      marginTop: 18,
      maxWidth: 560,
    },
    actions: {
      alignItems: 'center',
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 18,
      marginTop: 34,
    },
    primaryButton: {
      alignItems: 'center',
      backgroundColor: colors.primary,
      borderRadius: 8,
      flexDirection: 'row',
      gap: 10,
      minHeight: 54,
      paddingHorizontal: 24,
      paddingVertical: 14,
    },
    primaryButtonText: {
      color: colors.white,
      fontFamily: typography.familyBold,
      fontSize: typography.size.bodyLarge,
    },
    versionBlock: {
      gap: 2,
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
      padding: 16,
    },
    installNoteText: {
      color: colors.textMuted,
      flex: 1,
      fontFamily: typography.family,
      fontSize: typography.size.bodySmall,
      lineHeight: typography.lineHeight.bodySmall,
    },
    phoneStage: {
      alignItems: 'center',
      flex: 0.84,
      justifyContent: 'center',
      minWidth: isCompact ? 0 : 310,
      width: isCompact ? '100%' : undefined,
    },
    phone: {
      backgroundColor: colors.surface,
      borderColor: colors.surfaceVariant,
      borderRadius: 34,
      borderWidth: 1,
      maxWidth: 360,
      minHeight: isCompact ? 480 : 560,
      padding: isCompact ? 20 : 24,
      shadowColor: dark ? '#000000' : '#0052d4',
      shadowOffset: { width: 0, height: 20 },
      shadowOpacity: dark ? 0.42 : 0.16,
      shadowRadius: 36,
      width: '100%',
    },
    phoneHeader: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 12,
      marginBottom: 32,
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
      fontSize: isCompact ? 34 : 42,
      lineHeight: isCompact ? 42 : 50,
    },
    phoneMetricRow: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 20,
    },
    phoneList: {
      gap: 12,
      marginTop: 32,
    },
    section: {
      alignSelf: 'center',
      flexDirection: isCompact ? 'column' : 'row',
      flexWrap: 'wrap',
      gap: 16,
      maxWidth: 1120,
      paddingBottom: 44,
      width: '100%',
    },
    featureCard: {
      backgroundColor: colors.surface,
      borderColor: colors.surfaceVariant,
      borderRadius: 8,
      borderWidth: 1,
      flex: 1,
      minWidth: 240,
      padding: 22,
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
