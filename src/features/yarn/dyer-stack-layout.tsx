import type { ComponentProps } from 'react';
import { HeaderBackButton } from '@react-navigation/elements';
import { Stack, useRouter } from 'expo-router';

type Props = {
  fallbackHref: string;
};

export function DyerStackLayout({ fallbackHref }: Props) {
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
          title: 'Dyer',
          headerLeft: backToApp,
        }}
      />
    </Stack>
  );
}
