import { Ionicons } from '@expo/vector-icons'
import { Tabs } from 'expo-router'
import React from 'react'

import { colors } from '@/src/shared/theme/colors'

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSoft,
        tabBarItemStyle: {
          borderRadius: 24,
          marginHorizontal: 4,
          marginVertical: 8,
          paddingVertical: 4,
        },
        tabBarLabelStyle: {
          fontSize: 13,
          fontWeight: '600',
        },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.surfaceVariant,
          height: 86,
          paddingHorizontal: 10,
          paddingTop: 6,
        },
        tabBarActiveBackgroundColor: colors.primarySoft,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons color={color} name={focused ? 'grid' : 'grid-outline'} size={28} />
          ),
        }}
      />
      <Tabs.Screen
        name="groups"
        options={{
          title: 'Groups',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons color={color} name={focused ? 'people' : 'people-outline'} size={28} />
          ),
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: 'Activity',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons color={color} name={focused ? 'receipt' : 'receipt-outline'} size={28} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons color={color} name={focused ? 'settings' : 'settings-outline'} size={28} />
          ),
        }}
      />
    </Tabs>
  )
}
