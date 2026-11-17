import type { AxiosError } from 'axios';
import type {
  FriendEntry,
  RavelryFavorite,
  RavelryPattern,
  RavelryPerson,
  RavelryProject,
  RavelryQueuedProject,
  RavelryStash,
} from '@/lib/ravelry/types';
import { createQuery } from 'react-query-kit';

import {
  fetchFriendCount,
  fetchFriends,
  fetchPatternsByDesignerCandidates,
  fetchPerson,
  fetchPersonFavorites,
  fetchProjectsList,
  fetchQueuedProject,
  fetchQueueList,
  fetchStash,
  fetchStashList,
  resolveDesignerPermalinkForProfile,
} from '@/lib/ravelry/api';

export type { RavelryFavorite, RavelryPattern, RavelryPerson, RavelryProject, RavelryQueuedProject, RavelryStash };

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

export const usePersonFriendCount = createQuery<
  number,
  { username: string },
  AxiosError
>({
  queryKey: ['person-friend-count'],
  fetcher: variables => fetchFriendCount(variables.username),
});

export const usePersonFriends = createQuery<
  FriendEntry[],
  { username: string },
  AxiosError
>({
  queryKey: ['person-friends'],
  fetcher: async (variables) => {
    const res = await fetchFriends(variables.username);
    return res.friends;
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

export type PersonStashResult = {
  stashes: RavelryStash[];
  totalCount: number;
};

const STASH_PAGE_SIZE = 48;
/** Cap pages so a large notebook doesn’t fan out unbounded requests. */
const STASH_MAX_PAGES = 5;

function stashRecencyMs(stash: RavelryStash): number {
  for (const value of [stash.updated_at, stash.created_at]) {
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

function sortStashByRecent(stashes: RavelryStash[]): RavelryStash[] {
  return [...stashes].sort((a, b) => {
    const delta = stashRecencyMs(b) - stashRecencyMs(a);
    if (delta !== 0)
      return delta;
    return b.id - a.id;
  });
}

export const usePersonStash = createQuery<
  PersonStashResult,
  { username: string },
  AxiosError
>({
  queryKey: ['person-stash'],
  fetcher: async (variables) => {
    const first = await fetchStashList(variables.username, {
      page: 1,
      pageSize: STASH_PAGE_SIZE,
    });
    const all = [...first.stashes];
    const lastPage = Math.min(first.pageCount, STASH_MAX_PAGES);

    for (let page = 2; page <= lastPage; page += 1) {
      const next = await fetchStashList(variables.username, {
        page,
        pageSize: STASH_PAGE_SIZE,
      });
      all.push(...next.stashes);
    }

    return {
      stashes: sortStashByRecent(all),
      totalCount: first.totalResults ?? all.length,
    };
  },
});

export const useStash = createQuery<
  RavelryStash,
  { username: string; id: number },
  AxiosError
>({
  queryKey: ['stash'],
  fetcher: variables => fetchStash(variables.username, variables.id),
});

export type PersonQueueResult = {
  queuedProjects: RavelryQueuedProject[];
  totalCount: number;
};

const QUEUE_PAGE_SIZE = 48;
const QUEUE_MAX_PAGES = 5;

function sortQueue(items: RavelryQueuedProject[]): RavelryQueuedProject[] {
  return [...items].sort((a, b) => {
    const aOrder = a.sort_order ?? Number.MAX_SAFE_INTEGER;
    const bOrder = b.sort_order ?? Number.MAX_SAFE_INTEGER;
    if (aOrder !== bOrder)
      return aOrder - bOrder;
    return a.id - b.id;
  });
}

export const usePersonQueue = createQuery<
  PersonQueueResult,
  { username: string },
  AxiosError
>({
  queryKey: ['person-queue'],
  fetcher: async (variables) => {
    const first = await fetchQueueList(variables.username, {
      page: 1,
      pageSize: QUEUE_PAGE_SIZE,
    });
    const all = [...first.queuedProjects];
    const lastPage = Math.min(first.pageCount, QUEUE_MAX_PAGES);

    for (let page = 2; page <= lastPage; page += 1) {
      const next = await fetchQueueList(variables.username, {
        page,
        pageSize: QUEUE_PAGE_SIZE,
      });
      all.push(...next.queuedProjects);
    }

    return {
      queuedProjects: sortQueue(all),
      totalCount: first.totalResults ?? all.length,
    };
  },
});

export const useQueuedProject = createQuery<
  RavelryQueuedProject,
  { username: string; id: number },
  AxiosError
>({
  queryKey: ['queued-project'],
  fetcher: variables => fetchQueuedProject(variables.username, variables.id),
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
