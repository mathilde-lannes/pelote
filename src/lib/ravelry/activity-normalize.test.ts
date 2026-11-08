import {
  normalizeCreatedAt,
  resolveActivityType,
} from './activity-utils';

describe('resolveActivityType', () => {
  it('does not default missing type to project_photo', () => {
    expect(resolveActivityType({})).toBe('unknown');
  });

  it('maps aliases and infers favorites from title text', () => {
    expect(resolveActivityType({ type: 'Favourite' })).toBe('favorite');
    expect(resolveActivityType({ activity_type: 'project-photo' })).toBe(
      'project_photo',
    );
    expect(resolveActivityType({ type: 'project_added' })).toBe(
      'project_photo',
    );
    expect(resolveActivityType({ type: 'pattern_favorited' })).toBe(
      'favorite',
    );
    expect(
      resolveActivityType({ title: 'Favorited a pattern' }),
    ).toBe('favorite');
  });
});

describe('normalizeCreatedAt', () => {
  it('rejects empty or invalid timestamps', () => {
    expect(normalizeCreatedAt({ created_at: '' })).toBe('');
    expect(normalizeCreatedAt({ created_at: 'nope' })).toBe('');
    expect(normalizeCreatedAt({})).toBe('');
  });

  it('accepts valid ISO and alternate fields', () => {
    const iso = '2024-01-15T12:00:00.000Z';
    expect(normalizeCreatedAt({ created_at: iso })).toBe(iso);
    expect(normalizeCreatedAt({ created: iso })).toBe(iso);
  });
});
