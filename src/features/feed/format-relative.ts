function formatAbsolute(date: Date, now: Date): string {
  const sameYear = date.getFullYear() === now.getFullYear();
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
  });
}

/**
 * Instagram-style age for recent posts; absolute date once older than a week.
 * Invalid/empty dates → empty string (never NaNd).
 */
export function formatRelative(iso: string, nowMs: number = Date.now()): string {
  if (!iso || !iso.trim())
    return '';
  const date = new Date(iso);
  const time = date.getTime();
  if (!Number.isFinite(time))
    return '';

  const now = new Date(nowMs);
  const diff = nowMs - time;
  if (!Number.isFinite(diff))
    return '';

  const mins = Math.floor(diff / 60000);
  if (!Number.isFinite(mins))
    return '';
  if (mins < 60)
    return `${Math.max(1, mins)}m`;

  const hours = Math.floor(mins / 60);
  if (!Number.isFinite(hours))
    return '';
  if (hours < 24)
    return `${hours}h`;

  const days = Math.floor(hours / 24);
  if (!Number.isFinite(days))
    return '';
  if (days < 7)
    return `${days}d`;

  return formatAbsolute(date, now);
}
