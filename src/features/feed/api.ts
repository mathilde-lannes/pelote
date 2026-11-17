import type { AxiosError } from 'axios';
import type { FriendsActivityPage } from '@/lib/ravelry/api';
import type {
  FriendActivity,
  RavelryProject,
  RavelryYarn,
} from '@/lib/ravelry/types';
import { createInfiniteQuery, createQuery } from 'react-query-kit';

import { useAuthStore } from '@/features/auth/use-auth-store';
import {
  fetchFriendsActivity,
  fetchProject,
  fetchYarnsByIds,
} from '@/lib/ravelry/api';

export type { FriendActivity, FriendsActivityPage, RavelryProject };

export const useFriendsActivity = createInfiniteQuery<
  FriendsActivityPage,
  void,
  AxiosError
>({
  queryKey: ['friends-activity', 'all'],
  fetcher: (_variables, { pageParam }) => {
    const username = useAuthStore.getState().user?.username;
    if (!username)
      throw new Error('Not signed in');
    return fetchFriendsActivity(username, {
      page: pageParam as number,
    });
  },
  getNextPageParam: lastPage =>
    lastPage.activities.length < lastPage.pageSize
      ? undefined
      : lastPage.page + 1,
  initialPageParam: 1,
});

export const useProject = createQuery<
  RavelryProject,
  { username: string; id: string },
  AxiosError
>({
  queryKey: ['project'],
  fetcher: (variables) => {
    return fetchProject(variables.username, Number(variables.id));
  },
});

/** Yarn#full rows for project pack photos (`GET yarns.json?ids=`). */
export const useYarnsByIds = createQuery<
  RavelryYarn[],
  { ids: number[] },
  AxiosError
>({
  queryKey: ['yarns', 'by-ids'],
  fetcher: variables => fetchYarnsByIds(variables.ids),
});
