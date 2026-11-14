import * as React from 'react';

import {
  clearRecentSearches,
  getRecentSearches,
  pushRecentSearch,
  removeRecentSearch,
  type RecentSearch,
} from './recent-searches';

export function useRecentSearches() {
  const [recents, setRecents] = React.useState<RecentSearch[]>(() =>
    getRecentSearches(),
  );

  const refresh = React.useCallback(() => {
    setRecents(getRecentSearches());
  }, []);

  const remember = React.useCallback((query: string) => {
    setRecents(pushRecentSearch(query));
  }, []);

  const remove = React.useCallback((query: string) => {
    setRecents(removeRecentSearch(query));
  }, []);

  const clear = React.useCallback(() => {
    clearRecentSearches();
    setRecents([]);
  }, []);

  return { recents, refresh, remember, remove, clear };
}
