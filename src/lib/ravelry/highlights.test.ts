import {
  mergeHighlightPatterns,
  normalizeHighlights,
  normalizePattern,
  patternFromShowPayload,
  patternsFromListPayload,
} from './highlights';

const sweater = {
  id: 2,
  name: 'Cable Sweater',
  permalink: 'cable-sweater',
  favorites_count: 12,
  free: false,
  photos: [{ id: 9, square_url: 'https://img/sq', medium2_url: 'https://img/m2' }],
  pattern_author: {
    id: 4,
    name: 'Ada',
    users: [{ id: 8, username: 'ada', small_photo_url: 'https://img/ada' }],
  },
};

describe('normalizeHighlights', () => {
  it('reads timeline_entries and sorts newest first', () => {
    const highlights = normalizeHighlights({
      timeline_entries: [
        { timeline_date: '2024/11/01', pattern: { id: 1, name: 'Older' } },
        { timeline_date: '2024-11-03', pattern: sweater },
      ],
    });

    expect(highlights.map(item => item.pattern.id)).toEqual([2, 1]);
    expect(highlights[0]?.pattern.name).toBe('Cable Sweater');
    expect(highlights[0]?.pattern.photos[0]?.medium2_url).toBe('https://img/m2');
    expect(highlights[0]?.pattern.pattern_author?.users[0]?.username).toBe('ada');
  });

  it('accepts an object of entries or arrays, and a bare pattern', () => {
    const highlights = normalizeHighlights({
      timeline_entries: {
        a: { timeline_date: '2024-01-02', pattern: { id: 3, name: 'Hat' } },
        b: [
          { timeline_date: '2024-01-01', pattern: { id: 4, name: 'Sock' } },
        ],
        c: { id: 5, name: 'Shawl', permalink: 'shawl', timeline_date: '2024-01-04' },
      },
    });

    expect(highlights.map(item => item.pattern.name)).toEqual([
      'Shawl',
      'Hat',
      'Sock',
    ]);
  });

  it('reads first_photo when the photos list is missing', () => {
    const highlights = normalizeHighlights({
      timeline_entries: [{
        timeline_date: '2024-11-04',
        pattern: {
          id: 7,
          name: 'Mittens',
          first_photo: { id: 1, square_url: '//images.ravelrycache.com/sq.jpg' },
        },
      }],
    });

    expect(highlights[0]?.pattern.photos[0]?.square_url).toBe(
      'https://images.ravelrycache.com/sq.jpg',
    );
  });

  it('drops entries that are not patterns', () => {
    expect(normalizeHighlights({
      timeline_entries: [{ timeline_date: '2024-01-01', pattern: { name: 'no id' } }],
    })).toEqual([]);
  });
});

describe('pattern photos from GET /patterns.json', () => {
  it('reads the id-keyed patterns map and merges photos onto highlights', () => {
    const full = patternsFromListPayload({
      patterns: {
        1: {
          id: 1,
          name: 'Older',
          photos: [{ id: 4, square_url: 'https://images.example/older.jpg' }],
        },
      },
    }).flatMap((raw) => {
      const pattern = normalizePattern(raw);
      return pattern ? [pattern] : [];
    });

    const highlights = normalizeHighlights({
      timeline_entries: [
        { timeline_date: '2024-11-01', pattern: { id: 1, name: 'Older', first_photo_id: 4 } },
      ],
    });

    expect(highlights[0]?.pattern.photos).toEqual([]);
    expect(mergeHighlightPatterns(highlights, full)[0]?.pattern.photos[0]?.square_url)
      .toBe('https://images.example/older.jpg');
  });
});

describe('patternFromShowPayload', () => {
  it('reads the documented patterns root', () => {
    const pattern = patternFromShowPayload({ patterns: sweater }, 2);
    expect(pattern?.permalink).toBe('cable-sweater');
    expect(pattern?.favorites_count).toBe(12);
  });

  it('reads a pattern object keyed by id', () => {
    const pattern = patternFromShowPayload({ patterns: { 2: sweater } }, 2);
    expect(pattern?.id).toBe(2);
  });
});
