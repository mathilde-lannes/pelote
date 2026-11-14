import { getItem, setItem } from '@/lib/storage';

const STORAGE_KEY = 'explore.recent-searches';
const MAX_RECENT = 12;

export type RecentSearch = {
  query: string;
  searchedAt: number;
};

function readAll(): RecentSearch[] {
  const stored = getItem<RecentSearch[]>(STORAGE_KEY);
  if (!Array.isArray(stored))
    return [];
  return stored
    .filter(item => item && typeof item.query === 'string' && item.query.trim())
    .map(item => ({
      query: item.query.trim(),
      searchedAt: typeof item.searchedAt === 'number' ? item.searchedAt : 0,
    }));
}

export function getRecentSearches(): RecentSearch[] {
  return readAll().sort((a, b) => b.searchedAt - a.searchedAt);
}

export function pushRecentSearch(query: string): RecentSearch[] {
  const trimmed = query.trim();
  if (!trimmed)
    return getRecentSearches();

  const next: RecentSearch[] = [
    { query: trimmed, searchedAt: Date.now() },
    ...readAll().filter(
      item => item.query.toLowerCase() !== trimmed.toLowerCase(),
    ),
  ].slice(0, MAX_RECENT);

  void setItem(STORAGE_KEY, next);
  return next;
}

export function removeRecentSearch(query: string): RecentSearch[] {
  const needle = query.trim().toLowerCase();
  const next = readAll().filter(item => item.query.toLowerCase() !== needle);
  void setItem(STORAGE_KEY, next);
  return next.sort((a, b) => b.searchedAt - a.searchedAt);
}

export function clearRecentSearches(): void {
  void setItem(STORAGE_KEY, []);
}
