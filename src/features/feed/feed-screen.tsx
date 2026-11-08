import type { FriendActivity } from './api';
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
import { isHomeFeedActivity, useFriendsActivity } from './api';
import { ActivityCard } from './components/activity-card';

function FeedFooter({ loading }: { loading: boolean }) {
  if (!loading)
    return null;
  return (
    <View className="items-center py-4">
      <ActivityIndicator color="#ffffff" />
    </View>
  );
}

export function FeedScreen() {
  const router = useRouter();
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
  } = useFriendsActivity({ enabled: Boolean(user) });

  const photoFirst = React.useMemo(
    () =>
      (data?.pages ?? [])
        .flatMap(page => page.activities)
        .filter(isHomeFeedActivity),
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
      <SafeAreaView className="flex-1 items-center justify-center bg-black px-6" edges={['top']}>
        <FocusAwareStatusBar />
        <Text className="mb-2 text-center text-lg font-semibold text-white">
          Couldn’t load your feed
        </Text>
        <Text className="mb-4 text-center text-sm text-fog-400">
          Check your connection and try again.
        </Text>
        <Button label="Retry" onPress={() => refetch()} />
      </SafeAreaView>
    );
  }

  if (!photoFirst.length) {
    return (
      <SafeAreaView className="flex-1 bg-black px-6 pt-4" edges={['top']}>
        <FocusAwareStatusBar />
        <PeloteWordmark size="md" />
        <Text className="mt-8 text-center text-2xl font-semibold text-white">
          Your feed is waiting for friends
        </Text>
        <Text className="mt-3 text-center text-base/6 text-fog-400">
          Add friends and designers on Ravelry to fill this Instagram-style
          photo feed with project updates.
        </Text>
        <View className="mt-8">
          <Button
            label="Find friends & designers"
            onPress={() => router.push('/friends')}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black" edges={['top']}>
      <FocusAwareStatusBar />
      <View className="flex-1">
        <FlashList
          data={photoFirst}
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
            <View className="items-center border-b border-ink-300 px-4 py-3">
              <PeloteWordmark size="sm" />
            </View>
          )}
          ListFooterComponent={<FeedFooter loading={isFetchingNextPage} />}
        />
      </View>
    </SafeAreaView>
  );
}
