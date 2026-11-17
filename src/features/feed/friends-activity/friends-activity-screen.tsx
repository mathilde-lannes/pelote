import type { FlashListRef } from '@shopify/flash-list';
import type { FriendActivity } from '../api';
import type { FeedMode } from '../feed-mode';
import { useScrollToTop } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import * as React from 'react';

import { ActivityIndicator, RefreshControl } from 'react-native';
import { PeloteWordmark } from '@/components/brand/pelote-wordmark';
import {
  Button,
  FocusAwareStatusBar,
  SafeAreaView,
  Text,
  View,
} from '@/components/ui';
import { useAuthStore } from '@/features/auth/use-auth-store';
import { ForYouHeader } from '@/features/feed/for-you/for-you-header';
import { useFriendsActivity } from '../api';
import { ActivityCard } from '../components/activity-card';

function FeedFooter({ loading }: { loading: boolean }) {
  if (!loading)
    return null;
  return (
    <View className="items-center py-4">
      <ActivityIndicator color="#ffffff" />
    </View>
  );
}

function FriendsEmptyState({
  feedMode,
  onFeedModeChange,
  onFindFriends,
}: {
  feedMode: FeedMode;
  onFeedModeChange: (mode: FeedMode) => void;
  onFindFriends: () => void;
}) {
  return (
    <SafeAreaView className="flex-1 bg-black" edges={['top']}>
      <FocusAwareStatusBar />
      <ForYouHeader value={feedMode} onChange={onFeedModeChange} />
      <View className="flex-1 items-center justify-center px-6">
        <PeloteWordmark size="md" />
        <Text className="mt-8 text-center text-2xl font-semibold text-white">
          Your feed is waiting for friends
        </Text>
        <Text className="mt-3 text-center text-base/6 text-fog-400">
          Add friends and designers on Ravelry to fill this Instagram-style
          photo feed with project updates.
        </Text>
        <View className="mt-8">
          <Button label="Find friends & designers" onPress={onFindFriends} />
        </View>
      </View>
    </SafeAreaView>
  );
}

type Props = {
  feedMode: FeedMode;
  onFeedModeChange: (mode: FeedMode) => void;
};

export function FriendsActivityScreen({
  feedMode,
  onFeedModeChange,
}: Props) {
  const router = useRouter();
  const user = useAuthStore.use.user();
  const listRef = React.useRef<FlashListRef<FriendActivity>>(null);
  useScrollToTop(listRef);
  const {
    data,
    isPending,
    isError,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFriendsActivity({ enabled: Boolean(user) });

  const activities = React.useMemo(
    () => (data?.pages ?? []).flatMap(page => page.activities),
    [data],
  );

  const renderItem = React.useCallback(
    ({ item }: { item: FriendActivity }) => <ActivityCard item={item} />,
    [],
  );

  const onEndReached = React.useCallback(() => {
    if (hasNextPage && !isFetchingNextPage)
      fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (!user || isPending) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-black" edges={['top']}>
        <FocusAwareStatusBar />
        <ActivityIndicator color="#ffffff" size="large" />
        <Text className="mt-3 text-sm text-fog-400">
          Loading friends’ activity…
        </Text>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView className="flex-1 bg-black" edges={['top']}>
        <FocusAwareStatusBar />
        <ForYouHeader value={feedMode} onChange={onFeedModeChange} />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="mb-2 text-center text-lg font-semibold text-white">
            Couldn’t load your feed
          </Text>
          <Text className="mb-4 text-center text-sm text-fog-400">
            Check your connection and try again.
          </Text>
          <Button label="Retry" onPress={() => refetch()} />
        </View>
      </SafeAreaView>
    );
  }

  if (!activities.length) {
    return (
      <FriendsEmptyState
        feedMode={feedMode}
        onFeedModeChange={onFeedModeChange}
        onFindFriends={() => router.push('/friends')}
      />
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black" edges={['top']}>
      <FocusAwareStatusBar />
      <View className="flex-1">
        <FlashList
          ref={listRef}
          data={activities}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.5}
          refreshControl={(
            <RefreshControl
              refreshing={isRefetching && !isFetchingNextPage}
              onRefresh={() => refetch()}
              tintColor="#ffffff"
            />
          )}
          ListHeaderComponent={(
            <ForYouHeader value={feedMode} onChange={onFeedModeChange} />
          )}
          ListFooterComponent={<FeedFooter loading={isFetchingNextPage} />}
        />
      </View>
    </SafeAreaView>
  );
}
