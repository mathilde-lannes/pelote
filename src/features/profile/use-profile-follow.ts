import type { AxiosError } from 'axios';
import type { RavelryPerson } from '@/lib/ravelry/types';
import { useQueryClient } from '@tanstack/react-query';
import * as React from 'react';

import { showMessage } from 'react-native-flash-message';
import {
  useAddFriend,
  useFriends,
  useRemoveFriend,
} from '@/features/friends/api';

function errorMessage(error: unknown, fallback: string) {
  if (error && typeof error === 'object' && 'isAxiosError' in error) {
    const axiosError = error as AxiosError<{ error?: string; message?: string }>;
    const body
      = axiosError.response?.data?.error
        ?? axiosError.response?.data?.message;
    if (body)
      return body;
  }
  return error instanceof Error ? error.message : fallback;
}

export function useProfileFollow({
  username,
  person,
  enabled,
}: {
  username: string;
  person?: RavelryPerson;
  enabled: boolean;
}) {
  const queryClient = useQueryClient();
  const friendsQuery = useFriends({ enabled });
  const addFriend = useAddFriend();
  const removeFriend = useRemoveFriend();

  const friend = React.useMemo(
    () => (friendsQuery.data ?? []).find(
      entry => entry.username.toLowerCase() === username.toLowerCase(),
    ),
    [friendsQuery.data, username],
  );
  const serverFollowed = Boolean(friend);
  const [optimistic, setOptimistic] = React.useState<{
    username: string;
    followed: boolean;
  } | null>(null);
  // Drop the override once the friends list agrees, or when the profile changes.
  if (
    optimistic
    && (
      optimistic.username !== username
      || optimistic.followed === serverFollowed
    )
  ) {
    setOptimistic(null);
  }

  const adding
    = addFriend.isPending
      && addFriend.variables?.friendUsername.toLowerCase() === username.toLowerCase();
  const removing
    = removeFriend.isPending
      && removeFriend.variables?.friendshipId === friend?.friendship_id;
  const followed = optimistic?.username === username
    ? optimistic.followed
    : serverFollowed;

  const onFollow = React.useCallback(async () => {
    const wasFriend = Boolean(friend);
    setOptimistic({ username, followed: !wasFriend });
    try {
      if (friend) {
        await removeFriend.mutateAsync({ friendshipId: friend.friendship_id });
      }
      else {
        await addFriend.mutateAsync({
          friendUsername: username,
          ...(person ? { person } : {}),
        });
      }
      await queryClient.invalidateQueries({ queryKey: ['friends'] });
      await queryClient.invalidateQueries({ queryKey: ['friends-activity'] });
    }
    catch (error) {
      setOptimistic(null);
      showMessage({
        message: errorMessage(
          error,
          wasFriend ? 'Could not unfollow' : 'Could not follow',
        ),
        type: 'danger',
      });
    }
  }, [addFriend, friend, person, queryClient, removeFriend, username]);

  return {
    followed,
    followPending: enabled && (friendsQuery.isPending || adding || removing),
    onFollow,
  };
}
