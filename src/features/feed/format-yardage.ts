const YARDS_TO_METERS = 0.9144;

function yardsToMeters(yards: number): number {
  return Math.round(yards * YARDS_TO_METERS);
}

/**
 * Keep Ravelry's yardage string, and when it's in yards append meters.
 * e.g. "1000 - 1200 yards" → "1000 - 1200 yards (914 - 1097 m)"
 */
export function formatYardage(description: string | null | undefined): string | null {
  const text = description?.trim();
  if (!text)
    return null;

  if (!/\b(yards?|yds?)\b/i.test(text))
    return text;

  const numbers = [...text.matchAll(/(\d+(?:\.\d+)?)/g)]
    .map(match => Number(match[1]))
    .filter(value => Number.isFinite(value));
  if (!numbers.length)
    return text;

  const meters = numbers.map(yardsToMeters);
  const metersLabel
    = meters.length === 1
      ? `${meters[0]} m`
      : `${meters.join(' - ')} m`;

  return `${text} (${metersLabel})`;
}
