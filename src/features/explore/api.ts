import type { AxiosError } from 'axios';
import type {
  DesignerPatternsPage,
  PatternHighlightsPage,
} from '@/lib/ravelry/api';
import type { PatternHighlight, RavelryPattern } from '@/lib/ravelry/types';
import { createInfiniteQuery, createQuery } from 'react-query-kit';

import {
  fetchPattern,
  fetchPatternHighlightsPage,
  fetchPatternsByQuery,
  fetchRecentlyPopularPatterns,
  invalidatePatternHighlightTimeline,
} from '@/lib/ravelry/api';
import {
  EMPTY_PATTERN_SEARCH_FILTERS,
  patternFiltersQueryKey,
  patternFiltersToParams,
  type PatternSearchFilters,
} from './pattern-search-filters';

export type { PatternHighlight, PatternHighlightsPage, RavelryPattern };
export type { PatternSearchFilters };

const RECENTLY_POPULAR_PAGE_SIZE = 48;
const PATTERN_SEARCH_PAGE_SIZE = 48;
const PATTERN_SUGGEST_PAGE_SIZE = 8;

export function refreshPatternHighlights(
  refetch: () => Promise<unknown>,
) {
  invalidatePatternHighlightTimeline();
  return refetch();
}

export const usePatternHighlights = createInfiniteQuery<
  PatternHighlightsPage,
  void,
  AxiosError
>({
  queryKey: ['pattern-highlights', 'page-15'],
  fetcher: (_variables, { pageParam }) =>
    fetchPatternHighlightsPage(pageParam as number),
  getNextPageParam: lastPage =>
    lastPage.page * lastPage.pageSize < lastPage.total
      ? lastPage.page + 1
      : undefined,
  initialPageParam: 1,
});

export const useRecentlyPopularPatterns = createInfiniteQuery<
  DesignerPatternsPage,
  { filters?: PatternSearchFilters },
  AxiosError
>({
  queryKey: ['patterns', 'recently-popular', 'v3-filters', `page-${RECENTLY_POPULAR_PAGE_SIZE}`],
  fetcher: (variables, { pageParam }) =>
    fetchRecentlyPopularPatterns({
      page: pageParam as number,
      pageSize: RECENTLY_POPULAR_PAGE_SIZE,
      filters: patternFiltersToParams(
        variables.filters ?? EMPTY_PATTERN_SEARCH_FILTERS,
      ),
    }),
  getNextPageParam: lastPage =>
    lastPage.page < lastPage.pageCount
      ? lastPage.page + 1
      : undefined,
  initialPageParam: 1,
});

export const usePattern = createQuery<
  RavelryPattern,
  { id: number },
  AxiosError
>({
  queryKey: ['pattern'],
  fetcher: variables => fetchPattern(variables.id),
});

/** Live typeahead — thin Pattern#list rows, no full enrich. */
export const usePatternSearchSuggestions = createQuery<
  DesignerPatternsPage,
  { query: string; filters?: PatternSearchFilters },
  AxiosError
>({
  queryKey: ['patterns', 'search-suggest', 'v2-filters'],
  fetcher: variables =>
    fetchPatternsByQuery(variables.query, {
      page: 1,
      pageSize: PATTERN_SUGGEST_PAGE_SIZE,
      enrich: false,
      filters: patternFiltersToParams(
        variables.filters ?? EMPTY_PATTERN_SEARCH_FILTERS,
      ),
    }),
});

export const usePatternSearch = createInfiniteQuery<
  DesignerPatternsPage,
  { query: string; filters?: PatternSearchFilters },
  AxiosError
>({
  queryKey: ['patterns', 'search', 'v2-filters', `page-${PATTERN_SEARCH_PAGE_SIZE}`],
  fetcher: (variables, { pageParam }) =>
    fetchPatternsByQuery(variables.query, {
      page: pageParam as number,
      pageSize: PATTERN_SEARCH_PAGE_SIZE,
      filters: patternFiltersToParams(
        variables.filters ?? EMPTY_PATTERN_SEARCH_FILTERS,
      ),
    }),
  getNextPageParam: lastPage =>
    lastPage.page < lastPage.pageCount
      ? lastPage.page + 1
      : undefined,
  initialPageParam: 1,
});

export { patternFiltersQueryKey };
