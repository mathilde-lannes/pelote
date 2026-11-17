/**
 * Yarn / dyer URLs differ by tab stack:
 * - Home → `/yarn/:id`, `/dyer/:id`
 * - Search → `/search/yarn/:id`, `/search/dyer/:id`
 * - Profile → `/profile/yarn/:id`, `/profile/dyer/:id`
 */
export function yarnBasePath(pathname?: string | null): string {
  if (pathname?.startsWith('/search'))
    return '/search/yarn';
  if (pathname?.startsWith('/profile'))
    return '/profile/yarn';
  return '/yarn';
}

export function dyerBasePath(pathname?: string | null): string {
  if (pathname?.startsWith('/search'))
    return '/search/dyer';
  if (pathname?.startsWith('/profile'))
    return '/profile/dyer';
  return '/dyer';
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
  companyName?: string | null,
): string {
  const base = `${dyerBasePath(pathname)}/${companyId}`;
  const name = companyName?.trim();
  if (!name)
    return base;
  return `${base}?name=${encodeURIComponent(name)}`;
}
