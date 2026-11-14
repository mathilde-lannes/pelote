import type { RavelryPatternAuthor } from '@/lib/ravelry/types';

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
): string | null {
  const parts = designerRouteParts(author);
  if (!parts)
    return null;
  return parts.query
    ? `/user/${parts.routeUser}?${parts.query}`
    : `/user/${parts.routeUser}`;
}

/**
 * Designer designs feed scrolled to a specific pattern (grid → feed open).
 */
export function designerDesignsFeedHref(
  author: RavelryPatternAuthor | null | undefined,
  patternId: number,
): string | null {
  const parts = designerRouteParts(author);
  if (!parts || !(patternId > 0))
    return null;
  const path = `/user/${parts.routeUser}/designs/${patternId}`;
  return parts.query ? `${path}?${parts.query}` : path;
}
