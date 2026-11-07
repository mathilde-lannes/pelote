import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import * as React from 'react';
import { ActivityIndicator, ScrollView } from 'react-native';

import { FocusAwareStatusBar, Text, View } from '@/components/ui';
import { bestPhotoUrl } from '@/lib/ravelry/api';
import { useProject } from './api';

export function ProjectDetailScreen() {
  const params = useLocalSearchParams<{
    username: string;
    id: string;
  }>();

  const { data, isPending, isError } = useProject({
    variables: {
      username: String(params.username ?? ''),
      id: String(params.id ?? ''),
    },
  });

  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <FocusAwareStatusBar />
        <ActivityIndicator color="#ffffff" />
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View className="flex-1 items-center justify-center bg-black px-6">
        <FocusAwareStatusBar />
        <Text className="text-center text-base text-fog-400">
          Couldn’t load this project.
        </Text>
      </View>
    );
  }

  const hero = bestPhotoUrl(data.first_photo ?? data.photos?.[0]);

  return (
    <ScrollView className="flex-1 bg-black">
      <FocusAwareStatusBar />
      {hero
        ? (
            <Image
              source={{ uri: hero }}
              style={{ width: '100%', aspectRatio: 4 / 5 }}
              contentFit="cover"
            />
          )
        : null}
      <View className="px-4 py-5">
        <Text className="text-2xl font-semibold text-white">
          {data.name}
        </Text>
        {data.pattern_name
          ? (
              <Text className="mt-1 text-base text-fog-400">
                {data.pattern_name}
              </Text>
            )
          : null}
        <View className="mt-4 flex-row flex-wrap gap-2">
          {data.status_name
            ? (
                <View className="rounded-md bg-ink-200 px-2 py-1">
                  <Text className="text-xs text-fog-300">
                    {data.status_name}
                  </Text>
                </View>
              )
            : null}
          {typeof data.progress === 'number'
            ? (
                <View className="rounded-md bg-ink-200 px-2 py-1">
                  <Text className="text-xs text-fog-300">
                    {data.progress}
                    %
                  </Text>
                </View>
              )
            : null}
          {data.craft_name
            ? (
                <View className="rounded-md bg-ink-200 px-2 py-1">
                  <Text className="text-xs text-fog-300">{data.craft_name}</Text>
                </View>
              )
            : null}
        </View>
        {data.notes_html
          ? (
              <Text className="mt-5 text-base/6 text-fog-300">
                {data.notes_html.replace(/<[^>]+>/g, ' ').trim()}
              </Text>
            )
          : null}
      </View>
    </ScrollView>
  );
}
