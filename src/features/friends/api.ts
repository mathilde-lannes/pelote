import type { AxiosError } from 'axios';
import type { FriendEntry, RavelryPerson } from '@/lib/ravelry/types';

import { createMutation, createQuery } from 'react-query-kit';
import { useAuthStore } from '@/features/auth/use-auth-store';
import {
  addFriend,
  fetchFriends,
  removeFriend,
  searchPeople,
} from '@/lib/ravelry/api';

export const useFriends = createQuery<FriendEntry[], void, AxiosError>({
  queryKey: ['friends'],
  fetcher: async () => {
    const username = useAuthStore.getState().user?.username;
    if (!username)
      throw new Error('Not signed in');
    const res = await fetchFriends(username);
    return res.friends;
  },
});

export const usePeopleSearch = createQuery<
  RavelryPerson[],
  { query: string },
  AxiosError
>({
  queryKey: ['people-search'],
  fetcher: async (variables) => {
    const res = await searchPeople(variables.query);
    return res.people;
  },
});

export const useAddFriend = createMutation<
  void,
  { friendUsername: string; person?: RavelryPerson },
  AxiosError
>({
  mutationFn: async ({ friendUsername, person }) => {
    const username = useAuthStore.getState().user?.username;
    if (!username)
      throw new Error('Not signed in');
    await addFriend(username, friendUsername, person);
  },
});

export const useRemoveFriend = createMutation<
  void,
  { friendshipId: number },
  AxiosError
>({
  mutationFn: async ({ friendshipId }) => {
    const username = useAuthStore.getState().user?.username;
    if (!username)
      throw new Error('Not signed in');
    await removeFriend(username, friendshipId);
  },
});
