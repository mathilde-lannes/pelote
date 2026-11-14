import * as React from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { Text } from '@/components/ui';
import colors from '@/components/ui/colors';
import { Search, SlidersHorizontal } from '@/components/ui/icons';

type Props = {
  value: string;
  onChangeText: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onSubmit?: () => void;
  onClear?: () => void;
  onPressFilter?: () => void;
  inputRef?: React.RefObject<TextInput | null>;
};

export function ExploreSearchBar({
  value,
  onChangeText,
  onFocus,
  onBlur,
  onSubmit,
  onClear,
  onPressFilter,
  inputRef,
}: Props) {
  return (
    <View className="flex-row items-center gap-2 px-3 py-2">
      <View className="min-w-0 flex-1 flex-row items-center rounded-full bg-ink-200 px-3.5">
        <Search color={colors.fog[400]} width={18} height={18} strokeWidth={2} />
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          onFocus={onFocus}
          onBlur={onBlur}
          onSubmitEditing={onSubmit}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="off"
          placeholder="Search"
          placeholderTextColor={colors.fog[400]}
          className="ml-2 min-w-0 flex-1 py-2.5 text-base text-white"
          accessibilityLabel="Search patterns"
        />
        {value.length > 0
          ? (
              <Pressable
                onPress={onClear}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Clear search"
                className="ml-1 size-6 items-center justify-center rounded-full bg-ink-400"
              >
                <Text className="text-xs font-semibold text-fog-300">✕</Text>
              </Pressable>
            )
          : null}
      </View>
      <Pressable
        onPress={onPressFilter}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Filters"
        className="items-center justify-center px-1 py-2"
      >
        <SlidersHorizontal
          color={colors.white}
          width={22}
          height={22}
          strokeWidth={2}
        />
      </Pressable>
    </View>
  );
}
