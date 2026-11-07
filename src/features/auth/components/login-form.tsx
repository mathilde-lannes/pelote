import Env from 'env';
import * as React from 'react';

import { ActivityIndicator } from 'react-native';
import { PeloteWordmark } from '@/components/brand/pelote-wordmark';
import { Button, SafeAreaView, Text, View } from '@/components/ui';

export type LoginFormProps = {
  onOAuth?: () => void;
  onDemo?: () => void;
  loading?: boolean;
  error?: string | null;
  oauthAvailable?: boolean;
};

export function LoginForm({
  onOAuth,
  onDemo,
  loading = false,
  error,
  oauthAvailable = false,
}: LoginFormProps) {
  const demoEnabled
    = Env.EXPO_PUBLIC_ENABLE_DEMO_MODE
      || Env.EXPO_PUBLIC_APP_ENV === 'development';

  return (
    <SafeAreaView className="flex-1 justify-center bg-black px-6" edges={['top', 'bottom']}>
      <View className="mb-10 items-center">
        <PeloteWordmark
          size="lg"
          subtitle="Ravelry companion feed"
        />
      </View>

      <Text className="mb-6 text-center text-base/6 text-fog-400">
        Sign in with your Ravelry account to see friends’ project photos in an
        Instagram-style feed. Your personal API key is never used.
      </Text>

      {error
        ? (
            <View className="mb-4 rounded-lg bg-danger-50 px-3 py-2">
              <Text className="text-sm text-danger-600">{error}</Text>
            </View>
          )
        : null}

      {loading
        ? (
            <View className="items-center py-4">
              <ActivityIndicator color="#ffffff" />
              <Text className="mt-2 text-sm text-fog-400">
                Connecting to Ravelry…
              </Text>
            </View>
          )
        : (
            <View className="gap-3">
              <Button
                testID="oauth-login-button"
                label={
                  oauthAvailable
                    ? 'Continue with Ravelry'
                    : 'Ravelry OAuth (configure client id)'
                }
                onPress={onOAuth}
                disabled={!oauthAvailable || loading}
              />

              {demoEnabled
                ? (
                    <View className="mt-2">
                      <View className="mb-2 rounded-lg border border-ink-300 bg-ink-100 px-3 py-2">
                        <Text className="text-center text-xs font-medium text-fog-400">
                          DEMO MODE — labeled mock data, not live Ravelry
                        </Text>
                      </View>
                      <Button
                        testID="demo-login-button"
                        label="Browse demo feed"
                        variant="secondary"
                        onPress={onDemo}
                      />
                    </View>
                  )
                : null}
            </View>
          )}

      <Text className="mt-8 text-center text-xs/5 text-fog-500">
        Production and store builds require multi-user OAuth2 only. Register a
        Ravelry app with redirect
        {' '}
        {Env.EXPO_PUBLIC_SCHEME}
        ://
        {Env.EXPO_PUBLIC_RAVELRY_REDIRECT_PATH}
        {' '}
        and scope
        {' '}
        offline
        .
      </Text>
    </SafeAreaView>
  );
}
