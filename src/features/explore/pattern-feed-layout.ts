import type { PatternHighlight } from '@/lib/ravelry/types';
import { POST_ITEM_HEIGHT } from '@/features/feed/components/post-layout';

export { POST_ITEM_HEIGHT as PATTERN_POST_ITEM_HEIGHT };

/** Fixed height — matches shared Post; stable for scroll-to-index. */
export function patternPostItemHeight(_highlight: PatternHighlight): number {
  return POST_ITEM_HEIGHT;
}

export function patternPostOffset(
  highlights: readonly PatternHighlight[],
  index: number,
): number {
  return POST_ITEM_HEIGHT * Math.min(index, highlights.length);
}
