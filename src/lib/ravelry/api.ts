import type {
  CurrentUserResponse,
  FriendActivity,
  FriendEntry,
  FriendsListResponse,
  PeopleSearchResponse,
  RavelryPerson,
  RavelryPhoto,
  RavelryProject,
} from './types';

import { client } from '@/lib/api';
import {
  normalizeCreatedAt,
  normalizeFavoritesCount,
  resolveActivityType,
} from './activity-utils';

export { normalizeCreatedAt, resolveActivityType } from './activity-utils';

function normalizePhoto(raw: any): RavelryPhoto | null {
  if (!raw)
    return null;
  return {
    id: raw.id ?? 0,
    medium_url: raw.medium_url ?? raw.medium2_url ?? null,
    medium2_url: raw.medium2_url ?? raw.medium_url ?? null,
    square_url: raw.square_url ?? null,
    small_url: raw.small_url ?? null,
    shelved_url: raw.shelved_url ?? null,
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

function normalizeProject(raw: any): RavelryProject {
  return {
    id: raw.id,
    name: raw.name,
    permalink: raw.permalink,
    pattern_name: raw.pattern_name ?? raw.pattern?.name ?? null,
    status_name: raw.status_name ?? null,
    progress: raw.progress ?? null,
    notes_html: raw.notes_html ?? raw.notes ?? null,
    started: raw.started ?? null,
    completed: raw.completed ?? null,
    user_id: raw.user_id,
    craft_name: raw.craft_name ?? raw.craft?.name ?? null,
    favorites_count: normalizeFavoritesCount(raw),
    first_photo: normalizePhoto(raw.first_photo),
    photos: Array.isArray(raw.photos)
      ? raw.photos.map(normalizePhoto).filter(Boolean) as RavelryPhoto[]
      : undefined,
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

export async function fetchProjectsList(
  username: string,
  options?: { page?: number; pageSize?: number },
): Promise<{ projects: RavelryProject[]; page: number; pageSize: number }> {
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 24;
  // Documented: GET projects/{username}/list.json (same family as projects/{user}/{id}.json)
  const { data } = await client.get(
    `projects/${encodeURIComponent(username)}/list.json`,
    { params: { page, page_size: pageSize } },
  );
  const list = data.projects ?? [];
  return {
    projects: (Array.isArray(list) ? list : []).map(normalizeProject),
    page,
    pageSize,
  };
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

export async function fetchProject(
  username: string,
  id: number,
): Promise<RavelryProject> {
  const { data } = await client.get(
    `projects/${encodeURIComponent(username)}/${id}.json`,
  );
  return normalizeProject(data.project ?? data);
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
  if (!q)
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
    ?? photo.small_url
    ?? null
  );
}
