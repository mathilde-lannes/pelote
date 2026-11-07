import type { Theme } from '@react-navigation/native';
import { DarkTheme as NavigationDarkTheme } from '@react-navigation/native';

import colors from '@/components/ui/colors';

const PeloteDarkTheme: Theme = {
  ...NavigationDarkTheme,
  colors: {
    ...NavigationDarkTheme.colors,
    primary: colors.white,
    background: colors.black,
    card: colors.ink[100],
    text: colors.white,
    border: colors.ink[300],
    notification: colors.danger[500],
  },
};

export function useThemeConfig() {
  // Pelote ships Instagram-like dark mode only.
  return PeloteDarkTheme;
}
