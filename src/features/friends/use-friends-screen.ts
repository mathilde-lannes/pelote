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
        message: e instanceof Error ? e.message : 'Could not add friend',
        type: 'danger',
      });
    }
  };

  const onRemove = async (username: string) => {
    try {
      await removeFriend.mutateAsync({ friendUsername: username });
      showMessage({ message: `Removed ${username}`, type: 'info' });
      await invalidate();
    }
    catch (e) {
      showMessage({
        message: e instanceof Error ? e.message : 'Could not remove friend',
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
