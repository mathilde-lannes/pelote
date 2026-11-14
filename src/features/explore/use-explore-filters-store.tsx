import { create } from 'zustand';

import { createSelectors } from '@/lib/utils';
import {
  EMPTY_PATTERN_SEARCH_FILTERS,
  type PatternSearchFilters,
} from './pattern-search-filters';

type ExploreFiltersState = {
  filters: PatternSearchFilters;
  setFilters: (filters: PatternSearchFilters) => void;
  clearFilters: () => void;
};

const _useExploreFiltersStore = create<ExploreFiltersState>(set => ({
  filters: EMPTY_PATTERN_SEARCH_FILTERS,
  setFilters: filters => set({ filters }),
  clearFilters: () => set({ filters: EMPTY_PATTERN_SEARCH_FILTERS }),
}));

export const useExploreFiltersStore = createSelectors(_useExploreFiltersStore);
