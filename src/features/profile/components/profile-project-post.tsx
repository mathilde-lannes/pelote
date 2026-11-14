import type { RavelryPerson, RavelryProject } from '@/lib/ravelry/types';
import { Image } from 'expo-image';
import * as React from 'react';
import { Dimensions, View } from 'react-native';

import { usePattern } from '@/features/explore/api';
import { useProject } from '@/features/feed/api';
import { Post } from '@/features/feed/components/post';
import { POST_ITEM_HEIGHT } from '@/features/feed/components/post-layout';
import { collectProjectPhotos } from '@/features/feed/components/collect-project-photos';
import { formatRelative } from '@/features/feed/format-relative';
import { designerDesignsFeedHref } from '@/features/profile/designer-profile-href';
import { bestPhotoUrl } from '@/lib/ravelry/api';

const SCREEN_WIDTH = Dimensions.get('window').width;

type Props = {
  username: string;
  person?: RavelryPerson | null;
  project: RavelryProject;
};

function projectDateLabel(project: RavelryProject): string {
  // Craft dates are optional on Ravelry; created_at is the reliable “posted” stamp.
  for (const value of [
    project.completed,
    project.started,
    project.created_at,
    project.updated_at,
  ]) {
    if (typeof value !== 'string' || !value.trim())
      continue;
    const normalized = value.includes('/')
      ? value.replace(/\//g, '-')
      : value;
    const relative = formatRelative(
      Number.isFinite(new Date(normalized).getTime())
        ? new Date(normalized).toISOString()
        : value,
    );
    if (relative)
      return relative;
  }
  return '';
}

function ProfileProjectPostPlaceholder({
  project,
}: {
  project: RavelryProject;
}) {
  const uri = bestPhotoUrl(project.first_photo ?? project.photos?.[0]);
  return (
    <View style={{ height: POST_ITEM_HEIGHT }} className="bg-black">
      <View className="flex-row items-center gap-2.5 px-4 py-3">
        <View className="size-8 rounded-full bg-ink-400" />
        <View className="min-w-0 flex-1 gap-1.5">
          <View className="h-3.5 w-28 rounded bg-ink-300" />
          <View className="h-3 w-40 rounded bg-ink-200" />
        </View>
      </View>
      <View
        style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH }}
        className="bg-ink-200"
      >
        {uri
          ? (
              <Image
                source={{ uri }}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
              />
            )
          : null}
      </View>
      <View style={{ height: 22 }} />
    </View>
  );
}

export function ProfileProjectPost({ username, person, project }: Props) {
  // Enrich photos when allowed; list payload is enough if show returns 403.
  const detailQuery = useProject({
    variables: { username, id: String(project.id) },
    retry: (failureCount, error) => {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 403 || status === 404)
        return false;
      return failureCount < 2;
    },
  });

  const ready = Boolean(detailQuery.data) || detailQuery.isError || !detailQuery.isPending;
  const data = detailQuery.data ?? project;
  const patternId = data.pattern_id ?? null;
  // Project list rows often lack nested pattern_author — warm Pattern#show.
  const patternQuery = usePattern({
    variables: { id: patternId ?? 0 },
    enabled: Boolean(patternId) && !data.pattern_author,
    retry: (failureCount, error) => {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 403 || status === 404)
        return false;
      return failureCount < 2;
    },
  });

  const photos = React.useMemo(
    () => collectProjectPhotos(data.first_photo, data.photos),
    [data.first_photo, data.photos],
  );

  const displayName = person?.username || username;
  const avatar
    = person?.small_photo_url
      ?? person?.photo_url
      ?? null;
  const author
    = data.pattern_author
      ?? patternQuery.data?.pattern_author
      ?? null;
  const designerName
    = author?.name?.trim()
      || author?.users[0]?.username?.trim()
      || null;
  const designerHref
    = patternId != null
      ? designerDesignsFeedHref(author, patternId)
      : null;

  if (!ready && !photos.length)
    return <ProfileProjectPostPlaceholder project={project} />;

  // Prefer list photos immediately so the grid→feed open doesn't flash empty.
  // Full details still enrich notes / favorites when the show call returns.
  return (
    <View style={{ minHeight: POST_ITEM_HEIGHT }} className="bg-black">
      <Post
        variant="project"
        authorName={displayName}
        authorAvatar={avatar}
        authorHref={`/user/${displayName}`}
        projectName={data.name}
        patternName={data.pattern_name ?? patternQuery.data?.name}
        designerName={designerName}
        designerHref={designerHref}
        photos={photos}
        notesHtml={data.notes_html}
        relative={projectDateLabel(data)}
        favoritesCount={data.favorites_count}
      />
    </View>
  );
}
