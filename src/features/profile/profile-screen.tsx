import { useNavigation } from 'expo-router';
import * as React from 'react';

import {
  FocusAwareStatusBar,
  SafeAreaView,
  Text,
} from '@/components/ui';
import { ProfileHeader } from './components/profile-header';
import { ProfileNavigationHeader } from './components/profile-navigation-header';
import { ProfileScreenSkeleton } from './components/profile-skeletons';
import { ProfileTabLists } from './components/profile-tab-lists';
import { useProfileFollow } from './use-profile-follow';
import { useProfileScreen } from './use-profile-screen';

function useProfileNavigationHeader({
  isTabProfile,
  displayName,
  isOwnProfile,
  followed,
  followPending,
  onFollow,
}: {
  isTabProfile: boolean;
  displayName: string;
  isOwnProfile: boolean;
  followed: boolean;
  followPending: boolean;
  onFollow: () => void;
}) {
  const navigation = useNavigation();

  React.useLayoutEffect(() => {
    if (isTabProfile)
      return;

    navigation.setOptions({
      title: displayName,
      headerRight: undefined,
      header: () => (
        <ProfileNavigationHeader
          title={displayName}
          showFollow={!isOwnProfile}
          followed={followed}
          followPending={followPending}
          onFollow={() => {
            void onFollow();
          }}
        />
      ),
    });
  }, [
    displayName,
    followPending,
    followed,
    isOwnProfile,
    isTabProfile,
    navigation,
    onFollow,
  ]);
}

export function ProfileScreen() {
  const profile = useProfileScreen();
  const { followed, followPending, onFollow } = useProfileFollow({
    username: profile.username,
    person: profile.person,
    enabled: Boolean(profile.username) && !profile.isOwnProfile,
  });

  useProfileNavigationHeader({
    isTabProfile: profile.isTabProfile,
    displayName: profile.displayName,
    isOwnProfile: profile.isOwnProfile,
    followed,
    followPending,
    onFollow,
  });

  if (!profile.username) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-black" edges={['top']}>
        <FocusAwareStatusBar />
        <Text className="text-fog-400">Missing username</Text>
      </SafeAreaView>
    );
  }

  // Tab profile needs top inset; nested stack profiles already have a header + tab bar.
  const edges = profile.isTabProfile ? (['top'] as const) : [];

  if (profile.personPending && !profile.person) {
    return (
      <SafeAreaView
        className="flex-1 bg-black"
        edges={edges}
      >
        <FocusAwareStatusBar />
        <ProfileScreenSkeleton
          showSettings={profile.isOwnProfile}
          showDesignsChip={profile.isDesignerProfile}
        />
      </SafeAreaView>
    );
  }

  if (profile.failed) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-black px-6" edges={['top']}>
        <FocusAwareStatusBar />
        <Text className="text-center text-base text-fog-400">
          Couldn’t load this profile.
        </Text>
      </SafeAreaView>
    );
  }

  const header = (
    <ProfileHeader
      username={profile.displayName}
      avatarUrl={profile.avatarUrl}
      about={profile.about}
      workCount={profile.workCount}
      workLabel={profile.workLabel}
      workLoading={profile.workPending}
      friendCount={profile.friendCount}
      friendsLoading={profile.friendsPending}
      tab={profile.activeTab}
      onTabChange={profile.setTab}
      showDesignsChip={profile.showDesignsChip}
      showSettings={profile.isOwnProfile}
    />
  );

  return (
    <SafeAreaView
      className="flex-1 bg-black"
      edges={edges}
    >
      <FocusAwareStatusBar />
      <ProfileTabLists
        tab={profile.activeTab}
        header={header}
        displayName={profile.displayName}
        designerPermalink={profile.designerPermalink || undefined}
        designerId={profile.designerId}
        projects={profile.projects}
        favorites={profile.favorites}
        designs={profile.designs}
        projectsPending={profile.projectsPending}
        favoritesPending={profile.favoritesPending}
        designsPending={profile.designsPending}
      />
    </SafeAreaView>
  );
}
