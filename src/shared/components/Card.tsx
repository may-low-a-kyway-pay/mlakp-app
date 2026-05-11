import { PropsWithChildren } from 'react'
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native'
import { AppTheme } from '@/src/shared/theme/colors'
import { useAppTheme } from '@/src/shared/theme/ThemeContext'

type CardProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>
}>

export function Card({ children, style }: CardProps) {
  const theme = useAppTheme()
  const styles = createStyles(theme)

  return <View style={[styles.card, style]}>{children}</View>
}

function createStyles({ colors, shadows }: AppTheme) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderColor: colors.surfaceVariant,
      borderRadius: 12,
      borderWidth: StyleSheet.hairlineWidth,
      padding: 18,
      ...shadows.card,
    },
  })
}
