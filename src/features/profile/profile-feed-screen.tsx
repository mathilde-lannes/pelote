import type { FlatList as FlatListType } from 'react-native';
import type { RavelryProject } from './api';
import { useLocalSearchParams } from 'expo-router';
import * as React from 'react';
import {
  ActivityIndicator,
  FlatList,

} from 'react-native';

import { FocusAwareStatusBar, Text, View } from '@/components/ui';
import { usePerson, usePersonProjects } from './api';
import { ProfileProjectPost } from './components/profile-project-post';
import { PROFILE_POST_ITEM_HEIGHT } from './profile-feed-layout';

function FeedStatus({ message }: { message: string }) {
  return (
    <View className="flex-1 items-center justify-center bg-black px-6">
      <FocusAwareStatusBar />
      <Text className="text-center text-base text-fog-400">{message}</Text>
    </View>
  );
}

function useProfileFeedScroll(
  username: string,
  startId: string,
  projects: RavelryProject[],
) {
  const listRef = React.useRef<FlatListType<RavelryProject>>(null);
  const didScroll = React.useRef(false);

  const startIndex = React.useMemo(() => {
    if (!startId || !projects.length)
      return 0;
    const index = projects.findIndex(project => String(project.id) === startId);
    return index >= 0 ? index : 0;
  }, [projects, startId]);

  React.useEffect(() => {
    didScroll.current = false;
  }, [username, startId]);

  const getItemLayout = React.useCallback(
    (_: ArrayLike<RavelryProject> | null | undefined, index: number) => ({
      length: PROFILE_POST_ITEM_HEIGHT,
      offset: PROFILE_POST_ITEM_HEIGHT * index,
      index,
    }),
    [],
  );

  const scrollToStart = React.useCallback(() => {
    if (didScroll.current || startIndex <= 0 || !projects.length)
      return;
    listRef.current?.scrollToIndex({
      index: startIndex,
      animated: false,
      viewPosition: 0,
    });
    didScroll.current = true;
  }, [projects.length, startIndex]);

  const onScrollToIndexFailed = React.useCallback(
    (info: { index: number }) => {
      setTimeout(() => {
        listRef.current?.scrollToOffset({
          offset: info.index * PROFILE_POST_ITEM_HEIGHT,
          animated: false,
        });
        didScroll.current = true;
      }, 16);
    },
    [],
  );

  return {
    listRef,
    startIndex,
    getItemLayout,
    scrollToStart,
    onScrollToIndexFailed,
  };
}

export function ProfileFeedScreen() {
  const params = useLocalSearchParams<{ username: string; id: string }>();
  const username = String(params.username ?? '').trim();
  const startId = String(params.id ?? '').trim();

  const personQuery = usePerson({
    variables: { username },
    enabled: Boolean(username),
  });
  const projectsQuery = usePersonProjects({
    variables: { username },
    enabled: Boolean(username),
  });

  const projects = React.useMemo(
    () => projectsQuery.data ?? [],
    [projectsQuery.data],
  );

  const {
    listRef,
    startIndex,
    getItemLayout,
    scrollToStart,
    onScrollToIndexFailed,
  } = useProfileFeedScroll(username, startId, projects);

  if (!username)
    return <FeedStatus message="Missing username" />;

  if (projectsQuery.isPending && !projects.length) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <FocusAwareStatusBar />
        <ActivityIndicator color="#ffffff" size="large" />
      </View>
    );
  }

  if (projectsQuery.isError && !projects.length)
    return <FeedStatus message="Couldn’t load projects." />;

  return (
    <View className="flex-1 bg-black">
      <FocusAwareStatusBar />
      <FlatList
        ref={listRef}
        data={projects}
        keyExtractor={(item: RavelryProject) => String(item.id)}
        key={`${username}:${startId}`}
        getItemLayout={getItemLayout}
        initialScrollIndex={startIndex > 0 ? startIndex : undefined}
        initialNumToRender={Math.min(
          projects.length,
          Math.max(startIndex + 3, 5),
        )}
        windowSize={7}
        onLayout={scrollToStart}
        onScrollToIndexFailed={onScrollToIndexFailed}
        renderItem={({ item }) => (
          <ProfileProjectPost
            username={username}
            person={personQuery.data}
            project={item}
          />
        )}
        ListEmptyComponent={(
          <Text className="mt-10 text-center text-sm text-fog-400">
            No public projects yet.
          </Text>
        )}
      />
    </View>
  );
}
