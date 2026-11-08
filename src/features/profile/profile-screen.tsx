import type { RavelryProject } from './api';
import { Image } from 'expo-image';
import { Link, useLocalSearchParams } from 'expo-router';
import * as React from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
} from 'react-native';

import {
  FocusAwareStatusBar,
  SafeAreaView,
  Text,
  View,
} from '@/components/ui';
import { bestPhotoUrl } from '@/lib/ravelry/api';
import { usePerson, usePersonProjects } from './api';

const GRID_GAP = 2;
const COLS = 3;
const TILE
  = (Dimensions.get('window').width - GRID_GAP * (COLS - 1)) / COLS;

function ProfileHeader({
  username,
  avatarUrl,
  about,
  projectCount,
}: {
  username: string;
  avatarUrl: string | null;
  about: string | null;
  projectCount: number | null;
}) {
  const initial = username.slice(0, 1).toUpperCase() || '?';

  return (
    <View className="border-b border-ink-300 px-4 pb-5 pt-2">
      <View className="flex-row items-center gap-5">
        {avatarUrl
          ? (
              <Image
                source={{ uri: avatarUrl }}
                style={{ width: 86, height: 86, borderRadius: 43 }}
                contentFit="cover"
              />
            )
          : (
              <View className="size-[86px] items-center justify-center rounded-full bg-ink-300">
                <Text className="text-3xl font-semibold text-white">
                  {initial}
                </Text>
              </View>
            )}
        <View className="flex-1">
          <Text className="text-xl font-semibold text-white">
            {username}
          </Text>
          <View className="mt-3 flex-row gap-6">
            <View>
              <Text className="text-base font-semibold text-white">
                {projectCount == null ? '—' : projectCount}
              </Text>
              <Text className="text-sm text-fog-400">
                projects
              </Text>
            </View>
          </View>
        </View>
      </View>
      {about
        ? (
            <Text className="mt-4 text-sm leading-5 text-fog-300">
              {about}
            </Text>
          )
        : null}
    </View>
  );
}

function ProjectTile({
  username,
  project,
}: {
  username: string;
  project: RavelryProject;
}) {
  const uri = bestPhotoUrl(project.first_photo ?? project.photos?.[0]);
  const href = `/project/${username}/${project.id}`;

  return (
    <Link href={href as any} asChild>
      <Pressable style={{ width: TILE, height: TILE }}>
        {uri
          ? (
              <Image
                source={{ uri }}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
              />
            )
          : (
              <View className="size-full items-center justify-center bg-ink-200 px-2">
                <Text className="text-center text-xs text-fog-400" numberOfLines={3}>
                  {project.name}
                </Text>
              </View>
            )}
      </Pressable>
    </Link>
  );
}

export function ProfileScreen() {
  const params = useLocalSearchParams<{ username: string }>();
  const username = String(params.username ?? '').trim();

  const personQuery = usePerson({
    variables: { username },
    enabled: Boolean(username),
  });
  const projectsQuery = usePersonProjects({
    variables: { username },
    enabled: Boolean(username),
  });

  const person = personQuery.data;
  const projects = projectsQuery.data ?? [];
  const avatarUrl
    = person?.photo_url
      ?? person?.small_photo_url
      ?? null;
  const about
    = person?.about_me?.trim()
      || person?.first_name?.trim()
      || null;

  const loading = personQuery.isPending || projectsQuery.isPending;
  const failed = personQuery.isError && !person;

  if (!username) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-black" edges={['top']}>
        <FocusAwareStatusBar />
        <Text className="text-fog-400">Missing username</Text>
      </SafeAreaView>
    );
  }

  if (loading && !person) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-black" edges={['top']}>
        <FocusAwareStatusBar />
        <ActivityIndicator color="#ffffff" size="large" />
      </SafeAreaView>
    );
  }

  if (failed) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-black px-6" edges={['top']}>
        <FocusAwareStatusBar />
        <Text className="text-center text-base text-fog-400">
          Couldn’t load this profile.
        </Text>
      </SafeAreaView>
    );
  }

  const displayName = person?.username || username;

  return (
    <SafeAreaView className="flex-1 bg-black" edges={['bottom']}>
      <FocusAwareStatusBar />
      <FlatList
        data={projects}
        keyExtractor={item => String(item.id)}
        numColumns={COLS}
        columnWrapperStyle={{ gap: GRID_GAP }}
        contentContainerStyle={{ gap: GRID_GAP, paddingBottom: 24 }}
        ListHeaderComponent={(
          <ProfileHeader
            username={displayName}
            avatarUrl={avatarUrl}
            about={about}
            projectCount={
              projectsQuery.isPending ? null : projects.length
            }
          />
        )}
        ListEmptyComponent={
          projectsQuery.isPending
            ? (
                <View className="items-center py-10">
                  <ActivityIndicator color="#ffffff" />
                </View>
              )
            : (
                <Text className="mt-10 text-center text-sm text-fog-400">
                  No public projects yet.
                </Text>
              )
        }
        renderItem={({ item }) => (
          <ProjectTile username={displayName} project={item} />
        )}
      />
    </SafeAreaView>
  );
}
