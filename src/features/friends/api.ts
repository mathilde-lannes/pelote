import type { AxiosError } from 'axios';
import { createMutation, createQuery } from 'react-query-kit';

import { useAuthStore } from '@/features/auth/use-auth-store';
import {
  addFriend,
  fetchFriends,
  removeFriend,
  searchPeople,
} from '@/lib/ravelry/api';
import type { RavelryPerson } from '@/lib/ravelry/types';

export const useFriends = createQuery<RavelryPerson[], void, AxiosError>({
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
  { friendUsername: string },
  AxiosError
>({
  mutationFn: async ({ friendUsername }) => {
    const username = useAuthStore.getState().user?.username;
    if (!username)
      throw new Error('Not signed in');
    await removeFriend(username, friendUsername);
  },
});
