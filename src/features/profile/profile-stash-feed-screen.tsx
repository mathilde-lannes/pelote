import type { FlatList as FlatListType } from 'react-native';
import type { RavelryStash } from './api';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import * as React from 'react';
import { FlatList } from 'react-native';

import { FocusAwareStatusBar, Text, View } from '@/components/ui';
import { useAuthStore } from '@/features/auth/use-auth-store';
import { POST_ITEM_HEIGHT } from '@/features/feed/components/post-layout';
import { FeedSkeletonScreen } from '@/features/feed/components/post-skeleton';
import { usePerson, usePersonStash } from './api';
import { ProfileStashPost } from './components/profile-stash-post';

function FeedStatus({ message }: { message: string }) {
  return (
    <View className="flex-1 items-center justify-center bg-black px-6">
      <FocusAwareStatusBar />
      <Text className="text-center text-base text-fog-400">{message}</Text>
    </View>
  );
}

export function ProfileStashFeedScreen() {
  const navigation = useNavigation();
  const params = useLocalSearchParams<{ username?: string; id: string }>();
  const authUsername = useAuthStore.use.user()?.username?.trim() || '';
  const username = String(params.username ?? '').trim() || authUsername;
  const startId = String(params.id ?? '').trim();

  const personQuery = usePerson({
    variables: { username },
    enabled: Boolean(username),
  });
  const stashQuery = usePersonStash({
    variables: { username },
    enabled: Boolean(username),
  });
  const stashes = React.useMemo(
    () => stashQuery.data?.stashes ?? [],
    [stashQuery.data],
  );
  const displayName = personQuery.data?.username?.trim() || username;
  const startIndex = React.useMemo(() => {
    const index = stashes.findIndex(stash => String(stash.id) === startId);
    return index >= 0 ? index : 0;
  }, [stashes, startId]);
  const listRef = React.useRef<FlatListType<RavelryStash>>(null);

  React.useLayoutEffect(() => {
    if (!displayName)
      return;
    navigation.setOptions({ title: `${displayName} yarn` });
  }, [displayName, navigation]);

  if (!username)
    return <FeedStatus message="Missing username" />;
  if (stashQuery.isPending && !stashes.length)
    return <FeedSkeletonScreen />;
  if (stashQuery.isError && !stashes.length)
    return <FeedStatus message="Couldn’t load stash." />;

  return (
    <View className="flex-1 bg-black">
      <FocusAwareStatusBar />
      <FlatList
        ref={listRef}
        data={stashes}
        keyExtractor={(item: RavelryStash) => String(item.id)}
        key={`${username}:${startId}`}
        getItemLayout={(_, index) => ({
          length: POST_ITEM_HEIGHT,
          offset: POST_ITEM_HEIGHT * index,
          index,
        })}
        initialScrollIndex={startIndex > 0 ? startIndex : undefined}
        initialNumToRender={3}
        windowSize={5}
        onScrollToIndexFailed={(info) => {
          listRef.current?.scrollToOffset({
            offset: POST_ITEM_HEIGHT * info.index,
            animated: false,
          });
        }}
        renderItem={({ item }) => (
          <ProfileStashPost
            username={username}
            person={personQuery.data}
            stash={item}
          />
        )}
        ListEmptyComponent={(
          <Text className="mt-10 text-center text-sm text-fog-400">
            No stash yet.
          </Text>
        )}
      />
    </View>
  );
}
