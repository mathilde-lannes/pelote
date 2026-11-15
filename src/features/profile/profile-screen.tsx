import * as React from 'react';
import { ActivityIndicator } from 'react-native';

import {
  FocusAwareStatusBar,
  SafeAreaView,
  Text,
} from '@/components/ui';
import { ProfileHeader } from './components/profile-header';
import { ProfileTabLists } from './components/profile-tab-lists';
import { useProfileScreen } from './use-profile-screen';

export function ProfileScreen() {
  const profile = useProfileScreen();

  if (!profile.username) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-black" edges={['top']}>
        <FocusAwareStatusBar />
        <Text className="text-fog-400">Missing username</Text>
      </SafeAreaView>
    );
  }

  if (profile.loading && !profile.person) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-black" edges={['top']}>
        <FocusAwareStatusBar />
        <ActivityIndicator color="#ffffff" size="large" />
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
      projectCount={profile.projectCount}
      favouriteCount={profile.favouriteCount}
      designCount={profile.designCount}
      tab={profile.activeTab}
      onTabChange={profile.setTab}
      showDesignsTab={profile.hasDesigns}
      showSettings={profile.isOwnProfile}
    />
  );

  return (
    <SafeAreaView
      className="flex-1 bg-black"
      edges={profile.isTabProfile ? ['top'] : ['bottom']}
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
