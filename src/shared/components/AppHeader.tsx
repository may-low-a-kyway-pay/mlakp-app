import { StyleSheet, Text, View } from 'react-native'
import { AppColors } from '@/src/shared/theme/colors'
import { useAppTheme } from '@/src/shared/theme/ThemeContext'
import { typography } from '@/src/shared/theme/typography'

export function AppHeader() {
  const { colors } = useAppTheme()
  const styles = createStyles(colors)

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
      <View style={styles.side} />
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
      width: 44,
    },
    logoMark: {
      alignItems: 'center',
      backgroundColor: colors.primarySoft,
      borderColor: colors.primary,
      borderRadius: 22,
      borderWidth: StyleSheet.hairlineWidth,
      height: 44,
      justifyContent: 'center',
      width: 44,
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
