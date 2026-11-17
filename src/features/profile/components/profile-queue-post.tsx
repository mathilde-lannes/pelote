import type { RavelryPerson, RavelryQueuedProject } from '@/lib/ravelry/types';
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
import { useQueuedProject } from '../api';

type Props = {
  username: string;
  person?: RavelryPerson | null;
  queued: RavelryQueuedProject;
};

function queuedDateLabel(queued: RavelryQueuedProject): string {
  const value = queued.created_at;
  if (typeof value !== 'string' || !value.trim())
    return '';
  const normalized = value.includes('/')
    ? value.replace(/\//g, '-')
    : value;
  return formatRelative(
    Number.isFinite(new Date(normalized).getTime())
      ? new Date(normalized).toISOString()
      : value,
  );
}

export function ProfileQueuePost({ username, person, queued }: Props) {
  const detailQuery = useQueuedProject({
    variables: { username, id: queued.id },
    retry: (failureCount, error) => {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 403 || status === 404)
        return false;
      return failureCount < 2;
    },
  });
  const data = detailQuery.data ?? queued;
  const photos = React.useMemo(
    () => collectProjectPhotos(data.best_photo, data.photos),
    [data.best_photo, data.photos],
  );
  const pathname = usePathname();
  const displayName = person?.username || username;
  const authorHref = postAuthorHref(displayName, pathname);
  const patternName = data.pattern_name?.trim() || data.name;

  if (detailQuery.isPending && !photos.length) {
    return (
      <PostSkeleton photoUri={bestPhotoUrl(queued.best_photo)} />
    );
  }

  return (
    <View style={{ minHeight: POST_ITEM_HEIGHT }} className="bg-black">
      <Post
        variant="queue"
        authorName={displayName}
        authorAvatar={person?.small_photo_url ?? person?.photo_url ?? null}
        authorHref={authorHref}
        queuedProjectId={data.id}
        patternId={data.pattern_id}
        patternName={patternName}
        designerName={data.designer_name}
        yarnId={data.yarn_id}
        yarnName={data.yarn_name}
        skeins={data.skeins}
        projectsCount={data.projects_count}
        photos={photos}
        notesHtml={data.notes_html}
        relative={queuedDateLabel(data)}
        favoritesCount={data.favorites_count}
        commentsCount={data.comments_count}
      />
    </View>
  );
}
