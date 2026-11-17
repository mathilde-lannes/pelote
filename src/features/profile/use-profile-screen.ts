import type { ProfileTab } from './components/profile-header';
import type { RavelryPattern, RavelryPerson } from '@/lib/ravelry/types';
import { useLocalSearchParams } from 'expo-router';
import * as React from 'react';

import { useAuthStore } from '@/features/auth/use-auth-store';
import {
  useDesignerPatterns,
  usePerson,
  usePersonFavorites,
  usePersonFriendCount,
  usePersonProjects,
} from './api';

function designerLabel(
  person: RavelryPerson | undefined,
  designs: RavelryPattern[],
): string | null {
  const fromDesigns = designs.find(pattern => pattern.pattern_author?.name?.trim())
    ?.pattern_author
    ?.name
    ?.trim();
  return fromDesigns || person?.designer_name?.trim() || null;
}

export function useProfileScreen() {
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

  /** Opened via designer link (`?designer=` / `designer_id`). */
  const isDesignerProfile
    = Boolean(designerPermalink) || designerId != null;
  const showDesignsChip = isDesignerProfile;

  const [tab, setTab] = React.useState<ProfileTab | null>(null);
  const activeTab: ProfileTab
    = tab != null && (tab !== 'designs' || showDesignsChip)
      ? tab
      : (showDesignsChip ? 'designs' : 'projects');

  const personQuery = usePerson({
    variables: { username },
    enabled: Boolean(username),
  });
  const projectsQuery = usePersonProjects({
    variables: { username },
    // Non-designers show this total beside the photo, so keep it loaded.
    enabled: Boolean(username) && (activeTab === 'projects' || !isDesignerProfile),
  });
  const favoritesQuery = usePersonFavorites({
    variables: { username },
    // Favourites are only loaded for the signed-in user's own profile.
    enabled: Boolean(username) && isOwnProfile && activeTab === 'favourites',
  });
  const designsQuery = useDesignerPatterns({
    variables: {
      username,
      ...(designerPermalink ? { designerPermalink } : {}),
      ...(designerId != null ? { designerId } : {}),
    },
    // Designers show this total beside the photo, so keep it loaded.
    enabled: Boolean(username) && (activeTab === 'designs' || isDesignerProfile),
  });
  const friendCountQuery = usePersonFriendCount({
    variables: { username },
    enabled: Boolean(username),
  });

  const person = personQuery.data;
  const projects = projectsQuery.data?.projects ?? [];
  const favorites = favoritesQuery.data?.favorites ?? [];
  const designs = designsQuery.data?.patterns ?? [];

  return {
    username,
    designerPermalink,
    designerId,
    isTabProfile,
    isOwnProfile,
    isDesignerProfile,
    showDesignsChip,
    person,
    projects,
    favorites,
    designs,
    activeTab,
    setTab,
    personPending: personQuery.isPending,
    failed: personQuery.isError && !person,
    displayName: person?.username || username,
    profileName: (isDesignerProfile ? designerLabel(person, designs) : null)
      || person?.first_name?.trim()
      || person?.username
      || username,
    avatarUrl: person?.photo_url ?? person?.small_photo_url ?? null,
    about: person?.about_me?.trim() || null,
    workCount: isDesignerProfile
      ? (designsQuery.data?.totalCount ?? null)
      : (projectsQuery.data?.totalCount ?? null),
    workLabel: isDesignerProfile ? 'designs' as const : 'projects' as const,
    workPending: isDesignerProfile
      ? designsQuery.isPending
      : projectsQuery.isPending,
    friendCount: friendCountQuery.data ?? null,
    friendsPending: friendCountQuery.isPending,
    projectsPending: activeTab === 'projects' && projectsQuery.isPending,
    favoritesPending:
      activeTab === 'favourites' && isOwnProfile && favoritesQuery.isPending,
    designsPending: activeTab === 'designs' && designsQuery.isPending,
  };
}
