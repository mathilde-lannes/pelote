import { Dimensions } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;

/** 4:5 media plane — matches PhotoCarousel. */
export const PROFILE_POST_MEDIA_HEIGHT = Math.round(SCREEN_WIDTH * (5 / 4));

/** Username row + caption block + bottom margin. */
export const PROFILE_POST_CHROME_HEIGHT = 56 + 96 + 24;

/**
 * Fixed row height so FlatList getItemLayout / initialScrollIndex stay accurate
 * and the profile feed can scroll both up and down from the tapped post.
 */
export const PROFILE_POST_ITEM_HEIGHT
  = PROFILE_POST_MEDIA_HEIGHT + PROFILE_POST_CHROME_HEIGHT;
