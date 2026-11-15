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
  // Bump when switching from yarn= to yarn-link= permalink facet.
  queryKey: ['yarn-projects', 'v3-yarn-link'],
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
  { query: string; id?: number | null },
  AxiosError
>({
  // Bump when switching from YarnCompanies#show to yarn_companies/search.
  queryKey: ['yarn-company', 'v2-search'],
  fetcher: variables =>
    fetchYarnCompany({
      query: variables.query,
      id: variables.id,
    }),
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
  { companyId?: number | null; query: string },
  AxiosError
>({
  // Bump when switching to brand= permalink facet (+ query fallback).
  queryKey: ['company-yarns', 'v5-brand-facet', `page-${PAGE_SIZE}`],
  fetcher: async (variables, { pageParam }) => {
    const company = await fetchYarnCompany({
      query: variables.query,
      id: variables.companyId,
    });
    const page = await fetchCompanyYarns(
      {
        id: company.id,
        permalink: company.permalink,
        name: company.name,
      },
      {
        page: pageParam as number,
        pageSize: PAGE_SIZE,
      },
    );
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
