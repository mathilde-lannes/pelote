import type { RavelryPerson } from '@/lib/ravelry/types';
import { Image } from 'expo-image';

import * as React from 'react';
import { Button, Text, View } from '@/components/ui';

type Props = {
  item: RavelryPerson;
  isFriend: boolean;
  onAdd: (person: RavelryPerson) => void;
  onRemove: (username: string) => void;
};

export function FriendRow({ item, isFriend, onAdd, onRemove }: Props) {
  const username = item.username?.trim() || `user-${item.id}`;
  const initial = username.slice(0, 1).toUpperCase() || '?';

  return (
    <View className="mb-3 flex-row items-center gap-3 border-b border-ink-300 px-1 py-3">
      {item.small_photo_url
        ? (
            <Image
              source={{ uri: item.small_photo_url }}
              style={{ width: 48, height: 48, borderRadius: 24 }}
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
