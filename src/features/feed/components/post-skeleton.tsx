import type { ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { MotiView } from 'moti';
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

function SkeletonBlock({
  className,
  style,
  delay = 0,
}: {
  className?: string;
  style?: ViewStyle;
  delay?: number;
}) {
  return (
    <MotiView
      from={{ opacity: 0.35 }}
      animate={{ opacity: 0.85 }}
      transition={{
        type: 'timing',
        duration: 750,
        loop: true,
        repeatReverse: true,
        delay,
      }}
      className={className}
      style={style}
    />
  );
}

export function PostSkeleton({ photoUri }: PostSkeletonProps) {
  return (
    <View style={{ height: POST_ITEM_HEIGHT }} className="bg-black">
      <View className="flex-row items-center gap-2.5 px-4 py-3">
        <SkeletonBlock className="size-8 rounded-full bg-ink-400" />
        <View className="min-w-0 flex-1 gap-1.5">
          <SkeletonBlock
            className="h-3.5 w-28 rounded bg-ink-300"
            delay={40}
          />
          <SkeletonBlock
            className="h-3 w-40 rounded bg-ink-200"
            delay={80}
          />
        </View>
      </View>
      {photoUri
        ? (
            <View
              style={{ width: '100%', height: POST_MEDIA_HEIGHT }}
              className="bg-ink-200"
            >
              <Image
                source={{ uri: photoUri }}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
              />
            </View>
          )
        : (
            <SkeletonBlock
              style={{ width: '100%', height: POST_MEDIA_HEIGHT }}
              className="bg-ink-200"
              delay={50}
            />
          )}
      <View style={{ height: POST_DOTS_HEIGHT }} />
      <View className="flex-row items-center gap-4 px-[18px] pt-2">
        <SkeletonBlock className="h-3 w-10 rounded bg-ink-300" delay={100} />
        <SkeletonBlock className="h-3 w-10 rounded bg-ink-300" delay={140} />
        <SkeletonBlock className="h-3 w-8 rounded bg-ink-300" delay={180} />
      </View>
      <View className="mt-3 gap-1.5 px-4">
        <SkeletonBlock className="h-3 w-64 rounded bg-ink-200" delay={120} />
        <SkeletonBlock className="h-3 w-32 rounded bg-ink-200" delay={160} />
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
