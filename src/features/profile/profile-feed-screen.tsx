import type { RavelryProject } from './api';
import { useLocalSearchParams } from 'expo-router';
import * as React from 'react';
import { ActivityIndicator, FlatList } from 'react-native';

import { FocusAwareStatusBar, Text, View } from '@/components/ui';
import { usePerson, usePersonProjects } from './api';
import { ProfileProjectPost } from './components/profile-project-post';

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

  const projects = projectsQuery.data ?? [];
  const startIndex = React.useMemo(() => {
    if (!startId || !projects.length)
      return 0;
    const index = projects.findIndex(project => String(project.id) === startId);
    return index >= 0 ? index : 0;
  }, [projects, startId]);

  /**
   * Start at the tapped project, then older posts below.
   * Avoids scrollToIndex failures / jumps when row heights change as photos load.
   */
  const feedProjects = React.useMemo(
    () => (startIndex > 0 ? projects.slice(startIndex) : projects),
    [projects, startIndex],
  );

  if (!username) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <FocusAwareStatusBar />
        <Text className="text-fog-400">Missing username</Text>
      </View>
    );
  }

  if (projectsQuery.isPending && !projects.length) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <FocusAwareStatusBar />
        <ActivityIndicator color="#ffffff" size="large" />
      </View>
    );
  }

  if (projectsQuery.isError && !projects.length) {
    return (
      <View className="flex-1 items-center justify-center bg-black px-6">
        <FocusAwareStatusBar />
        <Text className="text-center text-base text-fog-400">
          Couldn’t load projects.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <FocusAwareStatusBar />
      <FlatList
        data={feedProjects}
        keyExtractor={(item: RavelryProject) => String(item.id)}
        key={`${username}:${startId}`}
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
