import * as React from 'react';
import { ActivityIndicator, Pressable } from 'react-native';

import { Text } from '@/components/ui';
import { UserRoundCheck, UserRoundPlus } from '@/components/ui/icons';

type Props = {
  followed: boolean;
  pending: boolean;
  onPress: () => void;
};

export function ProfileFollowButton({ followed, pending, onPress }: Props) {
  const label = followed ? null : 'Follow';
  const Icon = followed ? UserRoundCheck : UserRoundPlus;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label ?? 'Followed'}
      accessibilityState={{ disabled: pending, busy: pending }}
      disabled={pending}
      hitSlop={8}
      onPress={onPress}
      testID="profile-follow"
      className="flex-row items-center gap-1.5 rounded-full bg-ink-300 px-3 py-1.5"
    >
      {label && (
        <Text className="text-base font-semibold text-white">{label}</Text>
      )}
      {pending
        ? (
            <ActivityIndicator color="#ffffff" size="small" />
          )
        : (
            <Icon color="#ffffff" />
          )}
    </Pressable>
  );
}
