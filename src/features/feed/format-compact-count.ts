/**
 * Compact count for feed stats. Values above 9999 use one decimal + K
 * with a comma decimal separator (e.g. 12876 → 12,8K).
 */
export function formatCompactCount(count: number): string {
  const n = Math.max(0, Math.floor(count));
  if (n <= 9999)
    return String(n);

  // Truncate to one decimal so 12876 → 12,8K (not 12,9K).
  const tenths = Math.floor(n / 100) / 10;
  if (Number.isInteger(tenths))
    return `${tenths}K`;
  return `${String(tenths).replace('.', ',')}K`;
}
