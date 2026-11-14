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
