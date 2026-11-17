import type { FlatList as FlatListType } from 'react-native';
import type { RavelryQueuedProject } from './api';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import * as React from 'react';
import { FlatList } from 'react-native';

import { FocusAwareStatusBar, Text, View } from '@/components/ui';
import { useAuthStore } from '@/features/auth/use-auth-store';
import { POST_ITEM_HEIGHT } from '@/features/feed/components/post-layout';
import { FeedSkeletonScreen } from '@/features/feed/components/post-skeleton';
import { usePerson, usePersonQueue } from './api';
import { ProfileQueuePost } from './components/profile-queue-post';

function FeedStatus({ message }: { message: string }) {
  return (
    <View className="flex-1 items-center justify-center bg-black px-6">
      <FocusAwareStatusBar />
      <Text className="text-center text-base text-fog-400">{message}</Text>
    </View>
  );
}

export function ProfileQueueFeedScreen() {
  const navigation = useNavigation();
  const params = useLocalSearchParams<{ username?: string; id: string }>();
  const authUsername = useAuthStore.use.user()?.username?.trim() || '';
  const username = String(params.username ?? '').trim() || authUsername;
  const startId = String(params.id ?? '').trim();

  const personQuery = usePerson({
    variables: { username },
    enabled: Boolean(username),
  });
  const queueQuery = usePersonQueue({
    variables: { username },
    enabled: Boolean(username),
  });
  const queuedProjects = React.useMemo(
    () => queueQuery.data?.queuedProjects ?? [],
    [queueQuery.data],
  );
  const displayName = personQuery.data?.username?.trim() || username;
  const startIndex = React.useMemo(() => {
    const index = queuedProjects.findIndex(item => String(item.id) === startId);
    return index >= 0 ? index : 0;
  }, [queuedProjects, startId]);
  const listRef = React.useRef<FlatListType<RavelryQueuedProject>>(null);

  React.useLayoutEffect(() => {
    if (!displayName)
      return;
    navigation.setOptions({ title: `${displayName} queue` });
  }, [displayName, navigation]);

  if (!username)
    return <FeedStatus message="Missing username" />;
  if (queueQuery.isPending && !queuedProjects.length)
    return <FeedSkeletonScreen />;
  if (queueQuery.isError && !queuedProjects.length)
    return <FeedStatus message="Couldn’t load queue." />;

  return (
    <View className="flex-1 bg-black">
      <FocusAwareStatusBar />
      <FlatList
        ref={listRef}
        data={queuedProjects}
        keyExtractor={(item: RavelryQueuedProject) => String(item.id)}
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
          <ProfileQueuePost
            username={username}
            person={personQuery.data}
            queued={item}
          />
        )}
        ListEmptyComponent={(
          <Text className="mt-10 text-center text-sm text-fog-400">
            Nothing queued yet.
          </Text>
        )}
      />
    </View>
  );
}
