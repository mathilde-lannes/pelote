import type { FlatList as FlatListType } from 'react-native';
import type { PatternHighlight } from '@/lib/ravelry/types';
import { useLocalSearchParams } from 'expo-router';
import * as React from 'react';
import { ActivityIndicator, FlatList } from 'react-native';

import { FocusAwareStatusBar, Text, View } from '@/components/ui';
import { usePattern, usePatternHighlights } from './api';
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

function usePatternFeedScroll(startId: string, items: PatternHighlight[]) {
  const listRef = React.useRef<FlatListType<PatternHighlight>>(null);
  const didScroll = React.useRef(false);

  const startIndex = React.useMemo(() => {
    if (!startId || !items.length)
      return 0;
    const index = items.findIndex(
      item => String(item.pattern.id) === startId,
    );
    return index >= 0 ? index : 0;
  }, [items, startId]);

  React.useEffect(() => {
    didScroll.current = false;
  }, [startId]);

  const getItemLayout = React.useCallback(
    (_: ArrayLike<PatternHighlight> | null | undefined, index: number) => ({
      length: patternPostItemHeight(items[index]!),
      offset: patternPostOffset(items, index),
      index,
    }),
    [items],
  );

  const scrollToStart = React.useCallback(() => {
    if (didScroll.current || startIndex <= 0 || !items.length)
      return;
    listRef.current?.scrollToIndex({
      index: startIndex,
      animated: false,
      viewPosition: 0,
    });
    didScroll.current = true;
  }, [items.length, startIndex]);

  const onScrollToIndexFailed = React.useCallback(
    (info: { index: number }) => {
      setTimeout(() => {
        listRef.current?.scrollToOffset({
          offset: patternPostOffset(items, info.index),
          animated: false,
        });
        didScroll.current = true;
      }, 16);
    },
    [items],
  );

  return {
    listRef,
    startIndex,
    getItemLayout,
    scrollToStart,
    onScrollToIndexFailed,
  };
}

function toHighlight(pattern: PatternHighlight['pattern']): PatternHighlight {
  return {
    id: `pattern:${pattern.id}`,
    timeline_date: null,
    pattern,
  };
}

export function PatternFeedScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const startId = String(params.id ?? '').trim();
  const patternId = Number(startId);
  const highlightsQuery = usePatternHighlights();
  const highlights = React.useMemo(
    () => (highlightsQuery.data?.pages ?? []).flatMap(page => page.highlights),
    [highlightsQuery.data],
  );
  const inHighlights = React.useMemo(
    () => highlights.some(item => String(item.pattern.id) === startId),
    [highlights, startId],
  );

  // Designer grids (and other non-highlight entry points) open patterns that are
  // not in the highlights timeline — fetch that pattern directly instead of
  // falling through to the top of For You / highlights.
  const patternQuery = usePattern({
    variables: { id: patternId },
    enabled:
      Boolean(startId)
      && Number.isFinite(patternId)
      && patternId > 0
      && !highlightsQuery.isPending
      && !inHighlights,
  });

  const items = React.useMemo(() => {
    if (inHighlights)
      return highlights;
    if (patternQuery.data)
      return [toHighlight(patternQuery.data)];
    return [];
  }, [highlights, inHighlights, patternQuery.data]);

  const {
    listRef,
    startIndex,
    getItemLayout,
    scrollToStart,
    onScrollToIndexFailed,
  } = usePatternFeedScroll(startId, items);

  if (!startId)
    return <FeedStatus message="Missing pattern" />;

  if (
    (highlightsQuery.isPending && !highlights.length)
    || (!inHighlights && patternQuery.isPending)
  ) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <FocusAwareStatusBar />
        <ActivityIndicator color="#ffffff" size="large" />
      </View>
    );
  }

  if (inHighlights && highlightsQuery.isError && !highlights.length)
    return <FeedStatus message="Couldn’t load highlights." />;

  if (!inHighlights && patternQuery.isError)
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
        key={startId}
        getItemLayout={getItemLayout}
        initialScrollIndex={
          inHighlights && startIndex > 0 ? startIndex : undefined
        }
        initialNumToRender={Math.min(
          items.length,
          Math.max(startIndex + 3, 5),
        )}
        windowSize={7}
        onEndReached={() => {
          if (
            inHighlights
            && highlightsQuery.hasNextPage
            && !highlightsQuery.isFetchingNextPage
          ) {
            highlightsQuery.fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        onLayout={scrollToStart}
        onScrollToIndexFailed={onScrollToIndexFailed}
        renderItem={({ item }) => <PatternPost item={item} />}
        ListFooterComponent={
          inHighlights && highlightsQuery.isFetchingNextPage
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
