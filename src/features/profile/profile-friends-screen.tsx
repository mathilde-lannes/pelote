import type { FriendEntry } from '@/lib/ravelry/types';
import { useLocalSearchParams, usePathname, useRouter } from 'expo-router';
import * as React from 'react';
import { ActivityIndicator, FlatList } from 'react-native';

import { FocusAwareStatusBar, Text, View } from '@/components/ui';
import { useAuthStore } from '@/features/auth/use-auth-store';
import { ExplorePersonRow } from '@/features/explore/components/explore-person-row';
import { userProfileHref } from '@/features/profile/designer-profile-href';
import { usePersonFriends } from './api';

function FriendsStatus({ message }: { message: string }) {
  return (
    <View className="flex-1 items-center justify-center bg-black px-6">
      <FocusAwareStatusBar />
      <Text className="text-center text-base text-fog-400">{message}</Text>
    </View>
  );
}

export function ProfileFriendsScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useLocalSearchParams<{ username?: string }>();
  const authUsername = useAuthStore.use.user()?.username?.trim() || '';
  const username = String(params.username ?? '').trim() || authUsername;
  const friendsQuery = usePersonFriends({
    variables: { username },
    enabled: Boolean(username),
  });
  const friends = friendsQuery.data ?? [];

  if (!username)
    return <FriendsStatus message="Missing username" />;
  if (friendsQuery.isPending && !friends.length) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <FocusAwareStatusBar />
        <ActivityIndicator color="#ffffff" />
      </View>
    );
  }
  if (friendsQuery.isError && !friends.length)
    return <FriendsStatus message="Couldn’t load friends." />;

  return (
    <View className="flex-1 bg-black">
      <FocusAwareStatusBar />
      <FlatList
        data={friends}
        keyExtractor={(item: FriendEntry) => String(item.friendship_id)}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        ListEmptyComponent={(
          <Text className="mt-10 text-center text-sm text-fog-400">
            No friends yet.
          </Text>
        )}
        renderItem={({ item }) => (
          <ExplorePersonRow
            person={item}
            onPress={() => {
              router.push(userProfileHref(item.username, pathname) as never);
            }}
          />
        )}
      />
    </View>
  );
}
