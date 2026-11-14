import * as React from 'react';

import {
  FocusAwareStatusBar,
  SafeAreaView,
  Text,
  View,
} from '@/components/ui';

export function LibraryScreen() {
  return (
    <SafeAreaView className="flex-1 bg-black px-6" edges={['top']}>
      <FocusAwareStatusBar />
      <View className="flex-1 items-center justify-center">
        <Text className="text-2xl font-semibold text-white">
          Library
        </Text>
        <Text className="mt-3 text-center text-base/6 text-fog-400">
          Your pattern library is coming soon.
        </Text>
      </View>
    </SafeAreaView>
  );
}
