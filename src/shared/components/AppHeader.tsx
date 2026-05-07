import { Ionicons } from '@expo/vector-icons'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import { colors } from '@/src/shared/theme/colors'

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
              uri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&h=160&fit=crop&crop=faces',
            }}
            style={styles.avatar}
          />
        ) : null}
      </View>
      <Text style={styles.title}>Debt Tracker</Text>
      <Pressable style={styles.iconButton}>
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
    fontSize: 21,
    fontWeight: '700',
  },
  iconButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
})
