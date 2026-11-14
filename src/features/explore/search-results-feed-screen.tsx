import type { FlatList as FlatListType } from 'react-native';
import type { PatternHighlight, RavelryPattern } from '@/lib/ravelry/types';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import * as React from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';

import { FocusAwareStatusBar, Text } from '@/components/ui';
import { POST_ITEM_HEIGHT } from '@/features/feed/components/post-layout';
import { FeedSkeletonScreen } from '@/features/feed/components/post-skeleton';
import { bestPhotoUrl } from '@/lib/ravelry/api';
import { usePattern, usePatternSearch } from './api';
import { PatternPost } from './components/pattern-post';
import { patternPostItemHeight, patternPostOffset } from './pattern-feed-layout';
import { useExploreFiltersStore } from './use-explore-filters-store';

function FeedStatus({ message }: { message: string }) {
  return (
    <View className="flex-1 items-center justify-center bg-black px-6">
      <FocusAwareStatusBar />
      <Text className="text-center text-base text-fog-400">{message}</Text>
    </View>
  );
}

function toHighlight(pattern: RavelryPattern): PatternHighlight {
  return {
    id: `search:${pattern.id}`,
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

export function SearchResultsFeedScreen() {
  const navigation = useNavigation();
  const params = useLocalSearchParams<{ id: string; q?: string }>();
  const startId = String(params.id ?? '').trim();
  const query = String(
    Array.isArray(params.q) ? params.q[0] : params.q ?? '',
  ).trim();
  const startPatternId = Number(startId);

  React.useLayoutEffect(() => {
    if (!query)
      return;
    navigation.setOptions({ title: query });
  }, [navigation, query]);

  const filters = useExploreFiltersStore.use.filters();
  const searchQuery = usePatternSearch({
    variables: { query, filters },
    enabled: Boolean(query),
  });

  const patterns = React.useMemo(
    () => (searchQuery.data?.pages ?? []).flatMap(page => page.patterns),
    [searchQuery.data],
  );

  const inResults = React.useMemo(
    () => patterns.some(pattern => String(pattern.id) === startId),
    [patterns, startId],
  );

  // Warm Pattern#show for the tapped row; fall back when deep-linked alone.
  const patternQuery = usePattern({
    variables: { id: startPatternId },
    enabled:
      Boolean(startId)
      && Number.isFinite(startPatternId)
      && startPatternId > 0
      && !searchQuery.isPending
      && !inResults,
  });

  const items = React.useMemo(() => {
    if (patterns.length)
      return patterns.map(toHighlight);
    if (patternQuery.data)
      return [toHighlight(patternQuery.data)];
    return [];
  }, [patternQuery.data, patterns]);

  const listRef = React.useRef<FlatListType<PatternHighlight>>(null);
  const startIndex = React.useMemo(() => {
    if (!startId || !items.length)
      return 0;
    const index = items.findIndex(
      item => String(item.pattern.id) === startId,
    );
    return index >= 0 ? index : 0;
  }, [items, startId]);

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

  if (!query)
    return <FeedStatus message="Missing search query" />;

  if (!startId)
    return <FeedStatus message="Missing pattern" />;

  if (
    (searchQuery.isPending && !patterns.length)
    || (!inResults && patternQuery.isPending && !items.length)
  ) {
    return <FeedSkeletonScreen photoUri={skeletonPhoto} />;
  }

  if (searchQuery.isError && !patterns.length && !items.length)
    return <FeedStatus message="Couldn’t load search results." />;

  if (!items.length)
    return <FeedStatus message="No patterns found." />;

  return (
    <View className="flex-1 bg-black">
      <FocusAwareStatusBar />
      <FlatList
        ref={listRef}
        data={items}
        keyExtractor={item => item.id}
        key={`search:${query}:${startId}`}
        getItemLayout={getItemLayout}
        initialScrollIndex={startIndex > 0 ? startIndex : undefined}
        initialNumToRender={3}
        maxToRenderPerBatch={2}
        windowSize={5}
        updateCellsBatchingPeriod={50}
        onEndReached={() => {
          if (searchQuery.hasNextPage && !searchQuery.isFetchingNextPage)
            searchQuery.fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        onScrollToIndexFailed={onScrollToIndexFailed}
        renderItem={({ item }) => <PatternFeedRow item={item} />}
        ListFooterComponent={
          searchQuery.isFetchingNextPage
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
