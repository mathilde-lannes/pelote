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
  /** Typical colors used — Ravelry `colors=` (1–5, or 6 for 6+). */
  colors: string[];
  /** Knitting needle sizes — Ravelry `needle=` (e.g. us-6). */
  needles: string[];
  /** Meterage range as `min|max` for Ravelry `meterage=`. */
  meterage: string | null;
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
  colors: [],
  needles: [],
  meterage: null,
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

/** `colors=` — typical number of colors used (6 means 6+). */
export const COLORS_OPTIONS: FilterOption[] = [
  { label: '1', value: '1' },
  { label: '2', value: '2' },
  { label: '3', value: '3' },
  { label: '4', value: '4' },
  { label: '5', value: '5' },
  { label: '6+', value: '6' },
];

/**
 * Common knitting needle sizes for `needle=` (US slug used by site search).
 * Multi-select is OR (pipe-joined), same as yarn weight.
 */
export const NEEDLE_OPTIONS: FilterOption[] = [
  { label: 'US 0 · 2.0 mm', value: 'us-0' },
  { label: 'US 1 · 2.25 mm', value: 'us-1' },
  { label: 'US 1½ · 2.5 mm', value: 'us-1-5' },
  { label: 'US 2 · 2.75 mm', value: 'us-2' },
  { label: 'US 2½ · 3.0 mm', value: 'us-2-5' },
  { label: 'US 3 · 3.25 mm', value: 'us-3' },
  { label: 'US 4 · 3.5 mm', value: 'us-4' },
  { label: 'US 5 · 3.75 mm', value: 'us-5' },
  { label: 'US 6 · 4.0 mm', value: 'us-6' },
  { label: 'US 7 · 4.5 mm', value: 'us-7' },
  { label: 'US 8 · 5.0 mm', value: 'us-8' },
  { label: 'US 9 · 5.5 mm', value: 'us-9' },
  { label: 'US 10 · 6.0 mm', value: 'us-10' },
  { label: 'US 10½ · 6.5 mm', value: 'us-10-5' },
  { label: 'US 11 · 8.0 mm', value: 'us-11' },
  { label: 'US 13 · 9.0 mm', value: 'us-13' },
  { label: 'US 15 · 10.0 mm', value: 'us-15' },
  { label: 'US 17 · 12.0 mm', value: 'us-17' },
  { label: 'US 19 · 15.0 mm', value: 'us-19' },
];

/**
 * Meterage buckets for `meterage=min|max` (same shape as site
 * `yardage=80%7C150` / custom meterage ranges).
 */
export const METERAGE_OPTIONS: FilterOption[] = [
  { label: 'Under 100 m', value: '0|100' },
  { label: '100 – 200 m', value: '100|200' },
  { label: '200 – 300 m', value: '200|300' },
  { label: '300 – 450 m', value: '300|450' },
  { label: '450 – 600 m', value: '450|600' },
  { label: '600 – 750 m', value: '600|750' },
  { label: '750 – 900 m', value: '750|900' },
  { label: '900 – 1,200 m', value: '900|1200' },
  { label: '1,200 – 1,500 m', value: '1200|1500' },
  { label: '1,500 – 1,800 m', value: '1500|1800' },
  { label: '1,800 – 2,100 m', value: '1800|2100' },
  { label: '2,100 m +', value: '2100|99999' },
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
    || filters.colors.length
    || filters.needles.length
    || filters.meterage
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
  if (filters.colors.length)
    params.colors = filters.colors.join('|');
  if (filters.needles.length)
    params.needle = filters.needles.join('|');
  if (filters.meterage)
    params.meterage = filters.meterage;
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
