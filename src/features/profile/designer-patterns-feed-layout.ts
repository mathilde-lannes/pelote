import type { RavelryPattern } from '@/lib/ravelry/types';
import { POST_ITEM_HEIGHT } from '@/features/feed/components/post-layout';

export { POST_ITEM_HEIGHT as DESIGN_POST_ITEM_HEIGHT };

/** Fixed height — matches shared Post; stable for scroll-to-index. */
export function designPostItemHeight(_pattern: RavelryPattern): number {
  return POST_ITEM_HEIGHT;
}

export function designPostOffset(
  patterns: ReadonlyArray<RavelryPattern>,
  index: number,
): number {
  return POST_ITEM_HEIGHT * Math.min(index, patterns.length);
}
