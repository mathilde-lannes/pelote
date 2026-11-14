import { formatRelative } from './format-relative';

describe('formatRelative', () => {
  it('returns empty string for invalid or empty dates (never NaNd)', () => {
    expect(formatRelative('')).toBe('');
    expect(formatRelative('   ')).toBe('');
    expect(formatRelative('not-a-date')).toBe('');
  });

  it('formats recent times as m/h/d', () => {
    const now = Date.now();
    expect(formatRelative(new Date(now - 5 * 60_000).toISOString(), now)).toBe('5m');
    expect(formatRelative(new Date(now - 3 * 3_600_000).toISOString(), now)).toBe('3h');
    expect(formatRelative(new Date(now - 2 * 86_400_000).toISOString(), now)).toBe('2d');
  });

  it('formats older than a week as an absolute date without year in the same year', () => {
    const now = new Date('2026-11-14T12:00:00.000Z').getTime();
    const twoWeeksAgo = new Date('2026-10-31T12:00:00.000Z').toISOString();
    expect(formatRelative(twoWeeksAgo, now)).toBe('Oct 31');
  });

  it('includes the year when the date is not in the current year', () => {
    const now = new Date('2026-11-14T12:00:00.000Z').getTime();
    const lastYear = new Date('2025-03-04T12:00:00.000Z').toISOString();
    expect(formatRelative(lastYear, now)).toBe('Mar 4, 2025');
  });
});
