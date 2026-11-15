import type { RavelryColorway } from './api';
import { Image } from 'expo-image';
import * as React from 'react';
import { ActivityIndicator, View } from 'react-native';

import { Box, PatternInfo } from '@/components/ui/icons';
import { Pressable, Text, useModal } from '@/components/ui';
import { PhotoCarousel } from '@/features/feed/components/photo-carousel';
import { POST_ITEM_HEIGHT } from '@/features/feed/components/post-layout';
import { formatCompactCount } from '@/features/feed/format-compact-count';
import { useColorwayStashPhotos, useYarn, useYarnCompany } from './api';
import { YarnInfoSheet } from './yarn-info-sheet';

type Props = {
  yarnId: number;
  colorway: RavelryColorway;
};

function countLabel(count: number | null | undefined): string | null {
  if (typeof count !== 'number' || !Number.isFinite(count))
    return null;
  const n = Math.max(0, Math.floor(count));
  return n > 0 ? formatCompactCount(n) : null;
}

function colorwaySubtitle(
  colorwayName: string,
  yarnName: string | null,
): string {
  const colorway = colorwayName.trim();
  const yarn = yarnName?.trim() || '';
  if (colorway && yarn)
    return `${colorway} · ${yarn}`;
  return colorway || yarn;
}

export function ColorwayFeedPost({ yarnId, colorway }: Props) {
  const yarnQuery = useYarn({
    variables: { id: yarnId },
  });
  const yarn = yarnQuery.data;
  const yarnName = yarn?.name?.trim() || null;
  const companyId
    = yarn?.yarn_company_id
      ?? yarn?.yarn_company?.id
      ?? null;
  const companyQuery = useYarnCompany({
    variables: { id: companyId ?? 0 },
    enabled: companyId != null && companyId > 0,
  });
  const dyerName
    = yarn?.yarn_company_name?.trim()
      || yarn?.yarn_company?.name?.trim()
      || companyQuery.data?.name?.trim()
      || null;
  const dyerLogo
    = companyQuery.data?.logo_url?.trim()
      || yarn?.yarn_company?.logo_url?.trim()
      || null;
  const dyerInitial = (dyerName || yarnName || '?').slice(0, 1).toUpperCase();

  // Single Colorway#full image only — never treat embed photo lists as the colorway.
  const catalogPhoto = colorway.photo ?? null;
  const needsStash = catalogPhoto == null;
  const stashQuery = useColorwayStashPhotos({
    variables: {
      yarnId,
      colorwayId: colorway.id,
      colorwayName: colorway.name,
    },
    enabled: needsStash,
  });
  const photos = needsStash
    ? (stashQuery.data ?? [])
    : [catalogPhoto];
  const title = dyerName || yarnName || 'Yarn';
  const subtitle = colorwaySubtitle(colorway.name, yarnName);
  const stashed = countLabel(colorway.stashes_count);
  const infoModal = useModal();
  const [infoOpened, setInfoOpened] = React.useState(false);

  const onInfoPress = React.useCallback(() => {
    setInfoOpened(true);
    infoModal.present();
  }, [infoModal]);

  return (
    <View style={{ minHeight: POST_ITEM_HEIGHT }} className="bg-black pb-4">
      <View className="flex-row items-center justify-between gap-2 px-4 py-3">
        <View className="min-w-0 flex-1 flex-row items-center gap-2.5">
          {dyerLogo
            ? (
                <Image
                  source={{ uri: dyerLogo }}
                  style={{ width: 32, height: 32, borderRadius: 16 }}
                  contentFit="cover"
                />
              )
            : (
                <View className="size-8 items-center justify-center rounded-full bg-ink-400">
                  <Text className="text-xs font-semibold text-ink-900">
                    {dyerInitial}
                  </Text>
                </View>
              )}
          <View className="min-w-0 flex-1">
            <Text className="text-sm font-bold text-white" numberOfLines={1}>
              {title}
            </Text>
            {subtitle
              ? (
                  <Text className="text-sm font-light text-fog-500" numberOfLines={1}>
                    {subtitle}
                  </Text>
                )
              : null}
          </View>
        </View>
        <Pressable
          onPress={onInfoPress}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Yarn info"
        >
          <PatternInfo color="#ffffff" />
        </Pressable>
      </View>
      <YarnInfoSheet
        ref={infoModal.ref}
        yarnId={yarnId}
        yarnName={yarnName}
        enabled={infoOpened}
      />

      {needsStash && stashQuery.isPending && !photos.length
        ? (
            <View className="aspect-square w-full items-center justify-center bg-ink-200">
              <ActivityIndicator color="#ffffff" size="large" />
            </View>
          )
        : (
            <PhotoCarousel
              photos={photos}
              aspectRatio={1}
              dotsPlacement="below"
              showCounter={false}
            />
          )}

      <View
        className="flex-row items-center gap-2 px-4 pt-3"
        accessibilityLabel={stashed ? `Stashed ${stashed}` : 'Stashed'}
      >
        <Box color="#ffffff" />
        {stashed
          ? (
              <Text className="text-sm font-bold text-white">
                {stashed}
              </Text>
            )
          : null}
      </View>
    </View>
  );
}
