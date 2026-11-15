import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import type { RavelryProject, RavelryProjectPack } from '@/lib/ravelry/types';
import type { RavelryYarnSummary } from '@/lib/ravelry/api';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import * as React from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  View,
} from 'react-native';

import colors from '@/components/ui/colors';
import { Modal, Text } from '@/components/ui';
import { Yarn } from '@/components/ui/icons';
import { useProject, useYarnsByIds } from '@/features/feed/api';
import { bestPhotoUrl } from '@/lib/ravelry/api';

type Props = {
  username: string;
  projectId: number;
  projectName?: string | null;
  /** Only fetch while the sheet has been opened at least once. */
  enabled?: boolean;
};

const DOT_ACTIVE = '#5478ff';
const DOT_INACTIVE = '#383838';
const CAROUSEL_ASPECT = 1;

function formatQuantity(value: number | null | undefined, unit: string): string | null {
  if (value == null || !Number.isFinite(value))
    return null;
  const amount = Number.isInteger(value) ? String(value) : value.toFixed(1);
  return `${amount} ${unit}`;
}

/** Project-owner pack fields (colorway, amounts, …) — not catalog yarn. */
function rowsForPack(pack: RavelryProjectPack): { label: string; value: string }[] {
  const rows: { label: string; value: string }[] = [];
  if (pack.colorway)
    rows.push({ label: 'Colorway', value: pack.colorway });
  if (pack.color_family_name)
    rows.push({ label: 'Color family', value: pack.color_family_name });
  if (pack.yarn_weight_name)
    rows.push({ label: 'Weight', value: pack.yarn_weight_name });
  if (pack.dye_lot)
    rows.push({ label: 'Dye lot', value: pack.dye_lot });
  const skeins = formatQuantity(pack.skeins, pack.skeins === 1 ? 'skein' : 'skeins');
  if (skeins)
    rows.push({ label: 'Skeins', value: skeins });
  const yards = formatQuantity(pack.total_yards, 'yards');
  const meters = formatQuantity(pack.total_meters, 'meters');
  if (yards && meters)
    rows.push({ label: 'Yardage', value: `${yards} · ${meters}` });
  else if (yards)
    rows.push({ label: 'Yardage', value: yards });
  else if (meters)
    rows.push({ label: 'Yardage', value: meters });
  if (pack.shop_name)
    rows.push({ label: 'Shop', value: pack.shop_name });
  return rows;
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

function YarnSlide({
  pack,
  width,
}: {
  pack: RavelryProjectPack;
  width: number;
}) {
  const uri = bestPhotoUrl(pack.photo ?? null);
  return (
    <View style={{ width, aspectRatio: CAROUSEL_ASPECT }} className="bg-ink-200">
      {uri
        ? (
            <Image
              source={{ uri }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
            />
          )
        : (
            <View className="size-full items-center justify-center gap-2 bg-ink-200">
              <Yarn color={colors.ink[600]} width={48} height={48} />
              <Text className="text-sm text-ink-700">
                No photo
              </Text>
            </View>
          )}
    </View>
  );
}

function YarnPackCarousel({
  packs,
  index,
  onIndexChange,
}: {
  packs: RavelryProjectPack[];
  index: number;
  onIndexChange: (index: number) => void;
}) {
  const width = Dimensions.get('window').width;

  const onScroll = React.useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const next = Math.round(event.nativeEvent.contentOffset.x / width);
      if (next !== index && next >= 0 && next < packs.length)
        onIndexChange(next);
    },
    [index, onIndexChange, packs.length, width],
  );

  return (
    <View>
      <FlatList
        data={packs}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(pack, i) => `${pack.yarn_id ?? pack.yarn_name ?? 'yarn'}-${i}`}
        onScroll={onScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => <YarnSlide pack={item} width={width} />}
      />
      <View
        className="w-full flex-row items-center justify-center gap-[5px]"
        style={{ height: 22 }}
      >
        {packs.length > 1
          ? packs.map((_, i) => (
              <View
                key={i}
                className="size-1.5 rounded-full"
                style={{
                  backgroundColor: i === index ? DOT_ACTIVE : DOT_INACTIVE,
                }}
              />
            ))
          : null}
      </View>
    </View>
  );
}

function YarnUsedRow({
  name,
  dyer,
  photoUri,
}: {
  name: string;
  dyer: string | null;
  photoUri: string | null;
}) {
  return (
    <View className="flex-row items-center gap-3 border-b border-ink-300 px-5 py-3.5">
      <View className="size-12 overflow-hidden rounded-md bg-ink-200">
        {photoUri
          ? (
              <Image
                source={{ uri: photoUri }}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
              />
            )
          : null}
      </View>
      <View className="min-w-0 flex-1">
        <Text className="text-base text-white" numberOfLines={1}>
          {name}
        </Text>
        {dyer
          ? (
              <Text className="mt-0.5 text-sm text-fog-400" numberOfLines={1}>
                {dyer}
              </Text>
            )
          : null}
      </View>
    </View>
  );
}

