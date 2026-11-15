import type { FlatList as FlatListType } from 'react-native';
import type { RavelryColorway } from './api';
import { useLocalSearchParams } from 'expo-router';
import * as React from 'react';
import { FlatList } from 'react-native';

import { FocusAwareStatusBar, Text, View } from '@/components/ui';
import { POST_ITEM_HEIGHT } from '@/features/feed/components/post-layout';
import { FeedSkeletonScreen } from '@/features/feed/components/post-skeleton';
import { ColorwayFeedPost } from './colorway-feed-post';
import { useYarnColorways } from './api';

function FeedStatus({ message }: { message: string }) {
  return (
    <View className="flex-1 items-center justify-center bg-black px-6">
      <FocusAwareStatusBar />
      <Text className="text-center text-base text-fog-400">{message}</Text>
    </View>
  );
}

function useColorwaysFeedScroll(
  yarnId: string,
  startId: string,
  colorways: RavelryColorway[],
) {
  const listRef = React.useRef<FlatListType<RavelryColorway>>(null);
  const didScroll = React.useRef(false);

  const startIndex = React.useMemo(() => {
    if (!startId || !colorways.length)
      return 0;
    const index = colorways.findIndex(
      colorway => String(colorway.id) === startId,
    );
    return index >= 0 ? index : 0;
  }, [colorways, startId]);

  React.useEffect(() => {
    didScroll.current = false;
  }, [yarnId, startId]);

  const getItemLayout = React.useCallback(
    (_: ArrayLike<RavelryColorway> | null | undefined, index: number) => ({
      length: POST_ITEM_HEIGHT,
      offset: POST_ITEM_HEIGHT * index,
      index,
    }),
    [],
  );

  const scrollToStart = React.useCallback(() => {
    if (didScroll.current || startIndex <= 0 || !colorways.length)
      return;
    listRef.current?.scrollToIndex({
      index: startIndex,
      animated: false,
      viewPosition: 0,
    });
    didScroll.current = true;
  }, [colorways.length, startIndex]);

  const onScrollToIndexFailed = React.useCallback(
    (info: { index: number }) => {
      setTimeout(() => {
        listRef.current?.scrollToOffset({
          offset: POST_ITEM_HEIGHT * info.index,
          animated: false,
        });
        didScroll.current = true;
      }, 16);
    },
    [],
  );

  return {
    listRef,
    startIndex,
    getItemLayout,
    scrollToStart,
    onScrollToIndexFailed,
  };
}

export function YarnColorwaysFeedScreen() {
  const params = useLocalSearchParams<{ id: string; colorwayId: string }>();
  const yarnIdRaw = String(params.id ?? '').trim();
  const startId = String(params.colorwayId ?? '').trim();
  const yarnId = Number(yarnIdRaw);
  const enabled = Number.isFinite(yarnId) && yarnId > 0;

  const colorwaysQuery = useYarnColorways({
    variables: { yarnId },
    enabled,
  });

  const colorways = colorwaysQuery.data ?? [];

  const {
    listRef,
    startIndex,
    getItemLayout,
    scrollToStart,
    onScrollToIndexFailed,
  } = useColorwaysFeedScroll(yarnIdRaw, startId, colorways);

  if (!enabled)
    return <FeedStatus message="Missing yarn" />;

  if (colorwaysQuery.isPending && !colorways.length)
    return <FeedSkeletonScreen />;

  if (colorwaysQuery.isError && !colorways.length)
    return <FeedStatus message="Couldn't load colorways." />;

  return (
    <View className="flex-1 bg-black">
      <FocusAwareStatusBar />
      <FlatList
        ref={listRef}
        data={colorways}
        keyExtractor={(item: RavelryColorway) => String(item.id)}
        key={`${yarnIdRaw}:colorway:${startId}`}
        getItemLayout={getItemLayout}
        initialScrollIndex={startIndex > 0 ? startIndex : undefined}
        initialNumToRender={3}
        maxToRenderPerBatch={2}
        windowSize={5}
        updateCellsBatchingPeriod={50}
        onLayout={scrollToStart}
        onScrollToIndexFailed={onScrollToIndexFailed}
        renderItem={({ item }) => (
          <ColorwayFeedPost yarnId={yarnId} colorway={item} />
        )}
        ListEmptyComponent={(
          <Text className="mt-10 text-center text-sm text-fog-400">
            No colorways yet.
          </Text>
        )}
      />
    </View>
  );
}
