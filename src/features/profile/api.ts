import type { AxiosError } from 'axios';
import type {
  RavelryFavorite,
  RavelryPattern,
  RavelryPerson,
  RavelryProject,
} from '@/lib/ravelry/types';
import { createQuery } from 'react-query-kit';

import {
  fetchPatternsByDesignerCandidates,
  fetchPerson,
  fetchPersonFavorites,
  fetchProjectsList,
  resolveDesignerPermalinkForProfile,
} from '@/lib/ravelry/api';

export type { RavelryFavorite, RavelryPattern, RavelryPerson, RavelryProject };

export type PersonProjectsResult = {
  projects: RavelryProject[];
  /** Total projects reported by Ravelry (not capped by loaded pages). */
  totalCount: number;
};

export type PersonFavoritesResult = {
  favorites: RavelryFavorite[];
  totalCount: number;
};

export type DesignerPatternsResult = {
  patterns: RavelryPattern[];
  totalCount: number;
};

function projectRecencyMs(project: RavelryProject): number {
  for (const value of [
    project.completed,
    project.started,
    project.created_at,
    project.updated_at,
  ]) {
    if (typeof value !== 'string' || !value.trim())
      continue;
    const normalized = value.includes('/')
      ? value.replace(/\//g, '-')
      : value;
    const time = new Date(normalized).getTime();
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

const PROJECTS_PAGE_SIZE = 48;

export const usePersonProjects = createQuery<
  PersonProjectsResult,
  { username: string },
  AxiosError
>({
  queryKey: ['person-projects'],
  fetcher: async (variables) => {
    const first = await fetchProjectsList(variables.username, {
      page: 1,
      pageSize: PROJECTS_PAGE_SIZE,
    });
    const all = [...first.projects];

    for (let page = 2; page <= first.pageCount; page += 1) {
      const next = await fetchProjectsList(variables.username, {
        page,
        pageSize: PROJECTS_PAGE_SIZE,
      });
      all.push(...next.projects);
    }

    return {
      projects: sortProjectsByRecent(all),
      totalCount: first.totalResults ?? all.length,
    };
  },
});

export const usePersonFavorites = createQuery<
  PersonFavoritesResult,
  { username: string },
  AxiosError
>({
  queryKey: ['person-favorites'],
  fetcher: variables => fetchPersonFavorites(variables.username),
});

const DESIGNS_PAGE_SIZE = 48;
/** Cap pages so prolific designers don’t fan out unbounded requests. */
const DESIGNS_MAX_PAGES = 5;

export type DesignerPatternsVariables = {
  username: string;
  /** From pattern_author.permalink when opening a designer from a pattern card. */
  designerPermalink?: string;
  /** From pattern_author.id when opening a designer from a pattern card. */
  designerId?: number;
};

export const useDesignerPatterns = createQuery<
  DesignerPatternsResult,
  DesignerPatternsVariables,
  AxiosError
>({
  // Bump key when search filter / resolution strategy changes.
  queryKey: ['designer-patterns', 'v3-designer'],
  fetcher: async (variables) => {
    const resolved = await resolveDesignerPermalinkForProfile({
      username: variables.username,
      designerPermalink: variables.designerPermalink,
      designerId: variables.designerId,
    });
    const candidates = [
      variables.designerPermalink,
      resolved,
      variables.username,
    ].filter((value): value is string => Boolean(value?.trim()));

    const first = await fetchPatternsByDesignerCandidates(candidates, {
      page: 1,
      pageSize: DESIGNS_PAGE_SIZE,
    });
    const all = [...first.patterns];
    const lastPage = Math.min(first.pageCount, DESIGNS_MAX_PAGES);
    const permalink = first.permalinkUsed;

    for (let page = 2; page <= lastPage; page += 1) {
      const next = await fetchPatternsByDesignerCandidates([permalink], {
        page,
        pageSize: DESIGNS_PAGE_SIZE,
      });
      all.push(...next.patterns);
    }

    return {
      patterns: all,
      totalCount: first.totalResults ?? all.length,
    };
  },
});
