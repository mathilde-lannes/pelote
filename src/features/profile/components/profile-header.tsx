import { Image } from 'expo-image';
import { usePathname, useRouter } from 'expo-router';
import * as React from 'react';
import { Pressable } from 'react-native';

import { ExpandableText } from '@/components/expandable-text';
import { Text, View } from '@/components/ui';
import { Settings as SettingsIcon } from '@/components/ui/icons';
import { userFriendsHref } from '../designer-profile-href';
import { ProfileCountSkeleton } from './profile-skeletons';

export type ProfileTab = 'designs' | 'projects' | 'queued' | 'favourites' | 'stash';

const PROFILE_TABS: { key: ProfileTab; label: string }[] = [
  { key: 'projects', label: 'Projects' },
  { key: 'favourites', label: 'Favourites' },
  { key: 'queued', label: 'Queued' },
  { key: 'stash', label: 'Stash' },
];

type Props = {
  username: string;
  /** Name beside the photo. Designers use the same name as their posts. */
  firstName: string;
  avatarUrl: string | null;
  about: string | null;
  workCount: number | null;
  workLabel: 'designs' | 'projects';
  workLoading: boolean;
  friendCount: number | null;
  friendsLoading: boolean;
  tab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
  /** Designs leads the row and is the default selection. */
  showDesignsTab?: boolean;
  showSettings: boolean;
};

function Stat({
  count,
  label,
  loading,
  onPress,
}: {
  count: number | null;
  label: string;
  loading?: boolean;
  onPress?: () => void;
}) {
  const body = loading
    ? <ProfileCountSkeleton />
    : (
        <View>
          <Text className="text-base font-semibold text-white">
            {count == null ? '—' : count}
          </Text>
          <Text className="text-sm text-fog-400">
            {label}
          </Text>
        </View>
      );

  if (!onPress)
    return body;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
    >
      {body}
    </Pressable>
  );
}

function ProfileTabs({
  tab,
  onTabChange,
  showDesignsTab,
}: {
  tab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
  showDesignsTab: boolean;
}) {
  const tabs = showDesignsTab
    ? [{ key: 'designs' as const, label: 'Designs' }, ...PROFILE_TABS]
    : PROFILE_TABS;

  return (
    <View className="mt-2 flex-row">
      {tabs.map(({ key, label }) => {
        const selected = tab === key;
        return (
          <Pressable
            key={key}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={label}
            onPress={() => onTabChange(key)}
            testID={`profile-tab-${key}`}
            className={`flex-1 items-center pt-3 pb-0 ${
              selected
                ? 'border-b-2 border-white'
                : 'border-b-2 border-transparent'
            }`}
          >
            <Text
              numberOfLines={1}
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

export function ProfileHeader({
  username,
  firstName,
  avatarUrl,
  about,
  workCount,
  workLabel,
  workLoading,
  friendCount,
  friendsLoading,
  tab,
  onTabChange,
  showDesignsTab = false,
  showSettings,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const initial = firstName.slice(0, 1).toUpperCase() || '?';

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
              {firstName}
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
            <Stat
              count={friendCount}
              label="following"
              loading={friendsLoading}
              onPress={() => {
                router.push(userFriendsHref(username, pathname) as never);
              }}
            />
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
      <ProfileTabs
        tab={tab}
        onTabChange={onTabChange}
        showDesignsTab={showDesignsTab}
      />
    </View>
  );
}
