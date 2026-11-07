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
import { useAuthStore } from '@/features/auth/use-auth-store';

import { client } from '@/lib/api';
import {
  normalizeCreatedAt,
  normalizeFavoritesCount,
  resolveActivityType,
} from './activity-utils';
import {
  addMockFriend,
  getLocalMockFriends,
  getMockActivities,
  getMockFriends,
  getMockProject,
  mockCurrentUser,
  removeMockFriend,
  searchMockPeople,
} from './mock-data';

export { normalizeCreatedAt, resolveActivityType } from './activity-utils';

function isDemo() {
  return useAuthStore.getState().isDemo;
}

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

function normalizePerson(raw: any): RavelryPerson {
  return {
    id: raw?.id ?? 0,
    username: String(raw?.username ?? ''),
    first_name: raw?.first_name ?? null,
    small_photo_url: raw?.small_photo_url ?? raw?.tiny_photo_url ?? null,
    photo_url: raw?.photo_url ?? null,
    about_me: raw?.about_me ?? null,
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
    return {
      ...normalizePerson({
        id,
        username: item.friend,
        small_photo_url: item.small_photo_url ?? item.tiny_photo_url,
        photo_url: item.photo_url,
        first_name: item.first_name,
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

  return {
    ...normalizePerson({
      ...(typeof raw === 'object' && raw ? raw : {}),
      id,
      username,
      small_photo_url:
        raw?.small_photo_url
        ?? raw?.tiny_photo_url
        ?? item?.small_photo_url
        ?? null,
      photo_url: raw?.photo_url ?? item?.photo_url ?? null,
      first_name: raw?.first_name ?? item?.first_name ?? null,
    }),
    friendship_id: friendshipId,
  };
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
  const person = normalizePerson(raw.user ?? raw.person ?? {});
  const project = raw.project ? normalizeProject(raw.project) : null;
  const photo = normalizePhoto(
    raw.photo ?? raw.project_photo ?? project?.first_photo,
  );
  const createdAt = normalizeCreatedAt(raw);
  const patternFavorites = normalizeFavoritesCount(raw.pattern ?? raw);

  if (
    project
    && (project.favorites_count == null)
    && patternFavorites != null
  ) {
    project.favorites_count = patternFavorites;
  }

  return {
    id: String(raw.id ?? `${person.username}-${index}-${createdAt || index}`),
    type: resolveActivityType(raw),
    created_at: createdAt,
    title: raw.title ?? raw.description ?? null,
    body: raw.body ?? raw.comment ?? null,
    person,
    project,
    photo,
    pattern_name:
      raw.pattern_name ?? project?.pattern_name ?? raw.pattern?.name ?? null,
  };
}

export async function fetchCurrentUser(): Promise<RavelryPerson> {
  if (isDemo())
    return mockCurrentUser;

  const { data } = await client.get<CurrentUserResponse>('current_user.json');
  return normalizePerson(data.user);
}

export async function fetchFriendsActivity(
  username: string,
): Promise<FriendActivity[]> {
  if (isDemo())
    return getMockActivities();

  const { data } = await client.get(
    `people/${encodeURIComponent(username)}/friends/activity.json`,
  );

  const list = data.activities ?? data.friend_activities ?? data ?? [];
  return (Array.isArray(list) ? list : []).map(normalizeActivity);
}

export async function fetchProject(
  username: string,
  id: number,
): Promise<RavelryProject> {
  if (isDemo()) {
    const project = getMockProject(username, id);
    if (!project)
      throw new Error('Project not found');
    return project;
  }

  const { data } = await client.get(
    `projects/${encodeURIComponent(username)}/${id}.json`,
  );
  return normalizeProject(data.project ?? data);
}

export async function fetchFriends(
  username: string,
): Promise<FriendsListResponse> {
  if (isDemo())
    return { friends: getLocalMockFriends() };

  // Documented: GET people/{username}/friends/list.json → { friendships: [...] }
  const { data } = await client.get(
    `people/${encodeURIComponent(username)}/friends/list.json`,
  );
  const friends = (data.friendships ?? data.friends ?? [])
    .map(personFromFriendship)
    .filter((entry: FriendEntry | null): entry is FriendEntry => entry != null);
  return { friends };
}

export async function searchPeople(
  query: string,
): Promise<PeopleSearchResponse> {
  if (isDemo())
    return searchMockPeople(query);

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
  if (isDemo()) {
    if (person)
      addMockFriend(person);
    else
      addMockFriend({ id: Date.now(), username: friendUsername });
    return;
  }

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
  friendUsername?: string,
): Promise<void> {
  if (isDemo()) {
    removeMockFriend(friendUsername ?? String(friendshipId));
    return;
  }

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

// Keep getMockFriends referenced for onboarding empty checks in demo
void getMockFriends;
