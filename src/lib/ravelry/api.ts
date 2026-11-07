import { useAuthStore } from '@/features/auth/use-auth-store';
import { client } from '@/lib/api';

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
import type {
  CurrentUserResponse,
  FriendActivity,
  FriendsListResponse,
  PeopleSearchResponse,
  RavelryPerson,
  RavelryPhoto,
  RavelryProject,
} from './types';

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
    id: raw.id,
    username: raw.username,
    first_name: raw.first_name ?? null,
    small_photo_url: raw.small_photo_url ?? raw.tiny_photo_url ?? null,
    photo_url: raw.photo_url ?? null,
    about_me: raw.about_me ?? null,
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

  return {
    id: String(raw.id ?? `${person.username}-${index}-${raw.created_at}`),
    type: raw.type ?? raw.activity_type ?? 'project_photo',
    created_at: raw.created_at ?? new Date().toISOString(),
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

  const { data } = await client.get(
    `people/${encodeURIComponent(username)}/friends.json`,
  );
  const friends = (data.friendships ?? data.friends ?? []).map((item: any) =>
    normalizePerson(item.friend ?? item.user ?? item),
  );
  return { friends };
}

export async function searchPeople(
  query: string,
): Promise<PeopleSearchResponse> {
  if (isDemo())
    return searchMockPeople(query);

  const { data } = await client.get('people/search.json', {
    params: { query },
  });
  const people = (data.people ?? data.users ?? []).map(normalizePerson);
  return { people };
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

  await client.post(
    `people/${encodeURIComponent(username)}/friends/${encodeURIComponent(friendUsername)}.json`,
  );
}

export async function removeFriend(
  username: string,
  friendUsername: string,
): Promise<void> {
  if (isDemo()) {
    removeMockFriend(friendUsername);
    return;
  }

  await client.delete(
    `people/${encodeURIComponent(username)}/friends/${encodeURIComponent(friendUsername)}.json`,
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
