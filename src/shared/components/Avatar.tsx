import { Image, StyleSheet, Text, View } from 'react-native'
import { colors } from '@/src/shared/theme/colors'

type AvatarProps = {
  initials: string
  tone?: 'blue' | 'green' | 'orange' | 'neutral'
  uri?: string
}

const toneStyles = {
  blue: { backgroundColor: colors.primarySoft, color: colors.primary },
  green: { backgroundColor: colors.successSoft, color: colors.success },
  orange: { backgroundColor: colors.tertiarySoft, color: colors.tertiary },
  neutral: { backgroundColor: colors.surfaceVariant, color: colors.textMuted },
}

export function Avatar({ initials, tone = 'neutral', uri }: AvatarProps) {
  if (uri) {
    return <Image source={{ uri }} style={styles.image} />
  }

  const toneStyle = toneStyles[tone]

  return (
    <View style={[styles.initials, { backgroundColor: toneStyle.backgroundColor }]}>
      <Text style={[styles.initialsText, { color: toneStyle.color }]}>{initials}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  image: {
    borderRadius: 24,
    height: 48,
    width: 48,
  },
  initials: {
    alignItems: 'center',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  initialsText: {
    fontSize: 18,
    fontWeight: '700',
  },
})
