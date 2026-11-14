import type { RavelryProject } from '@/lib/ravelry/types';
import { POST_ITEM_HEIGHT } from '@/features/feed/components/post-layout';

export { POST_ITEM_HEIGHT as PROFILE_POST_ITEM_HEIGHT };

/** Fixed height — matches shared Post; stable for scroll-to-index. */
export function profilePostItemHeight(_project: RavelryProject): number {
  return POST_ITEM_HEIGHT;
}

export function profilePostOffset(
  projects: ReadonlyArray<RavelryProject>,
  index: number,
): number {
  return POST_ITEM_HEIGHT * Math.min(index, projects.length);
}
