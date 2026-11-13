import type {
  PatternHighlight,
  RavelryPattern,
  RavelryPatternAuthor,
  RavelryPerson,
  RavelryPhoto,
} from './types';

/** Documented maximum for `days` on GET /patterns/highlights.json. */
export const HIGHLIGHT_DAYS = 90;

/**
 * Photo page size. Highlights itself is not paginated; each page is one
 * `GET /patterns.json?ids=` call.
 */
export const HIGHLIGHT_PAGE_SIZE = 12;

export function sliceHighlightPage(
  highlights: PatternHighlight[],
  page: number,
  pageSize = HIGHLIGHT_PAGE_SIZE,
) {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const start = (safePage - 1) * pageSize;
  return {
    highlights: highlights.slice(start, start + pageSize),
    page: safePage,
    pageSize,
    total: highlights.length,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function asString(value: unknown): string | null {
  const text = typeof value === 'string' ? value.trim() : '';
  if (!text)
    return null;
  // Ravelry sometimes returns protocol-relative CDN URLs.
  if (text.startsWith('//'))
    return `https:${text}`;
  return text;
}

function normalizePhoto(raw: unknown): RavelryPhoto | null {
  if (!isRecord(raw))
    return null;
  const medium2 = asString(raw.medium2_url);
  const medium = asString(raw.medium_url);
  const small = asString(raw.small_url) ?? asString(raw.small2_url);
  const square = asString(raw.square_url) ?? asString(raw.thumbnail_url);
  const shelved = asString(raw.shelved_url);
  if (!medium2 && !medium && !small && !square && !shelved)
    return null;
  return {
    id: Number(raw.id ?? 0) || 0,
    medium_url: medium ?? medium2,
    medium2_url: medium2 ?? medium,
    square_url: square,
    small_url: small,
    shelved_url: shelved,
  };
}

function collectPhotos(raw: Record<string, unknown>): RavelryPhoto[] {
  const sources: unknown[] = [];
  if (Array.isArray(raw.photos))
    sources.push(...raw.photos);
  else if (isRecord(raw.photos))
    sources.push(...Object.values(raw.photos));
  if (raw.first_photo)
    sources.push(raw.first_photo);
  if (raw.photo)
    sources.push(raw.photo);

  const photos: RavelryPhoto[] = [];
  const seen = new Set<string>();
  for (const source of sources) {
    const photo = normalizePhoto(source);
    if (!photo)
      continue;
    const key = photo.medium2_url
      ?? photo.medium_url
      ?? photo.square_url
      ?? photo.small_url
      ?? photo.shelved_url
      ?? '';
    if (!key || seen.has(key))
      continue;
    seen.add(key);
    photos.push(photo);
  }
  return photos;
}

function personFromUser(raw: unknown): RavelryPerson | null {
  if (!isRecord(raw))
    return null;
  const username = asString(raw.username);
  if (!username)
    return null;
  const small = asString(raw.small_photo_url) ?? asString(raw.tiny_photo_url);
  const large = asString(raw.photo_url) ?? asString(raw.large_photo_url);
  return {
    id: Number(raw.id ?? 0) || 0,
    username,
    small_photo_url: small ?? large,
    photo_url: large ?? small,
  };
}

function normalizeAuthor(raw: unknown): RavelryPatternAuthor | null {
  if (!isRecord(raw))
    return null;
  const users = Array.isArray(raw.users)
    ? raw.users.flatMap((user) => {
        const person = personFromUser(user);
        return person ? [person] : [];
      })
    : [];
  const name = asString(raw.name) ?? '';
  if (!name && raw.id == null && !users.length)
    return null;
  return {
    id: Number(raw.id ?? 0) || 0,
    name,
    permalink: asString(raw.permalink),
    users,
  };
}

export function normalizePattern(raw: unknown): RavelryPattern | null {
  if (!isRecord(raw))
    return null;
  const id = Number(raw.id);
  if (!Number.isFinite(id) || id <= 0)
    return null;
  const photos = collectPhotos(raw);
  const favorites = raw.favorites_count;
  return {
    id,
    name: asString(raw.name) ?? 'Pattern',
    permalink: asString(raw.permalink),
    favorites_count: typeof favorites === 'number' ? favorites : null,
    free: typeof raw.free === 'boolean' ? raw.free : null,
    notes_html: asString(raw.notes_html) ?? asString(raw.notes),
    photos,
    pattern_author: normalizeAuthor(raw.pattern_author),
  };
}

function collectEntries(root: unknown): unknown[] {
  if (Array.isArray(root))
    return root;
  if (!isRecord(root))
    return [];
  if ('pattern' in root || 'timeline_date' in root)
    return [root];
  return Object.values(root).flatMap(value =>
    Array.isArray(value) ? value : [value],
  );
}

function entryPatterns(entry: Record<string, unknown>): unknown[] {
  if (Array.isArray(entry.patterns) && entry.patterns.length)
    return entry.patterns;
  if (isRecord(entry.pattern))
    return [entry.pattern];
  if (entry.photos || entry.first_photo || entry.pattern_author || entry.permalink || entry.name)
    return [entry];
  return [];
}

function parseTimelineDate(value: string | null): number {
  if (!value)
    return 0;
  const match = value.match(/(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
  if (!match)
    return 0;
  const time = Date.UTC(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
  );
  return Number.isFinite(time) ? time : 0;
}

export function normalizeHighlights(data: unknown): PatternHighlight[] {
  const root = isRecord(data)
    ? (data.timeline_entries ?? data.timeline ?? [])
    : [];
  const highlights: PatternHighlight[] = [];

  collectEntries(root).forEach((entry, index) => {
    if (!isRecord(entry))
      return;
    const timelineDate = asString(entry.timeline_date);
    entryPatterns(entry).forEach((source, patternIndex) => {
      const pattern = normalizePattern(source);
      if (!pattern)
        return;
      highlights.push({
        id: `${pattern.id}:${timelineDate ?? index}:${patternIndex}`,
        timeline_date: timelineDate,
        pattern,
      });
    });
  });

  return highlights
    .map((item, index) => ({
      item,
      index,
      time: parseTimelineDate(item.timeline_date),
    }))
    .sort((a, b) => (b.time - a.time) || (a.index - b.index))
    .map(({ item }) => item);
}

function unwrapShowPattern(data: unknown, id: number): unknown {
  if (!isRecord(data))
    return data;
  const root = data.pattern ?? data.patterns ?? data;
  if (Array.isArray(root)) {
    return root.find(item => isRecord(item) && Number(item.id) === id)
      ?? root[0];
  }
  if (isRecord(root) && root.id == null) {
    const byId = root[String(id)];
    if (byId)
      return byId;
  }
  return root;
}

export function mergeHighlightPatterns(
  highlights: PatternHighlight[],
  fullPatterns: RavelryPattern[],
): PatternHighlight[] {
  const byId = new Map(fullPatterns.map(pattern => [pattern.id, pattern]));
  return highlights.map((item) => {
    const full = byId.get(item.pattern.id);
    if (!full)
      return item;
    return {
      ...item,
      pattern: {
        ...item.pattern,
        ...full,
        name: full.name || item.pattern.name,
        photos: full.photos.length ? full.photos : item.pattern.photos,
        pattern_author: full.pattern_author ?? item.pattern.pattern_author,
      },
    };
  });
}

/** `GET /patterns.json?ids=` returns a map of Pattern#full keyed by id. */
export function patternsFromListPayload(data: unknown): unknown[] {
  if (!isRecord(data))
    return [];
  const root = data.patterns;
  if (Array.isArray(root))
    return root;
  if (isRecord(root))
    return Object.values(root);
  return [];
}

/** `GET /patterns/{id}.json` documents the root as `patterns` (Pattern#full). */
export function patternFromShowPayload(
  data: unknown,
  id: number,
): RavelryPattern | null {
  return normalizePattern(unwrapShowPattern(data, id));
}
