import type { RavelryProject } from '@/lib/ravelry/types';
import { Dimensions } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;

/** 4:5 media plane — matches PhotoCarousel. */
export const PROFILE_POST_MEDIA_HEIGHT = Math.round(SCREEN_WIDTH * (5 / 4));

/** Avatar + username + date row. */
const HEADER_HEIGHT = 64;

/** Likes + username/project name + padding (no description). */
const CAPTION_BASE_HEIGHT = 68;

/** Collapsed description (~2 lines) + spacing. */
const CAPTION_DESCRIPTION_HEIGHT = 48;

function hasProjectDescription(project: RavelryProject): boolean {
  const notes = project.notes_html;
  return typeof notes === 'string' && notes.replace(/<[^>]+>/g, '').trim().length > 0;
}

export function profilePostChromeHeight(hasDescription: boolean): number {
  return HEADER_HEIGHT
    + CAPTION_BASE_HEIGHT
    + (hasDescription ? CAPTION_DESCRIPTION_HEIGHT : 0);
}

export function profilePostItemHeight(project: RavelryProject): number {
  return PROFILE_POST_MEDIA_HEIGHT
    + profilePostChromeHeight(hasProjectDescription(project));
}

/** Tallest fixed row (with collapsed description) — used as a safe minHeight when expanded. */
export const PROFILE_POST_ITEM_HEIGHT
  = PROFILE_POST_MEDIA_HEIGHT + profilePostChromeHeight(true);

export function profilePostOffset(
  projects: ReadonlyArray<RavelryProject>,
  index: number,
): number {
  let offset = 0;
  const end = Math.min(index, projects.length);
  for (let i = 0; i < end; i += 1)
    offset += profilePostItemHeight(projects[i]!);
  return offset;
}
