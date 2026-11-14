import { fuzzyFilter, fuzzyScore, normalizeSearchText } from './fuzzy-match';

describe('normalizeSearchText', () => {
  it('lowercases and strips accents', () => {
    expect(normalizeSearchText('  Café  SOCKS ')).toBe('cafe socks');
  });
});

describe('fuzzyScore', () => {
  it('matches substrings and subsequences without requiring exact text', () => {
    expect(fuzzyScore('Folklore Socks', 'folk')).not.toBeNull();
    expect(fuzzyScore('Folklore Socks', 'fls')).not.toBeNull();
    expect(fuzzyScore('Folklore Socks', 'zzz')).toBeNull();
  });

  it('ranks closer matches higher', () => {
    const exact = fuzzyScore('socks', 'socks');
    const prefix = fuzzyScore('socks pattern', 'socks');
    const sub = fuzzyScore('warm socks', 'socks');
    expect(exact!).toBeGreaterThan(prefix!);
    expect(prefix!).toBeGreaterThan(sub!);
  });
});

describe('fuzzyFilter', () => {
  it('filters and sorts by score', () => {
    const items = ['Aran Cardigan', 'Socks', 'Sock Yarn Shawl', 'Cowl'];
    expect(fuzzyFilter(items, 'sock', item => item)).toEqual([
      'Socks',
      'Sock Yarn Shawl',
    ]);
  });
});
