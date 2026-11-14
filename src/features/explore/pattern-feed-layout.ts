import type { PatternHighlight } from '@/lib/ravelry/types';
import { FOR_YOU_POST_ITEM_HEIGHT } from '@/features/feed/for-you/for-you-post-layout';

export { FOR_YOU_POST_ITEM_HEIGHT as PATTERN_POST_ITEM_HEIGHT };

/** Fixed height — matches ForYouPost; ignores notes so scroll-to-index stays stable. */
export function patternPostItemHeight(_highlight: PatternHighlight): number {
  return FOR_YOU_POST_ITEM_HEIGHT;
}

export function patternPostOffset(
  highlights: readonly PatternHighlight[],
  index: number,
): number {
  return FOR_YOU_POST_ITEM_HEIGHT * Math.min(index, highlights.length);
}
