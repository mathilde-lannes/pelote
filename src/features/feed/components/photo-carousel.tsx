import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import type { RavelryPhoto } from '@/lib/ravelry/types';
import { Image } from 'expo-image';
import * as React from 'react';
import {
  Dimensions,
  FlatList,

  View,
} from 'react-native';

import { Text } from '@/components/ui';
import { bestPhotoUrl } from '@/lib/ravelry/api';

const SCREEN_WIDTH = Dimensions.get('window').width;
const ASPECT = 4 / 5;

function Dots({ count, index }: { count: number; index: number }) {
  if (count <= 1)
    return null;
  return (
    <View className="absolute bottom-3 w-full flex-row items-center justify-center gap-1.5">
      {Array.from({ length: count }, (_, i) => (
        <View
          key={i}
          className={`size-1.5 rounded-full ${
            i === index ? 'bg-white' : 'bg-white/40'
          }`}
        />
      ))}
    </View>
  );
}

function Counter({ index, count }: { index: number; count: number }) {
  if (count <= 1)
    return null;
  return (
    <View className="absolute top-3 right-3 rounded-full bg-black/55 px-2.5 py-1">
      <Text className="text-xs font-medium text-white">
        {index + 1}
        /
        {count}
      </Text>
    </View>
  );
}

export function PhotoCarousel({ photos }: { photos: RavelryPhoto[] }) {
  const [index, setIndex] = React.useState(0);
  const uris = React.useMemo(
    () =>
      photos
        .map(photo => bestPhotoUrl(photo))
        .filter((uri): uri is string => Boolean(uri)),
    [photos],
  );

  const onScroll = React.useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const next = Math.round(
        event.nativeEvent.contentOffset.x / SCREEN_WIDTH,
      );
      if (next !== index && next >= 0 && next < uris.length)
        setIndex(next);
    },
    [index, uris.length],
  );

  // Always reserve media height so parent lists don't jump when photos load.
  return (
    <View style={{ width: SCREEN_WIDTH, aspectRatio: ASPECT }} className="bg-ink-200">
      {uris.length
        ? (
            <>
              <FlatList
                data={uris}
                horizontal
                pagingEnabled
                bounces={false}
                showsHorizontalScrollIndicator={false}
                keyExtractor={(uri, i) => `${uri}-${i}`}
                onScroll={onScroll}
                scrollEventThrottle={16}
                renderItem={({ item }) => (
                  <Image
                    source={{ uri: item }}
                    style={{ width: SCREEN_WIDTH, height: '100%' }}
                    contentFit="cover"
                  />
                )}
              />
              <Counter index={index} count={uris.length} />
              <Dots count={uris.length} index={index} />
            </>
          )
        : null}
    </View>
  );
}
