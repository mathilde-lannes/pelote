import {
  patternHref,
  patternProjectFeedHref,
  patternProjectsHref,
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
});
