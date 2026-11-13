import type { PatternHighlight } from './api';
import * as React from 'react';
import { ActivityIndicator, FlatList, RefreshControl, useWindowDimensions } from 'react-native';

import {
  Button,
  FocusAwareStatusBar,
  SafeAreaView,
  Text,
  View,
} from '@/components/ui';
import { useAuthStore } from '@/features/auth/use-auth-store';
import { refreshPatternHighlights, usePatternHighlights } from './api';
import { HighlightTile } from './components/highlight-tile';

const EXPLORE_GAP = 2;
const EXPLORE_COLUMNS = 3;

function ExploreHeader() {
  return (
    <View className="items-center border-b border-ink-300 px-4 py-3">
      <Text className="text-lg font-semibold text-white">
        Explore
      </Text>
    </View>
  );
}

function ExploreStatus({
  title,
  body,
  onRetry,
}: {
  title: string;
  body: string;
  onRetry?: () => void;
}) {
  return (
    <SafeAreaView className="flex-1 bg-black" edges={['top']}>
      <FocusAwareStatusBar />
      <ExploreHeader />
      <View className="flex-1 items-center justify-center px-6">
        <Text className="mb-2 text-center text-lg font-semibold text-white">
          {title}
        </Text>
        <Text className="text-center text-sm text-fog-400">
          {body}
        </Text>
        {onRetry
          ? (
              <View className="mt-4">
                <Button label="Retry" onPress={onRetry} />
              </View>
            )
          : null}
      </View>
    </SafeAreaView>
  );
}

function ExploreFooter({ loading }: { loading: boolean }) {
  if (!loading)
    return null;
  return (
    <View className="items-center py-4">
      <ActivityIndicator color="#ffffff" />
    </View>
  );
}

export function ExploreScreen() {
  const user = useAuthStore.use.user();
  const { width } = useWindowDimensions();
  const cell = (width - EXPLORE_GAP * (EXPLORE_COLUMNS - 1)) / EXPLORE_COLUMNS;
  const {
    data,
    isPending,
    isError,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePatternHighlights({ enabled: Boolean(user) });

  const highlights = React.useMemo(
    () => (data?.pages ?? []).flatMap(page => page.highlights),
    [data],
  );

  const renderTile = React.useCallback(
    ({ item }: { item: PatternHighlight }) => (
      <HighlightTile item={item} size={cell} />
    ),
    [cell],
  );

  const onEndReached = React.useCallback(() => {
    if (hasNextPage && !isFetchingNextPage)
      fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (!user || (isPending && !highlights.length)) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-black" edges={['top']}>
        <FocusAwareStatusBar />
        <ActivityIndicator color="#ffffff" size="large" />
        <Text className="mt-3 text-sm text-fog-400">
          Loading pattern highlights…
        </Text>
      </SafeAreaView>
    );
  }

  if (isError && !highlights.length) {
    return (
      <ExploreStatus
        title="Couldn’t load highlights"
        body="Check your connection and try again."
        onRetry={() => {
          refreshPatternHighlights(refetch);
        }}
      />
    );
  }

  if (!highlights.length) {
    return (
      <ExploreStatus
        title="No highlights yet"
        body="New patterns from designers and searches you follow on Ravelry show up here."
      />
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black" edges={['top']}>
      <FocusAwareStatusBar />
      <FlatList
        data={highlights}
        keyExtractor={item => item.id}
        numColumns={EXPLORE_COLUMNS}
        columnWrapperStyle={{ gap: EXPLORE_GAP }}
        contentContainerStyle={{ gap: EXPLORE_GAP }}
        renderItem={renderTile}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        refreshControl={(
          <RefreshControl
            refreshing={isRefetching && !isFetchingNextPage}
            onRefresh={() => {
              refreshPatternHighlights(refetch);
            }}
            tintColor="#ffffff"
          />
        )}
        ListHeaderComponent={<ExploreHeader />}
        ListFooterComponent={<ExploreFooter loading={isFetchingNextPage} />}
      />
    </SafeAreaView>
  );
}
