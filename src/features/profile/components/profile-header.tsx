import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { Pressable, ScrollView } from 'react-native';

import { ExpandableText } from '@/components/expandable-text';
import { Text, View } from '@/components/ui';
import { Settings as SettingsIcon } from '@/components/ui/icons';
import { ProfileCountSkeleton } from './profile-skeletons';

export type ProfileTab = 'designs' | 'projects' | 'queued' | 'favourites' | 'stash';

const PROFILE_CHIPS: { key: ProfileTab; label: string }[] = [
  { key: 'projects', label: 'Projects' },
  { key: 'queued', label: 'Queued' },
  { key: 'favourites', label: 'Favourites' },
  { key: 'stash', label: 'Stash' },
];

type Props = {
  username: string;
  avatarUrl: string | null;
  about: string | null;
  workCount: number | null;
  workLabel: 'designs' | 'projects';
  workLoading: boolean;
  friendCount: number | null;
  friendsLoading: boolean;
  tab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
  /** Designs chip leads the row and is the default selection. */
  showDesignsChip?: boolean;
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

function ProfileChips({
  tab,
  onTabChange,
  showDesignsChip,
}: {
  tab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
  showDesignsChip: boolean;
}) {
  const chips = showDesignsChip
    ? [{ key: 'designs' as const, label: 'Designs' }, ...PROFILE_CHIPS]
    : PROFILE_CHIPS;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      directionalLockEnabled
      className="mt-3"
      contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingBottom: 12 }}
    >
      {chips.map(({ key, label }) => {
        const selected = tab === key;
        return (
          <Pressable
            key={key}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={label}
            onPress={() => onTabChange(key)}
            testID={`profile-chip-${key}`}
            className={`rounded-full px-3.5 py-1.5 ${
              selected ? 'bg-white' : 'bg-ink-300'
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                selected ? 'text-black' : 'text-white'
              }`}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export function ProfileHeader({
  username,
  avatarUrl,
  about,
  workCount,
  workLabel,
  workLoading,
  friendCount,
  friendsLoading,
  tab,
  onTabChange,
  showDesignsChip = false,
  showSettings,
}: Props) {
  const router = useRouter();
  const initial = username.slice(0, 1).toUpperCase() || '?';

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
            <Stat count={workCount} label={workLabel} loading={workLoading} />
            <Stat count={friendCount} label="friends" loading={friendsLoading} />
          </View>
        </View>
      </View>
      {about
        ? (
            <View className="mt-2 mb-3 px-4">
              <ExpandableText
                text={about}
                numberOfLines={2}
                className="text-sm/5 text-fog-300"
                moreClassName="text-sm font-semibold text-fog-500"
              />
            </View>
          )
        : null}
      <ProfileChips
        tab={tab}
        onTabChange={onTabChange}
        showDesignsChip={showDesignsChip}
      />
    </View>
  );
}
