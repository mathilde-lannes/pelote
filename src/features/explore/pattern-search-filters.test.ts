import {
  EMPTY_PATTERN_SEARCH_FILTERS,
  hasActivePatternFilters,
  patternFiltersToParams,
  toggleMultiValue,
} from './pattern-search-filters';

describe('pattern search filters', () => {
  it('reports inactive for empty filters', () => {
    expect(hasActivePatternFilters(EMPTY_PATTERN_SEARCH_FILTERS)).toBe(false);
  });

  it('reports active when any facet is set', () => {
    expect(hasActivePatternFilters({
      ...EMPTY_PATTERN_SEARCH_FILTERS,
      craft: 'knitting',
    })).toBe(true);
    expect(hasActivePatternFilters({
      ...EMPTY_PATTERN_SEARCH_FILTERS,
      photo: true,
    })).toBe(true);
  });

  it('serializes multi-value facets with pipe separators', () => {
    expect(patternFiltersToParams({
      ...EMPTY_PATTERN_SEARCH_FILTERS,
      craft: 'crochet',
      weights: ['fingering', 'dk'],
      categories: ['hat'],
      fits: ['baby', 'child'],
      colors: ['2', '6'],
      needles: ['us-6', 'us-8'],
      meterage: '400|800',
      availability: 'free',
      language: 'en',
      photo: true,
    })).toEqual({
      craft: 'crochet',
      weight: 'fingering|dk',
      pc: 'hat',
      fit: 'baby|child',
      colors: '2|6',
      needle: 'us-6|us-8',
      meterage: '400|800',
      availability: 'free',
      language: 'en',
      photo: 'yes',
    });
  });

  it('treats colors, needles, and meterage as active filters', () => {
    expect(hasActivePatternFilters({
      ...EMPTY_PATTERN_SEARCH_FILTERS,
      colors: ['1'],
    })).toBe(true);
    expect(hasActivePatternFilters({
      ...EMPTY_PATTERN_SEARCH_FILTERS,
      needles: ['us-6'],
    })).toBe(true);
    expect(hasActivePatternFilters({
      ...EMPTY_PATTERN_SEARCH_FILTERS,
      meterage: '450|600',
    })).toBe(true);
  });

  it('toggles multi-select values', () => {
    expect(toggleMultiValue(['dk'], 'fingering')).toEqual(['dk', 'fingering']);
    expect(toggleMultiValue(['dk', 'fingering'], 'dk')).toEqual(['fingering']);
  });
});
