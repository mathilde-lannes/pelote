import { useLocalSearchParams } from 'expo-router';
import * as React from 'react';
import { ActivityIndicator, ScrollView } from 'react-native';

import { ExpandableText } from '@/components/expandable-text';
import { FocusAwareStatusBar, Text, View } from '@/components/ui';
import { useProject } from './api';
import { collectProjectPhotos } from './components/collect-project-photos';
import { PhotoCarousel } from './components/photo-carousel';

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

  const photos = React.useMemo(
    () => collectProjectPhotos(data?.first_photo, data?.photos),
    [data?.first_photo, data?.photos],
  );

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

  return (
    <ScrollView className="flex-1 bg-black">
      <FocusAwareStatusBar />
      <PhotoCarousel photos={photos} />
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
              <View className="mt-5">
                <ExpandableText
                  text={data.notes_html.replace(/<[^>]+>/g, ' ').trim()}
                  numberOfLines={2}
                  className="text-base/6 text-fog-300"
                  moreClassName="mt-1 text-sm text-fog-500"
                />
              </View>
            )
          : null}
      </View>
    </ScrollView>
  );
}
