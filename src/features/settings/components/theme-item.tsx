import * as React from 'react';

import { SettingsItem } from './settings-item';

/** Pelote is dark-mode-only; theme picker is informational. */
export function ThemeItem() {
  return (
    <SettingsItem
      text="settings.theme.title"
      value="Dark"
    />
  );
}
