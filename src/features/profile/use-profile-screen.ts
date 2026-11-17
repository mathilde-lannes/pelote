import type { ProfileTab } from './components/profile-header';
import { useLocalSearchParams } from 'expo-router';
import * as React from 'react';

import { useAuthStore } from '@/features/auth/use-auth-store';
import {
  useDesignerPatterns,
  usePerson,
  usePersonFavorites,
  usePersonProjects,
} from './api';

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

  const personQuery = usePerson({
    variables: { username },
    enabled: Boolean(username),
  });
  const projectsQuery = usePersonProjects({
    variables: { username },
    enabled: Boolean(username),
  });
  const favoritesQuery = usePersonFavorites({
    variables: { username },
    // Favourites are only loaded for the signed-in user's own profile.
    enabled: Boolean(username) && isOwnProfile,
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
  const favorites = favoritesQuery.data?.favorites ?? [];
  const designs = designsQuery.data?.patterns ?? [];
  const hasDesigns
    = designs.length > 0
      || ((designsQuery.data?.totalCount ?? 0) > 0);
  /** Opened via designer link (`?designer=` / `designer_id`). */
  const isDesignerProfile
    = Boolean(designerPermalink) || designerId != null;
  const showDesignsChip = isDesignerProfile || hasDesigns;

  const [tab, setTab] = React.useState<ProfileTab | null>(null);
  const activeTab: ProfileTab
    = tab != null && (tab !== 'designs' || showDesignsChip)
      ? tab
      : (showDesignsChip ? 'designs' : 'projects');

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
    avatarUrl: person?.photo_url ?? person?.small_photo_url ?? null,
    about: person?.about_me?.trim() || person?.first_name?.trim() || null,
    projectCount: projectsQuery.isPending
      ? null
      : projectsQuery.data?.totalCount ?? null,
    favouriteCount: favoritesQuery.isPending
      ? null
      : favoritesQuery.data?.totalCount ?? null,
    designCount: designsQuery.isPending
      ? null
      : designsQuery.data?.totalCount ?? null,
    projectsPending: projectsQuery.isPending,
    favoritesPending: favoritesQuery.isPending,
    designsPending: designsQuery.isPending,
  };
}
