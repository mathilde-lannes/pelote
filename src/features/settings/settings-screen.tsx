import Env from 'env';
import * as React from 'react';

import {
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

  return (
    <SafeAreaView className="flex-1 bg-black" edges={['top']}>
      <FocusAwareStatusBar />

      <ScrollView className="bg-black">
        <View className="flex-1 px-4 pt-4">
          <Text className="text-2xl font-semibold text-white">
            Settings
          </Text>

          <SettingsContainer title="Account">
            <SettingsItem
              text="Ravelry user"
              value={user?.username ?? '—'}
            />
            <SettingsItem
              text="Auth"
              value="OAuth2"
            />
          </SettingsContainer>

          <SettingsContainer title="About">
            <SettingsItem text="App" value={Env.EXPO_PUBLIC_NAME} />
            <SettingsItem text="Version" value={Env.EXPO_PUBLIC_VERSION} />
            <SettingsItem
              text="Environment"
              value={Env.EXPO_PUBLIC_APP_ENV}
            />
            <SettingsItem text="Appearance" value="Dark" />
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

          <Text className="mb-10 text-center text-xs/5 text-fog-500">
            Pelote never ships a personal Ravelry Basic API key. Store builds
            require per-user OAuth2.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
