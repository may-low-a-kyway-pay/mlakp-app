import { Ionicons } from '@expo/vector-icons'
import { Tabs } from 'expo-router'
import React from 'react'
import { StyleSheet, View } from 'react-native'

import { AppColors } from '@/src/shared/theme/colors'
import { useAppTheme } from '@/src/shared/theme/ThemeContext'
import { typography } from '@/src/shared/theme/typography'

export default function TabLayout() {
  const { colors } = useAppTheme()

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSoft,
        tabBarItemStyle: {
          height: 58,
          marginHorizontal: 4,
          paddingBottom: 6,
          paddingTop: 4,
        },
        tabBarLabelStyle: {
          fontFamily: typography.familyBold,
          fontSize: typography.size.caption,
          fontWeight: typography.weight.medium,
        },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.surfaceVariant,
          height: 78,
          paddingHorizontal: 10,
          paddingBottom: 8,
          paddingTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused}>
              <Ionicons color={color} name={focused ? 'grid' : 'grid-outline'} size={24} />
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="groups"
        options={{
          title: 'Groups',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused}>
              <Ionicons color={color} name={focused ? 'people' : 'people-outline'} size={24} />
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: 'Activity',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused}>
              <Ionicons color={color} name={focused ? 'receipt' : 'receipt-outline'} size={24} />
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused}>
              <Ionicons color={color} name={focused ? 'settings' : 'settings-outline'} size={24} />
            </TabIcon>
          ),
        }}
      />
    </Tabs>
  )
}

type TabIconProps = React.PropsWithChildren<{
  focused: boolean
}>

function TabIcon({ children, focused }: TabIconProps) {
  const { colors } = useAppTheme()
  const styles = createStyles(colors)

  return <View style={[styles.iconPill, focused && styles.iconPillActive]}>{children}</View>
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    iconPill: {
      alignItems: 'center',
      borderRadius: 16,
      height: 32,
      justifyContent: 'center',
      width: 48,
    },
    iconPillActive: {
      backgroundColor: colors.primarySoft,
    },
  })
}
