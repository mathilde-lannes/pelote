import type { ActivityType } from './types';

const ACTIVITY_TYPE_ALIASES: Record<string, ActivityType> = {
  'project_photo': 'project_photo',
  'projectphoto': 'project_photo',
  'project-photo': 'project_photo',
  // Seen in some API/client docs alongside project_photo
  'project_added': 'project_photo',
  'added_project_photo': 'project_photo',
  'stash_photo': 'stash_photo',
  'stashphoto': 'stash_photo',
  'stash-photo': 'stash_photo',
  'stash_added': 'stash_photo',
  'added_stash_photo': 'stash_photo',
  'handspun_photo': 'handspun_photo',
  'handspunphoto': 'handspun_photo',
  'handspun-photo': 'handspun_photo',
  // Ravelry activity_type_keys
  'added_handspun_photo': 'handspun_photo',
  'queued': 'queued',
  'queue': 'queued',
  'queued_pattern': 'queued',
  'favorite': 'favorite',
  'favourite': 'favorite',
  'favorited': 'favorite',
  'pattern_favorited': 'favorite',
  'added_favorite': 'favorite',
  'forum': 'forum',
  'comment': 'comment',
  'commented': 'comment',
};

function inferActivityTypeFromText(text: string): ActivityType | null {
  const lower = text.toLowerCase();
  if (lower.includes('favorit') || lower.includes('favourit'))
    return 'favorite';
  if (lower.includes('queued') || lower.includes('added to queue'))
    return 'queued';
  if (lower.includes('comment'))
    return 'comment';
  if (lower.includes('stash'))
    return 'stash_photo';
  if (lower.includes('handspun'))
    return 'handspun_photo';
  if (lower.includes('project photo') || lower.includes('added a photo'))
    return 'project_photo';
  return null;
}

/** Resolve activity type without defaulting unknowns to project_photo. */
export function resolveActivityType(raw: any): ActivityType {
  // Prefer Ravelry's documented `activity_type_key` (e.g. added-project-photo).
  const candidates = [
    raw?.activity_type_key,
    raw?.type,
    raw?.activity_type,
    raw?.kind,
    raw?.activity,
  ];
  for (const candidate of candidates) {
    if (typeof candidate !== 'string')
      continue;
    const key = candidate.trim().toLowerCase().replace(/\s+/g, '_');
    if (!key)
      continue;
    if (ACTIVITY_TYPE_ALIASES[key])
      return ACTIVITY_TYPE_ALIASES[key];
    if (ACTIVITY_TYPE_ALIASES[key.replace(/-/g, '_')])
      return ACTIVITY_TYPE_ALIASES[key.replace(/-/g, '_')];
  }

  const hint = [
    raw?.title,
    raw?.descriptive_title,
    raw?.description,
    raw?.body,
    raw?.comment,
  ]
    .filter(value => typeof value === 'string' && value.trim())
    .join(' ');
  const inferred = hint ? inferActivityTypeFromText(hint) : null;
  return inferred ?? 'unknown';
}

/**
 * Parse timestamps Ravelry returns, including
 * `2026/10/13 12:24:07 -0400` (not reliably parsed by Hermes Date).
 */
function parseActivityTimestamp(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed)
    return null;

  const native = new Date(trimmed).getTime();
  if (Number.isFinite(native))
    return native;

  const match = trimmed.match(
    /^(\d{4})\/(\d{2})\/(\d{2})\s+(\d{2}):(\d{2}):(\d{2})\s*([+-]\d{4})$/,
  );
  if (!match)
    return null;

  const [, year, month, day, hour, minute, second, offset] = match;
  const iso
    = `${year}-${month}-${day}T${hour}:${minute}:${second}`
      + `${offset.slice(0, 3)}:${offset.slice(3)}`;
  const time = new Date(iso).getTime();
  return Number.isFinite(time) ? time : null;
}

/** First non-empty timestamp; invalid/empty → empty string (UI hides NaNd). */
export function normalizeCreatedAt(raw: any): string {
  const candidates = [raw?.created_at, raw?.created, raw?.happened_at, raw?.timestamp];
  for (const candidate of candidates) {
    if (typeof candidate !== 'string' || !candidate.trim())
      continue;
    const time = parseActivityTimestamp(candidate);
    if (time != null)
      return new Date(time).toISOString();
  }
  return '';
}

export function normalizeFavoritesCount(raw: any): number | null {
  const value
    = raw?.favorites_count
      ?? raw?.favorite_count
      ?? raw?.favorites
      ?? null;
  if (typeof value === 'number' && Number.isFinite(value))
    return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}
