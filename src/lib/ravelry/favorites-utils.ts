import type { RavelryFavorite, RavelryFavoriteType } from './types';

function normalizeFavoriteType(raw: unknown): RavelryFavoriteType | null {
  const value = String(raw ?? '').toLowerCase().replace(/s$/, '');
  if (value === 'pattern' || value === 'project')
    return value;
  return null;
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

  return {
    id: Number(id),
    type,
    type_id: typeId,
    created_at: typeof raw?.created_at === 'string' ? raw.created_at : null,
  };
}

export function favoriteLookupKey(
  type: RavelryFavoriteType,
  typeId: number,
): string {
  return `${type}:${typeId}`;
}
