import type { RavelryPhoto, RavelryProjectPack } from './types';

/** Pack/stash photo URLs — shared by pattern and project pack rows. */
function normalizePackPhoto(raw: any): RavelryPhoto | null {
  if (!raw || typeof raw !== 'object')
    return null;
  const medium2
    = typeof raw.medium2_url === 'string' && raw.medium2_url
      ? raw.medium2_url
      : null;
  const medium
    = typeof raw.medium_url === 'string' && raw.medium_url
      ? raw.medium_url
      : null;
  const shelved
    = typeof raw.shelved_url === 'string' && raw.shelved_url
      ? raw.shelved_url
      : null;
  const square
    = typeof raw.square_url === 'string' && raw.square_url
      ? raw.square_url
      : null;
  const small2
    = typeof raw.small2_url === 'string' && raw.small2_url
      ? raw.small2_url
      : null;
  const small
    = typeof raw.small_url === 'string' && raw.small_url
      ? raw.small_url
      : null;
  const thumbnail
    = typeof raw.thumbnail_url === 'string' && raw.thumbnail_url
      ? raw.thumbnail_url
      : null;
  if (!medium2 && !medium && !shelved && !square && !small2 && !small && !thumbnail)
    return null;
  return {
    id: Number(raw.id ?? 0) || 0,
    medium_url: medium ?? medium2,
    medium2_url: medium2 ?? medium,
    square_url: square,
    small_url: small ?? small2 ?? thumbnail,
    small2_url: small2 ?? small ?? thumbnail,
    thumbnail_url: thumbnail,
    shelved_url: shelved,
  };
}

/**
 * Pattern#full / Project#full `packs[]` row.
 * Pack photos are owner/stash uploads — catalog yarn photos come from Yarns#full.
 */
export function normalizePack(raw: any): RavelryProjectPack | null {
  if (!raw || typeof raw !== 'object')
    return null;
  const yarnIdRaw = Number(raw.yarn_id ?? raw.yarn?.id);
  const yarnId
    = Number.isFinite(yarnIdRaw) && yarnIdRaw > 0 ? yarnIdRaw : null;
  const yarnName
    = (typeof raw.yarn_name === 'string' && raw.yarn_name.trim())
      || (typeof raw.yarn?.name === 'string' && raw.yarn.name.trim())
      || null;
  const company
    = (typeof raw.yarn_company_name === 'string' && raw.yarn_company_name.trim())
      || (typeof raw.yarn?.yarn_company_name === 'string'
        && raw.yarn.yarn_company_name.trim())
      || (typeof raw.yarn?.yarn_company?.name === 'string'
        && raw.yarn.yarn_company.name.trim())
      || (typeof raw.yarn_company?.name === 'string' && raw.yarn_company.name.trim())
      || null;
  const colorway
    = typeof raw.colorway === 'string' && raw.colorway.trim()
      ? raw.colorway.trim()
      : null;
  const colorFamily
    = (typeof raw.color_family?.name === 'string' && raw.color_family.name.trim())
      || (typeof raw.color_family_name === 'string' && raw.color_family_name.trim())
      || null;
  const yarnWeight
    = (typeof raw.yarn_weight?.name === 'string' && raw.yarn_weight.name.trim())
      || (typeof raw.yarn?.yarn_weight?.name === 'string'
        && raw.yarn.yarn_weight.name.trim())
      || null;
  const dyeLot
    = typeof raw.dye_lot === 'string' && raw.dye_lot.trim()
      ? raw.dye_lot.trim()
      : null;
  const skeinsRaw = raw.skeins ?? raw.total_skeins;
  const skeins
    = typeof skeinsRaw === 'number' && Number.isFinite(skeinsRaw)
      ? skeinsRaw
      : null;
  const totalYards
    = typeof raw.total_yards === 'number' && Number.isFinite(raw.total_yards)
      ? raw.total_yards
      : null;
  const totalMeters
    = typeof raw.total_meters === 'number' && Number.isFinite(raw.total_meters)
      ? raw.total_meters
      : null;
  const shopName
    = typeof raw.shop_name === 'string' && raw.shop_name.trim()
      ? raw.shop_name.trim()
      : null;
  const photo
    = normalizePackPhoto(raw.primary_photo)
      ?? normalizePackPhoto(raw.first_photo)
      ?? normalizePackPhoto(raw.photo)
      ?? normalizePackPhoto(
        Array.isArray(raw.photos) ? raw.photos[0] : null,
      )
      ?? normalizePackPhoto(raw.stash?.first_photo)
      ?? normalizePackPhoto(
        Array.isArray(raw.stash?.photos) ? raw.stash.photos[0] : null,
      );
  if (
    yarnId == null
    && !yarnName
    && !company
    && !colorway
    && !colorFamily
    && !yarnWeight
    && !dyeLot
    && skeins == null
    && totalYards == null
    && totalMeters == null
    && !shopName
    && !photo
  ) {
    return null;
  }
  return {
    yarn_id: yarnId,
    yarn_name: yarnName,
    yarn_company_name: company,
    colorway,
    color_family_name: colorFamily,
    yarn_weight_name: yarnWeight,
    dye_lot: dyeLot,
    skeins,
    total_yards: totalYards,
    total_meters: totalMeters,
    shop_name: shopName,
    photo,
  };
}

export function normalizePacks(raw: unknown): RavelryProjectPack[] {
  if (!Array.isArray(raw))
    return [];
  return raw
    .map(normalizePack)
    .filter((entry): entry is RavelryProjectPack => entry != null);
}
