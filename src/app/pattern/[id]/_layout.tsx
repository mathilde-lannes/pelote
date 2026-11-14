import { HeaderBackButton } from '@react-navigation/elements';
import { Stack, useRouter } from 'expo-router';
import type { ComponentProps } from 'react';

export default function PatternLayout() {
  const router = useRouter();

  const backToApp = (props: ComponentProps<typeof HeaderBackButton>) => (
    <HeaderBackButton
      {...props}
      tintColor="#ffffff"
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
        contentStyle: { backgroundColor: '#000000' },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Patterns',
          // Nested entry has no prior screen in this stack; pop the root navigator.
          headerLeft: backToApp,
        }}
      />
      <Stack.Screen
        name="projects/index"
        options={{
          title: 'Projects',
          // Opened directly from a post (skipping pattern index) — same root back.
          headerLeft: backToApp,
        }}
      />
      <Stack.Screen
        name="projects/[projectId]"
        options={{
          title: 'Posts',
          headerBackTitle: 'Projects',
        }}
      />
    </Stack>
  );
}
