import type { RavelryPatternAuthor } from '@/lib/ravelry/types';

/**
 * Profile route for a pattern author. Keeps the linked user for people/{username}
 * but forwards designer permalink / id so Designs can use the correct
 * patterns/search `designer=` filter (often ≠ login username).
 */
export function designerProfileHref(
  author: RavelryPatternAuthor | null | undefined,
): string | null {
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
  const query = params.toString();
  return query ? `/user/${routeUser}?${query}` : `/user/${routeUser}`;
}
