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
import { usePattern } from '@/features/explore/api';
import { formatCompactCount } from '@/features/feed/format-compact-count';
import { bestPhotoUrl } from '@/lib/ravelry/api';
import { usePatternProjects } from './api';

const GRID_GAP = 2;
const COLS = 3;
const TILE
  = (Dimensions.get('window').width - GRID_GAP * (COLS - 1)) / COLS;

function PatternProjectsHeader({
  name,
  photoUrl,
  projectCount,
}: {
  name: string;
  photoUrl: string | null;
  projectCount: number | null;
}) {
  const initial = (name || '?').slice(0, 1).toUpperCase();
  return (
    <View className="border-b border-ink-300 px-4 pt-2 pb-3">
      <View className="flex-row items-center gap-5 pb-2">
        {photoUrl
          ? (
              <Image
                source={{ uri: photoUrl }}
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
        <View className="min-w-0 flex-1">
          <Text className="text-xl font-semibold text-white" numberOfLines={2}>
            {name}
          </Text>
          <View className="mt-3">
            <Text className="text-base font-semibold text-white">
              {projectCount == null ? '—' : formatCompactCount(projectCount)}
            </Text>
            <Text className="text-sm text-fog-400">
              projects
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function ProjectTile({
  patternId,
  project,
}: {
  patternId: number;
  project: RavelryProject;
}) {
  const uri = bestPhotoUrl(project.first_photo ?? project.photos?.[0]);
  const href = `/pattern/${patternId}/projects/${project.id}`;

  return (
    <Link href={href as never} asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={project.name}
        style={{ width: TILE, height: TILE }}
      >
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

export function PatternProjectsScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const patternId = Number(String(params.id ?? '').trim());
  const enabled = Number.isFinite(patternId) && patternId > 0;

  const patternQuery = usePattern({
    variables: { id: patternId },
    enabled,
  });
  const projectsQuery = usePatternProjects({
    variables: { patternId },
    enabled,
  });

  const pattern = patternQuery.data;
  const projects = projectsQuery.data?.projects ?? [];
  // Once loaded, count matches the grid (includes notebooks without photos).
  const projectCount = projectsQuery.isPending
    ? (pattern?.projects_count ?? null)
    : (projects.length || pattern?.projects_count || null);
  const photoUrl = bestPhotoUrl(pattern?.photos[0] ?? null);
  const name = pattern?.name ?? 'Pattern';

  if (!enabled) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-black" edges={['bottom']}>
        <FocusAwareStatusBar />
        <Text className="text-fog-400">Missing pattern</Text>
      </SafeAreaView>
    );
  }

  if (
    (patternQuery.isPending && !pattern)
    && (projectsQuery.isPending && !projects.length)
  ) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-black" edges={['bottom']}>
        <FocusAwareStatusBar />
        <ActivityIndicator color="#ffffff" size="large" />
      </SafeAreaView>
    );
  }

  const header = (
    <PatternProjectsHeader
      name={name}
      photoUrl={photoUrl}
      projectCount={projectsQuery.isPending ? null : projectCount}
    />
  );

  return (
    <SafeAreaView className="flex-1 bg-black" edges={['bottom']}>
      <FocusAwareStatusBar />
      <FlatList
        data={projects}
        keyExtractor={item => String(item.id)}
        numColumns={COLS}
        columnWrapperStyle={{ gap: GRID_GAP }}
        contentContainerStyle={{ gap: GRID_GAP, paddingBottom: 24 }}
        ListHeaderComponent={header}
        ListEmptyComponent={
          projectsQuery.isPending
            ? (
                <View className="items-center py-10">
                  <ActivityIndicator color="#ffffff" />
                </View>
              )
            : (
                <Text className="mt-10 text-center text-sm text-fog-400">
                  No projects yet.
                </Text>
              )
        }
        renderItem={({ item }) => (
          <ProjectTile patternId={patternId} project={item} />
        )}
      />
    </SafeAreaView>
  );
}
