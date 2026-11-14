import {
  patternHref,
  patternProjectFeedHref,
  patternProjectsHref,
  searchResultsFeedHref,
} from './pattern-href';

describe('patternHref helpers', () => {
  it('uses home pattern paths by default', () => {
    expect(patternHref(12)).toBe('/pattern/12');
    expect(patternProjectsHref(12)).toBe('/pattern/12/projects');
    expect(patternProjectFeedHref(12, 99)).toBe('/pattern/12/projects/99');
  });

  it('keeps search stack paths when on search', () => {
    expect(patternHref(12, '/search')).toBe('/search/pattern/12');
    expect(patternHref(12, '/search/pattern/12')).toBe('/search/pattern/12');
    expect(patternProjectsHref(12, '/search/pattern/5')).toBe(
      '/search/pattern/12/projects',
    );
    expect(patternProjectFeedHref(12, 99, '/search/pattern/12/projects')).toBe(
      '/search/pattern/12/projects/99',
    );
  });

  it('builds a search-results feed url with the query', () => {
    expect(searchResultsFeedHref('folk socks', 42)).toBe(
      '/search/results/42?q=folk%20socks',
    );
    expect(searchResultsFeedHref('  ', 42)).toBeNull();
    expect(searchResultsFeedHref('socks', 0)).toBeNull();
  });
});
