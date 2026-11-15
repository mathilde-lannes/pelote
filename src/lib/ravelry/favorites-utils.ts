import type { RavelryFavorite, RavelryFavoriteType } from './types';

function normalizeFavoriteType(raw: unknown): RavelryFavoriteType | null {
  const value = String(raw ?? '').toLowerCase().replace(/s$/, '');
  if (value === 'pattern' || value === 'project')
    return value;
  return null;
}

/** Same size preference as `bestPhotoUrl` (medium first, not square/small). */
function favoritePhotoUrl(favorited: any): string | null {
  const photo
    = favorited?.first_photo
      ?? favorited?.photos?.[0]
      ?? null;
  if (!photo)
    return null;
  return (
    photo.medium2_url
    ?? photo.medium_url
    ?? photo.shelved_url
    ?? photo.square_url
    ?? photo.small_url
    ?? null
  );
}

function favoriteOwnerUsername(favorited: any): string | null {
  const user = favorited?.user ?? favorited?.person ?? null;
  const username = user?.username;
  return typeof username === 'string' && username.trim()
    ? username.trim()
    : null;
}

export function normalizeFavorite(raw: any): RavelryFavorite | null {
  const id = raw?.id;
  if (id == null || !Number.isFinite(Number(id)))
    return null;

  const favorited = raw?.favorited ?? raw?.favorite ?? null;
  const type
    = normalizeFavoriteType(raw?.type)
      ?? normalizeFavoriteType(raw?.favorited_type)
      ?? normalizeFavoriteType(favorited?.type)
      ?? null;
  const typeIdRaw
    = raw?.type_id
      ?? raw?.favorited_id
      ?? favorited?.id
      ?? null;
  const typeId = Number(typeIdRaw);
  if (type == null || !Number.isFinite(typeId) || typeId <= 0)
    return null;

  const name
    = (typeof favorited?.name === 'string' && favorited.name.trim())
      || (typeof raw?.name === 'string' && raw.name.trim())
      || null;

  return {
    id: Number(id),
    type,
    type_id: typeId,
    created_at: typeof raw?.created_at === 'string' ? raw.created_at : null,
    name,
    photo_url: favoritePhotoUrl(favorited),
    owner_username: type === 'project' ? favoriteOwnerUsername(favorited) : null,
  };
}

export function favoriteLookupKey(
  type: RavelryFavoriteType,
  typeId: number,
): string {
  return `${type}:${typeId}`;
}
