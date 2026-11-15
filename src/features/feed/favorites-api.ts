import type { AxiosError } from 'axios';
import type {
  RavelryFavorite,
  RavelryFavoriteType,
} from '@/lib/ravelry/types';
import { useQueryClient } from '@tanstack/react-query';
import { createMutation, createQuery } from 'react-query-kit';

import { useAuthStore } from '@/features/auth/use-auth-store';
import {
  addFavorite,
  fetchMyFavorites,
  removeFavorite,
} from '@/lib/ravelry/api';
import { favoriteLookupKey } from '@/lib/ravelry/favorites-utils';

export const favoritesQueryKey = ['favorites'] as const;

export type FavoritesIndex = Record<string, number>;

/**
 * Session overlay so a successful like isn't wiped when:
 * - an in-flight favorites list fetch finishes with stale data, or
 * - FlashList recycles the Post and remounts the hook.
 * Values: favorite record id, or null when removed this session.
 */
const sessionOverlay = new Map<string, number | null>();

export function getSessionFavorite(
  type: RavelryFavoriteType,
  typeId: number,
): number | null | undefined {
  const key = favoriteLookupKey(type, typeId);
  if (!sessionOverlay.has(key))
    return undefined;
  return sessionOverlay.get(key);
}

export function setSessionFavorite(
  type: RavelryFavoriteType,
  typeId: number,
  favoriteId: number | null,
) {
  sessionOverlay.set(favoriteLookupKey(type, typeId), favoriteId);
}

export function favoritesToIndex(favorites: RavelryFavorite[]): FavoritesIndex {
  const index: FavoritesIndex = {};
  for (const favorite of favorites)
    index[favoriteLookupKey(favorite.type, favorite.type_id)] = favorite.id;
  return index;
}

/** Apply session add/remove overlays on top of the server index. */
export function mergeFavoritesIndex(server: FavoritesIndex): FavoritesIndex {
  const merged = { ...server };
  for (const [key, favoriteId] of sessionOverlay) {
    if (favoriteId == null)
      delete merged[key];
    else
      merged[key] = favoriteId;
  }
  return merged;
}

export const useMyFavorites = createQuery<FavoritesIndex, void, AxiosError>({
  queryKey: favoritesQueryKey,
  fetcher: async () => {
    const username = useAuthStore.getState().user?.username;
    if (!username)
      throw new Error('Not signed in');
    const favorites = await fetchMyFavorites(username);
    return mergeFavoritesIndex(favoritesToIndex(favorites));
  },
  // Avoid background refetches clobbering hearts while scrolling the feed.
  staleTime: 5 * 60 * 1000,
});

export const useAddFavorite = createMutation<
  RavelryFavorite,
  { type: RavelryFavoriteType; id: number },
  AxiosError
>({
  mutationFn: async ({ type, id }) => {
    const username = useAuthStore.getState().user?.username;
    if (!username)
      throw new Error('Not signed in');
    return addFavorite(username, type, id);
  },
});

export const useRemoveFavorite = createMutation<
  void,
  { favoriteId: number },
  AxiosError
>({
  mutationFn: async ({ favoriteId }) => {
    const username = useAuthStore.getState().user?.username;
    if (!username)
      throw new Error('Not signed in');
    await removeFavorite(username, favoriteId);
  },
});

/** Optimistic cache helpers for heart state after add/remove. */
export function useFavoritesCache() {
  const queryClient = useQueryClient();

  const setFavorited = async (
    type: RavelryFavoriteType,
    typeId: number,
    favoriteId: number,
  ) => {
    setSessionFavorite(type, typeId, favoriteId);
    await queryClient.cancelQueries({ queryKey: favoritesQueryKey });
    queryClient.setQueryData<FavoritesIndex>(favoritesQueryKey, current => ({
      ...(current ?? {}),
      [favoriteLookupKey(type, typeId)]: favoriteId,
    }));
  };

  const clearFavorited = async (
    type: RavelryFavoriteType,
    typeId: number,
  ) => {
    setSessionFavorite(type, typeId, null);
    await queryClient.cancelQueries({ queryKey: favoritesQueryKey });
    queryClient.setQueryData<FavoritesIndex>(favoritesQueryKey, (current) => {
      if (!current)
        return current;
      const next = { ...current };
      delete next[favoriteLookupKey(type, typeId)];
      return next;
    });
  };

  return { setFavorited, clearFavorited };
}
