import { AppHeader } from '@/src/shared/components/AppHeader'
import { Card } from '@/src/shared/components/Card'
import { Screen } from '@/src/shared/components/Screen'
import { activityItems } from '@/src/modules/activity/data/activityData'
import { styles } from '@/src/modules/activity/screens/ActivityScreen.styles'
import { colors } from '@/src/shared/theme/colors'
import { Ionicons } from '@expo/vector-icons'
import { Text, View } from 'react-native'

export function ActivityScreen() {
  return (
    <Screen contentStyle={styles.content}>
      <AppHeader />
      <View style={styles.inner}>
        <Text style={styles.title}>Activity</Text>
        <View style={styles.list}>
          {activityItems.map((item) => (
            <Card key={item.title} style={styles.item}>
              <View style={styles.iconCircle}>
                <Ionicons color={colors.primary} name={item.icon} size={26} />
              </View>
              <View style={styles.itemText}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.status}>{item.status}</Text>
              </View>
              <Text style={styles.amount}>{item.amount}</Text>
            </Card>
          ))}
        </View>
      </View>
    </Screen>
  )
}
