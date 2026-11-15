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
  small2_url?: string | null;
  thumbnail_url?: string | null;
  shelved_url?: string | null;
};

/** Yarn company (dyer / brand) from Yarn#full `yarn_company` / YarnCompanies#show. */
export type RavelryYarnCompany = {
  id: number;
  name: string;
  permalink?: string | null;
  yarn_count?: number | null;
  /** Brand logo when present on YarnCompany#full. */
  logo_url?: string | null;
};

/** Catalog yarn from Yarns#show / yarns.json / yarns/search. */
export type RavelryYarn = {
  id: number;
  name: string;
  permalink?: string | null;
  yarn_company_name?: string | null;
  yarn_company_id?: number | null;
  yarn_company_permalink?: string | null;
  yarn_company?: RavelryYarnCompany | null;
  projects_count?: number | null;
  photo?: RavelryPhoto | null;
  photos?: RavelryPhoto[];
  yarn_weight_name?: string | null;
  /** Fibre blend summary, e.g. `75% Merino, 25% Nylon`. */
  fiber_description?: string | null;
  grams?: number | null;
  yardage?: number | null;
  wpi?: number | null;
  min_gauge?: number | null;
  max_gauge?: number | null;
  gauge_divisor?: number | null;
  machine_washable?: boolean | null;
  discontinued?: boolean | null;
  texture?: string | null;
  /** Catalog notes from Yarn#full (`notes` / `notes_html`). */
  notes_html?: string | null;
};

/**
 * Named colour variant from `GET yarns/{id}.json?include=colorways`
 * (Colorway#full — includes `photo_url` when Ravelry has a representative shot).
 */
export type RavelryColorway = {
  id: number;
  name: string;
  code?: string | null;
  yarn_id?: number | null;
  /** `null`/absent when active; `"discontinued"` when retired. */
  current_status?: string | null;
  projects_count?: number | null;
  stashes_count?: number | null;
  usage_count?: number | null;
  /** Representative colorway image from Colorway#full `photo_url` / photos. */
  photo?: RavelryPhoto | null;
  photos?: RavelryPhoto[];
};

/** Yarn pack summary from Pattern#full / Project#full `packs`. */
export type RavelryProjectPack = {
  /** Linked catalog yarn id for Yarns#show / yarns.json?ids=. */
  yarn_id?: number | null;
  /** Catalog yarn name when present on the pack (may lack photos). */
  yarn_name?: string | null;
  yarn_company_name?: string | null;
  colorway?: string | null;
  color_family_name?: string | null;
  yarn_weight_name?: string | null;
  dye_lot?: string | null;
  skeins?: number | null;
  total_yards?: number | null;
  total_meters?: number | null;
  shop_name?: string | null;
  /** User-uploaded pack / stash photo — not the dyer catalog image. */
  photo?: RavelryPhoto | null;
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
  /** Size label from Project#full when present. */
  size?: string | null;
  made_for?: string | null;
  gauge_description?: string | null;
  gauge?: number | null;
  gauge_divisor?: number | null;
  row_gauge?: number | null;
  gauge_pattern?: string | null;
  needle_sizes?: RavelryNeedleSize[];
  packs?: RavelryProjectPack[];
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
  /** Pack rows from Pattern#full (recommended / listed yarns). */
  packs?: RavelryProjectPack[];
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

/** Favoritable notebook entity for Favorites#create (`type`). */
export type RavelryFavoriteType = 'pattern' | 'project';

/**
 * One row from Favorites#list.
 * `id` is the favorite record id (needed for destroy); `type_id` is the
 * pattern/project id that was favorited.
 */
export type RavelryFavorite = {
  id: number;
  type: RavelryFavoriteType;
  type_id: number;
  created_at?: string | null;
  /** Display name from nested `favorited` when present. */
  name?: string | null;
  /** Best thumbnail URL from nested `favorited` photos. */
  photo_url?: string | null;
  /** Project owner username when favoriting a project. */
  owner_username?: string | null;
};
