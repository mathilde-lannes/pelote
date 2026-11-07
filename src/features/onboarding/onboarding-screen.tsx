import { useRouter } from 'expo-router';
import * as React from 'react';

import { PeloteWordmark } from '@/components/brand/pelote-wordmark';
import {
  Button,
  FocusAwareStatusBar,
  SafeAreaView,
  Text,
  View,
} from '@/components/ui';
import { useIsFirstTime } from '@/lib/hooks';

export function OnboardingScreen() {
  const [_, setIsFirstTime] = useIsFirstTime();
  const router = useRouter();
  return (
    <SafeAreaView className="flex h-full bg-black px-6" edges={['top', 'bottom']}>
      <FocusAwareStatusBar />
      <View className="flex-1 items-center justify-center">
        <PeloteWordmark size="lg" subtitle="Connects to Ravelry" />
        <Text className="mt-10 text-center text-2xl font-semibold text-white">
          Friends’ knitting, photo-first
        </Text>
        <Text className="mt-4 text-center text-base/6 text-fog-400">
          Browse full-bleed project photos from people and designers you follow
          — an Instagram-style feed powered by your Ravelry social graph.
        </Text>
        <View className="mt-8 gap-2 self-stretch">
          <Text className="text-base text-fog-300">
            • Multi-user Ravelry OAuth only
          </Text>
          <Text className="text-base text-fog-300">
            • Friends activity, full-bleed photos
          </Text>
          <Text className="text-base text-fog-300">
            • Find friends & designers when the feed is empty
          </Text>
        </View>
      </View>
      <View className="mb-4">
        <Button
          label="Continue"
          onPress={() => {
            setIsFirstTime(false);
            router.replace('/login');
          }}
        />
      </View>
    </SafeAreaView>
  );
}
