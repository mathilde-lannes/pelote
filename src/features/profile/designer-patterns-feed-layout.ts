import type { RavelryPattern } from '@/lib/ravelry/types';
import { FOR_YOU_POST_ITEM_HEIGHT } from '@/features/feed/for-you/for-you-post-layout';

export { FOR_YOU_POST_ITEM_HEIGHT as DESIGN_POST_ITEM_HEIGHT };

/** Fixed height — matches ForYouPost; ignores notes so scroll-to-index stays stable. */
export function designPostItemHeight(_pattern: RavelryPattern): number {
  return FOR_YOU_POST_ITEM_HEIGHT;
}

export function designPostOffset(
  patterns: ReadonlyArray<RavelryPattern>,
  index: number,
): number {
  return FOR_YOU_POST_ITEM_HEIGHT * Math.min(index, patterns.length);
}
