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
  /** Linked pattern id when present on Project#full / list. */
  pattern_id?: number | null;
  /** Designer from nested pattern on Project#full. */
  pattern_author?: RavelryPatternAuthor | null;
  status_name?: string | null;
  progress?: number | null;
  notes_html?: string | null;
  /** Optional craft timeline — users often leave these blank. */
  started?: string | null;
  completed?: string | null;
  /** When the project notebook entry was created (usually always present). */
  created_at?: string | null;
  updated_at?: string | null;
  user_id?: number;
  /** Owner when present (e.g. patterns/{id}/projects.json). */
  user?: RavelryPerson | null;
  first_photo?: RavelryPhoto | null;
  photos?: RavelryPhoto[];
  craft_name?: string | null;
  /** Ravelry favorites count — mapped to Instagram “likes” in the feed. */
  favorites_count?: number | null;
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

/** Friend row from friendships/list — includes API friendship id for destroy. */
export type FriendEntry = RavelryPerson & {
  friendship_id: number;
};

export type FriendsListResponse = {
  friends: FriendEntry[];
};

export type CurrentUserResponse = {
  user: RavelryPerson;
};

export type RavelryPatternAuthor = {
  id: number;
  name: string;
  permalink?: string | null;
  users: RavelryPerson[];
};

/** Needle / hook row from Pattern#full `pattern_needle_sizes`. */
export type RavelryNeedleSize = {
  id: number;
  name: string;
  metric?: number | null;
  us?: string | null;
  crochet?: boolean | null;
  knitting?: boolean | null;
};

/** Pattern#full fields used by highlights and pattern detail. */
export type RavelryPattern = {
  id: number;
  name: string;
  permalink?: string | null;
  favorites_count?: number | null;
  projects_count?: number | null;
  /** Users who queued the pattern (Pattern#full). */
  queued_projects_count?: number | null;
  comments_count?: number | null;
  /** Yarn / pack rows when present on Pattern#full. */
  packs_count?: number | null;
  free?: boolean | null;
  /** Pattern#full price amount (string or number from API). */
  price?: string | null;
  currency?: string | null;
  currency_symbol?: string | null;
  notes_html?: string | null;
  photos: RavelryPhoto[];
  pattern_author?: RavelryPatternAuthor | null;
  /** Craft label from Pattern#full `craft.name`. */
  craft_name?: string | null;
  /** Pattern type / category label from Pattern#full. */
  pattern_type_name?: string | null;
  yarn_weight_description?: string | null;
  /** Preformatted gauge line when present (Pattern#full). */
  gauge_description?: string | null;
  gauge?: number | null;
  gauge_divisor?: number | null;
  row_gauge?: number | null;
  gauge_pattern?: string | null;
  yardage_description?: string | null;
  sizes_available?: string | null;
  difficulty_average?: number | null;
  pattern_needle_sizes?: RavelryNeedleSize[];
};

/** One row from `GET /patterns/highlights.json` → `timeline_entries`. */
export type PatternHighlight = {
  id: string;
  timeline_date: string | null;
  pattern: RavelryPattern;
};
