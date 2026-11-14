import { HeaderBackButton } from '@react-navigation/elements';
import { Stack, useRouter } from 'expo-router';
import type { ComponentProps } from 'react';

export default function UserProfileLayout() {
  const router = useRouter();

  const backToApp = (props: ComponentProps<typeof HeaderBackButton>) => (
    <HeaderBackButton
      {...props}
      tintColor="#ffffff"
      displayMode="minimal"
      onPress={() => {
        if (router.canGoBack())
          router.back();
        else
          router.replace('/');
      }}
    />
  );

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#000000' },
        headerTintColor: '#ffffff',
        headerShadowVisible: false,
        headerBackButtonDisplayMode: 'minimal',
        contentStyle: { backgroundColor: '#000000' },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Profile',
          // Nested index has no prior screen in this stack; pop the root navigator.
          headerLeft: backToApp,
        }}
      />
      <Stack.Screen
        name="feed/[id]"
        options={{
          title: 'Posts',
          // Opened directly from a grid (skipping profile index) — same root back.
          headerLeft: backToApp,
        }}
      />
      <Stack.Screen
        name="designs/[id]"
        options={{
          title: 'Designs',
          // Opened from a project post trailing icon — same root back.
          headerLeft: backToApp,
        }}
      />
    </Stack>
  );
}
