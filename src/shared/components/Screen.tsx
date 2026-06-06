import { PropsWithChildren, useMemo } from 'react'
import { ScrollView, StyleSheet, ViewStyle } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AppColors } from '@/src/shared/theme/colors'
import { useAppTheme } from '@/src/shared/theme/ThemeContext'

type ScreenProps = PropsWithChildren<{
  scroll?: boolean
  contentStyle?: ViewStyle
}>

export function Screen({ children, contentStyle, scroll = true }: ScreenProps) {
  const { colors } = useAppTheme()
  const styles = useMemo(() => createStyles(colors), [colors])

  if (!scroll) {
    return <SafeAreaView style={[styles.root, contentStyle]}>{children}</SafeAreaView>
  }

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView
        automaticallyAdjustKeyboardInsets
        contentContainerStyle={[styles.content, contentStyle]}
        contentInsetAdjustmentBehavior="automatic"
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  )
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    root: {
      backgroundColor: colors.background,
      flex: 1,
    },
    content: {
      flexGrow: 1,
      padding: 18,
      paddingBottom: 120,
    },
  })
}
