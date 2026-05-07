import { Ionicons } from '@expo/vector-icons'
import { Tabs } from 'expo-router'
import React from 'react'

import { colors } from '@/src/shared/theme/colors'
import { typography } from '@/src/shared/theme/typography'

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSoft,
        tabBarItemStyle: {
          borderRadius: 22,
          height: 58,
          marginHorizontal: 4,
          marginTop: 8,
          overflow: 'hidden',
          paddingBottom: 4,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontFamily: typography.family,
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
        tabBarActiveBackgroundColor: colors.primarySoft,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons color={color} name={focused ? 'grid' : 'grid-outline'} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="groups"
        options={{
          title: 'Groups',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons color={color} name={focused ? 'people' : 'people-outline'} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: 'Activity',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons color={color} name={focused ? 'receipt' : 'receipt-outline'} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons color={color} name={focused ? 'settings' : 'settings-outline'} size={24} />
          ),
        }}
      />
    </Tabs>
  )
}
