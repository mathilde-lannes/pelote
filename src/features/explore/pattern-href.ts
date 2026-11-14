/**
 * Pattern detail URLs differ by tab stack:
 * - Home For You → `/pattern/:id`
 * - Search → `/search/pattern/:id` (keeps Search tab focused on back)
 */
export function patternBasePath(pathname?: string | null): string {
  return pathname?.startsWith('/search') ? '/search/pattern' : '/pattern';
}

export function patternHref(
  patternId: number,
  pathname?: string | null,
): string {
  return `${patternBasePath(pathname)}/${patternId}`;
}

/**
 * Search-query results feed scrolled to a pattern, so the user can swipe
 * through the other matches for `query`.
 */
export function searchResultsFeedHref(
  query: string,
  patternId: number,
): string | null {
  const q = query.trim();
  if (!q || !(patternId > 0))
    return null;
  return `/search/results/${patternId}?q=${encodeURIComponent(q)}`;
}

export function patternProjectsHref(
  patternId: number,
  pathname?: string | null,
): string {
  return `${patternHref(patternId, pathname)}/projects`;
}

export function patternProjectFeedHref(
  patternId: number,
  projectId: number,
  pathname?: string | null,
): string {
  return `${patternProjectsHref(patternId, pathname)}/${projectId}`;
}
