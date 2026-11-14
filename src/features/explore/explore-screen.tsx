import type { RavelryPattern } from './api';
import { useScrollToTop } from '@react-navigation/native';
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
import { useRecentlyPopularPatterns } from './api';
import { PatternGridSkeleton } from './components/pattern-grid-skeleton';
import { PatternTile } from './components/pattern-tile';

const EXPLORE_GAP = 2;
const EXPLORE_COLUMNS = 3;

function ExploreHeader() {
  return (
    <View className="items-center border-b border-ink-300 px-4 py-3">
      <Text className="text-lg font-semibold text-white">
        Recently popular
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
  const listRef = React.useRef<FlatList<RavelryPattern>>(null);
  useScrollToTop(listRef);
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
  } = useRecentlyPopularPatterns({ enabled: Boolean(user) });

  const patterns = React.useMemo(
    () => (data?.pages ?? []).flatMap(page => page.patterns),
    [data],
  );

  const renderTile = React.useCallback(
    ({ item }: { item: RavelryPattern }) => (
      <PatternTile pattern={item} size={cell} />
    ),
    [cell],
  );

  const onEndReached = React.useCallback(() => {
    if (hasNextPage && !isFetchingNextPage)
      fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (!user || (isPending && !patterns.length))
    return <PatternGridSkeleton />;

  if (isError && !patterns.length) {
    return (
      <ExploreStatus
        title="Couldn’t load patterns"
        body="Check your connection and try again."
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  if (!patterns.length) {
    return (
      <ExploreStatus
        title="No patterns yet"
        body="Recently popular patterns from Ravelry will show up here."
      />
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black" edges={['top']}>
      <FocusAwareStatusBar />
      <FlatList
        ref={listRef}
        data={patterns}
        keyExtractor={item => String(item.id)}
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
              void refetch();
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
