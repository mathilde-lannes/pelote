import type { FeedMode } from '../feed-mode';
import type { OptionType } from '@/components/ui';
import * as React from 'react';

import { Options, Pressable, Text, useModal, View } from '@/components/ui';
import { Add, ChevronDown, Heart } from '@/components/ui/icons';
import { FEED_MODE_OPTIONS, feedModeLabel } from '../feed-mode';

type Props = {
  value: FeedMode;
  onChange: (mode: FeedMode) => void;
};

export function ForYouHeader({ value, onChange }: Props) {
  const modal = useModal();

  const onSelect = React.useCallback(
    (option: OptionType) => {
      onChange(option.value as FeedMode);
      modal.dismiss();
    },
    [modal, onChange],
  );

  return (
    <>
      <View className="flex-row items-center justify-between px-6 py-3">
        <Pressable
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Add content"
        >
          <Add color="#ffffff" />
        </Pressable>

        <Pressable
          onPress={modal.present}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Switch feed"
          testID="feed-mode-switch"
          className="flex-row items-end gap-2"
        >
          <Text className="text-xl font-bold text-white">
            {feedModeLabel(value)}
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

      <Options
        ref={modal.ref}
        options={[...FEED_MODE_OPTIONS]}
        onSelect={onSelect}
        value={value}
        appearance="dark"
        testID="feed-mode-options"
      />
    </>
  );
}
