import type { SvgProps } from 'react-native-svg';
import { Redirect, Tabs } from 'expo-router';
import * as React from 'react';

import { colors } from '@/components/ui';
import {
  Home as HomeIcon,
  Library as LibraryIcon,
  Message as MessageIcon,
  Profile as ProfileIcon,
  Search as SearchIcon,
} from '@/components/ui/icons';
import { useAuthStore as useAuth } from '@/features/auth/use-auth-store';
import { useIsFirstTime } from '@/lib/hooks/use-is-first-time';

function tabIcon(Icon: React.ComponentType<SvgProps>) {
  return ({ color, focused }: { color: string; focused: boolean }) => (
    <Icon color={color} strokeWidth={focused ? 3 : 2} />
  );
}

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
        name="(home)"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: tabIcon(HomeIcon),
          tabBarButtonTestID: 'home-tab',
        }}
        listeners={({ navigation }) => ({
          // One tap from anywhere returns to the For You / Friends feed.
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('(home)', { screen: 'index' });
          },
        })}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          headerShown: false,
          tabBarIcon: tabIcon(LibraryIcon),
          tabBarButtonTestID: 'library-tab',
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          headerShown: false,
          tabBarIcon: tabIcon(MessageIcon),
          tabBarButtonTestID: 'messages-tab',
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          headerShown: false,
          tabBarIcon: tabIcon(SearchIcon),
          tabBarButtonTestID: 'search-tab',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerShown: false,
          tabBarIcon: tabIcon(ProfileIcon),
          tabBarButtonTestID: 'profile-tab',
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          href: null,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          href: null,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
