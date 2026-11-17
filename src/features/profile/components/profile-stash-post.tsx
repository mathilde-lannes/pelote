import type { RavelryPerson, RavelryStash } from '@/lib/ravelry/types';
import { usePathname } from 'expo-router';
import * as React from 'react';
import { View } from 'react-native';

import { collectProjectPhotos } from '@/features/feed/components/collect-project-photos';
import { Post } from '@/features/feed/components/post';
import { POST_ITEM_HEIGHT } from '@/features/feed/components/post-layout';
import { PostSkeleton } from '@/features/feed/components/post-skeleton';
import { formatRelative } from '@/features/feed/format-relative';
import { postAuthorHref } from '@/features/profile/designer-profile-href';
import { bestPhotoUrl } from '@/lib/ravelry/api';
import { useStash } from '../api';

type Props = {
  username: string;
  person?: RavelryPerson | null;
  stash: RavelryStash;
};

function stashDateLabel(stash: RavelryStash): string {
  for (const value of [stash.created_at, stash.updated_at]) {
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

function yarnSubtitle(stash: RavelryStash): string {
  const colorway = stash.colorway_name?.trim() || '';
  const yarn = stash.yarn_name?.trim() || '';
  if (colorway && yarn)
    return `${colorway} · ${yarn}`;
  return colorway || yarn || stash.name;
}

export function ProfileStashPost({ username, person, stash }: Props) {
  const detailQuery = useStash({
    variables: { username, id: stash.id },
    retry: (failureCount, error) => {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 403 || status === 404)
        return false;
      return failureCount < 2;
    },
  });
  const data = detailQuery.data ?? stash;
  const photos = React.useMemo(
    () => collectProjectPhotos(data.first_photo, data.photos),
    [data.first_photo, data.photos],
  );
  const pathname = usePathname();
  const displayName = person?.username || username;
  const authorHref = postAuthorHref(displayName, pathname);

  if (detailQuery.isPending && !photos.length) {
    return (
      <PostSkeleton photoUri={bestPhotoUrl(stash.first_photo)} />
    );
  }

  return (
    <View style={{ minHeight: POST_ITEM_HEIGHT }} className="bg-black">
      <Post
        variant="yarn"
        authorName={displayName}
        authorAvatar={person?.small_photo_url ?? person?.photo_url ?? null}
        authorHref={authorHref}
        stashId={data.id}
        yarnId={data.yarn_id}
        yarnName={data.name}
        yarnSubtitle={yarnSubtitle(data)}
        ownerUsername={username}
        photos={photos}
        notesHtml={data.notes_html}
        relative={stashDateLabel(data)}
        favoritesCount={data.favorites_count}
        commentsCount={data.comments_count}
      />
    </View>
  );
}
