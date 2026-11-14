import {
  designerDesignsFeedHref,
  designerProfileHref,
  userProfileHref,
  userProjectFeedHref,
} from './designer-profile-href';

describe('designerProfileHref', () => {
  it('forwards designer permalink and id for brand accounts', () => {
    expect(designerProfileHref({
      id: 42,
      name: 'LE KNIT',
      permalink: 'le-knit-dk',
      users: [{ id: 9, username: 'leknit', small_photo_url: null, photo_url: null }],
    })).toBe('/user/leknit?designer=le-knit-dk&designer_id=42');
  });

  it('falls back to permalink when no linked user', () => {
    expect(designerProfileHref({
      id: 42,
      name: 'LE KNIT',
      permalink: 'le-knit-dk',
      users: [],
    })).toBe('/user/le-knit-dk?designer=le-knit-dk&designer_id=42');
  });

  it('returns null without a route key', () => {
    expect(designerProfileHref({
      id: 0,
      name: 'Unknown',
      permalink: null,
      users: [],
    })).toBeNull();
  });

  it('keeps search stack paths when on search', () => {
    expect(designerProfileHref({
      id: 42,
      name: 'LE KNIT',
      permalink: 'le-knit-dk',
      users: [{ id: 9, username: 'leknit', small_photo_url: null, photo_url: null }],
    }, '/search/pattern/1')).toBe(
      '/search/user/leknit?designer=le-knit-dk&designer_id=42',
    );
  });
});

describe('designerDesignsFeedHref', () => {
  it('opens designs feed at the pattern id', () => {
    expect(designerDesignsFeedHref({
      id: 42,
      name: 'LE KNIT',
      permalink: 'le-knit-dk',
      users: [{ id: 9, username: 'leknit', small_photo_url: null, photo_url: null }],
    }, 99)).toBe('/user/leknit/designs/99?designer=le-knit-dk&designer_id=42');
  });

  it('returns null without a pattern id', () => {
    expect(designerDesignsFeedHref({
      id: 42,
      name: 'LE KNIT',
      permalink: 'le-knit-dk',
      users: [],
    }, 0)).toBeNull();
  });

  it('keeps search stack paths when on search', () => {
    expect(designerDesignsFeedHref({
      id: 42,
      name: 'LE KNIT',
      permalink: 'le-knit-dk',
      users: [{ id: 9, username: 'leknit', small_photo_url: null, photo_url: null }],
    }, 99, '/search')).toBe(
      '/search/user/leknit/designs/99?designer=le-knit-dk&designer_id=42',
    );
  });
});

describe('user profile href helpers', () => {
  it('uses home paths by default', () => {
    expect(userProfileHref('ada')).toBe('/user/ada');
    expect(userProjectFeedHref('ada', 7)).toBe('/user/ada/feed/7');
  });

  it('prefixes search stack paths', () => {
    expect(userProfileHref('ada', '/search/pattern/1')).toBe('/search/user/ada');
    expect(userProjectFeedHref('ada', 7, '/search/user/ada')).toBe(
      '/search/user/ada/feed/7',
    );
  });
});
