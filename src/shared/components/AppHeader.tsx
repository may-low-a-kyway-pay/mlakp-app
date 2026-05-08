import { Ionicons } from '@expo/vector-icons'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import { colors } from '@/src/shared/theme/colors'
import { typography } from '@/src/shared/theme/typography'

type AppHeaderProps = {
  showProfile?: boolean
}

export function AppHeader({ showProfile = true }: AppHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.side}>
        {showProfile ? (
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1611145434336-2324aa4079cd?q=80&w=930&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            }}
            style={styles.avatar}
          />
        ) : null}
      </View>
      <Text adjustsFontSizeToFit minimumFontScale={0.86} numberOfLines={1} style={styles.title}>
        May Low A Kyway Pay
      </Text>
      <Pressable accessibilityLabel="Notifications" style={styles.iconButton}>
        <Ionicons color={colors.primaryBright} name="notifications-outline" size={24} />
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
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
    width: 44,
  },
  avatar: {
    borderColor: colors.outline,
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    height: 44,
    width: 44,
  },
  title: {
    color: colors.primaryBright,
    flex: 1,
    fontFamily: typography.familyBold,
    fontSize: typography.size.titleSmall,
    fontWeight: typography.weight.semibold,
    paddingHorizontal: 10,
    textAlign: 'center',
  },
  iconButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
})
