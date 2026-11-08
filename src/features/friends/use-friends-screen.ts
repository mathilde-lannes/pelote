import type { AxiosError } from 'axios';
import type { RavelryPerson } from '@/lib/ravelry/types';
import { useQueryClient } from '@tanstack/react-query';
import * as React from 'react';

import { showMessage } from 'react-native-flash-message';
import { useAuthStore } from '@/features/auth/use-auth-store';
import {
  useAddFriend,
  useFriends,
  usePeopleSearch,
  useRemoveFriend,
} from './api';

function errorMessage(error: unknown, fallback: string) {
  if (error && typeof error === 'object' && 'isAxiosError' in error) {
    const axiosError = error as AxiosError<{ error?: string; message?: string }>;
    const status = axiosError.response?.status;
    const body
      = axiosError.response?.data?.error
        ?? axiosError.response?.data?.message;
    if (status === 401 || status === 403) {
      return body
        ?? 'Ravelry rejected this write — confirm the app is read & write and try signing in again.';
    }
    if (body)
      return body;
  }
  return error instanceof Error ? error.message : fallback;
}

export function useFriendsScreen() {
  const [query, setQuery] = React.useState('');
  const [debounced, setDebounced] = React.useState('');
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  const user = useAuthStore.use.user();
  const friendsQuery = useFriends({ enabled: Boolean(user) });
  const searchQuery = usePeopleSearch({
    variables: { query: debounced },
    enabled: Boolean(user) && debounced.length > 0,
  });

  const addFriend = useAddFriend();
  const removeFriend = useRemoveFriend();

  const friendSet = React.useMemo(
    () => new Set((friendsQuery.data ?? []).map(f => f.username)),
    [friendsQuery.data],
  );

  const invalidate = React.useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['friends'] });
    await queryClient.invalidateQueries({ queryKey: ['friends-activity'] });
  }, [queryClient]);

  const onAdd = async (person: RavelryPerson) => {
    try {
      await addFriend.mutateAsync({
        friendUsername: person.username,
        person,
      });
      showMessage({
        message: `Added ${person.username}`,
        type: 'success',
      });
      await invalidate();
    }
    catch (e) {
      showMessage({
        message: errorMessage(e, 'Could not add friend'),
        type: 'danger',
      });
    }
  };

  const onRemove = async (username: string) => {
    const entry = (friendsQuery.data ?? []).find(f => f.username === username);
    if (entry?.friendship_id == null) {
      showMessage({
        message: 'Could not find that friendship to remove',
        type: 'danger',
      });
      return;
    }

    try {
      await removeFriend.mutateAsync({
        friendshipId: entry.friendship_id,
      });
      showMessage({ message: `Removed ${username}`, type: 'info' });
      await invalidate();
    }
    catch (e) {
      showMessage({
        message: errorMessage(e, 'Could not remove friend'),
        type: 'danger',
      });
    }
  };

  const showingSearch = debounced.length > 0;
  const results = showingSearch
    ? (searchQuery.data ?? [])
    : (friendsQuery.data ?? []);

  return {
    query,
    setQuery,
    debounced,
    friendsQuery,
    searchQuery,
    friendSet,
    onAdd,
    onRemove,
    showingSearch,
    results,
  };
}
