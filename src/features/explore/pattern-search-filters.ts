/**
 * Pattern search facets for `GET /patterns/search.json`, matching the filter
 * family on https://www.ravelry.com/patterns/search (query-string params).
 */

export type PatternSearchFilters = {
  craft: string | null;
  availability: string | null;
  weights: string[];
  categories: string[];
  fits: string[];
  language: string | null;
  photo: boolean;
};

export type FilterOption = { label: string; value: string };

export const EMPTY_PATTERN_SEARCH_FILTERS: PatternSearchFilters = {
  craft: null,
  availability: null,
  weights: [],
  categories: [],
  fits: [],
  language: null,
  photo: false,
};

export const CRAFT_OPTIONS: FilterOption[] = [
  { label: 'Knitting', value: 'knitting' },
  { label: 'Crochet', value: 'crochet' },
  { label: 'Machine knitting', value: 'machine-knitting' },
  { label: 'Loom knitting', value: 'loom-knitting' },
  { label: 'Weaving', value: 'weaving' },
  { label: 'Spinning', value: 'spinning' },
  { label: 'Dyeing', value: 'dyeing' },
  { label: 'Mixed craft', value: 'mixed-craft' },
];

export const AVAILABILITY_OPTIONS: FilterOption[] = [
  { label: 'Free', value: 'free' },
  { label: 'Ravelry download', value: 'ravelry-download' },
  { label: 'Online', value: 'online' },
  { label: 'In print', value: 'inprint' },
  { label: 'Discontinued', value: 'discontinued' },
];

export const WEIGHT_OPTIONS: FilterOption[] = [
  { label: 'Thread', value: 'thread' },
  { label: 'Cobweb', value: 'cobweb' },
  { label: 'Lace', value: 'lace' },
  { label: 'Light fingering', value: 'light-fingering' },
  { label: 'Fingering', value: 'fingering' },
  { label: 'Sport', value: 'sport' },
  { label: 'DK', value: 'dk' },
  { label: 'Worsted', value: 'worsted' },
  { label: 'Aran', value: 'aran' },
  { label: 'Bulky', value: 'bulky' },
  { label: 'Super bulky', value: 'super-bulky' },
  { label: 'Jumbo', value: 'jumbo' },
];

/** `pc=` pattern categories used by site search. */
export const CATEGORY_OPTIONS: FilterOption[] = [
  { label: 'Sweater', value: 'sweater' },
  { label: 'Cardigan', value: 'cardigan' },
  { label: 'Pullover', value: 'pullover' },
  { label: 'Vest', value: 'vest' },
  { label: 'Coat / jacket', value: 'coat' },
  { label: 'Pants', value: 'pants' },
  { label: 'Skirt', value: 'skirt' },
  { label: 'Dress', value: 'dress' },
  { label: 'Socks', value: 'socks' },
  { label: 'Mittens', value: 'mittens' },
  { label: 'Gloves', value: 'gloves' },
  { label: 'Hat', value: 'hat' },
  { label: 'Scarf', value: 'scarf' },
  { label: 'Shawl / wrap', value: 'shawl-wrap' },
  { label: 'Cowl', value: 'cowl' },
  { label: 'Neck / torso', value: 'neck-torso' },
  { label: 'Blanket', value: 'blanket' },
  { label: 'Home', value: 'home' },
  { label: 'Toys / softies', value: 'toysanddolls' },
  { label: 'Bags', value: 'bag' },
  { label: 'Components', value: 'components' },
];

export const FIT_OPTIONS: FilterOption[] = [
  { label: 'Adult', value: 'adult' },
  { label: 'Baby', value: 'baby' },
  { label: 'Child', value: 'child' },
  { label: 'Toddler', value: 'toddler' },
  { label: 'Teen', value: 'teen' },
  { label: 'Petite', value: 'petite' },
  { label: 'Plus', value: 'plus' },
  { label: 'Tall', value: 'tall' },
  { label: 'Maternity', value: 'maternity' },
  { label: 'Doll', value: 'doll' },
  { label: 'Pet', value: 'pet' },
];

export const LANGUAGE_OPTIONS: FilterOption[] = [
  { label: 'English', value: 'en' },
  { label: 'German', value: 'de' },
  { label: 'French', value: 'fr' },
  { label: 'Spanish', value: 'es' },
  { label: 'Dutch', value: 'nl' },
  { label: 'Italian', value: 'it' },
  { label: 'Japanese', value: 'ja' },
  { label: 'Russian', value: 'ru' },
  { label: 'Portuguese', value: 'pt' },
  { label: 'Swedish', value: 'sv' },
  { label: 'Danish', value: 'da' },
  { label: 'Norwegian', value: 'no' },
  { label: 'Finnish', value: 'fi' },
  { label: 'Polish', value: 'pl' },
  { label: 'Korean', value: 'ko' },
  { label: 'Chinese', value: 'zh' },
];

export function hasActivePatternFilters(
  filters: PatternSearchFilters,
): boolean {
  return Boolean(
    filters.craft
    || filters.availability
    || filters.weights.length
    || filters.categories.length
    || filters.fits.length
    || filters.language
    || filters.photo,
  );
}

/** Serialize filters into `patterns/search.json` query params. */
export function patternFiltersToParams(
  filters: PatternSearchFilters,
): Record<string, string> {
  const params: Record<string, string> = {};
  if (filters.craft)
    params.craft = filters.craft;
  if (filters.availability)
    params.availability = filters.availability;
  if (filters.weights.length)
    params.weight = filters.weights.join('|');
  if (filters.categories.length)
    params.pc = filters.categories.join('|');
  if (filters.fits.length)
    params.fit = filters.fits.join('|');
  if (filters.language)
    params.language = filters.language;
  if (filters.photo)
    params.photo = 'yes';
  return params;
}

export function toggleMultiValue(
  values: string[],
  value: string,
): string[] {
  return values.includes(value)
    ? values.filter(item => item !== value)
    : [...values, value];
}

/** Stable key fragment for React Query. */
export function patternFiltersQueryKey(
  filters: PatternSearchFilters,
): string {
  return JSON.stringify(patternFiltersToParams(filters));
}
