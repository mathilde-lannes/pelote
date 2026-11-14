export type FeedMode = 'for-you' | 'friends';

export const FEED_MODE_OPTIONS = [
  { label: 'For you', value: 'for-you' as const },
  { label: 'Friends activity', value: 'friends' as const },
];

export function feedModeLabel(mode: FeedMode): string {
  return FEED_MODE_OPTIONS.find(option => option.value === mode)?.label
    ?? 'For you';
}
