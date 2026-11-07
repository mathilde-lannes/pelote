import type { Theme } from '@react-navigation/native';
import { DefaultTheme } from '@react-navigation/native';

import colors from '@/components/ui/colors';

const LightTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.rust[500],
    background: colors.oat[100],
    card: colors.oat[50],
    text: colors.charcoal[900],
    border: colors.charcoal[200],
    notification: colors.rust[500],
  },
};

export function useThemeConfig() {
  // Pelote ships light-first cosy autumn chrome.
  return LightTheme;
}
