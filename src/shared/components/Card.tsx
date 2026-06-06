import { PropsWithChildren, useMemo } from 'react'
import { StyleProp, StyleSheet, View, ViewProps, ViewStyle } from 'react-native'
import { AppTheme } from '@/src/shared/theme/colors'
import { useAppTheme } from '@/src/shared/theme/ThemeContext'

type CardProps = PropsWithChildren<
  ViewProps & {
    style?: StyleProp<ViewStyle>
  }
>

export function Card({ children, style, ...viewProps }: CardProps) {
  const theme = useAppTheme()
  const styles = useMemo(() => createStyles(theme), [theme])

  return (
    <View {...viewProps} style={[styles.card, style]}>
      {children}
    </View>
  )
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
