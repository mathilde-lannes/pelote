import type { RavelryPerson, RavelryProject } from '@/lib/ravelry/types';
import * as React from 'react';
import { View } from 'react-native';

import { usePathname } from 'expo-router';

import { usePattern } from '@/features/explore/api';
import { useProject } from '@/features/feed/api';
import { Post } from '@/features/feed/components/post';
import { POST_ITEM_HEIGHT } from '@/features/feed/components/post-layout';
import { PostSkeleton } from '@/features/feed/components/post-skeleton';
import { collectProjectPhotos } from '@/features/feed/components/collect-project-photos';
import { formatRelative } from '@/features/feed/format-relative';
import {
  designerDesignsFeedHref,
  userProfileHref,
} from '@/features/profile/designer-profile-href';
import { bestPhotoUrl } from '@/lib/ravelry/api';

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

  const pathname = usePathname();
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
      ? designerDesignsFeedHref(author, patternId, pathname)
      : null;

  if (!ready && !photos.length) {
    return (
      <PostSkeleton
        photoUri={bestPhotoUrl(project.first_photo ?? project.photos?.[0] ?? null)}
      />
    );
  }

  // Prefer list photos immediately so the grid→feed open doesn't flash empty.
  // Full details still enrich notes / favorites when the show call returns.
  return (
    <View style={{ minHeight: POST_ITEM_HEIGHT }} className="bg-black">
      <Post
        variant="project"
        authorName={displayName}
        authorAvatar={avatar}
        authorHref={userProfileHref(displayName, pathname)}
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
