import type { FlatList as FlatListType } from 'react-native';
import type { RavelryProject } from './api';
import { useLocalSearchParams } from 'expo-router';
import * as React from 'react';
import { ActivityIndicator, FlatList } from 'react-native';

import { FocusAwareStatusBar, Text, View } from '@/components/ui';
import { POST_ITEM_HEIGHT } from '@/features/feed/components/post-layout';
import { ProfileProjectPost } from '@/features/profile/components/profile-project-post';
import { usePatternProjects } from './api';

function FeedStatus({ message }: { message: string }) {
  return (
    <View className="flex-1 items-center justify-center bg-black px-6">
      <FocusAwareStatusBar />
      <Text className="text-center text-base text-fog-400">{message}</Text>
    </View>
  );
}

function projectUsername(project: RavelryProject): string {
  return project.user?.username?.trim() || '';
}

function useProjectsFeedScroll(
  patternId: string,
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
  }, [patternId, startId]);

  const getItemLayout = React.useCallback(
    (_: ArrayLike<RavelryProject> | null | undefined, index: number) => ({
      length: POST_ITEM_HEIGHT,
      offset: POST_ITEM_HEIGHT * index,
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
          offset: POST_ITEM_HEIGHT * info.index,
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

export function PatternProjectsFeedScreen() {
  const params = useLocalSearchParams<{ id: string; projectId: string }>();
  const patternIdRaw = String(params.id ?? '').trim();
  const startId = String(params.projectId ?? '').trim();
  const patternId = Number(patternIdRaw);
  const enabled = Number.isFinite(patternId) && patternId > 0;

  const projectsQuery = usePatternProjects({
    variables: { patternId },
    enabled,
  });

  const projects = React.useMemo(
    () => (projectsQuery.data?.projects ?? []).filter(project =>
      Boolean(projectUsername(project)),
    ),
    [projectsQuery.data],
  );

  const {
    listRef,
    startIndex,
    getItemLayout,
    scrollToStart,
    onScrollToIndexFailed,
  } = useProjectsFeedScroll(patternIdRaw, startId, projects);

  if (!enabled)
    return <FeedStatus message="Missing pattern" />;

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
        key={`${patternIdRaw}:${startId}`}
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
            username={projectUsername(item)}
            person={item.user}
            project={item}
          />
        )}
        ListEmptyComponent={(
          <Text className="mt-10 text-center text-sm text-fog-400">
            No projects yet.
          </Text>
        )}
      />
    </View>
  );
}