function resolveCatalogYarn(
  pack: RavelryProjectPack,
  yarnsById: Map<number, RavelryYarnSummary>,
): {
  name: string;
  dyer: string | null;
  photoUri: string | null;
} | null {
  const catalog = pack.yarn_id != null ? yarnsById.get(pack.yarn_id) : null;
  const name
    = catalog?.name?.trim()
      || pack.yarn_name?.trim()
      || null;
  const dyer
    = catalog?.yarn_company_name?.trim()
      || pack.yarn_company_name?.trim()
      || null;
  const photoUri = bestPhotoUrl(catalog?.photo ?? null);
  if (!name && !dyer && !photoUri)
    return null;
  return {
    name: name ?? 'Yarn',
    dyer,
    photoUri,
  };
}

function ActivePackDetails({
  pack,
  catalogYarn,
}: {
  pack: RavelryProjectPack;
  catalogYarn: {
    name: string;
    dyer: string | null;
    photoUri: string | null;
  } | null;
}) {
  const rows = rowsForPack(pack);
  return (
    <View>
      {catalogYarn
        ? (
            <View>
              <View className="px-5 pb-1 pt-4">
                <Text className="text-xs font-medium uppercase tracking-wide text-fog-500">
                  Yarn used
                </Text>
              </View>
              <YarnUsedRow
                name={catalogYarn.name}
                dyer={catalogYarn.dyer}
                photoUri={catalogYarn.photoUri}
              />
            </View>
          )
        : null}
      {rows.map(row => (
        <InfoRow
          key={row.label}
          label={row.label}
          value={row.value}
        />
      ))}
      {!rows.length && !catalogYarn
        ? (
            <View className="px-5 py-8">
              <Text className="text-center text-sm text-fog-400">
                No yarn details listed.
              </Text>
            </View>
          )
        : null}
    </View>
  );
}

export function ProjectYarnSheet({
  ref,
  username,
  projectId,
  projectName,
  enabled = false,
}: Props & { ref?: React.RefObject<BottomSheetModal | null> }) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const query = useProject({
    variables: { username, id: String(projectId) },
    enabled: enabled && Boolean(username) && projectId > 0,
    retry: (failureCount, error) => {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 403 || status === 404)
        return false;
      return failureCount < 2;
    },
  });

  const project = query.data as RavelryProject | undefined;
  const packs = project?.packs ?? [];
  const yarnIds = React.useMemo(
    () => [...new Set(
      packs
        .map(pack => pack.yarn_id)
        .filter((id): id is number => id != null && id > 0),
    )],
    [packs],
  );
  const yarnsQuery = useYarnsByIds({
    variables: { ids: yarnIds },
    enabled: enabled && yarnIds.length > 0,
    retry: (failureCount, error) => {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 403 || status === 404)
        return false;
      return failureCount < 2;
    },
  });
  const yarnsById = React.useMemo(() => {
    const map = new Map<number, RavelryYarnSummary>();
    for (const yarn of yarnsQuery.data ?? [])
      map.set(yarn.id, yarn);
    return map;
  }, [yarnsQuery.data]);

  const safeIndex = packs.length
    ? Math.min(activeIndex, packs.length - 1)
    : 0;
  const activePack = packs[safeIndex] ?? null;
  const catalogYarn = activePack
    ? resolveCatalogYarn(activePack, yarnsById)
    : null;
  const title = project?.name || projectName || 'Yarn';

  React.useEffect(() => {
    setActiveIndex(0);
  }, [project?.id]);

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
      snapPoints={['85%', '95%']}
      backgroundStyle={{ backgroundColor: colors.black }}
      handleComponent={renderHandle}
    >
      <BottomSheetScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        className="bg-black"
      >
        {query.isPending && !project
          ? (
              <View className="items-center py-10">
                <ActivityIndicator color="#ffffff" />
              </View>
            )
          : null}

        {query.isError && !project
          ? (
              <View className="px-5 py-8">
                <Text className="text-center text-sm text-fog-400">
                  Couldn't load yarn details.
                </Text>
              </View>
            )
          : null}

        {project && !packs.length
          ? (
              <View className="px-5 py-8">
                <Text className="text-center text-sm text-fog-400">
                  No yarn listed for this project.
                </Text>
              </View>
            )
          : null}

        {packs.length
          ? (
              <>
                <YarnPackCarousel
                  packs={packs}
                  index={safeIndex}
                  onIndexChange={setActiveIndex}
                />
                {activePack
                  ? (
                      <ActivePackDetails
                        pack={activePack}
                        catalogYarn={catalogYarn}
                      />
                    )
                  : null}
              </>
            )
          : null}
      </BottomSheetScrollView>
    </Modal>
  );
}
