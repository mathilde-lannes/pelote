/**
 * Yarn / dyer URLs differ by tab stack:
 * - Home → `/yarn/:id`, `/dyer/:id`
 * - Search → `/search/yarn/:id`, `/search/dyer/:id`
 */
export function yarnBasePath(pathname?: string | null): string {
  return pathname?.startsWith('/search') ? '/search/yarn' : '/yarn';
}

export function dyerBasePath(pathname?: string | null): string {
  return pathname?.startsWith('/search') ? '/search/dyer' : '/dyer';
}

export function yarnHref(
  yarnId: number,
  pathname?: string | null,
): string {
  return `${yarnBasePath(pathname)}/${yarnId}`;
}

export function yarnProjectFeedHref(
  yarnId: number,
  projectId: number,
  pathname?: string | null,
): string {
  return `${yarnHref(yarnId, pathname)}/${projectId}`;
}

export function yarnColorwayFeedHref(
  yarnId: number,
  colorwayId: number,
  pathname?: string | null,
): string {
  return `${yarnHref(yarnId, pathname)}/colorway/${colorwayId}`;
}

export function dyerHref(
  companyId: number,
  pathname?: string | null,
): string {
  return `${dyerBasePath(pathname)}/${companyId}`;
}
