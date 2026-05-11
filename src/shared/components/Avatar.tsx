import { Image, StyleSheet, Text, View } from 'react-native'
import { AppColors } from '@/src/shared/theme/colors'
import { useAppTheme } from '@/src/shared/theme/ThemeContext'
import { typography } from '@/src/shared/theme/typography'

type AvatarProps = {
  initials: string
  tone?: 'blue' | 'green' | 'orange' | 'neutral'
  uri?: string
}

export function Avatar({ initials, tone = 'neutral', uri }: AvatarProps) {
  const { colors } = useAppTheme()
  const toneStyles = createToneStyles(colors)

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

function createToneStyles(colors: AppColors) {
  return {
    blue: { backgroundColor: colors.primarySoft, color: colors.primary },
    green: { backgroundColor: colors.successSoft, color: colors.success },
    orange: { backgroundColor: colors.tertiarySoft, color: colors.tertiary },
    neutral: { backgroundColor: colors.surfaceVariant, color: colors.textMuted },
  }
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
    fontFamily: typography.familyBold,
    fontSize: typography.size.titleSmall,
    fontWeight: typography.weight.semibold,
  },
})
