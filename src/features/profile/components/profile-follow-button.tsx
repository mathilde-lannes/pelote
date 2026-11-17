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
  const label = followed ? 'friend' : 'add friend';
  const Icon = followed ? UserRoundCheck : UserRoundPlus;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: pending, busy: pending }}
      disabled={pending}
      hitSlop={8}
      onPress={onPress}
      testID="profile-follow"
      className="flex-row items-center gap-1.5"
    >
      <Text className="text-base font-semibold text-white">
        {label}
      </Text>
      {pending
        ? <ActivityIndicator color="#ffffff" size="small" />
        : <Icon color="#ffffff" />}
    </Pressable>
  );
}
