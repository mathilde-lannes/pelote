import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import type { RavelryProjectPack, RavelryYarn } from '@/lib/ravelry/types';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import { Link, usePathname } from 'expo-router';
import * as React from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
  View,
} from 'react-native';

import colors from '@/components/ui/colors';
import { Modal, Text } from '@/components/ui';
import { ArrowRight, Yarn } from '@/components/ui/icons';
import { usePattern } from '@/features/explore/api';
import { useProject, useYarnsByIds } from '@/features/feed/api';
import { yarnHref } from '@/features/yarn/yarn-href';
import { bestPhotoUrl } from '@/lib/ravelry/api';

type ProjectSource = {
  source: 'project';
  username: string;
  projectId: number;
  title?: string | null;
};

type PatternSource = {
  source: 'pattern';
  patternId: number;
  title?: string | null;
};

type YarnPackSheetProps = (ProjectSource | PatternSource) & {
  /** Only fetch while the sheet has been opened at least once. */
  enabled?: boolean;
};

type ProjectYarnSheetProps = {
  username: string;
  projectId: number;
  projectName?: string | null;
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
  href,
  onPress,
}: {
  name: string;
  dyer: string | null;
  photoUri: string | null;
  href?: string | null;
  onPress?: () => void;
}) {
  const body = (
    <>
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
      {href
        ? <ArrowRight color={colors.fog[400]} />
        : null}
    </>
  );

  if (href) {
    return (
      <Link href={href as never} asChild>
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={
            dyer ? `Yarn ${name} by ${dyer}` : `Yarn ${name}`
          }
          className="flex-row items-center gap-3 border-b border-ink-300 px-5 py-3.5"
        >
          {body}
        </Pressable>
      </Link>
    );
  }

  return (
    <View
      accessibilityLabel={
        dyer ? `Yarn ${name} by ${dyer}` : `Yarn ${name}`
      }
      className="flex-row items-center gap-3 border-b border-ink-300 px-5 py-3.5"
    >
      {body}
    </View>
  );
}

function resolveCatalogYarn(
  pack: RavelryProjectPack,
  yarnsById: Map<number, RavelryYarn>,
): {
  yarnId: number | null;
  name: string;
  dyer: string | null;
  photoUri: string | null;
} | null {
  const yarnId = pack.yarn_id != null && pack.yarn_id > 0 ? pack.yarn_id : null;
  const catalog = yarnId != null ? yarnsById.get(yarnId) : null;
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
    yarnId,
    name: name ?? 'Yarn',
    dyer,
    photoUri,
  };
}

function ActivePackDetails({
  pack,
  catalogYarn,
  yarnLink,
  onYarnPress,
}: {
  pack: RavelryProjectPack;
  catalogYarn: {
    yarnId: number | null;
    name: string;
    dyer: string | null;
    photoUri: string | null;
  } | null;
  yarnLink?: string | null;
  onYarnPress?: () => void;
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
                href={yarnLink}
                onPress={onYarnPress}
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

function useYarnPackSource(
  props: YarnPackSheetProps,
): {
  packs: RavelryProjectPack[];
  title: string;
  isPending: boolean;
  isError: boolean;
  ready: boolean;
  entityKey: string | number | undefined;
  emptyMessage: string;
} {
  const enabled = props.enabled ?? false;
  const isProject = props.source === 'project';
  const projectQuery = useProject({
    variables: {
      username: isProject ? props.username : '',
      id: String(isProject ? props.projectId : 0),
    },
    enabled: enabled && isProject && Boolean(props.username) && props.projectId > 0,
    retry: (failureCount, error) => {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 403 || status === 404)
        return false;
      return failureCount < 2;
    },
  });
  const patternQuery = usePattern({
    variables: { id: !isProject ? props.patternId : 0 },
    enabled: enabled && !isProject && props.patternId > 0,
    retry: (failureCount, error) => {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 403 || status === 404)
        return false;
      return failureCount < 2;
    },
  });

  if (isProject) {
    const project = projectQuery.data;
    return {
      packs: project?.packs ?? [],
      title: project?.name || props.title || 'Yarn',
      isPending: projectQuery.isPending,
      isError: projectQuery.isError,
      ready: Boolean(project),
      entityKey: project?.id,
      emptyMessage: 'No yarn listed for this project.',
    };
  }

  const pattern = patternQuery.data;
  return {
    packs: pattern?.packs ?? [],
    title: pattern?.name || props.title || 'Yarn',
    isPending: patternQuery.isPending,
    isError: patternQuery.isError,
    ready: Boolean(pattern),
    entityKey: pattern?.id,
    emptyMessage: 'No yarn listed for this pattern.',
  };
}

export function YarnPackSheet({
  ref,
  enabled = false,
  ...source
}: YarnPackSheetProps & { ref?: React.RefObject<BottomSheetModal | null> }) {
  const pathname = usePathname();
  const [activeIndex, setActiveIndex] = React.useState(0);
  const {
    packs,
    title,
    isPending,
    isError,
    ready,
    entityKey,
    emptyMessage,
  } = useYarnPackSource({ ...source, enabled });

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
    const map = new Map<number, RavelryYarn>();
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
  const yarnLink
    = catalogYarn?.yarnId != null
      ? yarnHref(catalogYarn.yarnId, pathname)
      : null;

  React.useEffect(() => {
    setActiveIndex(0);
  }, [entityKey]);

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
        {isPending && !ready
          ? (
              <View className="items-center py-10">
                <ActivityIndicator color="#ffffff" />
              </View>
            )
          : null}

        {isError && !ready
          ? (
              <View className="px-5 py-8">
                <Text className="text-center text-sm text-fog-400">
                  Couldn't load yarn details.
                </Text>
              </View>
            )
          : null}

        {ready && !packs.length
          ? (
              <View className="px-5 py-8">
                <Text className="text-center text-sm text-fog-400">
                  {emptyMessage}
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
                        yarnLink={yarnLink}
                        onYarnPress={() => ref?.current?.dismiss()}
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

/** @deprecated Prefer YarnPackSheet with source="project". */
export function ProjectYarnSheet({
  ref,
  username,
  projectId,
  projectName,
  enabled = false,
}: ProjectYarnSheetProps & { ref?: React.RefObject<BottomSheetModal | null> }) {
  return (
    <YarnPackSheet
      ref={ref}
      source="project"
      username={username}
      projectId={projectId}
      title={projectName}
      enabled={enabled}
    />
  );
}
