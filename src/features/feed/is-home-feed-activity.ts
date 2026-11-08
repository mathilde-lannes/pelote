import type { FriendActivity, RavelryPhoto } from '@/lib/ravelry/types';

/**
 * Normalized types for Home (after resolveActivityType).
 * Ravelry `activity_type_keys` accepted set:
 *   added-project-photo, added-stash-photo, queued-pattern,
 *   added-favorite, added-handspun-photo
 * Home uses the first three only; favorite / handspun stay off.
 */
const HOME_FEED_TYPES = new Set([
  'project_photo', // added-project-photo
  'stash_photo', // added-stash-photo
  'queued', // queued-pattern
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
 * Default Home = project/stash photos and queued patterns.
 * Favourites / handspun stay off (map to likes / For you later).
 */
export function isHomeFeedActivity(item: FriendActivity): boolean {
  if (!HOME_FEED_TYPES.has(String(item.type)))
    return false;
  if (item.type === 'queued')
    return true;
  return hasUsablePhoto(item.photo ?? item.project?.first_photo);
}
