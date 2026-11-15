import type { AxiosError } from 'axios';
import type {
  RavelryProject,
  RavelryYarn,
  RavelryYarnCompany,
} from '@/lib/ravelry/types';
import { createInfiniteQuery, createQuery } from 'react-query-kit';

import { sortProjectsByRecent } from '@/features/profile/api';
import {
  fetchCompanyYarns,
  fetchYarn,
  fetchYarnCompany,
  fetchYarnProjects,
} from '@/lib/ravelry/api';

export type { RavelryProject, RavelryYarn, RavelryYarnCompany };

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
  queryKey: ['yarn-projects', 'v1-projects-search'],
  fetcher: async (variables) => {
    const first = await fetchYarnProjects(variables.yarnId, {
      page: 1,
      pageSize: PAGE_SIZE,
    });
    const all = [...first.projects];
    const lastPage = Math.min(first.pageCount, MAX_PROJECT_PAGES);

    for (let page = 2; page <= lastPage; page += 1) {
      const next = await fetchYarnProjects(variables.yarnId, {
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
