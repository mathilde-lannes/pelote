import type { RavelryColorway, RavelryProject } from './api';
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
import {
  useColorwayStashPhotos,
  useYarn,
  useYarnColorways,
  useYarnProjects,
} from './api';
import {
  dyerHref,
  yarnColorwayFeedHref,
  yarnProjectFeedHref,
} from './yarn-href';

const GRID_GAP = 2;
const COLS = 3;
const TILE
  = (Dimensions.get('window').width - GRID_GAP * (COLS - 1)) / COLS;

type YarnTab = 'projects' | 'colorways';

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

function YarnTabs({
  tab,
  onTabChange,
}: {
  tab: YarnTab;
  onTabChange: (tab: YarnTab) => void;
}) {
  const tabs: { key: YarnTab; label: string }[] = [
    { key: 'projects', label: 'Projects' },
    { key: 'colorways', label: 'Colorways' },
  ];

  return (
    <View className="flex-row border-b border-ink-300">
      {tabs.map(({ key, label }) => {
        const selected = tab === key;
        return (
          <Pressable
            key={key}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onTabChange(key)}
            className={`flex-1 items-center pt-3 ${
              selected
                ? 'border-b-2 border-white'
                : 'border-b-2 border-transparent'
            }`}
          >
            <Text
              className={`pb-3 text-sm font-semibold ${
                selected ? 'text-white' : 'text-fog-500'
              }`}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function YarnHeader({
  name,
  dyerName,
  dyerLink,
  photoUrl,
  projectCount,
  colorwayCount,
  tab,
  onTabChange,
}: {
  name: string;
  dyerName: string | null;
  dyerLink: string | null;
  photoUrl: string | null;
  projectCount: number | null;
  colorwayCount: number | null;
  tab: YarnTab;
  onTabChange: (tab: YarnTab) => void;
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
    <View className="px-4 pt-2">
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
            <StatColumn value={colorwayCount} label="colorways" />
          </View>
        </View>
      </View>
      <YarnTabs tab={tab} onTabChange={onTabChange} />
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

function ColorwayTile({
  yarnId,
  colorway,
}: {
  yarnId: number;
  colorway: RavelryColorway;
}) {
  const pathname = usePathname();
  const catalogPhoto = colorway.photo ?? null;
  const needsStash = !catalogPhoto;
  const stashQuery = useColorwayStashPhotos({
    variables: {
      yarnId,
      colorwayId: colorway.id,
      colorwayName: colorway.name,
    },
    enabled: needsStash,
  });
  const uri = bestPhotoUrl(
    catalogPhoto ?? stashQuery.data?.[0] ?? null,
  );
  const label = colorway.code
    ? `${colorway.code} ${colorway.name}`
    : colorway.name;
  const href = yarnColorwayFeedHref(yarnId, colorway.id, pathname);

  return (
    <Link href={href as never} asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        style={{ width: TILE, height: TILE }}
        className="overflow-hidden bg-ink-200"
      >
        {needsStash && stashQuery.isPending && !uri
          ? (
              <View className="size-full items-center justify-center">
                <ActivityIndicator color="#ffffff" />
              </View>
            )
          : uri
            ? (
                <Image
                  source={{ uri }}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                />
              )
            : (
                <View className="size-full items-center justify-center px-2">
                  <Text className="text-center text-xs text-fog-400" numberOfLines={3}>
                    {label}
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
  const [tab, setTab] = React.useState<YarnTab>('projects');

  const yarnQuery = useYarn({
    variables: { id: yarnId },
    enabled,
  });
  const projectsQuery = useYarnProjects({
    variables: { yarnId },
    enabled,
  });
  const colorwaysQuery = useYarnColorways({
    variables: { yarnId },
    enabled,
  });

  const yarn = yarnQuery.data;
  const projects = projectsQuery.data?.projects ?? [];
  const colorways = colorwaysQuery.data ?? [];
  const projectCount = projectsQuery.isPending && tab === 'projects'
    ? (yarn?.projects_count ?? null)
    : (projectsQuery.data?.totalCount
      ?? yarn?.projects_count
      ?? (projects.length || null));
  const colorwayCount = colorwaysQuery.isPending && tab === 'colorways'
    ? null
    : (colorwaysQuery.data?.length ?? null);
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

  if (yarnQuery.isPending && !yarn) {
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
        yarnQuery.isPending && tab === 'projects' && projectsQuery.isPending
          ? null
          : (yarn?.projects_count ?? projectCount)
      }
      colorwayCount={
        tab === 'colorways' && colorwaysQuery.isPending
          ? null
          : colorwayCount
      }
      tab={tab}
      onTabChange={setTab}
    />
  );

  if (tab === 'colorways') {
    return (
      <SafeAreaView className="flex-1 bg-black" edges={['bottom']}>
        <FocusAwareStatusBar />
        <FlatList
          data={colorways}
          keyExtractor={item => String(item.id)}
          numColumns={COLS}
          columnWrapperStyle={{ gap: GRID_GAP }}
          contentContainerStyle={{ gap: GRID_GAP, paddingBottom: 24 }}
          ListHeaderComponent={header}
          ListEmptyComponent={
            colorwaysQuery.isPending
              ? (
                  <View className="items-center py-10">
                    <ActivityIndicator color="#ffffff" />
                  </View>
                )
              : (
                  <Text className="mt-10 text-center text-sm text-fog-400">
                    No colorways yet.
                  </Text>
                )
          }
          renderItem={({ item }) => (
            <ColorwayTile yarnId={yarnId} colorway={item} />
          )}
        />
      </SafeAreaView>
    );
  }

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
