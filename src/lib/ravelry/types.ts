export type RavelryPerson = {
  id: number;
  username: string;
  first_name?: string | null;
  small_photo_url?: string | null;
  photo_url?: string | null;
  about_me?: string | null;
};

export type RavelryPhoto = {
  id: number;
  medium_url?: string | null;
  medium2_url?: string | null;
  square_url?: string | null;
  small_url?: string | null;
  shelved_url?: string | null;
};

export type RavelryProject = {
  id: number;
  name: string;
  permalink?: string;
  pattern_name?: string | null;
  status_name?: string | null;
  progress?: number | null;
  notes_html?: string | null;
  started?: string | null;
  completed?: string | null;
  user_id?: number;
  first_photo?: RavelryPhoto | null;
  photos?: RavelryPhoto[];
  craft_name?: string | null;
};

export type ActivityType
  = | 'project_photo'
    | 'stash_photo'
    | 'handspun_photo'
    | 'queued'
    | 'favorite'
    | 'forum'
    | 'comment'
    | string;

export type FriendActivity = {
  id: string;
  type: ActivityType;
  created_at: string;
  title?: string | null;
  body?: string | null;
  person: RavelryPerson;
  project?: RavelryProject | null;
  photo?: RavelryPhoto | null;
  pattern_name?: string | null;
};

export type FriendsActivityResponse = {
  activities: FriendActivity[];
};

export type PeopleSearchResponse = {
  people: RavelryPerson[];
};

export type FriendsListResponse = {
  friends: RavelryPerson[];
};

export type CurrentUserResponse = {
  user: RavelryPerson;
};
