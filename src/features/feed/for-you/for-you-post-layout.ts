import { Dimensions } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;

/** 1:1 media plane — matches ForYouPost PhotoCarousel. */
export const FOR_YOU_POST_MEDIA_HEIGHT = SCREEN_WIDTH;

/** Reserved dots row below media (even when a post has one photo). */
export const FOR_YOU_POST_DOTS_HEIGHT = 22;

/** Designer + pattern name row. */
const HEADER_HEIGHT = 56;

/** Favorites / projects / comments / yarn + bookmark. */
const STATS_HEIGHT = 40;

/** Caption + bottom padding — always reserve notes line to avoid feed jumps. */
const CAPTION_HEIGHT = 88;

/**
 * Fixed row height for pattern feeds that scroll-to-index.
 * Matches ForYouPost chrome with below-dots reserved.
 */
export const FOR_YOU_POST_ITEM_HEIGHT
  = FOR_YOU_POST_MEDIA_HEIGHT
    + FOR_YOU_POST_DOTS_HEIGHT
    + HEADER_HEIGHT
    + STATS_HEIGHT
    + CAPTION_HEIGHT;
