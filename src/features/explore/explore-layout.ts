export const EXPLORE_GAP = 2;
export const EXPLORE_COLUMNS = 3;
export const EXPLORE_BLOCK_SIZE = 9;
export const EXPLORE_BLOCK_ROWS = 5;

export type ExplorePlacement = {
  col: number;
  row: number;
  span: number;
};

/**
 * Instagram explore mosaic, repeating every 9 photos / 5 rows:
 * a 2×2 tile on the left, then a 2×2 tile on the right, then a row of squares.
 */
export const EXPLORE_PLACEMENTS: ExplorePlacement[] = [
  { col: 0, row: 0, span: 2 },
  { col: 2, row: 0, span: 1 },
  { col: 2, row: 1, span: 1 },
  { col: 0, row: 2, span: 1 },
  { col: 1, row: 2, span: 2 },
  { col: 0, row: 3, span: 1 },
  { col: 0, row: 4, span: 1 },
  { col: 1, row: 4, span: 1 },
  { col: 2, row: 4, span: 1 },
];

export function exploreCellSize(width: number): number {
  return (width - EXPLORE_GAP * (EXPLORE_COLUMNS - 1)) / EXPLORE_COLUMNS;
}

export function exploreBlockHeight(cell: number): number {
  return EXPLORE_BLOCK_ROWS * cell + (EXPLORE_BLOCK_ROWS - 1) * EXPLORE_GAP;
}

export function chunkHighlights<T>(items: T[]): T[][] {
  const blocks: T[][] = [];
  for (let index = 0; index < items.length; index += EXPLORE_BLOCK_SIZE)
    blocks.push(items.slice(index, index + EXPLORE_BLOCK_SIZE));
  return blocks;
}

export function exploreTileFrame(placement: ExplorePlacement, cell: number) {
  const size = placement.span * cell + (placement.span - 1) * EXPLORE_GAP;
  return {
    left: placement.col * (cell + EXPLORE_GAP),
    top: placement.row * (cell + EXPLORE_GAP),
    size,
  };
}
