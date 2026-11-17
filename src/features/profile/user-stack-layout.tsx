import type { ComponentProps } from 'react';
import { HeaderBackButton } from '@react-navigation/elements';
import { Stack, useRouter } from 'expo-router';

type Props = {
  /** Where to go when this stack has no history (cold deep link). */
  fallbackHref: string;
};

export function UserStackLayout({ fallbackHref }: Props) {
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
          router.replace(fallbackHref as never);
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
          headerLeft: backToApp,
        }}
      />
      <Stack.Screen
        name="feed/[id]"
        options={{
          title: 'Posts',
          headerLeft: backToApp,
        }}
      />
      <Stack.Screen
        name="designs/[id]"
        options={{
          title: 'Designs',
          headerLeft: backToApp,
        }}
      />
      <Stack.Screen
        name="stash/[id]"
        options={{
          title: 'Yarn',
          headerLeft: backToApp,
        }}
      />
      <Stack.Screen
        name="queue/[id]"
        options={{
          title: 'Queue',
          headerLeft: backToApp,
        }}
      />
      <Stack.Screen
        name="friends"
        options={{
          title: 'Friends',
          headerLeft: backToApp,
        }}
      />
    </Stack>
  );
}
