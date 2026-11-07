/** Relative Instagram-style age. Invalid/empty dates → empty string (never NaNd). */
export function formatRelative(iso: string): string {
  if (!iso || !iso.trim())
    return '';
  const time = new Date(iso).getTime();
  if (!Number.isFinite(time))
    return '';

  const diff = Date.now() - time;
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

  const weeks = Math.floor(days / 7);
  return Number.isFinite(weeks) ? `${weeks}w` : '';
}
