import {
  EXPLORE_BLOCK_ROWS,
  EXPLORE_COLUMNS,
  EXPLORE_PLACEMENTS,
} from './explore-layout';

describe('explore mosaic', () => {
  it('fills a 3×5 block without overlapping cells', () => {
    const occupied = new Set<string>();

    for (const placement of EXPLORE_PLACEMENTS) {
      for (let row = 0; row < placement.span; row++) {
        for (let col = 0; col < placement.span; col++) {
          const x = placement.col + col;
          const y = placement.row + row;
          const key = `${x},${y}`;
          expect(x).toBeGreaterThanOrEqual(0);
          expect(y).toBeGreaterThanOrEqual(0);
          expect(x).toBeLessThan(EXPLORE_COLUMNS);
          expect(y).toBeLessThan(EXPLORE_BLOCK_ROWS);
          expect(occupied.has(key)).toBe(false);
          occupied.add(key);
        }
      }
    }

    expect(occupied.size).toBe(EXPLORE_COLUMNS * EXPLORE_BLOCK_ROWS);
  });
});
