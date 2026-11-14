import type { RavelryPattern } from '@/lib/ravelry/types';
import { Dimensions } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;

/** 4:5 media plane — matches PhotoCarousel. */
export const DESIGN_POST_MEDIA_HEIGHT = Math.round(SCREEN_WIDTH * (5 / 4));

/** Avatar + designer + date row. */
const HEADER_HEIGHT = 64;

/** Likes + designer/pattern name + padding (no notes). */
const CAPTION_BASE_HEIGHT = 68;

/** Collapsed notes (~2 lines) + spacing. */
const CAPTION_DESCRIPTION_HEIGHT = 48;

function hasPatternNotes(pattern: RavelryPattern): boolean {
  const notes = pattern.notes_html;
  return typeof notes === 'string' && notes.replace(/<[^>]+>/g, '').trim().length > 0;
}

export function designPostChromeHeight(hasDescription: boolean): number {
  return HEADER_HEIGHT
    + CAPTION_BASE_HEIGHT
    + (hasDescription ? CAPTION_DESCRIPTION_HEIGHT : 0);
}

export function designPostItemHeight(pattern: RavelryPattern): number {
  return DESIGN_POST_MEDIA_HEIGHT
    + designPostChromeHeight(hasPatternNotes(pattern));
}

/** Tallest fixed row (with collapsed notes) — safe minHeight when expanded. */
export const DESIGN_POST_ITEM_HEIGHT
  = DESIGN_POST_MEDIA_HEIGHT + designPostChromeHeight(true);

export function designPostOffset(
  patterns: ReadonlyArray<RavelryPattern>,
  index: number,
): number {
  let offset = 0;
  const end = Math.min(index, patterns.length);
  for (let i = 0; i < end; i += 1)
    offset += designPostItemHeight(patterns[i]!);
  return offset;
}
