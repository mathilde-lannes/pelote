import type { AxiosError } from 'axios';
import type { FriendsActivityPage } from '@/lib/ravelry/api';
import type { FriendActivity, RavelryProject } from '@/lib/ravelry/types';
import { createInfiniteQuery, createQuery } from 'react-query-kit';

import { useAuthStore } from '@/features/auth/use-auth-store';
import {
  fetchFriendsActivity,
  fetchProject,
} from '@/lib/ravelry/api';

export type { FriendActivity, FriendsActivityPage, RavelryProject };
export { isHomeFeedActivity } from './is-home-feed-activity';

/** Subset of Ravelry `activity_type_keys` used for the Home feed. */
export const HOME_FEED_ACTIVITY_TYPE_KEYS = [
  'added-project-photo',
  'added-stash-photo',
  'queued-pattern',
] as const;

export const useFriendsActivity = createInfiniteQuery<
  FriendsActivityPage,
  void,
  AxiosError
>({
  queryKey: ['friends-activity'],
  fetcher: (_variables, { pageParam }) => {
    const username = useAuthStore.getState().user?.username;
    if (!username)
      throw new Error('Not signed in');
    return fetchFriendsActivity(username, {
      activityTypeKeys: [...HOME_FEED_ACTIVITY_TYPE_KEYS],
      page: pageParam as number,
    });
  },
  getNextPageParam: (lastPage) =>
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
