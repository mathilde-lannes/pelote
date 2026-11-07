import Env from 'env';
import * as React from 'react';

import {
  colors,
  FocusAwareStatusBar,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from '@/components/ui';
import { useAuthStore as useAuth } from '@/features/auth/use-auth-store';
import { SettingsContainer } from './components/settings-container';
import { SettingsItem } from './components/settings-item';

export function SettingsScreen() {
  const signOut = useAuth.use.signOut();
  const user = useAuth.use.user();
  const isDemo = useAuth.use.isDemo();

  return (
    <SafeAreaView className="flex-1 bg-oat-100" edges={['top']}>
      <FocusAwareStatusBar />

      <ScrollView className="bg-oat-100">
        <View className="flex-1 px-4 pt-4">
          <Text className="font-display text-2xl font-semibold text-charcoal-900">
            Settings
          </Text>

          {isDemo
            ? (
                <View className="mt-4 rounded-lg bg-moss-600 px-3 py-2">
                  <Text className="text-center text-xs font-medium text-oat-50">
                    DEMO MODE — signed in with mock data
                  </Text>
                </View>
              )
            : null}

          <SettingsContainer title="Account">
            <SettingsItem
              text="Ravelry user"
              value={user?.username ?? '—'}
            />
            <SettingsItem
              text="Auth"
              value={isDemo ? 'Demo (mock)' : 'OAuth2'}
            />
          </SettingsContainer>

          <SettingsContainer title="About">
            <SettingsItem text="App" value={Env.EXPO_PUBLIC_NAME} />
            <SettingsItem text="Version" value={Env.EXPO_PUBLIC_VERSION} />
            <SettingsItem
              text="Environment"
              value={Env.EXPO_PUBLIC_APP_ENV}
            />
          </SettingsContainer>

          <View className="my-8">
            <SettingsContainer>
              <SettingsItem
                text="Log out"
                onPress={() => {
                  void signOut();
                }}
              />
            </SettingsContainer>
          </View>

          <Text className="mb-10 text-center text-xs leading-5 text-charcoal-500">
            Pelote never ships a personal Ravelry Basic API key. Store builds
            require per-user OAuth2.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Keep colors import used for potential theming
void colors;
