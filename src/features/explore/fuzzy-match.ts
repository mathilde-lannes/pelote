/** Normalize for fuzzy compare: case, accents, and extra whitespace. */
export function normalizeSearchText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
}

/**
 * Score how well `haystack` matches a fuzzy `needle`.
 * Returns null when there is no match — characters need not be contiguous.
 */
export function fuzzyScore(haystack: string, needle: string): number | null {
  const h = normalizeSearchText(haystack);
  const n = normalizeSearchText(needle);
  if (!n)
    return 0;
  if (!h)
    return null;

  if (h === n)
    return 10_000;
  if (h.startsWith(n))
    return 5_000 - h.length;
  if (h.includes(n))
    return 2_500 - h.indexOf(n);

  // Token match: every needle token appears somewhere (order free).
  const tokens = n.split(' ').filter(Boolean);
  if (tokens.length > 1 && tokens.every(token => h.includes(token)))
    return 1_500 + tokens.reduce((sum, token) => sum + token.length, 0);

  // Subsequence: “fls” matches “folklore socks”.
  let cursor = 0;
  let score = 0;
  let streak = 0;
  for (const char of n) {
    if (char === ' ')
      continue;
    const found = h.indexOf(char, cursor);
    if (found < 0)
      return null;
    streak = found === cursor ? streak + 1 : 1;
    score += streak * 3 - found * 0.01;
    cursor = found + 1;
  }
  return score;
}

/** Keep items that fuzzy-match `needle`, best scores first. */
export function fuzzyFilter<T>(
  items: readonly T[],
  needle: string,
  getText: (item: T) => string,
  limit = 20,
): T[] {
  const n = needle.trim();
  if (!n)
    return items.slice(0, limit);

  return items
    .map(item => ({ item, score: fuzzyScore(getText(item), n) }))
    .filter((row): row is { item: T; score: number } => row.score != null)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(row => row.item);
}
