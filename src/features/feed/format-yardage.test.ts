import { formatYardage } from './format-yardage';

describe('formatYardage', () => {
  it('appends meters for a yards range', () => {
    expect(formatYardage('1000 - 1200 yards')).toBe(
      '1000 - 1200 yards (914 - 1097 m)',
    );
  });

  it('appends meters for a single yardage', () => {
    expect(formatYardage('800 yards')).toBe('800 yards (732 m)');
  });

  it('handles yds abbreviation', () => {
    expect(formatYardage('500 yds')).toBe('500 yds (457 m)');
  });

  it('leaves metric descriptions unchanged', () => {
    expect(formatYardage('900 - 1100 meters')).toBe('900 - 1100 meters');
    expect(formatYardage('750 metres')).toBe('750 metres');
  });

  it('returns null for empty input', () => {
    expect(formatYardage(null)).toBeNull();
    expect(formatYardage('  ')).toBeNull();
  });
});
