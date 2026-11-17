import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import type { RavelryPattern } from '@/lib/ravelry/types';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import { Link, usePathname } from 'expo-router';
import * as React from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { Modal, Text } from '@/components/ui';
import colors from '@/components/ui/colors';
import { ArrowRight } from '@/components/ui/icons';
import { usePattern } from '@/features/explore/api';
import { patternHref } from '@/features/explore/pattern-href';
import { formatYardage } from '@/features/feed/format-yardage';
import { designerProfileHref } from '@/features/profile/designer-profile-href';

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
      <Text className="text-xs font-medium tracking-wide text-fog-500 uppercase">
        {label}
      </Text>
      <Text className="mt-1 text-base text-white">
        {value}
      </Text>
    </View>
  );
}

function DesignerLinkRow({
  href,
  name,
  photoUri,
  onPress,
}: {
  href: string;
  name: string;
  photoUri: string | null;
  onPress?: () => void;
}) {
  const initial = (name || '?').slice(0, 1).toUpperCase();
  return (
    <View className="border-b border-ink-300">
      <Text className="px-5 pt-3.5 text-xs font-medium tracking-wide text-fog-500 uppercase">
        Designer
      </Text>
      <Link href={href as never} asChild>
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={`Designer ${name}`}
          className="flex-row items-center gap-3 px-5 pt-2 pb-3.5"
        >
          {photoUri
            ? (
                <Image
                  source={{ uri: photoUri }}
                  style={{ width: 48, height: 48, borderRadius: 24 }}
                  contentFit="cover"
                />
              )
            : (
                <View className="size-12 items-center justify-center rounded-full bg-ink-300">
                  <Text className="font-semibold text-white">
                    {initial}
                  </Text>
                </View>
              )}
          <View className="min-w-0 flex-1">
            <Text className="text-base text-white" numberOfLines={1}>
              {name}
            </Text>
          </View>
          <ArrowRight color={colors.fog[400]} />
        </Pressable>
      </Link>
    </View>
  );
}

function PatternPageLink({
  patternId,
  name,
  onPress,
}: {
  patternId: number;
  name: string;
  onPress?: () => void;
}) {
  const pathname = usePathname();
  return (
    <Link href={patternHref(patternId, pathname) as never} asChild>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Pattern ${name}`}
        className="flex-row items-center gap-3 border-b border-ink-300 px-5 py-3.5"
      >
        <View className="min-w-0 flex-1">
          <Text className="text-xs font-medium tracking-wide text-fog-500 uppercase">
            Pattern
          </Text>
          <Text className="mt-1 text-base text-white" numberOfLines={1}>
            {name}
          </Text>
        </View>
        <ArrowRight color={colors.fog[400]} />
      </Pressable>
    </Link>
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

function PatternInfoBody({
  patternId,
  title,
  pattern,
  rows,
  pending,
  failed,
  designerName,
  designerPhoto,
  designerLink,
  onDismiss,
}: {
  patternId: number;
  title: string;
  pattern: RavelryPattern | undefined;
  rows: { label: string; value: string }[];
  pending: boolean;
  failed: boolean;
  designerName: string | null;
  designerPhoto: string | null;
  designerLink: string | null;
  onDismiss: () => void;
}) {
  return (
    <>
      {pending && !pattern
        ? (
            <View className="items-center py-10">
              <ActivityIndicator color="#ffffff" />
            </View>
          )
        : null}
      {failed && !pattern
        ? (
            <View className="px-5 py-8">
              <Text className="text-center text-sm text-fog-400">
                Couldn't load pattern details.
              </Text>
            </View>
          )
        : null}
      {patternId > 0
        ? (
            <PatternPageLink
              patternId={patternId}
              name={title}
              onPress={onDismiss}
            />
          )
        : null}
      {designerName && designerLink
        ? (
            <DesignerLinkRow
              href={designerLink}
              name={designerName}
              photoUri={designerPhoto}
              onPress={onDismiss}
            />
          )
        : designerName
          ? <InfoRow label="Designer" value={designerName} />
          : null}
      {pattern && !rows.length && !designerName
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
    </>
  );
}

export function PatternInfoSheet({
  ref,
  patternId,
  patternName,
  enabled = false,
}: Props & { ref?: React.RefObject<BottomSheetModal | null> }) {
  const pathname = usePathname();
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
  const author = pattern?.pattern_author;
  const designerName
    = author?.name?.trim()
      || author?.users?.[0]?.username?.trim()
      || null;
  const designerPhoto
    = author?.users?.[0]?.small_photo_url?.trim()
      || author?.users?.[0]?.photo_url?.trim()
      || null;
  const designerLink = designerProfileHref(author, pathname);
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
        <PatternInfoBody
          patternId={patternId}
          title={title}
          pattern={pattern}
          rows={rows}
          pending={query.isPending}
          failed={query.isError}
          designerName={designerName}
          designerPhoto={designerPhoto}
          designerLink={designerLink}
          onDismiss={() => ref?.current?.dismiss()}
        />
      </BottomSheetScrollView>
    </Modal>
  );
}
