import type { RavelryPerson } from '@/lib/ravelry/types';
import { Image } from 'expo-image';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui';

export function ExplorePersonRow({
  person,
  onPress,
}: {
  person: RavelryPerson;
  onPress: () => void;
}) {
  const username = person.username?.trim() || `user-${person.id}`;
  const avatar = person.small_photo_url ?? person.photo_url ?? null;
  const subtitle = person.first_name?.trim()
    || person.about_me?.trim()
    || null;

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 border-b border-ink-300 py-3"
      accessibilityRole="button"
      accessibilityLabel={username}
    >
      {avatar
        ? (
            <Image
              source={{ uri: avatar }}
              style={{ width: 48, height: 48, borderRadius: 24 }}
              contentFit="cover"
            />
          )
        : (
            <View className="size-12 items-center justify-center rounded-full bg-ink-300">
              <Text className="font-semibold text-white">
                {username.slice(0, 1).toUpperCase() || '?'}
              </Text>
            </View>
          )}
      <View className="min-w-0 flex-1">
        <Text className="text-base text-white" numberOfLines={1}>
          {username}
        </Text>
        {subtitle
          ? (
              <Text className="mt-0.5 text-sm text-fog-400" numberOfLines={1}>
                {subtitle}
              </Text>
            )
          : null}
      </View>
    </Pressable>
  );
}
