import * as React from 'react';
import { useMMKVString } from 'react-native-mmkv';
import { Uniwind, useUniwind } from 'uniwind';

import { storage } from '../storage';

const SELECTED_THEME = 'SELECTED_THEME';
export type ColorSchemeType = 'light' | 'dark' | 'system';
/**
 * this hooks should only be used while selecting the theme
 * This hooks will return the selected theme which is stored in MMKV
 * selectedTheme should be one of the following values 'light', 'dark' or 'system'
 * don't use this hooks if you want to use it to style your component based on the theme use useUniwind from uniwind instead
 *
 * Pelote is dark-mode-only; light/system choices still resolve to dark.
 */
export function useSelectedTheme() {
  const { theme: _theme } = useUniwind();
  const [theme, _setTheme] = useMMKVString(SELECTED_THEME, storage);

  const setSelectedTheme = React.useCallback(
    (_t: ColorSchemeType) => {
      Uniwind.setTheme('dark');
      _setTheme('dark');
    },
    [_setTheme],
  );

  const selectedTheme = 'dark' as ColorSchemeType;
  void theme;
  return { selectedTheme, setSelectedTheme } as const;
}
// to be used in the root file to load the selected theme from MMKV
export function loadSelectedTheme() {
  Uniwind.setTheme('dark');
  storage.set(SELECTED_THEME, 'dark');
}
