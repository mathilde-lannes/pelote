import type { RavelryPatternAuthor } from '@/lib/ravelry/types';

/**
 * User profile URLs differ by tab stack:
 * - Home → `/user/:username`
 * - Search → `/search/user/:username` (keeps Search tab focused on back)
 * - Profile → `/profile/user/:username` (keeps the Profile tab focused on back)
 */
export function userBasePath(pathname?: string | null): string {
  if (pathname?.startsWith('/search'))
    return '/search/user';
  if (pathname?.startsWith('/profile'))
    return '/profile/user';
  return '/user';
}

/** Signed-in profile tab, not a friend opened inside that tab. */
function isProfileTabRoot(pathname?: string | null): boolean {
  if (!pathname?.startsWith('/profile'))
    return false;
  return !pathname.startsWith('/profile/user/');
}

function designerRouteParts(
  author: RavelryPatternAuthor | null | undefined,
): { routeUser: string; query: string } | null {
  if (!author)
    return null;
  const username = author.users[0]?.username?.trim() || '';
  const permalink = author.permalink?.trim() || '';
  const routeUser = username || permalink;
  if (!routeUser)
    return null;

  const params = new URLSearchParams();
  if (permalink)
    params.set('designer', permalink);
  if (author.id > 0)
    params.set('designer_id', String(author.id));
  return { routeUser, query: params.toString() };
}

/**
 * Profile route for a pattern author. Keeps the linked user for people/{username}
 * but forwards designer permalink / id so Designs can use the correct
 * patterns/search `designer=` filter (often ≠ login username).
 */
export function designerProfileHref(
  author: RavelryPatternAuthor | null | undefined,
  pathname?: string | null,
): string | null {
  const parts = designerRouteParts(author);
  if (!parts)
    return null;
  const base = `${userBasePath(pathname)}/${parts.routeUser}`;
  return parts.query ? `${base}?${parts.query}` : base;
}

/**
 * Designer designs feed scrolled to a specific pattern (grid → feed open).
 */
export function designerDesignsFeedHref(
  author: RavelryPatternAuthor | null | undefined,
  patternId: number,
  pathname?: string | null,
): string | null {
  const parts = designerRouteParts(author);
  if (!parts || !(patternId > 0))
    return null;
  const path = `${userBasePath(pathname)}/${parts.routeUser}/designs/${patternId}`;
  return parts.query ? `${path}?${parts.query}` : path;
}

export function userProfileHref(
  username: string,
  pathname?: string | null,
): string {
  return `${userBasePath(pathname)}/${username}`;
}

/** Post author. The signed-in profile tab links back to itself. */
export function postAuthorHref(
  username: string,
  pathname?: string | null,
): string {
  if (isProfileTabRoot(pathname))
    return '/profile';
  return userProfileHref(username, pathname);
}

export function userFriendsHref(
  username: string,
  pathname?: string | null,
): string {
  return `${userBasePath(pathname)}/${username}/friends`;
}

export function userProjectFeedHref(
  username: string,
  projectId: number,
  pathname?: string | null,
): string {
  return `${userBasePath(pathname)}/${username}/feed/${projectId}`;
}

/** Stash feed scrolled to one yarn. The profile tab keeps its own stack. */
export function userStashFeedHref(
  username: string,
  stashId: number,
  pathname?: string | null,
): string {
  if (isProfileTabRoot(pathname))
    return `/profile/stash/${stashId}`;
  return `${userBasePath(pathname)}/${username}/stash/${stashId}`;
}

/** Queue feed scrolled to one queued pattern. The profile tab keeps its own stack. */
export function userQueueFeedHref(
  username: string,
  queuedProjectId: number,
  pathname?: string | null,
): string {
  if (isProfileTabRoot(pathname))
    return `/profile/queue/${queuedProjectId}`;
  return `${userBasePath(pathname)}/${username}/queue/${queuedProjectId}`;
}
