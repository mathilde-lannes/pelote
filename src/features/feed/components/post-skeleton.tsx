import { Image } from 'expo-image';
import * as React from 'react';
import { View } from 'react-native';

import { FocusAwareStatusBar } from '@/components/ui';
import {
  POST_DOTS_HEIGHT,
  POST_ITEM_HEIGHT,
  POST_MEDIA_HEIGHT,
} from '@/features/feed/components/post-layout';

type PostSkeletonProps = {
  /** Optional cover while details load — keeps the media plane familiar. */
  photoUri?: string | null;
};

export function PostSkeleton({ photoUri }: PostSkeletonProps) {
  return (
    <View style={{ height: POST_ITEM_HEIGHT }} className="bg-black">
      <View className="flex-row items-center gap-2.5 px-4 py-3">
        <View className="size-8 rounded-full bg-ink-400" />
        <View className="min-w-0 flex-1 gap-1.5">
          <View className="h-3.5 w-28 rounded bg-ink-300" />
          <View className="h-3 w-40 rounded bg-ink-200" />
        </View>
      </View>
      <View
        style={{ width: '100%', height: POST_MEDIA_HEIGHT }}
        className="bg-ink-200"
      >
        {photoUri
          ? (
              <Image
                source={{ uri: photoUri }}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
              />
            )
          : null}
      </View>
      <View style={{ height: POST_DOTS_HEIGHT }} />
      <View className="flex-row items-center gap-4 px-[18px] pt-2">
        <View className="h-3 w-10 rounded bg-ink-300" />
        <View className="h-3 w-10 rounded bg-ink-300" />
        <View className="h-3 w-8 rounded bg-ink-300" />
      </View>
      <View className="mt-3 gap-1.5 px-4">
        <View className="h-3 w-64 rounded bg-ink-200" />
        <View className="h-3 w-32 rounded bg-ink-200" />
      </View>
    </View>
  );
}

/** Full-screen feed placeholder shown while the first page/details load. */
export function FeedSkeletonScreen({
  photoUri,
  count = 2,
}: {
  photoUri?: string | null;
  count?: number;
}) {
  const items = React.useMemo(
    () => Array.from({ length: Math.max(1, count) }, (_, index) => index),
    [count],
  );

  return (
    <View className="flex-1 bg-black">
      <FocusAwareStatusBar />
      {items.map(index => (
        <PostSkeleton
          key={`feed-skeleton-${index}`}
          photoUri={index === 0 ? photoUri : null}
        />
      ))}
    </View>
  );
}
