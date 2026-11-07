import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { ActivityIndicator, RefreshControl } from 'react-native';

import { PeloteWordmark } from '@/components/brand/pelote-wordmark';
import {
  Button,
  FocusAwareStatusBar,
  Text,
  View,
} from '@/components/ui';
import { useAuthStore } from '@/features/auth/use-auth-store';
import type { FriendActivity } from './api';
import { useFriendsActivity } from './api';
import { ActivityCard } from './components/activity-card';

export function FeedScreen() {
  const router = useRouter();
  const isDemo = useAuthStore.use.isDemo();
  const user = useAuthStore.use.user();
  const { data, isPending, isError, refetch, isRefetching }
    = useFriendsActivity({ enabled: Boolean(user) });


  const photoFirst = React.useMemo(
    () =>
      (data ?? []).filter(
        item =>
          item.type === 'project_photo'
          || item.photo
          || item.project?.first_photo,
      ),
    [data],
  );

  const renderItem = React.useCallback(
    ({ item }: { item: FriendActivity }) => <ActivityCard item={item} />,
    [],
  );

  if (!user || isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-oat-100">
        <FocusAwareStatusBar />
        <ActivityIndicator color="#9A3F24" size="large" />
        <Text className="mt-3 text-sm text-charcoal-600">
          Loading friends’ activity…
        </Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center bg-oat-100 px-6">
        <FocusAwareStatusBar />
        <Text className="mb-2 text-center text-lg font-semibold text-charcoal-900">
          Couldn’t load your feed
        </Text>
        <Text className="mb-4 text-center text-sm text-charcoal-600">
          Check your connection and try again.
        </Text>
        <Button label="Retry" onPress={() => refetch()} />
      </View>
    );
  }

  if (!photoFirst.length) {
    return (
      <View className="flex-1 bg-oat-100 px-6 pt-16">
        <FocusAwareStatusBar />
        <PeloteWordmark size="md" />
        <Text className="mt-8 text-center text-2xl font-display font-semibold text-charcoal-900">
          Your feed is waiting for friends
        </Text>
        <Text className="mt-3 text-center text-base leading-6 text-charcoal-600">
          Add friends and designers on Ravelry to fill this Instagram-style
          photo feed with project updates.
        </Text>
        <View className="mt-8">
          <Button
            label="Find friends & designers"
            onPress={() => router.push('/friends')}
          />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-oat-100">
      <FocusAwareStatusBar />
      {isDemo
        ? (
            <View className="bg-moss-600 px-3 py-1.5">
              <Text className="text-center text-xs font-medium text-oat-50">
                DEMO MODE — mock friends activity
              </Text>
            </View>
          )
        : null}
      <FlashList
        data={photoFirst}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        refreshControl={(
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => refetch()}
            tintColor="#9A3F24"
          />
        )}
        ListHeaderComponent={(
          <View className="items-center px-4 pb-2 pt-4">
            <PeloteWordmark size="sm" />
          </View>
        )}
      />
    </View>
  );
}
