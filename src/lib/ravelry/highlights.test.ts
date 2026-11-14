import {
  mergeHighlightPatterns,
  normalizeHighlights,
  normalizePattern,
  patternFromShowPayload,
  patternsFromListPayload,
  sliceHighlightPage,
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

  it('pages highlights without dropping the rest of the timeline', () => {
    const highlights = [1, 2, 3].map(id => ({
      id: String(id),
      timeline_date: null,
      pattern: {
        id,
        name: `P${id}`,
        photos: [],
        pattern_author: null,
      },
    }));
    const page = sliceHighlightPage(highlights, 2, 2);
    expect(page.highlights.map(item => item.pattern.id)).toEqual([3]);
    expect(page.total).toBe(3);
    expect(page.page * page.pageSize >= page.total).toBe(true);
  });

  it('drops entries that are not patterns', () => {
    expect(normalizeHighlights({
      timeline_entries: [{ timeline_date: '2024-01-01', pattern: { name: 'no id' } }],
    })).toEqual([]);
  });
});

describe('normalizePattern Pattern#list', () => {
  it('reads designer (search list) as pattern_author', () => {
    const pattern = normalizePattern({
      id: 99,
      name: 'Zosia Sweater',
      first_photo: { id: 1, square_url: 'https://img/z.jpg' },
      designer: {
        id: 7,
        name: 'Mochi Knits',
        permalink: 'mochiknits',
        users: [{ id: 8, username: 'mochiknits' }],
      },
    });
    expect(pattern?.pattern_author?.permalink).toBe('mochiknits');
    expect(pattern?.pattern_author?.users[0]?.username).toBe('mochiknits');
    expect(pattern?.photos[0]?.square_url).toBe('https://img/z.jpg');
  });
});

describe('normalizePattern Pattern#full craft fields', () => {
  it('maps yarn weight, gauge, and needle sizes', () => {
    const pattern = normalizePattern({
      id: 42,
      name: 'Sample',
      craft: { name: 'Knitting' },
      pattern_type: { name: 'Pullover' },
      yarn_weight_description: 'DK (11 wpi)',
      gauge_description: '22 stitches and 30 rows = 4 inches in Stockinette',
      free: false,
      price: 6.5,
      currency: 'USD',
      currency_symbol: '$',
      yardage_description: '1000 - 1200 yards',
      sizes_available: 'XS-3XL',
      difficulty_average: 2.4,
      pattern_needle_sizes: [
        { id: 1, name: 'US 6 - 4.0 mm', metric: 4, us: '6', knitting: true },
        { id: 2, name: 'US 4 - 3.5 mm', metric: 3.5, us: '4', knitting: true },
      ],
    });

    expect(pattern?.craft_name).toBe('Knitting');
    expect(pattern?.pattern_type_name).toBe('Pullover');
    expect(pattern?.yarn_weight_description).toBe('DK (11 wpi)');
    expect(pattern?.gauge_description).toContain('Stockinette');
    expect(pattern?.pattern_needle_sizes).toHaveLength(2);
    expect(pattern?.pattern_needle_sizes?.[0]?.name).toBe('US 6 - 4.0 mm');
    expect(pattern?.difficulty_average).toBe(2.4);
    expect(pattern?.free).toBe(false);
    expect(pattern?.price).toBe('6.5');
    expect(pattern?.currency_symbol).toBe('$');
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
