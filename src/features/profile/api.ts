import type { AxiosError } from 'axios';
import type { RavelryPerson, RavelryProject } from '@/lib/ravelry/types';
import { createQuery } from 'react-query-kit';

import {
  fetchPerson,
  fetchProjectsList,
} from '@/lib/ravelry/api';

export type { RavelryPerson, RavelryProject };

function projectRecencyMs(project: RavelryProject): number {
  for (const value of [project.started, project.completed]) {
    if (typeof value !== 'string' || !value.trim())
      continue;
    const time = new Date(value).getTime();
    if (Number.isFinite(time))
      return time;
  }
  return 0;
}

/** Newest projects first (by started, then completed; id as tie-break). */
export function sortProjectsByRecent(projects: RavelryProject[]): RavelryProject[] {
  return [...projects].sort((a, b) => {
    const delta = projectRecencyMs(b) - projectRecencyMs(a);
    if (delta !== 0)
      return delta;
    return b.id - a.id;
  });
}

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
    return sortProjectsByRecent(page.projects);
  },
});
