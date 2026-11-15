import type { RavelryFavoriteType } from '@/lib/ravelry/types';
import * as React from 'react';
import { showMessage } from 'react-native-flash-message';

import { useModal } from '@/components/ui';
import {
  getSessionFavorite,
  useAddFavorite,
  useFavoritesCache,
  useMyFavorites,
  useRemoveFavorite,
} from '@/features/feed/favorites-api';
import { favoriteLookupKey } from '@/lib/ravelry/favorites-utils';

export type FavoriteTarget = {
  type: RavelryFavoriteType;
  id: number;
};

function writeErrorMessage(error: unknown): string {
  const status = (error as { response?: { status?: number } })?.response?.status;
  if (status === 401 || status === 403) {
    return 'Ravelry rejected this write — confirm the app is read & write and try signing in again.';
  }
  return error instanceof Error ? error.message : 'Something went wrong';
}

function nextCount(
  current: number | null,
  favoritesCount: number | null | undefined,
  delta: number,
): number {
  const base
    = current
      ?? (typeof favoritesCount === 'number' && Number.isFinite(favoritesCount)
        ? Math.max(0, Math.floor(favoritesCount))
        : 0);
  return Math.max(0, base + delta);
}

function resolveFavoriteId(
  target: FavoriteTarget | null,
  cache: Record<string, number> | undefined,
): number | undefined {
  if (!target)
    return undefined;
  const session = getSessionFavorite(target.type, target.id);
  if (session !== undefined)
    return session ?? undefined;
  return cache?.[favoriteLookupKey(target.type, target.id)];
}

/**
 * Heart / double-tap favorite for a pattern or project post.
 * Add is immediate; remove opens a confirmation sheet first.
 */
export function usePostFavorite(
  target: FavoriteTarget | null,
  favoritesCount?: number | null,
) {
  const modal = useModal();
  const favoritesQuery = useMyFavorites({ enabled: Boolean(target) });
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();
  const { setFavorited, clearFavorited } = useFavoritesCache();

  const [countOverride, setCountOverride] = React.useState<number | null>(null);
  const [optimistic, setOptimistic] = React.useState<'add' | 'remove' | null>(
    null,
  );

  const favoriteId = resolveFavoriteId(target, favoritesQuery.data);
  const isFavorited
    = optimistic === 'add'
      ? true
      : optimistic === 'remove'
        ? false
        : favoriteId != null;

  const displayCount
    = countOverride
      ?? (typeof favoritesCount === 'number' && Number.isFinite(favoritesCount)
        ? Math.max(0, Math.floor(favoritesCount))
        : null);

  const pending = addFavorite.isPending || removeFavorite.isPending;

  const add = React.useCallback(async () => {
    if (!target || pending || isFavorited)
      return;
    setOptimistic('add');
    setCountOverride(current => nextCount(current, favoritesCount, 1));
    try {
      const favorite = await addFavorite.mutateAsync({
        type: target.type,
        id: target.id,
      });
      await setFavorited(target.type, target.id, favorite.id);
      setOptimistic(null);
    }
    catch (error) {
      setOptimistic(null);
      setCountOverride(current => nextCount(current, favoritesCount, -1));
      showMessage({ message: writeErrorMessage(error), type: 'danger' });
    }
  }, [
    addFavorite,
    favoritesCount,
    isFavorited,
    pending,
    setFavorited,
    target,
  ]);

  const requestToggle = React.useCallback(() => {
    if (!target || pending)
      return;
    if (isFavorited) {
      if (favoriteId == null)
        return;
      modal.present();
      return;
    }
    void add();
  }, [add, favoriteId, isFavorited, modal, pending, target]);

  const confirmRemove = React.useCallback(async () => {
    if (!target || favoriteId == null || pending)
      return;
    setOptimistic('remove');
    setCountOverride(current => nextCount(current, favoritesCount, -1));
    try {
      await removeFavorite.mutateAsync({ favoriteId });
      await clearFavorited(target.type, target.id);
      setOptimistic(null);
      modal.dismiss();
    }
    catch (error) {
      setOptimistic(null);
      setCountOverride(current => nextCount(current, favoritesCount, 1));
      showMessage({ message: writeErrorMessage(error), type: 'danger' });
    }
  }, [
    clearFavorited,
    favoriteId,
    favoritesCount,
    modal,
    pending,
    removeFavorite,
    target,
  ]);

  return {
    isFavorited,
    displayCount,
    pending,
    requestToggle,
    confirmRemove,
    unfavoriteModal: modal,
    removing: removeFavorite.isPending,
  };
}
