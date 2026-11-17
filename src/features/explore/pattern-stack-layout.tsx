import type { ComponentProps } from 'react';
import { HeaderBackButton } from '@react-navigation/elements';
import { Stack, useRouter } from 'expo-router';

type Props = {
  /** Where to go when this stack has no history (cold deep link). */
  fallbackHref: string;
};

export function PatternStackLayout({ fallbackHref }: Props) {
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
          title: 'Patterns',
          headerLeft: backToApp,
        }}
      />
      <Stack.Screen
        name="projects/index"
        options={{
          title: 'Projects',
          headerLeft: backToApp,
        }}
      />
      <Stack.Screen
        name="projects/[project-id]"
        options={{
          title: 'Posts',
        }}
      />
    </Stack>
  );
}
