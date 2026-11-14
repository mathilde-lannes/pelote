import type { AxiosError } from 'axios';
import type { PatternHighlightsPage } from '@/lib/ravelry/api';
import type { PatternHighlight, RavelryPattern } from '@/lib/ravelry/types';
import { createInfiniteQuery } from 'react-query-kit';

import {
  fetchPatternHighlightsPage,
  invalidatePatternHighlightTimeline,
} from '@/lib/ravelry/api';

export type { PatternHighlight, PatternHighlightsPage, RavelryPattern };

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
