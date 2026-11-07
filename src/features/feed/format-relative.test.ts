import { formatRelative } from './format-relative';

describe('formatRelative', () => {
  it('returns empty string for invalid or empty dates (never NaNd)', () => {
    expect(formatRelative('')).toBe('');
    expect(formatRelative('   ')).toBe('');
    expect(formatRelative('not-a-date')).toBe('');
  });

  it('formats recent times as m/h/d/w', () => {
    const now = Date.now();
    expect(formatRelative(new Date(now - 5 * 60_000).toISOString())).toBe('5m');
    expect(formatRelative(new Date(now - 3 * 3_600_000).toISOString())).toBe('3h');
    expect(formatRelative(new Date(now - 2 * 86_400_000).toISOString())).toBe('2d');
    expect(formatRelative(new Date(now - 14 * 86_400_000).toISOString())).toBe('2w');
  });
});
