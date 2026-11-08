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
  'handspun_photo': 'handspun_photo',
  'handspunphoto': 'handspun_photo',
  'handspun-photo': 'handspun_photo',
  'queued': 'queued',
  'queue': 'queued',
  'favorite': 'favorite',
  'favourite': 'favorite',
  'favorited': 'favorite',
  'pattern_favorited': 'favorite',
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
  const candidates = [raw?.type, raw?.activity_type, raw?.kind, raw?.activity];
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

  const hint = [raw?.title, raw?.description, raw?.body, raw?.comment]
    .filter(value => typeof value === 'string' && value.trim())
    .join(' ');
  const inferred = hint ? inferActivityTypeFromText(hint) : null;
  return inferred ?? 'unknown';
}

/** First non-empty timestamp; invalid/empty → empty string (UI hides NaNd). */
export function normalizeCreatedAt(raw: any): string {
  const candidates = [raw?.created_at, raw?.created, raw?.happened_at, raw?.timestamp];
  for (const candidate of candidates) {
    if (typeof candidate !== 'string' || !candidate.trim())
      continue;
    const time = new Date(candidate).getTime();
    if (Number.isFinite(time))
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
