import type {
  FriendActivity,
  FriendEntry,
  FriendsListResponse,
  PeopleSearchResponse,
  RavelryPerson,
  RavelryProject,
} from './types';

const DEMO_USER: RavelryPerson = {
  id: 1,
  username: 'pelote_demo',
  first_name: 'Demo',
  small_photo_url:
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop',
  photo_url:
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
};

const FRIENDS: RavelryPerson[] = [
  {
    id: 11,
    username: 'stitchstudio',
    first_name: 'Ada',
    small_photo_url:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
  },
  {
    id: 12,
    username: 'loopandline',
    first_name: 'Jules',
    small_photo_url:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
  },
  {
    id: 13,
    username: 'fiberframe',
    first_name: 'Sam',
    small_photo_url:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop',
  },
];

const PHOTOS = [
  'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=1200&h=1500&fit=crop',
  'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=1200&h=1500&fit=crop',
  'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=1200&h=1500&fit=crop',
  'https://images.unsplash.com/photo-1558618047-f4b511aee78e?w=1200&h=1500&fit=crop',
  'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=1200&h=1500&fit=crop',
];

function project(input: {
  id: number;
  name: string;
  pattern: string;
  photo: string;
  ownerId: number;
  favoritesCount?: number;
  notes?: string;
}): RavelryProject {
  const { id, name, pattern, photo, ownerId, favoritesCount, notes } = input;
  return {
    id,
    name,
    pattern_name: pattern,
    status_name: 'In progress',
    progress: 40 + (id % 5) * 10,
    craft_name: 'Knitting',
    notes_html:
      notes
      ?? '<p>Fresh project photos from the needles — patterns, fiber, and progress.</p>',
    favorites_count: favoritesCount ?? 12 + (id % 7) * 3,
    user_id: ownerId,
    first_photo: {
      id: id * 10,
      medium2_url: photo,
      medium_url: photo,
      square_url: photo,
    },
    photos: [
      {
        id: id * 10,
        medium2_url: photo,
        medium_url: photo,
        square_url: photo,
      },
    ],
  };
}

const PROJECTS: RavelryProject[] = [
  project({
    id: 101,
    name: 'Studio Cardigan',
    pattern: 'Fellwald',
    photo: PHOTOS[0],
    ownerId: 11,
    favoritesCount: 48,
    notes: '<p>Blocked and ready for buttons — finally.</p>',
  }),
  project({
    id: 102,
    name: 'Street Cowl',
    pattern: 'Line Loop',
    photo: PHOTOS[1],
    ownerId: 12,
    favoritesCount: 19,
    notes: '<p>One skein wonder for cold bike rides.</p>',
  }),
  project({
    id: 103,
    name: 'Everyday Pullover',
    pattern: 'Quiet Wool',
    photo: PHOTOS[2],
    ownerId: 13,
    favoritesCount: 1,
    notes: '<p>Soft heathered wool, second sleeve underway.</p>',
  }),
  project({
    id: 104,
    name: 'Weekend Socks',
    pattern: 'Trail Pair',
    photo: PHOTOS[3],
    ownerId: 11,
    favoritesCount: 33,
  }),
  project({
    id: 105,
    name: 'Desk Mitts',
    pattern: 'Quick Hands',
    photo: PHOTOS[4],
    ownerId: 12,
    favoritesCount: 7,
    notes: '<p>Fingerless for typing days.</p>',
  }),
];

export const mockCurrentUser = DEMO_USER;

export function getMockActivities(): FriendActivity[] {
  return [
    {
      id: 'a1',
      type: 'project_photo',
      created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      title: 'New project photo',
      person: FRIENDS[0],
      project: PROJECTS[0],
      photo: PROJECTS[0].first_photo!,
      pattern_name: PROJECTS[0].pattern_name,
    },
    {
      id: 'a2',
      type: 'project_photo',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      title: 'New project photo',
      person: FRIENDS[1],
      project: PROJECTS[1],
      photo: PROJECTS[1].first_photo!,
      pattern_name: PROJECTS[1].pattern_name,
    },
    {
      id: 'a3',
      type: 'favorite',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      title: 'Favorited a pattern',
      body: 'Quiet Wool',
      person: FRIENDS[2],
      // Photo on purpose: Home must still exclude favourites (likes → For you later).
      photo: PROJECTS[2].first_photo!,
      project: PROJECTS[2],
      pattern_name: 'Quiet Wool',
    },
    {
      id: 'a4',
      type: 'project_photo',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
      title: 'New project photo',
      person: FRIENDS[2],
      project: PROJECTS[2],
      photo: PROJECTS[2].first_photo!,
      pattern_name: PROJECTS[2].pattern_name,
    },
    {
      id: 'a5',
      type: 'project_photo',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 40).toISOString(),
      title: 'New project photo',
      person: FRIENDS[0],
      project: PROJECTS[3],
      photo: PROJECTS[3].first_photo!,
      pattern_name: PROJECTS[3].pattern_name,
    },
    {
      id: 'a6',
      type: 'queued',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
      title: 'Queued a pattern',
      body: 'Ember Hands',
      person: FRIENDS[1],
      pattern_name: 'Ember Hands',
    },
    {
      id: 'a7',
      type: 'project_photo',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
      title: 'New project photo',
      person: FRIENDS[1],
      project: PROJECTS[4],
      photo: PROJECTS[4].first_photo!,
      pattern_name: PROJECTS[4].pattern_name,
    },
  ];
}

export function getMockProject(
  username: string,
  id: number,
): RavelryProject | null {
  const found = PROJECTS.find(p => p.id === id);
  if (!found)
    return null;
  return { ...found };
}

function asFriendEntry(person: RavelryPerson): FriendEntry {
  return { ...person, friendship_id: person.id };
}

export function getMockFriends(): FriendsListResponse {
  return { friends: FRIENDS.map(asFriendEntry) };
}

export function searchMockPeople(query: string): PeopleSearchResponse {
  const designers: RavelryPerson[] = [
    {
      id: 201,
      username: 'patternframe',
      first_name: 'Mina',
      small_photo_url:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
      about_me: 'Clear project photography and wearable knits.',
    },
    {
      id: 202,
      username: 'needlegrid',
      first_name: 'River',
      small_photo_url:
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&h=200&fit=crop',
      about_me: 'Everyday sweaters and yarn notes.',
    },
    ...FRIENDS,
  ];

  const q = query.trim().toLowerCase();
  if (!q)
    return { people: designers.slice(0, 5) };

  return {
    people: designers.filter(
      p =>
        p.username.toLowerCase().includes(q)
        || (p.first_name?.toLowerCase().includes(q) ?? false),
    ),
  };
}

let localFriends: FriendEntry[] = FRIENDS.map(asFriendEntry);

export function addMockFriend(person: RavelryPerson) {
  if (!localFriends.some(f => f.username === person.username)) {
    localFriends = [asFriendEntry(person), ...localFriends];
  }
  return localFriends;
}

export function removeMockFriend(username: string) {
  localFriends = localFriends.filter(f => f.username !== username);
  return localFriends;
}

export function getLocalMockFriends() {
  return localFriends;
}
