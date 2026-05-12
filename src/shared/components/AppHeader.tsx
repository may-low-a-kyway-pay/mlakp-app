import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useNotifications } from '@/src/modules/notifications/context/NotificationsProvider'
import { AppColors } from '@/src/shared/theme/colors'
import { useAppTheme } from '@/src/shared/theme/ThemeContext'
import { typography } from '@/src/shared/theme/typography'

export function AppHeader() {
  const { colors } = useAppTheme()
  const { unreadCount } = useNotifications()
  const styles = createStyles(colors)
  const hasUnreadNotifications = unreadCount > 0
  const notificationAccessibilityLabel = hasUnreadNotifications
    ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`
    : 'Notifications'

  return (
    <View style={styles.header}>
      <View style={styles.side}>
        <View style={styles.logoMark}>
          <Text style={styles.logoText}>M</Text>
        </View>
      </View>
      <Text adjustsFontSizeToFit minimumFontScale={0.86} numberOfLines={1} style={styles.title}>
        May Low A Kyway Pay
      </Text>
      <View style={[styles.side, styles.notificationSide]}>
        <Pressable
          accessibilityHint="Opens your notifications"
          accessibilityLabel={notificationAccessibilityLabel}
          accessibilityRole="button"
          onPress={() => router.push('/notifications')}
          style={({ pressed }) => [
            styles.notificationButton,
            hasUnreadNotifications && styles.notificationButtonActive,
            pressed && styles.notificationButtonPressed,
          ]}
        >
          <Ionicons
            color={hasUnreadNotifications ? colors.primary : colors.textSoft}
            name={hasUnreadNotifications ? 'notifications' : 'notifications-outline'}
            size={24}
          />
          {hasUnreadNotifications ? (
            <View style={styles.notificationBadge}>
              <Text adjustsFontSizeToFit minimumFontScale={0.72} numberOfLines={1} style={styles.notificationBadgeText}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </Text>
            </View>
          ) : null}
        </Pressable>
      </View>
    </View>
  )
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    header: {
      alignItems: 'center',
      backgroundColor: colors.background,
      borderBottomColor: colors.surfaceVariant,
      borderBottomWidth: StyleSheet.hairlineWidth,
      flexDirection: 'row',
      height: 64,
      justifyContent: 'space-between',
      paddingHorizontal: 18,
    },
    side: {
      width: 48,
    },
    notificationSide: {
      alignItems: 'flex-end',
      justifyContent: 'center',
    },
    notificationButton: {
      alignItems: 'center',
      borderRadius: 24,
      height: 48,
      justifyContent: 'center',
      width: 48,
    },
    notificationButtonActive: {
      backgroundColor: colors.primarySoft,
    },
    notificationButtonPressed: {
      opacity: 0.72,
    },
    notificationBadge: {
      alignItems: 'center',
      backgroundColor: colors.danger,
      borderColor: colors.background,
      borderRadius: 9,
      borderWidth: 2,
      minWidth: 18,
      height: 18,
      justifyContent: 'center',
      paddingHorizontal: 3,
      position: 'absolute',
      right: 2,
      top: 2,
    },
    notificationBadgeText: {
      color: colors.white,
      fontFamily: typography.familyBold,
      fontSize: 10,
      fontWeight: typography.weight.bold,
      lineHeight: 12,
      textAlign: 'center',
    },
    logoMark: {
      alignItems: 'center',
      backgroundColor: colors.primarySoft,
      borderColor: colors.primary,
      borderRadius: 24,
      borderWidth: StyleSheet.hairlineWidth,
      height: 48,
      justifyContent: 'center',
      width: 48,
    },
    logoText: {
      color: colors.primary,
      fontFamily: typography.familyBrand,
      fontSize: 30,
      fontWeight: typography.weight.bold,
    },
    title: {
      color: colors.primaryBright,
      flex: 1,
      fontFamily: typography.familyBrand,
      fontSize: 26,
      fontWeight: typography.weight.bold,
      paddingHorizontal: 10,
      textAlign: 'center',
    },
  })
}
