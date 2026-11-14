import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import type { RavelryPattern } from '@/lib/ravelry/types';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import * as React from 'react';
import { ActivityIndicator, View } from 'react-native';

import colors from '@/components/ui/colors';
import { Modal, Text } from '@/components/ui';
import { usePattern } from '@/features/explore/api';
import { formatYardage } from '@/features/feed/format-yardage';

type Props = {
  patternId: number;
  patternName?: string | null;
  /** Only fetch while the sheet has been opened at least once. */
  enabled?: boolean;
};

function formatGauge(pattern: RavelryPattern): string | null {
  const description = pattern.gauge_description?.trim();
  if (description)
    return description;

  const gauge = pattern.gauge;
  const divisor = pattern.gauge_divisor;
  if (gauge == null || divisor == null)
    return null;

  const stitches = Number.isInteger(gauge) ? String(gauge) : gauge.toFixed(1);
  const parts = [`${stitches} stitches`];
  if (pattern.row_gauge != null) {
    const rows = Number.isInteger(pattern.row_gauge)
      ? String(pattern.row_gauge)
      : pattern.row_gauge.toFixed(1);
    parts.push(`and ${rows} rows`);
  }
  parts.push(`= ${divisor} inches`);
  if (pattern.gauge_pattern)
    parts.push(`in ${pattern.gauge_pattern}`);
  return parts.join(' ');
}

function formatDifficulty(value: number | null | undefined): string | null {
  if (value == null || !Number.isFinite(value))
    return null;
  return value.toFixed(1);
}

function formatPrice(pattern: RavelryPattern): string | null {
  if (pattern.free)
    return 'Free';
  const amount = pattern.price?.trim();
  if (!amount)
    return null;
  const symbol = pattern.currency_symbol?.trim();
  if (symbol)
    return `${symbol}${amount}`;
  const currency = pattern.currency?.trim();
  if (currency)
    return `${amount} ${currency}`;
  return amount;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="border-b border-ink-300 px-5 py-3.5">
      <Text className="text-xs font-medium uppercase tracking-wide text-fog-500">
        {label}
      </Text>
      <Text className="mt-1 text-base text-white">
        {value}
      </Text>
    </View>
  );
}

function rowsForPattern(pattern: RavelryPattern): { label: string; value: string }[] {
  const needles = (pattern.pattern_needle_sizes ?? [])
    .map(needle => needle.name.trim())
    .filter(Boolean);
  const rows: { label: string; value: string }[] = [];

  const price = formatPrice(pattern);
  if (price)
    rows.push({ label: 'Price', value: price });
  if (pattern.craft_name)
    rows.push({ label: 'Craft', value: pattern.craft_name });
  if (pattern.pattern_type_name)
    rows.push({ label: 'Type', value: pattern.pattern_type_name });
  if (pattern.yarn_weight_description)
    rows.push({ label: 'Yarn weight', value: pattern.yarn_weight_description });
  const gauge = formatGauge(pattern);
  if (gauge)
    rows.push({ label: 'Gauge', value: gauge });
  if (needles.length)
    rows.push({ label: needles.length === 1 ? 'Needle size' : 'Needle sizes', value: needles.join(', ') });
  const yardage = formatYardage(pattern.yardage_description);
  if (yardage)
    rows.push({ label: 'Yardage', value: yardage });
  if (pattern.sizes_available)
    rows.push({ label: 'Sizes', value: pattern.sizes_available });
  const difficulty = formatDifficulty(pattern.difficulty_average);
  if (difficulty)
    rows.push({ label: 'Difficulty', value: difficulty });

  return rows;
}

export function PatternInfoSheet({
  ref,
  patternId,
  patternName,
  enabled = false,
}: Props & { ref?: React.RefObject<BottomSheetModal | null> }) {
  const query = usePattern({
    variables: { id: patternId },
    enabled: enabled && patternId > 0,
    retry: (failureCount, error) => {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 403 || status === 404)
        return false;
      return failureCount < 2;
    },
  });

  const pattern = query.data;
  const title = pattern?.name || patternName || 'Pattern info';
  const rows = pattern ? rowsForPattern(pattern) : [];

  const renderHandle = React.useCallback(
    () => (
      <View className="items-center border-b border-ink-300 bg-black pt-2 pb-3">
        <View
          className="mb-3 h-1 w-12 rounded-lg"
          style={{ backgroundColor: colors.ink[500] }}
        />
        <Text className="px-10 text-center text-base font-bold text-white" numberOfLines={2}>
          {title}
        </Text>
      </View>
    ),
    [title],
  );

  return (
    <Modal
      ref={ref}
      snapPoints={['55%', '80%']}
      backgroundStyle={{ backgroundColor: colors.black }}
      handleComponent={renderHandle}
    >
      <BottomSheetScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        className="bg-black"
      >
        {query.isPending && !pattern
          ? (
              <View className="items-center py-10">
                <ActivityIndicator color="#ffffff" />
              </View>
            )
          : null}

        {query.isError && !pattern
          ? (
              <View className="px-5 py-8">
                <Text className="text-center text-sm text-fog-400">
                  Couldn't load pattern details.
                </Text>
              </View>
            )
          : null}

        {pattern && !rows.length
          ? (
              <View className="px-5 py-8">
                <Text className="text-center text-sm text-fog-400">
                  No craft details listed for this pattern.
                </Text>
              </View>
            )
          : null}

        {rows.map(row => (
          <InfoRow key={row.label} label={row.label} value={row.value} />
        ))}
      </BottomSheetScrollView>
    </Modal>
  );
}
