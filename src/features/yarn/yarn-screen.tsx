import type { RavelryProject } from './api';
import { Image } from 'expo-image';
import { Link, useLocalSearchParams, usePathname } from 'expo-router';
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
import { formatCompactCount } from '@/features/feed/format-compact-count';
import { bestPhotoUrl } from '@/lib/ravelry/api';
import { useYarn, useYarnProjects } from './api';
import { dyerHref, yarnProjectFeedHref } from './yarn-href';

const GRID_GAP = 2;
const COLS = 3;
const TILE
  = (Dimensions.get('window').width - GRID_GAP * (COLS - 1)) / COLS;

function StatColumn({
  value,
  label,
}: {
  value: number | null;
  label: string;
}) {
  return (
    <View>
      <Text className="text-base font-semibold text-white">
        {value == null ? '—' : formatCompactCount(value)}
      </Text>
      <Text className="text-sm text-fog-400">
        {label}
      </Text>
    </View>
  );
}

function YarnHeader({
  name,
  dyerName,
  dyerLink,
  photoUrl,
  projectCount,
}: {
  name: string;
  dyerName: string | null;
  dyerLink: string | null;
  photoUrl: string | null;
  projectCount: number | null;
}) {
  const initial = (name || '?').slice(0, 1).toUpperCase();
  const dyerLabel = dyerName
    ? (
        <Text className="mt-1 text-sm text-fog-400" numberOfLines={1}>
          {dyerName}
        </Text>
      )
    : null;

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
          {dyerLink && dyerName
            ? (
                <Link href={dyerLink as never} asChild>
                  <Pressable accessibilityRole="link" accessibilityLabel={`Dyer ${dyerName}`}>
                    {dyerLabel}
                  </Pressable>
                </Link>
              )
            : dyerLabel}
          <View className="mt-3 flex-row gap-6">
            <StatColumn value={projectCount} label="projects" />
          </View>
        </View>
      </View>
    </View>
  );
}

function ProjectTile({
  yarnId,
  project,
}: {
  yarnId: number;
  project: RavelryProject;
}) {
  const pathname = usePathname();
  const uri = bestPhotoUrl(project.first_photo ?? project.photos?.[0]);
  const href = yarnProjectFeedHref(yarnId, project.id, pathname);

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

export function YarnScreen() {
  const pathname = usePathname();
  const params = useLocalSearchParams<{ id: string }>();
  const yarnId = Number(String(params.id ?? '').trim());
  const enabled = Number.isFinite(yarnId) && yarnId > 0;

  const yarnQuery = useYarn({
    variables: { id: yarnId },
    enabled,
  });
  const projectsQuery = useYarnProjects({
    variables: { yarnId },
    enabled,
  });

  const yarn = yarnQuery.data;
  const projects = projectsQuery.data?.projects ?? [];
  const projectCount = projectsQuery.isPending
    ? (yarn?.projects_count ?? null)
    : (projects.length || yarn?.projects_count || null);
  const photoUrl = bestPhotoUrl(yarn?.photo ?? yarn?.photos?.[0] ?? null);
  const name = yarn?.name ?? 'Yarn';
  const dyerName = yarn?.yarn_company_name?.trim() || null;
  const dyerId = yarn?.yarn_company_id ?? yarn?.yarn_company?.id ?? null;
  const dyerLink
    = dyerId != null && dyerId > 0
      ? dyerHref(dyerId, pathname)
      : null;

  if (!enabled) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-black" edges={['bottom']}>
        <FocusAwareStatusBar />
        <Text className="text-fog-400">Missing yarn</Text>
      </SafeAreaView>
    );
  }

  if (
    (yarnQuery.isPending && !yarn)
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
    <YarnHeader
      name={name}
      dyerName={dyerName}
      dyerLink={dyerLink}
      photoUrl={photoUrl}
      projectCount={
        yarnQuery.isPending && projectsQuery.isPending
          ? null
          : (yarn?.projects_count ?? projectCount)
      }
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
          <ProjectTile yarnId={yarnId} project={item} />
        )}
      />
    </SafeAreaView>
  );
}
