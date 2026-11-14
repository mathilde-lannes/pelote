import * as React from 'react';

import { Pressable, Text, View } from '@/components/ui';
import { Add, ChevronDown, Heart } from '@/components/ui/icons';

type Props = {
  onPressTitle?: () => void;
};

export function ForYouHeader({ onPressTitle }: Props) {
  return (
    <View className="flex-row items-center justify-between px-6 py-3">
      <Pressable
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Add content"
      >
        <Add color="#ffffff" />
      </Pressable>

      <Pressable
        onPress={onPressTitle}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Switch feed"
        className="flex-row items-end gap-2"
      >
        <Text className="text-xl font-bold text-white">
          For you
        </Text>
        <View className="pb-0.5">
          <ChevronDown color="#ffffff" />
        </View>
      </Pressable>

      <Pressable
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Favorites"
      >
        <Heart color="#ffffff" />
      </Pressable>
    </View>
  );
}
