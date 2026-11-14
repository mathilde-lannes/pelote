import type { FlatList as FlatListType } from 'react-native';
import type { PatternHighlight } from '@/lib/ravelry/types';
import { useLocalSearchParams, usePathname } from 'expo-router';
import * as React from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';

import { FocusAwareStatusBar, Text } from '@/components/ui';
import { FeedSkeletonScreen } from '@/features/feed/components/post-skeleton';
import { POST_ITEM_HEIGHT } from '@/features/feed/components/post-layout';
import { bestPhotoUrl } from '@/lib/ravelry/api';
import {
  usePattern,
  usePatternHighlights,
  useRecentlyPopularPatterns,
} from './api';
import { PatternPost } from './components/pattern-post';
import { patternPostItemHeight, patternPostOffset } from './pattern-feed-layout';

function FeedStatus({ message }: { message: string }) {
  return (
    <View className="flex-1 items-center justify-center bg-black px-6">
      <FocusAwareStatusBar />
      <Text className="text-center text-base text-fog-400">{message}</Text>
    </View>
  );
}

function toHighlight(pattern: PatternHighlight['pattern']): PatternHighlight {
  return {
    id: `pattern:${pattern.id}`,
    timeline_date: null,
    pattern,
  };
}

function PatternFeedRow({ item }: { item: PatternHighlight }) {
  return (
    <View style={{ height: POST_ITEM_HEIGHT }} className="overflow-hidden bg-black">
      <PatternPost item={item} />
    </View>
  );
}

export function PatternFeedScreen() {
  const pathname = usePathname();
  const params = useLocalSearchParams<{ id: string }>();
  const startId = String(params.id ?? '').trim();
  const patternId = Number(startId);
  // Search stack opens recently popular; Home opens highlights. Avoid waiting
  // on the unused list (spinner → content jump).
  const fromSearch = pathname.startsWith('/search');

  const highlightsQuery = usePatternHighlights({ enabled: !fromSearch });
  const popularQuery = useRecentlyPopularPatterns({ enabled: fromSearch });

  const highlights = React.useMemo(
    () => (highlightsQuery.data?.pages ?? []).flatMap(page => page.highlights),
    [highlightsQuery.data],
  );
  const popular = React.useMemo(
    () => (popularQuery.data?.pages ?? []).flatMap(page =>
      page.patterns.map(toHighlight),
    ),
    [popularQuery.data],
  );

  const inHighlights = React.useMemo(
    () => !fromSearch && highlights.some(item => String(item.pattern.id) === startId),
    [fromSearch, highlights, startId],
  );
  const inPopular = React.useMemo(
    () => fromSearch && popular.some(item => String(item.pattern.id) === startId),
    [fromSearch, popular, startId],
  );

  const listPending = fromSearch
    ? popularQuery.isPending && !popular.length
    : highlightsQuery.isPending && !highlights.length;

  // Deep links / other entry points — fetch Pattern#show when not in the list.
  const patternQuery = usePattern({
    variables: { id: patternId },
    enabled:
      Boolean(startId)
      && Number.isFinite(patternId)
      && patternId > 0
      && !listPending
      && !inHighlights
      && !inPopular,
  });

  const items = React.useMemo(() => {
    if (inHighlights)
      return highlights;
    if (inPopular)
      return popular;
    if (patternQuery.data)
      return [toHighlight(patternQuery.data)];
    return [];
  }, [highlights, inHighlights, inPopular, patternQuery.data, popular]);

  const listSource
    = inHighlights
      ? 'highlights'
      : inPopular
        ? 'popular'
        : 'single';
  const listQuery
    = listSource === 'highlights'
      ? highlightsQuery
      : listSource === 'popular'
        ? popularQuery
        : null;

  const listRef = React.useRef<FlatListType<PatternHighlight>>(null);
  const startIndex = React.useMemo(() => {
    if (!startId || !items.length || listSource === 'single')
      return 0;
    const index = items.findIndex(
      item => String(item.pattern.id) === startId,
    );
    return index >= 0 ? index : 0;
  }, [items, listSource, startId]);

  const getItemLayout = React.useCallback(
    (_: ArrayLike<PatternHighlight> | null | undefined, index: number) => ({
      length: patternPostItemHeight(items[index]!),
      offset: patternPostOffset(items, index),
      index,
    }),
    [items],
  );

  const onScrollToIndexFailed = React.useCallback(
    (info: { index: number }) => {
      listRef.current?.scrollToOffset({
        offset: patternPostOffset(items, info.index),
        animated: false,
      });
    },
    [items],
  );

  const skeletonPhoto = React.useMemo(() => {
    const match = items.find(item => String(item.pattern.id) === startId)
      ?? items[0];
    return bestPhotoUrl(match?.pattern.photos[0] ?? null);
  }, [items, startId]);

  if (!startId)
    return <FeedStatus message="Missing pattern" />;

  if (listPending || (listSource === 'single' && patternQuery.isPending)) {
    return <FeedSkeletonScreen photoUri={skeletonPhoto} />;
  }

  if (!fromSearch && highlightsQuery.isError && !highlights.length)
    return <FeedStatus message="Couldn’t load highlights." />;

  if (fromSearch && popularQuery.isError && !popular.length)
    return <FeedStatus message="Couldn’t load popular patterns." />;

  if (listSource === 'single' && patternQuery.isError)
    return <FeedStatus message="Couldn’t load this pattern." />;

  if (!items.length)
    return <FeedStatus message="Pattern not found." />;

  return (
    <View className="flex-1 bg-black">
      <FocusAwareStatusBar />
      <FlatList
        ref={listRef}
        data={items}
        keyExtractor={item => item.id}
        key={`${pathname}:${startId}`}
        getItemLayout={getItemLayout}
        initialScrollIndex={startIndex > 0 ? startIndex : undefined}
        // Keep the first paint light — virtualize around startIndex instead of
        // mounting every row up to the tapped pattern (that froze the UI).
        initialNumToRender={3}
        maxToRenderPerBatch={2}
        windowSize={5}
        updateCellsBatchingPeriod={50}
        onEndReached={() => {
          if (
            listQuery
            && listQuery.hasNextPage
            && !listQuery.isFetchingNextPage
          ) {
            listQuery.fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        onScrollToIndexFailed={onScrollToIndexFailed}
        renderItem={({ item }) => <PatternFeedRow item={item} />}
        ListFooterComponent={
          listQuery?.isFetchingNextPage
            ? (
                <View className="items-center py-4">
                  <ActivityIndicator color="#ffffff" />
                </View>
              )
            : null
        }
      />
    </View>
  );
}
