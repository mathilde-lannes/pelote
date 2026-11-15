import type { RavelryYarn } from './api';
import { Image } from 'expo-image';
import { Link, useLocalSearchParams, usePathname } from 'expo-router';
import * as React from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
} from 'react-native';

import {
  FocusAwareStatusBar,
  SafeAreaView,
  Text,
  View,
} from '@/components/ui';
import { formatCompactCount } from '@/features/feed/format-compact-count';
import { bestPhotoUrl } from '@/lib/ravelry/api';
import { useCompanyYarns, useYarnCompany } from './api';
import { yarnHref } from './yarn-href';

const GRID_GAP = 2;
const COLS = 3;
const TILE
  = (Dimensions.get('window').width - GRID_GAP * (COLS - 1)) / COLS;

function StatColumn({
  value,
  label,
}: {
  value: number | null;
  label: string;
}) {
  return (
    <View>
      <Text className="text-base font-semibold text-white">
        {value == null ? '—' : formatCompactCount(value)}
      </Text>
      <Text className="text-sm text-fog-400">
        {label}
      </Text>
    </View>
  );
}

function DyerHeader({
  name,
  yarnCount,
}: {
  name: string;
  yarnCount: number | null;
}) {
  const initial = (name || '?').slice(0, 1).toUpperCase();
  return (
    <View className="border-b border-ink-300 px-4 pt-2 pb-3">
      <View className="flex-row items-center gap-5 pb-2">
        <View className="size-[86px] items-center justify-center rounded-full bg-ink-300">
          <Text className="text-3xl font-semibold text-white">
            {initial}
          </Text>
        </View>
        <View className="min-w-0 flex-1">
          <Text className="text-xl font-semibold text-white" numberOfLines={2}>
            {name}
          </Text>
          <View className="mt-3 flex-row gap-6">
            <StatColumn value={yarnCount} label="yarns" />
          </View>
        </View>
      </View>
    </View>
  );
}

function YarnTile({ yarn }: { yarn: RavelryYarn }) {
  const pathname = usePathname();
  const uri = bestPhotoUrl(yarn.photo ?? yarn.photos?.[0] ?? null);
  const href = yarnHref(yarn.id, pathname);

  return (
    <Link href={href as never} asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={yarn.name}
        style={{ width: TILE, height: TILE }}
      >
        {uri
          ? (
              <Image
                source={{ uri }}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
              />
            )
          : (
              <View className="size-full items-center justify-center bg-ink-200 px-2">
                <Text className="text-center text-xs text-fog-400" numberOfLines={3}>
                  {yarn.name}
                </Text>
              </View>
            )}
      </Pressable>
    </Link>
  );
}

export function DyerScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const companyId = Number(String(params.id ?? '').trim());
  const enabled = Number.isFinite(companyId) && companyId > 0;

  const companyQuery = useYarnCompany({
    variables: { id: companyId },
    enabled,
  });
  const yarnsQuery = useCompanyYarns({
    variables: { companyId },
    enabled,
  });

  const company = companyQuery.data;
  const yarns = React.useMemo(
    () => (yarnsQuery.data?.pages ?? []).flatMap(page => page.yarns),
    [yarnsQuery.data],
  );
  const yarnCount = yarnsQuery.isPending
    ? (company?.yarn_count ?? null)
    : (yarnsQuery.data?.pages[0]?.totalResults
      ?? yarns.length
      ?? company?.yarn_count
      ?? null);
  const name = company?.name ?? 'Dyer';

  const onEndReached = React.useCallback(() => {
    if (yarnsQuery.hasNextPage && !yarnsQuery.isFetchingNextPage)
      yarnsQuery.fetchNextPage();
  }, [yarnsQuery]);

  if (!enabled) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-black" edges={['bottom']}>
        <FocusAwareStatusBar />
        <Text className="text-fog-400">Missing dyer</Text>
      </SafeAreaView>
    );
  }

  if (
    (companyQuery.isPending && !company)
    && (yarnsQuery.isPending && !yarns.length)
  ) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-black" edges={['bottom']}>
        <FocusAwareStatusBar />
        <ActivityIndicator color="#ffffff" size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black" edges={['bottom']}>
      <FocusAwareStatusBar />
      <FlatList
        data={yarns}
        keyExtractor={item => String(item.id)}
        numColumns={COLS}
        columnWrapperStyle={{ gap: GRID_GAP }}
        contentContainerStyle={{ gap: GRID_GAP, paddingBottom: 24 }}
        ListHeaderComponent={(
          <DyerHeader
            name={name}
            yarnCount={
              companyQuery.isPending && yarnsQuery.isPending
                ? null
                : yarnCount
            }
          />
        )}
        ListEmptyComponent={
          yarnsQuery.isPending
            ? (
                <View className="items-center py-10">
                  <ActivityIndicator color="#ffffff" />
                </View>
              )
            : (
                <Text className="mt-10 text-center text-sm text-fog-400">
                  No yarns yet.
                </Text>
              )
        }
        ListFooterComponent={
          yarnsQuery.isFetchingNextPage
            ? (
                <View className="items-center py-4">
                  <ActivityIndicator color="#ffffff" />
                </View>
              )
            : null
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={0.4}
        renderItem={({ item }) => <YarnTile yarn={item} />}
      />
    </SafeAreaView>
  );
}
