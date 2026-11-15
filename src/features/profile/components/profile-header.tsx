import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { Pressable } from 'react-native';

import { Text, View } from '@/components/ui';
import { Settings as SettingsIcon } from '@/components/ui/icons';
import { ProfileCountSkeleton } from './profile-skeletons';

export type ProfileTab = 'projects' | 'favourites' | 'designs';

type Props = {
  username: string;
  avatarUrl: string | null;
  about: string | null;
  projectCount: number | null;
  favouriteCount: number | null;
  designCount: number | null;
  projectsLoading: boolean;
  favouritesLoading: boolean;
  designsLoading: boolean;
  tab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
  showFavouritesTab: boolean;
  showDesignsTab: boolean;
  showSettings: boolean;
};

function Stat({
  count,
  label,
  loading,
}: {
  count: number | null;
  label: string;
  loading?: boolean;
}) {
  if (loading)
    return <ProfileCountSkeleton />;

  return (
    <View>
      <Text className="text-base font-semibold text-white">
        {count == null ? '—' : count}
      </Text>
      <Text className="text-sm text-fog-400">
        {label}
      </Text>
    </View>
  );
}

function tabLabel(key: ProfileTab): string {
  if (key === 'projects')
    return 'Projects';
  if (key === 'favourites')
    return 'Favourites';
  return 'Designs';
}

function ProfileTabs({
  tabs,
  tab,
  onTabChange,
}: {
  tabs: ProfileTab[];
  tab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
}) {
  return (
    <View className="mt-2 flex-row">
      {tabs.map((key) => {
        const selected = tab === key;
        return (
          <Pressable
            key={key}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onTabChange(key)}
            className={`flex-1 items-center pt-3 pb-0 ${
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
              {tabLabel(key)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function ProfileHeader({
  username,
  avatarUrl,
  about,
  projectCount,
  favouriteCount,
  designCount,
  projectsLoading,
  favouritesLoading,
  designsLoading,
  tab,
  onTabChange,
  showFavouritesTab,
  showDesignsTab,
  showSettings,
}: Props) {
  const router = useRouter();
  const initial = username.slice(0, 1).toUpperCase() || '?';
  const tabs: ProfileTab[] = [
    'projects',
    ...(showFavouritesTab ? (['favourites'] as const) : []),
    ...(showDesignsTab ? (['designs'] as const) : []),
  ];
  const showDesignsStat
    = designsLoading || (designCount != null && designCount > 0);

  return (
    <View className="pt-2">
      <View className="flex-row items-center gap-5 px-4 pb-2">
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
            <Stat count={projectCount} label="projects" loading={projectsLoading} />
            {showFavouritesTab
              ? (
                  <Stat
                    count={favouriteCount}
                    label="favourites"
                    loading={favouritesLoading}
                  />
                )
              : null}
            {showDesignsStat
              ? <Stat count={designCount} label="designs" loading={designsLoading} />
              : null}
          </View>
        </View>
      </View>
      {about
        ? (
            <Text className="mt-2 mb-3 px-4 text-sm/5 text-fog-300">
              {about}
            </Text>
          )
        : null}
      <ProfileTabs tabs={tabs} tab={tab} onTabChange={onTabChange} />
    </View>
  );
}
