import type { FriendActivity, RavelryPhoto } from '@/lib/ravelry/types';

/** Activity types that belong on the default Home photo feed. */
const HOME_FEED_TYPES = new Set([
  'project_photo',
  'stash_photo',
  'handspun_photo',
]);

function hasUsablePhoto(photo?: RavelryPhoto | null): boolean {
  if (!photo)
    return false;
  return Boolean(
    photo.medium2_url
    ?? photo.medium_url
    ?? photo.shelved_url
    ?? photo.square_url
    ?? photo.small_url,
  );
}

/**
 * Default Home = friends’ own photo posts only.
 * Favourites / queue / comments / forum stay off (map to likes / For you later).
 */
export function isHomeFeedActivity(item: FriendActivity): boolean {
  if (!HOME_FEED_TYPES.has(String(item.type)))
    return false;
  return hasUsablePhoto(item.photo ?? item.project?.first_photo);
}
