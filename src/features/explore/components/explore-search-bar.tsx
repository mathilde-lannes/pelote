import * as React from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { Text } from '@/components/ui';
import colors from '@/components/ui/colors';
import { Search } from '@/components/ui/icons';

type Props = {
  value: string;
  onChangeText: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onSubmit?: () => void;
  onClear?: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
  inputRef?: React.RefObject<TextInput | null>;
};

export function ExploreSearchBar({
  value,
  onChangeText,
  onFocus,
  onBlur,
  onSubmit,
  onClear,
  onCancel,
  showCancel = false,
  inputRef,
}: Props) {
  return (
    <View className="flex-row items-center gap-2 border-b border-ink-300 px-3 py-2">
      <View className="min-w-0 flex-1 flex-row items-center rounded-xl border border-ink-300 bg-ink-100 px-3">
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
          placeholder="Search patterns"
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
                className="ml-1 size-6 items-center justify-center rounded-full bg-ink-300"
              >
                <Text className="text-xs font-semibold text-fog-300">✕</Text>
              </Pressable>
            )
          : null}
      </View>
      {showCancel
        ? (
            <Pressable
              onPress={onCancel}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Cancel search"
            >
              <Text className="text-base text-white">Cancel</Text>
            </Pressable>
          )
        : null}
    </View>
  );
}
