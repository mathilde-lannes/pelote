import type { FeedMode } from '../feed-mode';
import type { PatternHighlight } from '@/lib/ravelry/types';
import { FlashList } from '@shopify/flash-list';
import * as React from 'react';
import { ActivityIndicator, RefreshControl } from 'react-native';

import {
  Button,
  FocusAwareStatusBar,
  SafeAreaView,
  Text,
  View,
} from '@/components/ui';
import { useAuthStore } from '@/features/auth/use-auth-store';
import {
  refreshPatternHighlights,
  usePatternHighlights,
} from '@/features/explore/api';
import { ForYouHeader } from './for-you-header';
import { ForYouPost } from './for-you-post';

function FeedFooter({ loading }: { loading: boolean }) {
  if (!loading)
    return null;
  return (
    <View className="items-center py-4">
      <ActivityIndicator color="#ffffff" />
    </View>
  );
}

type Props = {
  feedMode: FeedMode;
  onFeedModeChange: (mode: FeedMode) => void;
};

export function ForYouScreen({ feedMode, onFeedModeChange }: Props) {
  const user = useAuthStore.use.user();
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

  const renderItem = React.useCallback(
    ({ item }: { item: PatternHighlight }) => <ForYouPost item={item} />,
    [],
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
      <SafeAreaView className="flex-1 bg-black" edges={['top']}>
        <FocusAwareStatusBar />
        <ForYouHeader value={feedMode} onChange={onFeedModeChange} />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="mb-2 text-center text-lg font-semibold text-white">
            Couldn’t load highlights
          </Text>
          <Text className="mb-4 text-center text-sm text-fog-400">
            Check your connection and try again.
          </Text>
          <Button
            label="Retry"
            onPress={() => {
              refreshPatternHighlights(refetch);
            }}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (!highlights.length) {
    return (
      <SafeAreaView className="flex-1 bg-black" edges={['top']}>
        <FocusAwareStatusBar />
        <ForYouHeader value={feedMode} onChange={onFeedModeChange} />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="mb-2 text-center text-lg font-semibold text-white">
            No highlights yet
          </Text>
          <Text className="text-center text-sm text-fog-400">
            New patterns from designers and searches you follow on Ravelry show
            up here.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black" edges={['top']}>
      <FocusAwareStatusBar />
      <FlashList
        data={highlights}
        renderItem={renderItem}
        keyExtractor={item => item.id}
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
        ListHeaderComponent={(
          <ForYouHeader value={feedMode} onChange={onFeedModeChange} />
        )}
        ListFooterComponent={<FeedFooter loading={isFetchingNextPage} />}
      />
    </SafeAreaView>
  );
}
