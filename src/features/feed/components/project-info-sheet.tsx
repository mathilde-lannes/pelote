import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import type { RavelryPattern, RavelryProject } from '@/lib/ravelry/types';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import { Link, usePathname } from 'expo-router';
import * as React from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

import colors from '@/components/ui/colors';
import { Modal, Text } from '@/components/ui';
import { ArrowRight } from '@/components/ui/icons';
import { usePattern } from '@/features/explore/api';
import { patternHref } from '@/features/explore/pattern-href';
import { useProject } from '@/features/feed/api';
import { bestPhotoUrl } from '@/lib/ravelry/api';

type Props = {
  username: string;
  projectId: number;
  projectName?: string | null;
  patternId?: number | null;
  patternName?: string | null;
  /** Only fetch while the sheet has been opened at least once. */
  enabled?: boolean;
};

function formatGauge(project: RavelryProject): string | null {
  const description = project.gauge_description?.trim();
  if (description)
    return description;

  const gauge = project.gauge;
  const divisor = project.gauge_divisor;
  if (gauge == null || divisor == null)
    return null;

  const stitches = Number.isInteger(gauge) ? String(gauge) : gauge.toFixed(1);
  const parts = [`${stitches} stitches`];
  if (project.row_gauge != null) {
    const rows = Number.isInteger(project.row_gauge)
      ? String(project.row_gauge)
      : project.row_gauge.toFixed(1);
    parts.push(`and ${rows} rows`);
  }
  parts.push(`= ${divisor} inches`);
  if (project.gauge_pattern)
    parts.push(`in ${project.gauge_pattern}`);
  return parts.join(' ');
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

function rowsForProject(project: RavelryProject): { label: string; value: string }[] {
  const needles = (project.needle_sizes ?? [])
    .map(needle => needle.name.trim())
    .filter(Boolean);
  const rows: { label: string; value: string }[] = [];

  if (project.craft_name)
    rows.push({ label: 'Craft', value: project.craft_name });
  if (project.status_name)
    rows.push({ label: 'Status', value: project.status_name });
  if (typeof project.progress === 'number' && Number.isFinite(project.progress))
    rows.push({ label: 'Progress', value: `${Math.round(project.progress)}%` });
  if (project.size)
    rows.push({ label: 'Size', value: project.size });
  if (project.made_for)
    rows.push({ label: 'Made for', value: project.made_for });
  const gauge = formatGauge(project);
  if (gauge)
    rows.push({ label: 'Gauge', value: gauge });
  if (needles.length) {
    rows.push({
      label: needles.length === 1 ? 'Needle size' : 'Needle sizes',
      value: needles.join(', '),
    });
  }
  if (project.started)
    rows.push({ label: 'Started', value: project.started });
  if (project.completed)
    rows.push({ label: 'Completed', value: project.completed });

  return rows;
}

function designerLabel(
  pattern?: RavelryPattern | null,
  project?: RavelryProject | null,
): string | null {
  const author = pattern?.pattern_author ?? project?.pattern_author ?? null;
  return author?.name?.trim()
    || author?.users?.[0]?.username?.trim()
    || null;
}

function PatternLinkRow({
  href,
  name,
  designer,
  photoUri,
  onPress,
}: {
  href: string;
  name: string;
  designer: string | null;
  photoUri: string | null;
  onPress?: () => void;
}) {
  return (
    <Link href={href as never} asChild>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={
          designer ? `Pattern ${name} by ${designer}` : `Pattern ${name}`
        }
        className="flex-row items-center gap-3 border-b border-ink-300 px-5 py-3.5"
      >
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
          {designer
            ? (
                <Text className="mt-0.5 text-sm text-fog-400" numberOfLines={1}>
                  {designer}
                </Text>
              )
            : null}
        </View>
        <ArrowRight color={colors.fog[400]} />
      </Pressable>
    </Link>
  );
}

export function ProjectInfoSheet({
  ref,
  username,
  projectId,
  projectName,
  patternId,
  patternName,
  enabled = false,
}: Props & { ref?: React.RefObject<BottomSheetModal | null> }) {
  const pathname = usePathname();
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

  const project = query.data;
  const title = project?.name || projectName || 'Project info';
  const resolvedPatternId = project?.pattern_id ?? patternId ?? null;
  const patternQuery = usePattern({
    variables: { id: resolvedPatternId ?? 0 },
    enabled: enabled && resolvedPatternId != null && resolvedPatternId > 0,
    retry: (failureCount, error) => {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 403 || status === 404)
        return false;
      return failureCount < 2;
    },
  });

  const pattern = patternQuery.data ?? null;
  const resolvedPatternName
    = pattern?.name?.trim()
      || project?.pattern_name?.trim()
      || patternName?.trim()
      || null;
  const rows = project ? rowsForProject(project) : [];
  const patternLink
    = resolvedPatternId != null && resolvedPatternId > 0 && resolvedPatternName
      ? patternHref(resolvedPatternId, pathname)
      : null;
  const patternPhotoUri = bestPhotoUrl(pattern?.photos?.[0] ?? null);
  const patternDesigner = designerLabel(pattern, project);
  const hasContent = Boolean(patternLink) || rows.length > 0;

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
                  Couldn't load project details.
                </Text>
              </View>
            )
          : null}

        {project && !hasContent
          ? (
              <View className="px-5 py-8">
                <Text className="text-center text-sm text-fog-400">
                  No craft details listed for this project.
                </Text>
              </View>
            )
          : null}

        {patternLink && resolvedPatternName
          ? (
              <PatternLinkRow
                href={patternLink}
                name={resolvedPatternName}
                designer={patternDesigner}
                photoUri={patternPhotoUri}
                onPress={() => ref?.current?.dismiss()}
              />
            )
          : null}

        {rows.map(row => (
          <InfoRow key={row.label} label={row.label} value={row.value} />
        ))}
      </BottomSheetScrollView>
    </Modal>
  );
}
