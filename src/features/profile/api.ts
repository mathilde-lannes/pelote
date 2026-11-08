import type { AxiosError } from 'axios';
import type { RavelryPerson, RavelryProject } from '@/lib/ravelry/types';
import { createQuery } from 'react-query-kit';

import {
  fetchPerson,
  fetchProjectsList,
} from '@/lib/ravelry/api';

export type { RavelryPerson, RavelryProject };

export const usePerson = createQuery<
  RavelryPerson,
  { username: string },
  AxiosError
>({
  queryKey: ['person'],
  fetcher: variables => fetchPerson(variables.username),
});

export const usePersonProjects = createQuery<
  RavelryProject[],
  { username: string },
  AxiosError
>({
  queryKey: ['person-projects'],
  fetcher: async (variables) => {
    const page = await fetchProjectsList(variables.username, {
      page: 1,
      pageSize: 48,
    });
    return page.projects;
  },
});
