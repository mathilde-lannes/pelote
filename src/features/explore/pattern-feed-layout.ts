import type { PatternHighlight } from '@/lib/ravelry/types';
import { Dimensions } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;

/** 4:5 media plane — matches PhotoCarousel. */
export const PATTERN_POST_MEDIA_HEIGHT = Math.round(SCREEN_WIDTH * (5 / 4));

/** Designer row. */
const HEADER_HEIGHT = 64;

/** Likes + pattern name + padding (no notes). */
const CAPTION_BASE_HEIGHT = 68;

/** Collapsed notes (~2 lines) + spacing. */
const CAPTION_DESCRIPTION_HEIGHT = 48;

function hasNotes(highlight: PatternHighlight): boolean {
  const notes = highlight.pattern.notes_html;
  return typeof notes === 'string' && notes.replace(/<[^>]+>/g, '').trim().length > 0;
}

export function patternPostItemHeight(highlight: PatternHighlight): number {
  return PATTERN_POST_MEDIA_HEIGHT
    + HEADER_HEIGHT
    + CAPTION_BASE_HEIGHT
    + (hasNotes(highlight) ? CAPTION_DESCRIPTION_HEIGHT : 0);
}

export function patternPostOffset(
  highlights: readonly PatternHighlight[],
  index: number,
): number {
  let offset = 0;
  const end = Math.min(index, highlights.length);
  for (let i = 0; i < end; i += 1)
    offset += patternPostItemHeight(highlights[i]!);
  return offset;
}
