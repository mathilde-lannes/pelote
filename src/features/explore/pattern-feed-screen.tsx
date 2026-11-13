import type { FlatList as FlatListType } from 'react-native';
import type { PatternHighlight } from '@/lib/ravelry/types';
import { useLocalSearchParams } from 'expo-router';
import * as React from 'react';
import { ActivityIndicator, FlatList } from 'react-native';

import { FocusAwareStatusBar, Text, View } from '@/components/ui';
import { usePatternHighlights } from './api';
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

function usePatternFeedScroll(startId: string, highlights: PatternHighlight[]) {
  const listRef = React.useRef<FlatListType<PatternHighlight>>(null);
  const didScroll = React.useRef(false);

  const startIndex = React.useMemo(() => {
    if (!startId || !highlights.length)
      return 0;
    const index = highlights.findIndex(
      item => String(item.pattern.id) === startId,
    );
    return index >= 0 ? index : 0;
  }, [highlights, startId]);

  React.useEffect(() => {
    didScroll.current = false;
  }, [startId]);

  const getItemLayout = React.useCallback(
    (_: ArrayLike<PatternHighlight> | null | undefined, index: number) => ({
      length: patternPostItemHeight(highlights[index]!),
      offset: patternPostOffset(highlights, index),
      index,
    }),
    [highlights],
  );

  const scrollToStart = React.useCallback(() => {
    if (didScroll.current || startIndex <= 0 || !highlights.length)
      return;
    listRef.current?.scrollToIndex({
      index: startIndex,
      animated: false,
      viewPosition: 0,
    });
    didScroll.current = true;
  }, [highlights.length, startIndex]);

  const onScrollToIndexFailed = React.useCallback(
    (info: { index: number }) => {
      setTimeout(() => {
        listRef.current?.scrollToOffset({
          offset: patternPostOffset(highlights, info.index),
          animated: false,
        });
        didScroll.current = true;
      }, 16);
    },
    [highlights],
  );

  return {
    listRef,
    startIndex,
    getItemLayout,
    scrollToStart,
    onScrollToIndexFailed,
  };
}

export function PatternFeedScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const startId = String(params.id ?? '').trim();
  const highlightsQuery = usePatternHighlights();
  const highlights = React.useMemo(
    () => (highlightsQuery.data?.pages ?? []).flatMap(page => page.highlights),
    [highlightsQuery.data],
  );
  const {
    listRef,
    startIndex,
    getItemLayout,
    scrollToStart,
    onScrollToIndexFailed,
  } = usePatternFeedScroll(startId, highlights);

  if (!startId)
    return <FeedStatus message="Missing pattern" />;

  if (highlightsQuery.isPending && !highlights.length) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <FocusAwareStatusBar />
        <ActivityIndicator color="#ffffff" size="large" />
      </View>
    );
  }

  if (highlightsQuery.isError && !highlights.length)
    return <FeedStatus message="Couldn’t load highlights." />;

  return (
    <View className="flex-1 bg-black">
      <FocusAwareStatusBar />
      <FlatList
        ref={listRef}
        data={highlights}
        keyExtractor={item => item.id}
        key={startId}
        getItemLayout={getItemLayout}
        initialScrollIndex={startIndex > 0 ? startIndex : undefined}
        initialNumToRender={Math.min(
          highlights.length,
          Math.max(startIndex + 3, 5),
        )}
        windowSize={7}
        onEndReached={() => {
          if (highlightsQuery.hasNextPage && !highlightsQuery.isFetchingNextPage)
            highlightsQuery.fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        onLayout={scrollToStart}
        onScrollToIndexFailed={onScrollToIndexFailed}
        renderItem={({ item }) => <PatternPost item={item} />}
        ListFooterComponent={
          highlightsQuery.isFetchingNextPage
            ? (
                <View className="items-center py-4">
                  <ActivityIndicator color="#ffffff" />
                </View>
              )
            : null
        }
        ListEmptyComponent={(
          <Text className="mt-10 text-center text-sm text-fog-400">
            No pattern highlights yet.
          </Text>
        )}
      />
    </View>
  );
}
