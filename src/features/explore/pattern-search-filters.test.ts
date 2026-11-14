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
      availability: 'free',
      language: 'en',
      photo: true,
    })).toEqual({
      craft: 'crochet',
      weight: 'fingering|dk',
      pc: 'hat',
      fit: 'baby|child',
      availability: 'free',
      language: 'en',
      photo: 'yes',
    });
  });

  it('toggles multi-select values', () => {
    expect(toggleMultiValue(['dk'], 'fingering')).toEqual(['dk', 'fingering']);
    expect(toggleMultiValue(['dk', 'fingering'], 'dk')).toEqual(['fingering']);
  });
});
