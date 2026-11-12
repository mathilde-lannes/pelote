import type { AxiosError } from 'axios';
import type { PatternHighlight, RavelryPattern } from '@/lib/ravelry/types';
import { createQuery } from 'react-query-kit';

import { fetchPattern, fetchPatternHighlights } from '@/lib/ravelry/api';

export type { PatternHighlight, RavelryPattern };

export const usePatternHighlights = createQuery<
  PatternHighlight[],
  void,
  AxiosError
>({
  queryKey: ['pattern-highlights'],
  fetcher: () => fetchPatternHighlights(),
});

export const usePattern = createQuery<
  RavelryPattern,
  { id: string },
  AxiosError
>({
  queryKey: ['pattern'],
  fetcher: variables => fetchPattern(Number(variables.id)),
});
