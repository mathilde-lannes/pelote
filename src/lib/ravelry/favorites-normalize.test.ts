import {
  favoriteLookupKey,
  normalizeFavorite,
} from './favorites-utils';

describe('normalizeFavorite', () => {
  it('maps create-style payloads with type_id', () => {
    expect(
      normalizeFavorite({
        id: 9,
        type: 'pattern',
        type_id: 42,
        created_at: '2026-01-01',
      }),
    ).toEqual({
      id: 9,
      type: 'pattern',
      type_id: 42,
      created_at: '2026-01-01',
    });
  });

  it('maps list-style payloads with nested favorited', () => {
    expect(
      normalizeFavorite({
        id: 11,
        type: 'projects',
        favorited: { id: 77, name: 'Fog Harbor' },
      }),
    ).toEqual({
      id: 11,
      type: 'project',
      type_id: 77,
      created_at: null,
    });
  });

  it('returns null when ids are missing', () => {
    expect(normalizeFavorite({ type: 'pattern' })).toBeNull();
    expect(normalizeFavorite(null)).toBeNull();
  });
});

describe('favoriteLookupKey', () => {
  it('joins type and id', () => {
    expect(favoriteLookupKey('pattern', 12)).toBe('pattern:12');
  });
});
