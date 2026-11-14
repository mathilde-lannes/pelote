import { formatCompactCount } from './format-compact-count';

describe('formatCompactCount', () => {
  it('keeps values up to 9999 as plain integers', () => {
    expect(formatCompactCount(0)).toBe('0');
    expect(formatCompactCount(999)).toBe('999');
    expect(formatCompactCount(9999)).toBe('9999');
  });

  it('formats values above 9999 as K with a comma decimal', () => {
    expect(formatCompactCount(10000)).toBe('10K');
    expect(formatCompactCount(10100)).toBe('10,1K');
    expect(formatCompactCount(12876)).toBe('12,8K');
    expect(formatCompactCount(12000)).toBe('12K');
  });
});
