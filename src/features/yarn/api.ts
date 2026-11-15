import type { AxiosError } from 'axios';
import type {
  RavelryColorway,
  RavelryPhoto,
  RavelryProject,
  RavelryYarn,
  RavelryYarnCompany,
} from '@/lib/ravelry/types';
import { createInfiniteQuery, createQuery } from 'react-query-kit';

import { sortProjectsByRecent } from '@/features/profile/api';
import {
  fetchColorwayStashPhotos,
  fetchCompanyYarns,
  fetchYarn,
  fetchYarnColorways,
  fetchYarnCompany,
  fetchYarnProjects,
} from '@/lib/ravelry/api';

export type {
  RavelryColorway,
  RavelryPhoto,
  RavelryProject,
  RavelryYarn,
  RavelryYarnCompany,
};

export type YarnProjectsResult = {
  projects: RavelryProject[];
  totalCount: number;
};

export type CompanyYarnsPage = {
  yarns: RavelryYarn[];
  page: number;
  pageCount: number;
  totalResults: number | null;
};

const PAGE_SIZE = 48;
const MAX_PROJECT_PAGES = 5;

export const useYarn = createQuery<
  RavelryYarn,
  { id: number },
  AxiosError
>({
  queryKey: ['yarn'],
  fetcher: variables => fetchYarn(variables.id),
});

export const useYarnProjects = createQuery<
  YarnProjectsResult,
  { yarnId: number },
  AxiosError
>({
  // Bump when switching from ignored yarn_id to yarn= permalink facet.
  queryKey: ['yarn-projects', 'v2-yarn-facet'],
  fetcher: async (variables) => {
    const yarn = await fetchYarn(variables.yarnId);
    const yarnKey = {
      id: yarn.id,
      permalink: yarn.permalink,
      name: yarn.name,
    };
    const first = await fetchYarnProjects(yarnKey, {
      page: 1,
      pageSize: PAGE_SIZE,
    });
    const all = [...first.projects];
    const lastPage = Math.min(first.pageCount, MAX_PROJECT_PAGES);

    for (let page = 2; page <= lastPage; page += 1) {
      const next = await fetchYarnProjects(yarnKey, {
        page,
        pageSize: PAGE_SIZE,
      });
      all.push(...next.projects);
    }

    return {
      projects: sortProjectsByRecent(all),
      totalCount: first.totalResults ?? all.length,
    };
  },
});

export const useYarnCompany = createQuery<
  RavelryYarnCompany,
  { id: number },
  AxiosError
>({
  queryKey: ['yarn-company'],
  fetcher: variables => fetchYarnCompany(variables.id),
});

export const useYarnColorways = createQuery<
  RavelryColorway[],
  { yarnId: number },
  AxiosError
>({
  queryKey: ['yarn-colorways'],
  fetcher: variables => fetchYarnColorways(variables.yarnId),
});

/** Stash photos when a colorway has no catalog photos (max 10). */
export const useColorwayStashPhotos = createQuery<
  RavelryPhoto[],
  {
    yarnId: number;
    colorwayId: number;
    colorwayName: string;
  },
  AxiosError
>({
  queryKey: ['colorway-stash-photos'],
  fetcher: variables =>
    fetchColorwayStashPhotos(variables.yarnId, {
      colorwayId: variables.colorwayId,
      colorwayName: variables.colorwayName,
      limit: 10,
    }),
});

export const useCompanyYarns = createInfiniteQuery<
  CompanyYarnsPage,
  { companyId: number },
  AxiosError
>({
  queryKey: ['company-yarns', `page-${PAGE_SIZE}`],
  fetcher: async (variables, { pageParam }) => {
    const page = await fetchCompanyYarns(variables.companyId, {
      page: pageParam as number,
      pageSize: PAGE_SIZE,
    });
    return {
      yarns: page.yarns,
      page: page.page,
      pageCount: page.pageCount,
      totalResults: page.totalResults,
    };
  },
  getNextPageParam: lastPage =>
    lastPage.page < lastPage.pageCount
      ? lastPage.page + 1
      : undefined,
  initialPageParam: 1,
});
