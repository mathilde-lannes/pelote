import type { RavelryPattern, RavelryProject } from './api';
import { Image } from 'expo-image';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
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
import { Settings as SettingsIcon } from '@/components/ui/icons';
import { useAuthStore } from '@/features/auth/use-auth-store';
import { bestPhotoUrl } from '@/lib/ravelry/api';
import {
  useDesignerPatterns,
  usePerson,
  usePersonProjects,
} from './api';
import { designerDesignsFeedHref } from './designer-profile-href';

const GRID_GAP = 2;
const COLS = 3;
const TILE
  = (Dimensions.get('window').width - GRID_GAP * (COLS - 1)) / COLS;

type ProfileTab = 'projects' | 'designs';

function ProfileHeader({
  username,
  avatarUrl,
  about,
  projectCount,
  designCount,
  tab,
  onTabChange,
  showTabSwitch,
  showSettings,
}: {
  username: string;
  avatarUrl: string | null;
  about: string | null;
  projectCount: number | null;
  designCount: number | null;
  tab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
  showTabSwitch: boolean;
  showSettings: boolean;
}) {
  const router = useRouter();
  const initial = username.slice(0, 1).toUpperCase() || '?';

  return (
    <View className="border-b border-ink-300 px-4 pt-2 pb-3">
      <View className="flex-row items-center gap-5 pb-2">
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
        <View className="min-w-0 flex-1">
          <View className="flex-row items-start justify-between gap-3">
            <Text className="flex-1 text-xl font-semibold text-white">
              {username}
            </Text>
            {showSettings
              ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Settings"
                    hitSlop={8}
                    onPress={() => router.push('/settings')}
                    testID="profile-settings"
                  >
                    <SettingsIcon color="#ffffff" />
                  </Pressable>
                )
              : null}
          </View>
          <View className="mt-3 flex-row gap-6">
            <View>
              <Text className="text-base font-semibold text-white">
                {projectCount == null ? '—' : projectCount}
              </Text>
              <Text className="text-sm text-fog-400">
                projects
              </Text>
            </View>
            {designCount != null && designCount > 0
              ? (
                  <View>
                    <Text className="text-base font-semibold text-white">
                      {designCount}
                    </Text>
                    <Text className="text-sm text-fog-400">
                      designs
                    </Text>
                  </View>
                )
              : null}
          </View>
        </View>
      </View>
      {about
        ? (
            <Text className="mt-2 mb-3 text-sm/5 text-fog-300">
              {about}
            </Text>
          )
        : null}
      {showTabSwitch
        ? (
            <View className="mt-2 flex-row border-t border-ink-300">
              {(['projects', 'designs'] as const).map((key) => {
                const selected = tab === key;
                return (
                  <Pressable
                    key={key}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => onTabChange(key)}
                    className={`flex-1 items-center py-3 ${
                      selected ? 'border-b-2 border-white' : ''
                    }`}
                  >
                    <Text
                      className={`text-sm font-semibold ${
                        selected ? 'text-white' : 'text-fog-500'
                      }`}
                    >
                      {key === 'projects' ? 'Projects' : 'Designs'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
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
  const href = `/user/${username}/feed/${project.id}`;

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

function DesignTile({
  username,
  pattern,
  designerPermalink,
  designerId,
}: {
  username: string;
  pattern: RavelryPattern;
  designerPermalink?: string;
  designerId?: number;
}) {
  const uri = bestPhotoUrl(pattern.photos[0]);
  const href
    = designerDesignsFeedHref(
      {
        id: designerId ?? pattern.pattern_author?.id ?? 0,
        name: pattern.pattern_author?.name ?? '',
        permalink: designerPermalink ?? pattern.pattern_author?.permalink,
        users: pattern.pattern_author?.users?.length
          ? pattern.pattern_author.users
          : [{ id: 0, username, small_photo_url: null, photo_url: null }],
      },
      pattern.id,
    )
    ?? `/user/${username}/designs/${pattern.id}`;

  return (
    <Link href={href as never} asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={pattern.name}
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
                  {pattern.name}
                </Text>
              </View>
            )}
      </Pressable>
    </Link>
  );
}

export function ProfileScreen() {
  const params = useLocalSearchParams<{
    username: string;
    designer?: string;
    designer_id?: string;
  }>();
  const authUser = useAuthStore.use.user();
  const paramUsername = String(params.username ?? '').trim();
  const username = paramUsername || authUser?.username?.trim() || '';
  const designerPermalink = String(params.designer ?? '').trim();
  const designerIdRaw = Number(params.designer_id);
  const designerId
    = Number.isFinite(designerIdRaw) && designerIdRaw > 0
      ? designerIdRaw
      : undefined;
  const isTabProfile = !paramUsername;
  const isOwnProfile
    = Boolean(username)
      && Boolean(authUser?.username)
      && username.toLowerCase() === authUser!.username.toLowerCase();

  const personQuery = usePerson({
    variables: { username },
    enabled: Boolean(username),
  });
  const projectsQuery = usePersonProjects({
    variables: { username },
    enabled: Boolean(username),
  });
  const designsQuery = useDesignerPatterns({
    variables: {
      username,
      ...(designerPermalink ? { designerPermalink } : {}),
      ...(designerId != null ? { designerId } : {}),
    },
    enabled: Boolean(username),
  });

  const person = personQuery.data;
  const projects = projectsQuery.data?.projects ?? [];
  const designs = designsQuery.data?.patterns ?? [];
  const projectCount = projectsQuery.data?.totalCount ?? null;
  const designCount = designsQuery.data?.totalCount ?? null;
  const hasDesigns = designs.length > 0 || (designCount != null && designCount > 0);
  const showTabSwitch = hasDesigns && projects.length > 0;

  const [tab, setTab] = React.useState<ProfileTab>('projects');
  const tabInitialized = React.useRef(false);

  React.useEffect(() => {
    if (tabInitialized.current)
      return;
    if (projectsQuery.isPending || designsQuery.isPending)
      return;
    tabInitialized.current = true;
    // Designers (e.g. For You taps) often have designs but few/no public projects.
    if (projects.length === 0 && hasDesigns)
      setTab('designs');
  }, [
    designsQuery.isPending,
    hasDesigns,
    projects.length,
    projectsQuery.isPending,
  ]);

  const avatarUrl
    = person?.photo_url
      ?? person?.small_photo_url
      ?? null;
  const about
    = person?.about_me?.trim()
      || person?.first_name?.trim()
      || null;

  const loading
    = personQuery.isPending
      || projectsQuery.isPending
      || designsQuery.isPending;
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
  const showingDesigns
    = tab === 'designs' || (hasDesigns && projects.length === 0);
  const header = (
    <ProfileHeader
      username={displayName}
      avatarUrl={avatarUrl}
      about={about}
      projectCount={projectsQuery.isPending ? null : projectCount}
      designCount={designsQuery.isPending ? null : designCount}
      tab={showingDesigns ? 'designs' : 'projects'}
      onTabChange={setTab}
      showTabSwitch={showTabSwitch}
      showSettings={isOwnProfile}
    />
  );

  const empty = (pending: boolean, label: string) =>
    pending
      ? (
          <View className="items-center py-10">
            <ActivityIndicator color="#ffffff" />
          </View>
        )
      : (
          <Text className="mt-10 text-center text-sm text-fog-400">
            {label}
          </Text>
        );

  return (
    <SafeAreaView
      className="flex-1 bg-black"
      edges={isTabProfile ? ['top'] : ['bottom']}
    >
      <FocusAwareStatusBar />
      {showingDesigns
        ? (
            <FlatList
              data={designs}
              keyExtractor={item => String(item.id)}
              numColumns={COLS}
              columnWrapperStyle={{ gap: GRID_GAP }}
              contentContainerStyle={{ gap: GRID_GAP, paddingBottom: 24 }}
              ListHeaderComponent={header}
              ListEmptyComponent={empty(
                designsQuery.isPending,
                'No published designs yet.',
              )}
              renderItem={({ item }) => (
                <DesignTile
                  username={displayName}
                  pattern={item}
                  designerPermalink={designerPermalink || undefined}
                  designerId={designerId}
                />
              )}
            />
          )
        : (
            <FlatList
              data={projects}
              keyExtractor={item => String(item.id)}
              numColumns={COLS}
              columnWrapperStyle={{ gap: GRID_GAP }}
              contentContainerStyle={{ gap: GRID_GAP, paddingBottom: 24 }}
              ListHeaderComponent={header}
              ListEmptyComponent={empty(
                projectsQuery.isPending,
                'No public projects yet.',
              )}
              renderItem={({ item }) => (
                <ProjectTile username={displayName} project={item} />
              )}
            />
          )}
    </SafeAreaView>
  );
}
