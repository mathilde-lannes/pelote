import type {
  CurrentUserResponse,
  FriendActivity,
  FriendEntry,
  FriendsListResponse,
  PatternHighlight,
  PeopleSearchResponse,
  RavelryColorway,
  RavelryFavorite,
  RavelryFavoriteType,
  RavelryNeedleSize,
  RavelryPattern,
  RavelryPerson,
  RavelryPhoto,
  RavelryProject,
  RavelryProjectPack,
  RavelryYarn,
  RavelryYarnCompany,
} from './types';

import { client } from '@/lib/api';
import {
  normalizeCreatedAt,
  normalizeFavoritesCount,
  resolveActivityType,
} from './activity-utils';
import { normalizeFavorite } from './favorites-utils';
import {
  HIGHLIGHT_DAYS,
  mergeHighlightPatterns,
  normalizeHighlights,
  normalizePattern,
  patternFromShowPayload,
  patternsFromListPayload,
  sliceHighlightPage,
} from './highlights';
import { normalizePack } from './packs';

export { normalizeCreatedAt, resolveActivityType } from './activity-utils';
export { favoriteLookupKey, normalizeFavorite } from './favorites-utils';

function normalizePhoto(raw: any): RavelryPhoto | null {
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

/** Collect avatar URLs from the many shapes Ravelry uses on people/friends. */
function pickPersonPhotos(raw: any): {
  small_photo_url: string | null;
  photo_url: string | null;
} {
  const small
    = (typeof raw?.small_photo_url === 'string' && raw.small_photo_url)
      || (typeof raw?.tiny_photo_url === 'string' && raw.tiny_photo_url)
      || (typeof raw?.profile_image_url === 'string' && raw.profile_image_url)
      || null;
  const large
    = (typeof raw?.photo_url === 'string' && raw.photo_url)
      || (typeof raw?.large_photo_url === 'string' && raw.large_photo_url)
      || (typeof raw?.big_photo_url === 'string' && raw.big_photo_url)
      || null;
  return {
    small_photo_url: small ?? large,
    photo_url: large ?? small,
  };
}

function normalizePerson(raw: any): RavelryPerson {
  const photos = pickPersonPhotos(raw);
  return {
    id: raw?.id ?? 0,
    username: String(raw?.username ?? ''),
    first_name: raw?.first_name ?? null,
    small_photo_url: photos.small_photo_url,
    photo_url: photos.photo_url,
    about_me: raw?.about_me ?? null,
  };
}

function mergePersonPhotos(...sources: any[]): {
  small_photo_url: string | null;
  photo_url: string | null;
} {
  let small: string | null = null;
  let large: string | null = null;
  for (const source of sources) {
    const photos = pickPersonPhotos(source);
    small ??= photos.small_photo_url;
    large ??= photos.photo_url;
  }
  return {
    small_photo_url: small ?? large,
    photo_url: large ?? small,
  };
}

/** Pull a usable person out of a friendships/list row (shapes vary). */
function personFromFriendship(item: any): FriendEntry | null {
  const friendshipId = item?.id;
  if (friendshipId == null)
    return null;

  // friend may be an embedded user, a username string, or absent.
  if (typeof item?.friend === 'string') {
    const id = item.friend_id ?? item.friend_user_id;
    if (id == null)
      return null;
    const photos = mergePersonPhotos(item);
    return {
      ...normalizePerson({
        id,
        username: item.friend,
        first_name: item.first_name,
        ...photos,
      }),
      friendship_id: friendshipId,
    };
  }

  const raw = item?.friend ?? item?.user ?? item;
  const username
    = (typeof raw?.username === 'string' && raw.username)
      || (typeof item?.friend_username === 'string' && item.friend_username)
      || (typeof item?.username === 'string' && item.username)
      || null;
  const id = raw?.id ?? item?.friend_id ?? item?.friend_user_id ?? null;
  if (!username || id == null)
    return null;

  const photos = mergePersonPhotos(
    typeof raw === 'object' && raw ? raw : null,
    item,
  );

  return {
    ...normalizePerson({
      ...(typeof raw === 'object' && raw ? raw : {}),
      id,
      username,
      first_name: raw?.first_name ?? item?.first_name ?? null,
      ...photos,
    }),
    friendship_id: friendshipId,
  };
}

async function enrichFriendPhotos(
  friends: FriendEntry[],
): Promise<FriendEntry[]> {
  const missing = friends.filter(
    friend => !friend.small_photo_url && !friend.photo_url,
  );
  if (!missing.length)
    return friends;

  const byUsername = new Map<string, RavelryPerson>();
  await Promise.all(
    missing.map(async (friend) => {
      try {
        const person = await fetchPerson(friend.username);
        byUsername.set(friend.username.toLowerCase(), person);
      }
      catch {
        // Best-effort: keep initial avatar if people/{username} fails.
      }
    }),
  );

  return friends.map((friend) => {
    const enriched = byUsername.get(friend.username.toLowerCase());
    if (!enriched)
      return friend;
    return {
      ...friend,
      small_photo_url:
        friend.small_photo_url
        ?? enriched.small_photo_url
        ?? enriched.photo_url
        ?? null,
      photo_url:
        friend.photo_url
        ?? enriched.photo_url
        ?? enriched.small_photo_url
        ?? null,
      first_name: friend.first_name ?? enriched.first_name ?? null,
      about_me: friend.about_me ?? enriched.about_me ?? null,
    };
  });
}

function normalizeProjectNeedle(raw: any): RavelryNeedleSize | null {
  const name = typeof raw?.name === 'string' ? raw.name.trim() : '';
  if (!name)
    return null;
  return {
    id: Number(raw?.id ?? 0) || 0,
    name,
    metric: typeof raw?.metric === 'number' ? raw.metric : null,
    us: typeof raw?.us === 'string' ? raw.us : null,
    crochet: typeof raw?.crochet === 'boolean' ? raw.crochet : null,
    knitting: typeof raw?.knitting === 'boolean' ? raw.knitting : null,
  };
}

function normalizeProject(raw: any): RavelryProject {
  const userRaw = raw.user ?? raw.person ?? null;
  const patternIdRaw = Number(raw.pattern_id ?? raw.pattern?.id);
  const patternId
    = Number.isFinite(patternIdRaw) && patternIdRaw > 0 ? patternIdRaw : null;
  const nestedPattern = raw.pattern != null && patternId != null
    ? normalizePattern({ ...raw.pattern, id: patternId })
    : null;
  const needleSource
    = raw.needle_sizes
      ?? raw.project_needle_sizes
      ?? raw.pattern_needle_sizes
      ?? [];
  const needles = (Array.isArray(needleSource) ? needleSource : [])
    .map(normalizeProjectNeedle)
    .filter((entry: RavelryNeedleSize | null): entry is RavelryNeedleSize =>
      entry != null,
    );
  const packs = (Array.isArray(raw.packs) ? raw.packs : [])
    .map(normalizePack)
    .filter((entry: RavelryProjectPack | null): entry is RavelryProjectPack =>
      entry != null,
    );
  const size
    = (typeof raw.size === 'string' && raw.size.trim())
      || (typeof raw.size_name === 'string' && raw.size_name.trim())
      || null;
  const statusName
    = raw.status_name
      ?? (typeof raw.status?.name === 'string' ? raw.status.name : null)
      ?? null;

  return {
    id: raw.id,
    name: raw.name,
    permalink: raw.permalink,
    pattern_name: raw.pattern_name ?? nestedPattern?.name ?? raw.pattern?.name ?? null,
    pattern_id: patternId,
    pattern_author: nestedPattern?.pattern_author ?? null,
    status_name: statusName,
    progress: raw.progress ?? null,
    notes_html: raw.notes_html ?? raw.notes ?? null,
    started: raw.started ?? null,
    completed: raw.completed ?? null,
    // Prefer ISO from activity parser; keep raw string if format is unusual.
    created_at: normalizeCreatedAt(raw) || raw.created_at || null,
    updated_at: normalizeCreatedAt({ created_at: raw.updated_at }) || raw.updated_at || null,
    user_id: raw.user_id ?? userRaw?.id,
    user: userRaw ? normalizePerson(userRaw) : null,
    craft_name: raw.craft_name ?? raw.craft?.name ?? null,
    favorites_count: normalizeFavoritesCount(raw),
    first_photo: normalizePhoto(raw.first_photo),
    photos: Array.isArray(raw.photos)
      ? raw.photos.map(normalizePhoto).filter(Boolean) as RavelryPhoto[]
      : undefined,
    size,
    made_for:
      typeof raw.made_for === 'string' && raw.made_for.trim()
        ? raw.made_for.trim()
        : null,
    gauge_description:
      typeof raw.gauge_description === 'string' && raw.gauge_description.trim()
        ? raw.gauge_description.trim()
        : null,
    gauge: typeof raw.gauge === 'number' ? raw.gauge : null,
    gauge_divisor: typeof raw.gauge_divisor === 'number' ? raw.gauge_divisor : null,
    row_gauge: typeof raw.row_gauge === 'number' ? raw.row_gauge : null,
    gauge_pattern:
      typeof raw.gauge_pattern === 'string' && raw.gauge_pattern.trim()
        ? raw.gauge_pattern.trim()
        : null,
    needle_sizes: needles.length ? needles : undefined,
    packs: packs.length ? packs : undefined,
  };
}

function normalizeActivity(raw: any, index: number): FriendActivity {
  // Ravelry often nests type-specific fields under `data`.
  const payload
    = raw?.data && typeof raw.data === 'object' && !Array.isArray(raw.data)
      ? raw.data
      : {};
  const person = normalizePerson(
    raw.user ?? raw.person ?? payload.user ?? payload.person ?? {},
  );
  const projectRaw = raw.project ?? payload.project ?? null;
  const project = projectRaw ? normalizeProject(projectRaw) : null;
  const photo = normalizePhoto(
    raw.photo
    ?? raw.project_photo
    ?? payload.photo
    ?? payload.project_photo
    ?? project?.first_photo,
  );
  const createdAt = normalizeCreatedAt(raw);
  const patternFavorites = normalizeFavoritesCount(
    raw.pattern ?? payload.pattern ?? raw,
  );

  if (
    project
    && (project.favorites_count == null)
    && patternFavorites != null
  ) {
    project.favorites_count = patternFavorites;
  }

  return {
    id: String(raw.id ?? `${person.username}-${index}-${createdAt || index}`),
    type: resolveActivityType({ ...payload, ...raw }),
    created_at: createdAt,
    title:
      raw.title
      ?? raw.descriptive_title
      ?? raw.description
      ?? payload.title
      ?? null,
    body: raw.body ?? raw.comment ?? payload.body ?? null,
    person,
    project,
    photo,
    pattern_name:
      raw.pattern_name
      ?? project?.pattern_name
      ?? raw.pattern?.name
      ?? payload.pattern_name
      ?? payload.pattern?.name
      ?? null,
  };
}

export async function fetchCurrentUser(): Promise<RavelryPerson> {
  const { data } = await client.get<CurrentUserResponse>('current_user.json');
  return normalizePerson(data.user);
}

export async function fetchPerson(username: string): Promise<RavelryPerson> {
  const { data } = await client.get(
    `people/${encodeURIComponent(username)}.json`,
  );
  return normalizePerson(data.user ?? data);
}

export type ProjectsListPage = {
  projects: RavelryProject[];
  page: number;
  pageSize: number;
  /** From Ravelry `paginator.page_count` / `last_page`. */
  pageCount: number;
  /** From Ravelry `paginator.results` when present. */
  totalResults: number | null;
};

export async function fetchProjectsList(
  username: string,
  options?: { page?: number; pageSize?: number },
): Promise<ProjectsListPage> {
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 24;
  // Documented: GET projects/{username}/list.json (same family as projects/{user}/{id}.json)
  const { data } = await client.get(
    `projects/${encodeURIComponent(username)}/list.json`,
    { params: { page, page_size: pageSize } },
  );
  const list = data.projects ?? [];
  const projects = (Array.isArray(list) ? list : []).map(normalizeProject);
  const paginator = data.paginator ?? {};
  const pageCountRaw = paginator.page_count ?? paginator.last_page ?? 1;
  const pageCount = Number(pageCountRaw);
  const totalRaw = paginator.results;
  const totalResults
    = typeof totalRaw === 'number' && Number.isFinite(totalRaw)
      ? totalRaw
      : null;

  return {
    projects,
    page,
    pageSize,
    pageCount: Number.isFinite(pageCount) && pageCount > 0 ? pageCount : 1,
    totalResults,
  };
}

export type DesignerPatternsPage = {
  patterns: RavelryPattern[];
  page: number;
  pageSize: number;
  pageCount: number;
  totalResults: number | null;
};

type DesignerSearchHit = {
  id?: number;
  permalink?: string;
  name?: string;
  users?: { username?: string }[];
};

function designerSlugKey(value: string): string {
  return value.trim().toLowerCase().replace(/[\s_]+/g, '-');
}

function designerMatchesQuery(designer: DesignerSearchHit, query: string): boolean {
  const needle = query.trim().toLowerCase();
  const slug = designerSlugKey(query);
  if (!needle)
    return false;
  const permalink = designer.permalink?.trim().toLowerCase() ?? '';
  const name = designer.name?.trim().toLowerCase() ?? '';
  const users = designer.users ?? [];
  return permalink === needle
    || permalink === slug
    || designerSlugKey(permalink) === slug
    || name === needle
    || designerSlugKey(name) === slug
    || users.some((user) => {
      const username = user.username?.trim().toLowerCase() ?? '';
      return username === needle || designerSlugKey(username) === slug;
    });
}

/** Documented: GET designers/{id}.json → designer. */
export async function fetchDesigner(id: number): Promise<DesignerSearchHit | null> {
  if (!Number.isFinite(id) || id <= 0)
    return null;
  try {
    const { data } = await client.get(`designers/${id}.json`);
    const designer = data.designer ?? data;
    return designer && typeof designer === 'object' ? designer : null;
  }
  catch {
    return null;
  }
}

/**
 * Resolve the designer permalink used by pattern search (`designer=` filter on
 * https://www.ravelry.com/patterns/search).
 */
export async function resolveDesignerPermalink(
  usernameOrPermalink: string,
): Promise<string> {
  const q = usernameOrPermalink.trim();
  if (!q)
    return q;
  try {
    const { data } = await client.get('designers/search.json', {
      params: { query: q },
    });
    const designers: DesignerSearchHit[] = Array.isArray(data.designers)
      ? data.designers
      : [];
    const match = designers.find(designer => designerMatchesQuery(designer, q));
    const permalink = typeof match?.permalink === 'string'
      ? match.permalink.trim()
      : '';
    return permalink || q;
  }
  catch {
    return q;
  }
}

/**
 * Prefer an explicit designer permalink / id from a pattern card, then fall back
 * to resolving from the profile username. Brand accounts (e.g. LE KNIT) often
 * use a different permalink than the linked login username.
 */
export async function resolveDesignerPermalinkForProfile(options: {
  username: string;
  designerPermalink?: string | null;
  designerId?: number | null;
}): Promise<string> {
  const explicit = options.designerPermalink?.trim();
  if (explicit)
    return explicit;

  const designerId = options.designerId;
  if (typeof designerId === 'number' && designerId > 0) {
    const designer = await fetchDesigner(designerId);
    const permalink = designer?.permalink?.trim();
    if (permalink)
      return permalink;
  }

  return resolveDesignerPermalink(options.username);
}

function patternsSearchPageFromPayload(
  data: { patterns?: unknown; paginator?: Record<string, unknown> },
  page: number,
  pageSize: number,
): DesignerPatternsPage {
  const list = data.patterns ?? [];
  const patterns = (Array.isArray(list) ? list : [])
    .map((raw: unknown) => normalizePattern(raw))
    .filter((pattern: RavelryPattern | null): pattern is RavelryPattern =>
      Boolean(pattern),
    );
  const paginator = data.paginator ?? {};
  const pageCountRaw = paginator.page_count ?? paginator.last_page ?? 1;
  const pageCount = Number(pageCountRaw);
  const totalRaw = paginator.results;
  const totalResults
    = typeof totalRaw === 'number' && Number.isFinite(totalRaw)
      ? totalRaw
      : null;

  return {
    patterns,
    page,
    pageSize,
    pageCount: Number.isFinite(pageCount) && pageCount > 0 ? pageCount : 1,
    totalResults,
  };
}

/**
 * Patterns by designer via site search filter `designer`, same as
 * https://www.ravelry.com/patterns/search?designer= — documented filter family
 * for `GET /patterns/search.json`.
 */
export async function fetchPatternsByDesigner(
  designer: string,
  options?: { page?: number; pageSize?: number; permalink?: string },
): Promise<DesignerPatternsPage> {
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 48;
  const permalink = (options?.permalink ?? designer).trim() || designer;
  const { data } = await client.get('patterns/search.json', {
    params: {
      designer: permalink,
      page,
      page_size: pageSize,
    },
  });
  return patternsSearchPageFromPayload(data, page, pageSize);
}

function mergeSearchPatternsWithFull(
  listPatterns: RavelryPattern[],
  fullPatterns: RavelryPattern[],
): RavelryPattern[] {
  const byId = new Map(fullPatterns.map(pattern => [pattern.id, pattern]));
  return listPatterns.map((pattern) => {
    const full = byId.get(pattern.id);
    if (!full)
      return pattern;
    return {
      ...pattern,
      ...full,
      name: full.name || pattern.name,
      photos: full.photos.length ? full.photos : pattern.photos,
      pattern_author: full.pattern_author ?? pattern.pattern_author,
    };
  });
}

export type PatternSearchFilterParams = Record<string, string>;

/**
 * Hot-right-now style ranking via site search sort `recently-popular`
 * (same as https://www.ravelry.com/patterns/search#sort=recently-popular).
 * Search rows are Pattern#list (thin stats) — merge Pattern#full via patterns.json?ids=.
 * Optional `filters` are the same query-string facets as the site search form.
 */
export async function fetchRecentlyPopularPatterns(
  options?: {
    page?: number;
    pageSize?: number;
    filters?: PatternSearchFilterParams;
  },
): Promise<DesignerPatternsPage> {
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 48;
  const { data } = await client.get('patterns/search.json', {
    params: {
      ...(options?.filters ?? {}),
      sort: 'recently-popular',
      page,
      page_size: pageSize,
    },
  });
  const listed = patternsSearchPageFromPayload(data, page, pageSize);
  const ids = listed.patterns.map(pattern => pattern.id);
  const full = ids.length ? await fetchFullPatterns(ids) : [];
  return {
    ...listed,
    patterns: mergeSearchPatternsWithFull(listed.patterns, full),
  };
}

/**
 * Free-text pattern search via `GET /patterns/search.json?query=`
 * (same family as https://www.ravelry.com/patterns/search). Ravelry ranks
 * best matches — callers should not require exact name equality.
 * Optional `filters` map to documented site-search facets (craft, weight, …).
 */
export async function fetchPatternsByQuery(
  query: string,
  options?: {
    page?: number;
    pageSize?: number;
    enrich?: boolean;
    filters?: PatternSearchFilterParams;
  },
): Promise<DesignerPatternsPage> {
  const q = query.trim();
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 48;
  if (!q) {
    return {
      patterns: [],
      page,
      pageSize,
      pageCount: 1,
      totalResults: 0,
    };
  }

  const { data } = await client.get('patterns/search.json', {
    params: {
      ...(options?.filters ?? {}),
      query: q,
      page,
      page_size: pageSize,
    },
  });
  const listed = patternsSearchPageFromPayload(data, page, pageSize);
  if (options?.enrich === false)
    return listed;

  const ids = listed.patterns.map(pattern => pattern.id);
  const full = ids.length ? await fetchFullPatterns(ids) : [];
  return {
    ...listed,
    patterns: mergeSearchPatternsWithFull(listed.patterns, full),
  };
}

/**
 * Try several designer= candidates (permalink, username, …) until one returns
 * patterns. Brand designers often need the permalink, not the login username.
 */
export async function fetchPatternsByDesignerCandidates(
  candidates: string[],
  options?: { page?: number; pageSize?: number },
): Promise<DesignerPatternsPage & { permalinkUsed: string }> {
  const unique = [...new Set(
    candidates.map(value => value.trim()).filter(Boolean),
  )];
  let last: DesignerPatternsPage = {
    patterns: [],
    page: options?.page ?? 1,
    pageSize: options?.pageSize ?? 48,
    pageCount: 1,
    totalResults: 0,
  };
  let permalinkUsed = unique[0] ?? '';

  for (const candidate of unique) {
    last = await fetchPatternsByDesigner(candidate, {
      ...options,
      permalink: candidate,
    });
    permalinkUsed = candidate;
    if (last.patterns.length > 0 || (last.totalResults ?? 0) > 0)
      return { ...last, permalinkUsed };
  }

  return { ...last, permalinkUsed };
}

export type FriendsActivityPage = {
  activities: FriendActivity[];
  page: number;
  pageSize: number;
};

export async function fetchFriendsActivity(
  username: string,
  options?: {
    activityTypeKeys?: string[];
    page?: number;
    pageSize?: number;
  },
): Promise<FriendsActivityPage> {
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 50;
  // Documented response root is `activity` (singular).
  const { data } = await client.get(
    `people/${encodeURIComponent(username)}/friends/activity.json`,
    {
      params: {
        page,
        page_size: pageSize,
        ...(options?.activityTypeKeys?.length
          ? { activity_type_keys: options.activityTypeKeys.join(' ') }
          : {}),
      },
    },
  );

  const list
    = data.activity
      ?? data.activities
      ?? data.friend_activities
      ?? [];
  return {
    activities: (Array.isArray(list) ? list : []).map(normalizeActivity),
    page,
    pageSize,
  };
}

/** @deprecated Prefer `RavelryYarn` from types. */
export type RavelryYarnSummary = RavelryYarn;

function yarnsFromListPayload(data: unknown): unknown[] {
  if (!data || typeof data !== 'object')
    return [];
  const root = (data as { yarns?: unknown }).yarns;
  if (Array.isArray(root))
    return root;
  if (root && typeof root === 'object')
    return Object.values(root);
  return [];
}

function normalizeYarnCompany(raw: any): RavelryYarnCompany | null {
  const id = Number(raw?.id);
  if (!Number.isFinite(id) || id <= 0)
    return null;
  const name
    = typeof raw?.name === 'string' && raw.name.trim()
      ? raw.name.trim()
      : null;
  if (!name)
    return null;
  const yarnCountRaw = Number(raw?.yarn_count ?? raw?.yarns_count);
  const logo
    = (typeof raw?.logo_url === 'string' && raw.logo_url.trim())
      || (typeof raw?.small_logo_url === 'string' && raw.small_logo_url.trim())
      || (typeof raw?.photo_url === 'string' && raw.photo_url.trim())
      || null;
  return {
    id,
    name,
    permalink:
      typeof raw?.permalink === 'string' && raw.permalink.trim()
        ? raw.permalink.trim()
        : null,
    yarn_count:
      Number.isFinite(yarnCountRaw) && yarnCountRaw >= 0
        ? yarnCountRaw
        : null,
    logo_url: logo,
  };
}

function normalizeYarn(raw: any): RavelryYarn | null {
  const id = Number(raw?.id);
  if (!Number.isFinite(id) || id <= 0)
    return null;
  const name
    = typeof raw?.name === 'string' && raw.name.trim()
      ? raw.name.trim()
      : null;
  if (!name)
    return null;
  const company = normalizeYarnCompany(raw?.yarn_company);
  const companyName
    = (typeof raw?.yarn_company_name === 'string' && raw.yarn_company_name.trim())
      || company?.name
      || null;
  const companyIdRaw = Number(raw?.yarn_company_id ?? company?.id);
  const companyId
    = Number.isFinite(companyIdRaw) && companyIdRaw > 0 ? companyIdRaw : null;
  const photos = Array.isArray(raw?.photos)
    ? raw.photos.map(normalizePhoto).filter(Boolean) as RavelryPhoto[]
    : [];
  const photo
    = normalizePhoto(raw?.first_photo)
      ?? photos[0]
      ?? null;
  const projectsRaw = Number(raw?.projects_count);
  const weight
    = (typeof raw?.yarn_weight?.name === 'string' && raw.yarn_weight.name.trim())
      || (typeof raw?.yarn_weight_name === 'string' && raw.yarn_weight_name.trim())
      || null;
  const fiberParts: string[] = [];
  if (Array.isArray(raw?.yarn_fibers)) {
    for (const fiber of raw.yarn_fibers) {
      const fiberName
        = (typeof fiber?.fiber_type?.name === 'string' && fiber.fiber_type.name.trim())
          || (typeof fiber?.name === 'string' && fiber.name.trim())
          || null;
      if (!fiberName)
        continue;
      const pct = Number(fiber?.percentage);
      fiberParts.push(
        Number.isFinite(pct) && pct > 0
          ? `${pct}% ${fiberName}`
          : fiberName,
      );
    }
  }
  const gramsRaw = Number(raw?.grams);
  const yardageRaw = Number(raw?.yardage);
  const wpiRaw = Number(raw?.wpi);
  const minGaugeRaw = Number(raw?.min_gauge);
  const maxGaugeRaw = Number(raw?.max_gauge);
  const gaugeDivisorRaw = Number(raw?.gauge_divisor);
  return {
    id,
    name,
    permalink:
      typeof raw?.permalink === 'string' && raw.permalink.trim()
        ? raw.permalink.trim()
        : null,
    yarn_company_name: companyName,
    yarn_company_id: companyId,
    yarn_company_permalink: company?.permalink ?? null,
    yarn_company: company,
    projects_count:
      Number.isFinite(projectsRaw) && projectsRaw >= 0 ? projectsRaw : null,
    photo,
    photos: photos.length ? photos : undefined,
    yarn_weight_name: weight,
    fiber_description: fiberParts.length ? fiberParts.join(', ') : null,
    grams: Number.isFinite(gramsRaw) && gramsRaw > 0 ? gramsRaw : null,
    yardage: Number.isFinite(yardageRaw) && yardageRaw > 0 ? yardageRaw : null,
    wpi: Number.isFinite(wpiRaw) && wpiRaw > 0 ? wpiRaw : null,
    min_gauge:
      Number.isFinite(minGaugeRaw) && minGaugeRaw > 0 ? minGaugeRaw : null,
    max_gauge:
      Number.isFinite(maxGaugeRaw) && maxGaugeRaw > 0 ? maxGaugeRaw : null,
    gauge_divisor:
      Number.isFinite(gaugeDivisorRaw) && gaugeDivisorRaw > 0
        ? gaugeDivisorRaw
        : null,
    machine_washable:
      typeof raw?.machine_washable === 'boolean'
        ? raw.machine_washable
        : null,
    discontinued:
      typeof raw?.discontinued === 'boolean' ? raw.discontinued : null,
    texture:
      typeof raw?.texture === 'string' && raw.texture.trim()
        ? raw.texture.trim()
        : null,
    notes_html:
      (typeof raw?.notes_html === 'string' && raw.notes_html.trim())
      || (typeof raw?.notes === 'string' && raw.notes.trim())
      || null,
  };
}

/** Documented: `GET yarns.json?ids=` → Yarn#full map (same id shape as patterns.json). */
export async function fetchYarnsByIds(ids: number[]): Promise<RavelryYarn[]> {
  const unique = [...new Set(ids.filter(id => Number.isFinite(id) && id > 0))];
  if (!unique.length)
    return [];
  const chunkSize = 50;
  const chunks: number[][] = [];
  for (let index = 0; index < unique.length; index += chunkSize)
    chunks.push(unique.slice(index, index + chunkSize));

  const pages = await Promise.all(chunks.map(async (chunk) => {
    const { data } = await client.get(`yarns.json?ids=${chunk.join('+')}`);
    return yarnsFromListPayload(data).flatMap((raw) => {
      const yarn = normalizeYarn(raw);
      return yarn ? [yarn] : [];
    });
  }));
  return pages.flat();
}

/** Documented: `GET yarns/{id}.json` → Yarn#full (fallback yarns.json?ids=). */
export async function fetchYarn(id: number): Promise<RavelryYarn> {
  if (!Number.isFinite(id) || id <= 0)
    throw new Error('Invalid yarn id');
  try {
    const { data } = await client.get(`yarns/${id}.json`);
    const yarn = normalizeYarn(data.yarn ?? data);
    if (yarn)
      return yarn;
  }
  catch {
    // Fall through to multi-get.
  }
  const [yarn] = await fetchYarnsByIds([id]);
  if (!yarn)
    throw new Error('Yarn missing from response');
  return yarn;
}

function photoFromUrl(url: string | null | undefined, id = 0): RavelryPhoto | null {
  if (typeof url !== 'string' || !url.trim())
    return null;
  const trimmed = url.trim();
  return {
    id,
    medium_url: trimmed,
    medium2_url: trimmed,
    square_url: trimmed,
    small_url: trimmed,
    small2_url: trimmed,
    thumbnail_url: trimmed,
  };
}

function normalizeColorway(raw: any): RavelryColorway | null {
  const id = Number(raw?.id);
  if (!Number.isFinite(id) || id <= 0)
    return null;
  const name
    = typeof raw?.name === 'string' && raw.name.trim()
      ? raw.name.trim()
      : null;
  if (!name)
    return null;
  // Colorway#full only exposes a single representative image (`photo_url`).
  // Ignore embed `photos[]` — it is empty or unreliable and is not colorway-safe.
  const photo
    = normalizePhoto(raw?.first_photo)
      ?? normalizePhoto(raw?.photo)
      ?? photoFromUrl(
        typeof raw?.photo_url === 'string' ? raw.photo_url : null,
      );
  const yarnIdRaw = Number(raw?.yarn_id);
  const projectsRaw = Number(raw?.projects_count);
  const stashesRaw = Number(raw?.stashes_count);
  const usageRaw = Number(raw?.usage_count);
  return {
    id,
    name,
    code:
      typeof raw?.code === 'string' && raw.code.trim()
        ? raw.code.trim()
        : null,
    yarn_id:
      Number.isFinite(yarnIdRaw) && yarnIdRaw > 0 ? yarnIdRaw : null,
    current_status:
      typeof raw?.current_status === 'string' && raw.current_status.trim()
        ? raw.current_status.trim()
        : null,
    projects_count:
      Number.isFinite(projectsRaw) && projectsRaw >= 0 ? projectsRaw : null,
    stashes_count:
      Number.isFinite(stashesRaw) && stashesRaw >= 0 ? stashesRaw : null,
    usage_count:
      Number.isFinite(usageRaw) && usageRaw >= 0 ? usageRaw : null,
    photo,
    photos: photo ? [photo] : undefined,
  };
}

/**
 * Colorways for a yarn — `GET yarns/{id}.json?include=colorways`
 * (top-level `colorways[]`; embed photos are usually empty).
 */
export async function fetchYarnColorways(
  yarnId: number,
): Promise<RavelryColorway[]> {
  if (!Number.isFinite(yarnId) || yarnId <= 0)
    throw new Error('Invalid yarn id');
  const { data } = await client.get(`yarns/${yarnId}.json`, {
    params: { include: 'colorways' },
  });
  const list = Array.isArray(data.colorways) ? data.colorways : [];
  const colorways: RavelryColorway[] = [];
  for (const raw of list) {
    const colorway = normalizeColorway(raw);
    if (colorway)
      colorways.push(colorway);
  }
  colorways.sort((a, b) => {
    const usageDiff = (b.usage_count ?? 0) - (a.usage_count ?? 0);
    if (usageDiff !== 0)
      return usageDiff;
    return a.name.localeCompare(b.name);
  });
  return colorways;
}

/** One representative photo per stash entry (people’s stash shot of the skein). */
function primaryPhotoFromStashEntry(raw: any): RavelryPhoto | null {
  return (
    normalizePhoto(raw?.first_photo)
      ?? (Array.isArray(raw?.photos) ? normalizePhoto(raw.photos[0]) : null)
  );
}

function stashEntryColorwayId(raw: any): number | null {
  const id = Number(
    raw?.colorway_id
    ?? raw?.colorway?.id
    ?? raw?.pack?.colorway_id,
  );
  return Number.isFinite(id) && id > 0 ? id : null;
}

function stashEntryColorwayName(raw: any): string | null {
  const name
    = (typeof raw?.colorway_name === 'string' && raw.colorway_name.trim())
      || (typeof raw?.colorway === 'string' && raw.colorway.trim())
      || (typeof raw?.colorway?.name === 'string' && raw.colorway.name.trim())
      || null;
  return name || null;
}

function stashEntryYarnId(raw: any): number | null {
  const id = Number(
    raw?.yarn_id
    ?? raw?.yarn?.id
    ?? raw?.pack?.yarn_id,
  );
  return Number.isFinite(id) && id > 0 ? id : null;
}

/**
 * Keep only stash rows that clearly belong to this yarn + colorway.
 * Require yarn id; require colorway id and/or exact name with no conflicts.
 */
function stashMatchesColorway(
  raw: any,
  target: {
    yarnId: number;
    colorwayId: number | null;
    colorwayName: string | null;
  },
): boolean {
  const { yarnId, colorwayId, colorwayName } = target;
  const entryYarnId = stashEntryYarnId(raw);
  // Drop hits we cannot pin to this catalog yarn (avoids other "Nox" yarns).
  if (entryYarnId == null || entryYarnId !== yarnId)
    return false;

  const entryId = stashEntryColorwayId(raw);
  const entryName = stashEntryColorwayName(raw);
  if (entryId == null && !entryName)
    return false;

  if (entryId != null && colorwayId != null && entryId !== colorwayId)
    return false;

  if (
    entryName
    && colorwayName
    && entryName.toLowerCase() !== colorwayName.toLowerCase()
  ) {
    return false;
  }

  if (entryId != null && colorwayId != null && entryId === colorwayId)
    return true;

  return Boolean(
    entryName
    && colorwayName
    && entryName.toLowerCase() === colorwayName.toLowerCase(),
  );
}

/**
 * Up to `limit` people-stash photos for one colorway (one photo per stash entry).
 * `GET stash/search.json` + strict yarn/colorway client filter.
 */
export async function fetchColorwayStashPhotos(
  yarnId: number,
  options: {
    colorwayId?: number | null;
    colorwayName?: string | null;
    limit?: number;
  },
): Promise<RavelryPhoto[]> {
  if (!Number.isFinite(yarnId) || yarnId <= 0)
    return [];
  const limit = Math.min(Math.max(options.limit ?? 10, 1), 10);
  const colorwayId
    = options.colorwayId != null && Number.isFinite(options.colorwayId)
      ? options.colorwayId
      : null;
  const colorwayName = options.colorwayName?.trim() || null;
  if (colorwayId == null && !colorwayName)
    return [];

  const { data } = await client.get('stash/search.json', {
    params: {
      yarn_id: yarnId,
      ...(colorwayId != null ? { colorway_id: colorwayId } : {}),
      ...(colorwayName
        ? { colorway_name: colorwayName, colorway: colorwayName }
        : {}),
      page: 1,
      page_size: 50,
    },
  });
  const list = Array.isArray(data.stashes)
    ? data.stashes
    : Array.isArray(data.stash)
      ? data.stash
      : [];

  const photos: RavelryPhoto[] = [];
  for (const entry of list) {
    if (photos.length >= limit)
      break;
    if (!stashMatchesColorway(entry, { yarnId, colorwayId, colorwayName }))
      continue;
    const photo = primaryPhotoFromStashEntry(entry);
    if (!photo)
      continue;
    const key
      = photo.id > 0
        ? `id:${photo.id}`
        : `url:${photo.medium2_url ?? photo.medium_url ?? photo.square_url ?? ''}`;
    if (photos.some((existing) => {
      const existingKey
        = existing.id > 0
          ? `id:${existing.id}`
          : `url:${existing.medium2_url ?? existing.medium_url ?? existing.square_url ?? ''}`;
      return existingKey === key;
    })) {
      continue;
    }
    photos.push(photo);
  }
  return photos;
}

/**
 * Projects that list this catalog yarn.
 *
 * Use `GET projects/search.json` with the site `yarn` facet (permalink/name),
 * same family as pattern search’s `pattern=` filter. Numeric `yarn_id` is
 * silently ignored by the API and returns the unfiltered project corpus.
 */
export async function fetchYarnProjects(
  yarn: { id: number; permalink?: string | null; name?: string | null },
  options?: { page?: number; pageSize?: number },
): Promise<ProjectsListPage> {
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 48;
  const yarnKey
    = yarn.permalink?.trim()
      || yarn.name?.trim()
      || String(yarn.id);

  const { data } = await client.get('projects/search.json', {
    params: {
      page,
      page_size: pageSize,
      // Same filter family as the website project search “yarn” facet.
      yarn: yarnKey,
    },
  });
  return projectsPageFromPayload(data, page, pageSize);
}

/**
 * Documented: `GET yarn_companies/search.json` → `yarn_companies[]`.
 *
 * Resolve a dyer/brand by name (and optional id). `YarnCompanies#show` is
 * unreliable for product use — search is the supported lookup.
 */
export async function fetchYarnCompany(options: {
  query: string;
  id?: number | null;
}): Promise<RavelryYarnCompany> {
  const q = options.query.trim();
  if (!q)
    throw new Error('Invalid yarn company query');

  const { data } = await client.get('yarn_companies/search.json', {
    params: {
      query: q,
      page_size: 24,
      sort: 'best',
    },
  });
  const list: unknown[] = Array.isArray(data.yarn_companies)
    ? data.yarn_companies
    : Array.isArray(data.companies)
      ? data.companies
      : [];
  const companies: RavelryYarnCompany[] = [];
  for (const raw of list) {
    const company = normalizeYarnCompany(raw);
    if (company)
      companies.push(company);
  }

  const needle = q.toLowerCase();
  const id = options.id;
  const match
    = (typeof id === 'number' && id > 0
      ? companies.find(company => company.id === id)
      : undefined)
      ?? companies.find(company => company.name.toLowerCase() === needle)
      ?? companies.find(
        company => company.permalink?.toLowerCase() === needle,
      )
      ?? companies.find(company =>
        company.name.toLowerCase().includes(needle))
      ?? companies[0];

  if (!match)
    throw new Error('Yarn company missing from response');
  return match;
}

export type YarnSearchPage = {
  yarns: RavelryYarn[];
  page: number;
  pageSize: number;
  pageCount: number;
  totalResults: number | null;
};

function yarnBelongsToCompany(
  yarn: RavelryYarn,
  company: { id: number; name?: string | null; permalink?: string | null },
): boolean {
  if (company.id > 0 && yarn.yarn_company_id != null)
    return yarn.yarn_company_id === company.id;

  const wantName = company.name?.trim().toLowerCase() || '';
  const gotName = yarn.yarn_company_name?.trim().toLowerCase() || '';
  if (wantName && gotName)
    return gotName === wantName;

  const wantPermalink = company.permalink?.trim().toLowerCase() || '';
  const gotPermalink = yarn.yarn_company_permalink?.trim().toLowerCase() || '';
  if (wantPermalink && gotPermalink)
    return gotPermalink === wantPermalink;

  // Search already scoped by brand/query — keep rows that omit company fields.
  return true;
}

function yarnSearchPageFromPayload(
  data: any,
  options: {
    page: number;
    pageSize: number;
    company: { id: number; name?: string | null; permalink?: string | null };
  },
): YarnSearchPage {
  const list = Array.isArray(data.yarns) ? data.yarns : [];
  const yarns = list
    .map(normalizeYarn)
    .filter((entry: RavelryYarn | null): entry is RavelryYarn =>
      entry != null && yarnBelongsToCompany(entry, options.company));
  const paginator = data.paginator ?? {};
  const pageCountRaw = paginator.page_count ?? paginator.last_page ?? 1;
  const pageCount = Number(pageCountRaw);
  const totalRaw = paginator.results;
  return {
    yarns,
    page: options.page,
    pageSize: options.pageSize,
    pageCount: Number.isFinite(pageCount) && pageCount > 0 ? pageCount : 1,
    totalResults:
      typeof totalRaw === 'number' && Number.isFinite(totalRaw)
        ? totalRaw
        : null,
  };
}

/** Site brand facet uses the company permalink (`/yarns/brands/{permalink}`). */
function companyBrandKey(company: {
  permalink?: string | null;
  name?: string | null;
}): string {
  const permalink = company.permalink?.trim();
  if (permalink)
    return permalink;
  const name = company.name?.trim();
  if (!name)
    return '';
  return name
    .toLowerCase()
    .replace(/&/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Yarns for a dyer / brand.
 *
 * Prefer `GET yarns/search.json` with the site `brand` facet (company
 * permalink), same family as pattern search’s `designer=` and project
 * search’s `yarn=`. Fall back to full-text `query` + client company filter.
 *
 * Avoid `ya` (yarn-*attribute* facet) and numeric `yarn_company_id` (ignored).
 */
export async function fetchCompanyYarns(
  company: {
    id: number;
    permalink?: string | null;
    name?: string | null;
  },
  options?: { page?: number; pageSize?: number },
): Promise<YarnSearchPage> {
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 48;
  const brandKey = companyBrandKey(company);
  const companyName = company.name?.trim() || brandKey;
  if (!brandKey && !companyName)
    throw new Error('Yarn company name or permalink required for yarn search');

  if (brandKey) {
    const { data } = await client.get('yarns/search.json', {
      params: {
        page,
        page_size: pageSize,
        // Website yarn search brand filter (`#brand=` / brands/{permalink}).
        brand: brandKey,
        sort: 'projects',
      },
    });
    const branded = yarnSearchPageFromPayload(data, { page, pageSize, company });
    // Only trust the facet when rows actually match this company. An ignored
    // `brand=` returns the global corpus; client filter then yields [].
    if (branded.yarns.length > 0)
      return branded;
  }

  // Fall back to full-text company name + strict company match.
  const { data: fallback } = await client.get('yarns/search.json', {
    params: {
      page,
      page_size: pageSize,
      query: companyName,
      sort: 'best',
    },
  });
  return yarnSearchPageFromPayload(fallback, { page, pageSize, company });
}

export async function fetchProject(
  username: string,
  id: number,
): Promise<RavelryProject> {
  const { data } = await client.get(
    `projects/${encodeURIComponent(username)}/${id}.json`,
  );
  return normalizeProject(data.project ?? data);
}

function projectsPageFromPayload(
  data: any,
  page: number,
  pageSize: number,
): ProjectsListPage {
  const list = data.projects ?? [];
  const projects = (Array.isArray(list) ? list : []).map(normalizeProject);
  const paginator = data.paginator ?? {};
  const pageCountRaw = paginator.page_count ?? paginator.last_page ?? 1;
  const pageCount = Number(pageCountRaw);
  const totalRaw = paginator.results;
  const totalResults
    = typeof totalRaw === 'number' && Number.isFinite(totalRaw)
      ? totalRaw
      : null;

  return {
    projects,
    page,
    pageSize,
    pageCount: Number.isFinite(pageCount) && pageCount > 0 ? pageCount : 1,
    totalResults,
  };
}

/**
 * Projects made from a pattern.
 *
 * Prefer `GET /projects/search.json` with the pattern filter (site project
 * search family) so notebooks without photos are included. The collection
 * `GET patterns/{id}/projects.json` is photogallery-oriented and undercounts
 * vs Pattern#full `projects_count`.
 */
export async function fetchPatternProjects(
  pattern: { id: number; permalink?: string | null; name?: string | null },
  options?: { page?: number; pageSize?: number },
): Promise<ProjectsListPage> {
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 48;
  const patternKey
    = pattern.permalink?.trim()
      || pattern.name?.trim()
      || String(pattern.id);

  const { data: searchData } = await client.get('projects/search.json', {
    params: {
      page,
      page_size: pageSize,
      // Same filter family as the website project search “pattern” facet.
      pattern: patternKey,
    },
  });
  const searchPage = projectsPageFromPayload(searchData, page, pageSize);
  if (searchPage.projects.length > 0 || (searchPage.totalResults ?? 0) > 0)
    return searchPage;

  const { data } = await client.get(
    `patterns/${pattern.id}/projects.json`,
    { params: { page, page_size: pageSize } },
  );
  return projectsPageFromPayload(data, page, pageSize);
}

export async function fetchFriends(
  username: string,
): Promise<FriendsListResponse> {
  // Documented: GET people/{username}/friends/list.json → { friendships: [...] }
  const { data } = await client.get(
    `people/${encodeURIComponent(username)}/friends/list.json`,
  );
  const friends = (data.friendships ?? data.friends ?? [])
    .map(personFromFriendship)
    .filter((entry: FriendEntry | null): entry is FriendEntry => entry != null);
  // friendships/list often omits avatars — fill from people/{username}.json
  return { friends: await enrichFriendPhotos(friends) };
}

export async function searchPeople(
  query: string,
): Promise<PeopleSearchResponse> {
  const q = query.trim();
  if (q.length < 3)
    return { people: [] };

  // Ravelry has no people/search endpoint — only people/{username}.json
  // plus designers/search for name matches that link to user accounts.
  const byId = new Map<number, RavelryPerson>();

  const looksLikeUsername = !/\s/.test(q);
  if (looksLikeUsername) {
    try {
      const { data } = await client.get(
        `people/${encodeURIComponent(q)}.json`,
      );
      const user = data.user ?? data;
      if (user?.id != null && user?.username)
        byId.set(user.id, normalizePerson(user));
    }
    catch (error) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status !== 404)
        throw error;
    }
  }

  try {
    const { data } = await client.get('designers/search.json', {
      params: { query: q, page_size: 20 },
    });
    for (const designer of data.designers ?? []) {
      for (const user of designer.users ?? []) {
        if (user?.id == null || !user?.username)
          continue;
        if (byId.has(user.id))
          continue;
        byId.set(
          user.id,
          normalizePerson({
            ...user,
            about_me:
              user.about_me
              ?? (designer.name ? `Designer · ${designer.name}` : null),
          }),
        );
      }
    }
  }
  catch {
    // Designer search is best-effort; username hits above still count.
  }

  return { people: [...byId.values()] };
}

export async function addFriend(
  username: string,
  friendUsername: string,
  person?: RavelryPerson,
): Promise<void> {
  let friendUserId = person?.id;
  if (friendUserId == null) {
    const { data } = await client.get(
      `people/${encodeURIComponent(friendUsername)}.json`,
    );
    friendUserId = data.user?.id;
  }
  if (friendUserId == null)
    throw new Error(`Could not resolve Ravelry user id for ${friendUsername}`);

  // Documented: POST people/{username}/friends/create.json?friend_user_id=
  await client.post(
    `people/${encodeURIComponent(username)}/friends/create.json`,
    null,
    { params: { friend_user_id: friendUserId } },
  );
}

export async function removeFriend(
  username: string,
  friendshipId: number,
): Promise<void> {
  // Documented: POST people/{username}/friends/{friendship_id}/destroy.json
  await client.post(
    `people/${encodeURIComponent(username)}/friends/${friendshipId}/destroy.json`,
  );
}

/** Map Favorites#list type filter (plural) ↔ Favorites#create type (singular). */
const FAVORITE_LIST_TYPE: Record<RavelryFavoriteType, string> = {
  pattern: 'patterns',
  project: 'projects',
};

export type FavoritesListPage = {
  favorites: RavelryFavorite[];
  page: number;
  pageSize: number;
  pageCount: number;
  totalResults: number | null;
};

function favoritesPageFromPayload(
  data: any,
  page: number,
  pageSize: number,
): FavoritesListPage {
  const list = data.favorites ?? data.bookmarks ?? [];
  const favorites = (Array.isArray(list) ? list : [])
    .map(normalizeFavorite)
    .filter((entry: RavelryFavorite | null): entry is RavelryFavorite =>
      entry != null,
    );
  const paginator = data.paginator ?? {};
  const pageCountRaw = paginator.page_count ?? paginator.last_page ?? 1;
  const pageCount = Number(pageCountRaw);
  const totalRaw = paginator.results;
  const totalResults
    = typeof totalRaw === 'number' && Number.isFinite(totalRaw)
      ? totalRaw
      : null;

  return {
    favorites,
    page,
    pageSize,
    pageCount: Number.isFinite(pageCount) && pageCount > 0 ? pageCount : 1,
    totalResults,
  };
}

/**
 * Favorites#list — node-ravelry uses `/favorites/list.json`; ravelry-mcp uses
 * `/favorites.json`. Prefer list.json, fall back on 404.
 */
export async function fetchFavoritesPage(
  username: string,
  options: {
    type: RavelryFavoriteType;
    page?: number;
    pageSize?: number;
  },
): Promise<FavoritesListPage> {
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? 100;
  const params = {
    type: FAVORITE_LIST_TYPE[options.type],
    page,
    page_size: pageSize,
  };
  const base = `people/${encodeURIComponent(username)}/favorites`;

  try {
    const { data } = await client.get(`${base}/list.json`, { params });
    return favoritesPageFromPayload(data, page, pageSize);
  }
  catch (error) {
    const status = (error as { response?: { status?: number } })?.response?.status;
    if (status !== 404)
      throw error;
    const { data } = await client.get(`${base}.json`, { params });
    return favoritesPageFromPayload(data, page, pageSize);
  }
}

export type PersonFavoritesResult = {
  favorites: RavelryFavorite[];
  /** Combined pattern + project favorites reported by Ravelry when available. */
  totalCount: number;
};

async function fetchFavoritesForTypeWithTotal(
  username: string,
  type: RavelryFavoriteType,
): Promise<{ favorites: RavelryFavorite[]; totalCount: number }> {
  const pageSize = 100;
  const maxPages = 20;
  const collected: RavelryFavorite[] = [];
  let page = 1;
  let pageCount = 1;
  let totalCount = 0;
  while (page <= pageCount && page <= maxPages) {
    const result = await fetchFavoritesPage(username, { type, page, pageSize });
    collected.push(...result.favorites);
    pageCount = result.pageCount;
    totalCount = result.totalResults ?? collected.length;
    if (result.favorites.length === 0)
      break;
    page += 1;
  }
  return { favorites: collected, totalCount };
}

/** Load every page of pattern + project favorites (capped) for feed heart state. */
export async function fetchMyFavorites(
  username: string,
): Promise<RavelryFavorite[]> {
  const result = await fetchPersonFavorites(username);
  return result.favorites;
}

/** Public favorites notebook for a profile grid (patterns + projects). */
export async function fetchPersonFavorites(
  username: string,
): Promise<PersonFavoritesResult> {
  // Project favorites are optional — some API apps only expose pattern/yarn/people.
  const [patterns, projects] = await Promise.all([
    fetchFavoritesForTypeWithTotal(username, 'pattern'),
    fetchFavoritesForTypeWithTotal(username, 'project').catch(() => ({
      favorites: [] as RavelryFavorite[],
      totalCount: 0,
    })),
  ]);
  return {
    favorites: [...patterns.favorites, ...projects.favorites],
    totalCount: patterns.totalCount + projects.totalCount,
  };
}

/**
 * Favorites#create —
 * POST people/{username}/favorites/create.json
 *
 * Ravelry ignores JSON bodies here (blank `type` → "type should be one of:…").
 * Match comments.create: form-urlencoded `type` + `favorited_id`.
 */
export async function addFavorite(
  username: string,
  type: RavelryFavoriteType,
  typeId: number,
): Promise<RavelryFavorite> {
  const body = new URLSearchParams({
    type,
    favorited_id: String(typeId),
  });

  const { data } = await client.post(
    `people/${encodeURIComponent(username)}/favorites/create.json`,
    body.toString(),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
  );
  const favorite = normalizeFavorite(data.favorite ?? data);
  if (!favorite) {
    // Create can return an empty/minimal body — synthesize from the request.
    return {
      id: Number(data?.id ?? data?.favorite?.id ?? 0) || Date.now(),
      type,
      type_id: typeId,
      created_at: null,
    };
  }
  return favorite;
}

/**
 * Favorites#destroy — node-ravelry uses DELETE …/favorites/{id}.json;
 * fall back to POST …/destroy.json (same shape as friends).
 */
export async function removeFavorite(
  username: string,
  favoriteId: number,
): Promise<void> {
  const base
    = `people/${encodeURIComponent(username)}/favorites/${favoriteId}`;
  try {
    await client.delete(`${base}.json`);
  }
  catch (error) {
    const status = (error as { response?: { status?: number } })?.response?.status;
    if (status !== 404 && status !== 405)
      throw error;
    await client.post(`${base}/destroy.json`);
  }
}

const PATTERN_ID_CHUNK = 50;

async function fetchFullPatterns(ids: number[]): Promise<RavelryPattern[]> {
  const chunks: number[][] = [];
  for (let index = 0; index < ids.length; index += PATTERN_ID_CHUNK)
    chunks.push(ids.slice(index, index + PATTERN_ID_CHUNK));

  const pages = await Promise.all(chunks.map(async (chunk) => {
    // Documented: space-delimited ids, sent as +. Axios must not encode + as %2B.
    const { data } = await client.get(`patterns.json?ids=${chunk.join('+')}`);
    return patternsFromListPayload(data).flatMap((raw) => {
      const pattern = normalizePattern(raw);
      return pattern ? [pattern] : [];
    });
  }));
  return pages.flat();
}

export type PatternHighlightsPage = {
  highlights: PatternHighlight[];
  page: number;
  pageSize: number;
  total: number;
};

let highlightTimeline: Promise<PatternHighlight[]> | null = null;

/** Drop the cached highlights timeline so the next page load hits the API. */
export function invalidatePatternHighlightTimeline() {
  highlightTimeline = null;
}

function loadHighlightTimeline(): Promise<PatternHighlight[]> {
  if (!highlightTimeline) {
    highlightTimeline = client
      .get('patterns/highlights.json', { params: { days: HIGHLIGHT_DAYS } })
      .then(({ data }) => normalizeHighlights(data))
      .catch((error: unknown) => {
        highlightTimeline = null;
        throw error;
      });
  }
  return highlightTimeline;
}

export async function fetchPatternHighlightsPage(
  page = 1,
): Promise<PatternHighlightsPage> {
  // highlights.json only accepts `days`. Page the photo lookup instead.
  const timeline = await loadHighlightTimeline();
  const sliced = sliceHighlightPage(timeline, page);
  const ids = [...new Set(sliced.highlights.map(item => item.pattern.id))];
  const full = ids.length ? await fetchFullPatterns(ids) : [];
  return {
    ...sliced,
    highlights: mergeHighlightPatterns(sliced.highlights, full),
  };
}

export async function fetchPattern(id: number): Promise<RavelryPattern> {
  const { data } = await client.get(`patterns/${id}.json`);
  const pattern = patternFromShowPayload(data, id);
  if (!pattern)
    throw new Error('Pattern missing from response');
  return pattern;
}

export function bestPhotoUrl(
  photo?: RavelryPhoto | null,
): string | null {
  if (!photo)
    return null;
  return (
    photo.medium2_url
    ?? photo.medium_url
    ?? photo.shelved_url
    ?? photo.square_url
    ?? photo.small2_url
    ?? photo.small_url
    ?? photo.thumbnail_url
    ?? null
  );
}
