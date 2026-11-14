import type { ViewProps } from 'react-native';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as React from 'react';
import { StyleSheet } from 'react-native';
import FlashMessage from 'react-native-flash-message';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeConfig } from '@/components/ui/use-theme-config';
import { hydrateAuth, setAuthUser, useAuthStore } from '@/features/auth/use-auth-store';

import { APIProvider } from '@/lib/api';
import { loadSelectedTheme } from '@/lib/hooks/use-selected-theme';
import { fetchCurrentUser } from '@/lib/ravelry/api';
// Import  global CSS file
import '../global.css';

export { ErrorBoundary } from 'expo-router';

// eslint-disable-next-line react-refresh/only-export-components
export const unstable_settings = {
  initialRouteName: '(app)',
};

hydrateAuth();
loadSelectedTheme();
SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({
  duration: 500,
  fade: true,
});

export default function RootLayout() {
  const hasHiddenSplash = React.useRef(false);
  const status = useAuthStore.use.status();
  const user = useAuthStore.use.user();

  React.useEffect(() => {
    if (status !== 'signIn' || user)
      return;

    let cancelled = false;
    (async () => {
      try {
        const next = await fetchCurrentUser();
        if (!cancelled)
          setAuthUser(next);
      }
      catch (e) {
        console.error(e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [status, user]);

  const onLayoutRootView = React.useCallback(() => {
    if (hasHiddenSplash.current) {
      return;
    }

    hasHiddenSplash.current = true;
    SplashScreen.hide();
  }, []);

  return (
    <Providers onLayout={onLayoutRootView}>
      <Stack>
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen
          name="project/[username]/[id]"
          options={{
            title: 'Project',
            headerBackTitle: 'Feed',
          }}
        />
        <Stack.Screen
          name="pattern/[id]"
          options={{
            title: 'Patterns',
            headerBackTitle: 'Explore',
          }}
        />
        <Stack.Screen
          name="user/[username]"
          options={{ headerShown: false }}
        />
      </Stack>
    </Providers>
  );
}

function Providers({
  children,
  onLayout,
}: {
  children: React.ReactNode;
  onLayout: ViewProps['onLayout'];
}) {
  const theme = useThemeConfig();
  const insets = useSafeAreaInsets();
  return (
    <GestureHandlerRootView
      onLayout={onLayout}
      style={styles.container}
    >
      <KeyboardProvider>
        <ThemeProvider value={theme}>
          <APIProvider>
            <BottomSheetModalProvider>
              {children}
              <FlashMessage position="top" statusBarHeight={insets.top} />
            </BottomSheetModalProvider>
          </APIProvider>
        </ThemeProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
});
