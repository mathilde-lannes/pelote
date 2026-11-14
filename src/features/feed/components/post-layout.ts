import { Dimensions } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;

/** 1:1 media plane — matches Post PhotoCarousel. */
export const POST_MEDIA_HEIGHT = SCREEN_WIDTH;

/** Reserved dots row below media (even when a post has one photo). */
export const POST_DOTS_HEIGHT = 22;

/** Author + title row. */
const HEADER_HEIGHT = 56;

/** Stats + bookmark row. */
const STATS_HEIGHT = 40;

/** Caption + bottom padding — always reserve notes line to avoid feed jumps. */
const CAPTION_HEIGHT = 88;

/**
 * Fixed row height for feeds that scroll-to-index.
 * Matches Post chrome with below-dots reserved.
 */
export const POST_ITEM_HEIGHT
  = POST_MEDIA_HEIGHT
    + POST_DOTS_HEIGHT
    + HEADER_HEIGHT
    + STATS_HEIGHT
    + CAPTION_HEIGHT;
