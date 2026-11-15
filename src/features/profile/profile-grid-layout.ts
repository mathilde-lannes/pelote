import { Dimensions } from 'react-native';

export const PROFILE_GRID_GAP = 2;
export const PROFILE_GRID_COLS = 3;

export const PROFILE_GRID_TILE
  = (Dimensions.get('window').width
    - PROFILE_GRID_GAP * (PROFILE_GRID_COLS - 1))
  / PROFILE_GRID_COLS;
