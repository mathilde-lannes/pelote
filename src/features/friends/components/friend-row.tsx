import type { RavelryPerson } from '@/lib/ravelry/types';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

import * as React from 'react';
import { Button, Pressable, Text, View } from '@/components/ui';

type Props = {
  item: RavelryPerson;
  isFriend: boolean;
  onAdd: (person: RavelryPerson) => void;
  onRemove: (username: string) => void;
};

export function FriendRow({ item, isFriend, onAdd, onRemove }: Props) {
  const router = useRouter();
  const username = item.username?.trim() || `user-${item.id}`;
  const initial = username.slice(0, 1).toUpperCase() || '?';
  const avatarUrl = item.small_photo_url ?? item.photo_url ?? null;

  const openProfile = React.useCallback(() => {
    router.push(`/user/${username}`);
  }, [router, username]);

  return (
    <View className="mb-3 flex-row items-center gap-3 border-b border-ink-300 px-1 py-3">
      <Pressable
        onPress={openProfile}
        accessibilityRole="button"
        accessibilityLabel={`Open ${username} profile`}
        className="flex-row items-center gap-3 flex-1"
      >
        {avatarUrl
          ? (
              <Image
                source={{ uri: avatarUrl }}
                style={{ width: 48, height: 48, borderRadius: 24 }}
                contentFit="cover"
              />
            )
          : (
              <View className="size-12 items-center justify-center rounded-full bg-ink-300">
                <Text className="font-semibold text-white">
                  {initial}
                </Text>
              </View>
            )}
        <View className="flex-1">
          <Text className="text-base font-semibold text-white">
            {username}
          </Text>
          {item.first_name || item.about_me
            ? (
                <Text className="text-sm text-fog-400" numberOfLines={2}>
                  {item.about_me ?? item.first_name}
                </Text>
              )
            : null}
        </View>
      </Pressable>
      {isFriend
        ? (
            <Button
              size="sm"
              variant="outline"
              label="Remove"
              onPress={() => onRemove(username)}
            />
          )
        : (
            <Button
              size="sm"
              label="Add"
              onPress={() => onAdd({ ...item, username })}
            />
          )}
    </View>
  );
}
