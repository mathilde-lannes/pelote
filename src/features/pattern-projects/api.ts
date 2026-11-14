import type { AxiosError } from 'axios';
import type { RavelryProject } from '@/lib/ravelry/types';
import { createQuery } from 'react-query-kit';

import { sortProjectsByRecent } from '@/features/profile/api';
import { fetchPattern, fetchPatternProjects } from '@/lib/ravelry/api';

export type { RavelryProject };

export type PatternProjectsResult = {
  projects: RavelryProject[];
  totalCount: number;
};

const PAGE_SIZE = 48;
/** Cap pages so very popular patterns don’t fan out unbounded requests. */
const MAX_PAGES = 5;

export const usePatternProjects = createQuery<
  PatternProjectsResult,
  { patternId: number },
  AxiosError
>({
  // Bump when switching from photo-gallery collection to projects/search.
  queryKey: ['pattern-projects', 'v3-projects-search'],
  fetcher: async (variables) => {
    const pattern = await fetchPattern(variables.patternId);
    const first = await fetchPatternProjects(
      {
        id: pattern.id,
        permalink: pattern.permalink,
        name: pattern.name,
      },
      { page: 1, pageSize: PAGE_SIZE },
    );
    const all = [...first.projects];
    const lastPage = Math.min(first.pageCount, MAX_PAGES);

    for (let page = 2; page <= lastPage; page += 1) {
      const next = await fetchPatternProjects(
        {
          id: pattern.id,
          permalink: pattern.permalink,
          name: pattern.name,
        },
        { page, pageSize: PAGE_SIZE },
      );
      all.push(...next.projects);
    }

    return {
      projects: sortProjectsByRecent(all),
      totalCount: first.totalResults ?? all.length,
    };
  },
});
