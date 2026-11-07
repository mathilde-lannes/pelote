import type { AxiosError } from 'axios';
import type { FriendActivity, RavelryProject } from '@/lib/ravelry/types';
import { createQuery } from 'react-query-kit';

import { useAuthStore } from '@/features/auth/use-auth-store';
import {
  fetchFriendsActivity,
  fetchProject,
} from '@/lib/ravelry/api';

export type { FriendActivity, RavelryProject };
export { isHomeFeedActivity } from './is-home-feed-activity';

export const useFriendsActivity = createQuery<
  FriendActivity[],
  void,
  AxiosError
>({
  queryKey: ['friends-activity'],
  fetcher: () => {
    const username = useAuthStore.getState().user?.username;
    if (!username)
      throw new Error('Not signed in');
    return fetchFriendsActivity(username);
  },
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
