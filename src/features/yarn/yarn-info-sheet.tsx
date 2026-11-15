import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import type { RavelryYarn } from '@/lib/ravelry/types';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import { Link, usePathname } from 'expo-router';
import * as React from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

import colors from '@/components/ui/colors';
import { Modal, Text } from '@/components/ui';
import { ArrowRight } from '@/components/ui/icons';
import { useYarn, useYarnCompany } from './api';
import { dyerHref } from './yarn-href';

type Props = {
  yarnId: number;
  yarnName?: string | null;
  /** Only fetch while the sheet has been opened at least once. */
  enabled?: boolean;
};

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

function DyerLinkRow({
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
      <Text className="px-5 pt-3.5 text-xs font-medium uppercase tracking-wide text-fog-500">
        Dyer
      </Text>
      <Link href={href as never} asChild>
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={`Dyer ${name}`}
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

function formatGauge(yarn: RavelryYarn): string | null {
  const divisor = yarn.gauge_divisor;
  const min = yarn.min_gauge;
  const max = yarn.max_gauge;
  if (min == null && max == null)
    return null;
  const unit = divisor != null ? ` = ${divisor}"` : '';
  if (min != null && max != null && min !== max)
    return `${min}–${max} sts${unit}`;
  const value = max ?? min;
  return value != null ? `${value} sts${unit}` : null;
}

function formatPutUp(yarn: RavelryYarn): string | null {
  const yards = yarn.yardage;
  const grams = yarn.grams;
  if (yards != null && grams != null)
    return `${yards} yards / ${grams} g`;
  if (yards != null)
    return `${yards} yards`;
  if (grams != null)
    return `${grams} g`;
  return null;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function rowsForYarn(yarn: RavelryYarn): { label: string; value: string }[] {
  const rows: { label: string; value: string }[] = [];
  if (yarn.yarn_weight_name)
    rows.push({ label: 'Weight', value: yarn.yarn_weight_name });
  if (yarn.fiber_description)
    rows.push({ label: 'Fiber', value: yarn.fiber_description });
  const putUp = formatPutUp(yarn);
  if (putUp)
    rows.push({ label: 'Put-up', value: putUp });
  if (yarn.wpi != null)
    rows.push({ label: 'WPI', value: String(yarn.wpi) });
  const gauge = formatGauge(yarn);
  if (gauge)
    rows.push({ label: 'Gauge', value: gauge });
  if (yarn.texture)
    rows.push({ label: 'Texture', value: yarn.texture });
  if (yarn.machine_washable != null)
    rows.push({
      label: 'Machine washable',
      value: yarn.machine_washable ? 'Yes' : 'No',
    });
  if (yarn.discontinued != null)
    rows.push({
      label: 'Availability',
      value: yarn.discontinued ? 'Discontinued' : 'Available',
    });
  const notes = yarn.notes_html ? stripHtml(yarn.notes_html) : '';
  if (notes)
    rows.push({ label: 'Notes', value: notes });
  return rows;
}

export function YarnInfoSheet({
  ref,
  yarnId,
  yarnName,
  enabled = false,
}: Props & { ref?: React.RefObject<BottomSheetModal | null> }) {
  const pathname = usePathname();
  const query = useYarn({
    variables: { id: yarnId },
    enabled: enabled && yarnId > 0,
    retry: (failureCount, error) => {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 403 || status === 404)
        return false;
      return failureCount < 2;
    },
  });

  const yarn = query.data;
  const companyId
    = yarn?.yarn_company_id
      ?? yarn?.yarn_company?.id
      ?? null;
  const companyName
    = yarn?.yarn_company_name?.trim()
      || yarn?.yarn_company?.name?.trim()
      || '';
  const companyQuery = useYarnCompany({
    variables: {
      query: companyName || String(companyId ?? ''),
      id: companyId,
    },
    enabled: enabled && Boolean(companyName || (companyId != null && companyId > 0)),
  });
  const dyerName
    = companyQuery.data?.name?.trim()
      || companyName
      || null;
  const dyerLogo
    = companyQuery.data?.logo_url?.trim()
      || yarn?.yarn_company?.logo_url?.trim()
      || null;
  const dyerLink
    = companyId != null && companyId > 0
      ? dyerHref(companyId, pathname, dyerName)
      : null;
  const title = yarn?.name || yarnName || 'Yarn info';
  const rows = yarn ? rowsForYarn(yarn) : [];

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
        {query.isPending && !yarn
          ? (
              <View className="items-center py-10">
                <ActivityIndicator color="#ffffff" />
              </View>
            )
          : null}

        {query.isError && !yarn
          ? (
              <View className="px-5 py-8">
                <Text className="text-center text-sm text-fog-400">
                  Couldn't load yarn details.
                </Text>
              </View>
            )
          : null}

        {dyerName && dyerLink
          ? (
              <DyerLinkRow
                href={dyerLink}
                name={dyerName}
                photoUri={dyerLogo}
                onPress={() => ref?.current?.dismiss()}
              />
            )
          : dyerName
            ? (
                <InfoRow label="Dyer" value={dyerName} />
              )
            : null}

        {yarn && !rows.length && !dyerName
          ? (
              <View className="px-5 py-8">
                <Text className="text-center text-sm text-fog-400">
                  No details listed for this yarn.
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
