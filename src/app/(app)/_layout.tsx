import { Redirect, Tabs } from 'expo-router';
import * as React from 'react';

import { colors } from '@/components/ui';
import {
  Explore as ExploreIcon,
  Feed as FeedIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
} from '@/components/ui/icons';
import { useAuthStore as useAuth } from '@/features/auth/use-auth-store';
import { useIsFirstTime } from '@/lib/hooks/use-is-first-time';

export default function TabLayout() {
  const status = useAuth.use.status();
  const [isFirstTime] = useIsFirstTime();

  if (status === 'idle') {
    return null;
  }
  if (isFirstTime) {
    return <Redirect href="/onboarding" />;
  }
  if (status === 'signOut') {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.white,
        tabBarInactiveTintColor: colors.fog[400],
        tabBarStyle: {
          backgroundColor: colors.black,
          borderTopColor: colors.ink[300],
        },
        headerStyle: {
          backgroundColor: colors.black,
        },
        headerTintColor: colors.white,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Feed',
          headerShown: false,
          tabBarIcon: ({ color }) => <FeedIcon color={color} />,
          tabBarButtonTestID: 'feed-tab',
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          headerShown: false,
          tabBarIcon: ({ color }) => <ExploreIcon color={color} />,
          tabBarButtonTestID: 'explore-tab',
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: 'Friends',
          headerShown: false,
          tabBarIcon: ({ color }) => <PeopleIcon color={color} />,
          tabBarButtonTestID: 'friends-tab',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          headerShown: false,
          tabBarIcon: ({ color }) => <SettingsIcon color={color} />,
          tabBarButtonTestID: 'settings-tab',
        }}
      />
    </Tabs>
  );
}
