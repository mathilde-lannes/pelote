import type {
  PatternHighlight,
  RavelryPattern,
  RavelryPerson,
} from '@/lib/ravelry/types';
import { usePathname } from 'expo-router';
import * as React from 'react';
import { View } from 'react-native';

import { usePattern } from '@/features/explore/api';
import { Post } from '@/features/feed/components/post';
import { POST_ITEM_HEIGHT } from '@/features/feed/components/post-layout';
import { PostSkeleton } from '@/features/feed/components/post-skeleton';
import {
  designerProfileHref,
  userProfileHref,
} from '@/features/profile/designer-profile-href';
import { bestPhotoUrl } from '@/lib/ravelry/api';

type Props = {
  username: string;
  person?: RavelryPerson | null;
  pattern: RavelryPattern;
};

export function DesignerPatternPost({ username, person, pattern }: Props) {
  const pathname = usePathname();
  const detailQuery = usePattern({
    variables: { id: pattern.id },
    retry: (failureCount, error) => {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 403 || status === 404)
        return false;
      return failureCount < 2;
    },
  });

  const item = React.useMemo<PatternHighlight | null>(() => {
    const data = detailQuery.data;
    if (!data) {
      if (detailQuery.isError)
        return {
          id: `pattern:${pattern.id}`,
          timeline_date: null,
          pattern,
        };
      return null;
    }

    const photos = data.photos?.length ? data.photos : pattern.photos;
    const author = data.pattern_author ?? pattern.pattern_author;
    const hasLinkedUser = Boolean(author?.users[0]);
    const patternAuthor
      = author
        ? {
            ...author,
            users: hasLinkedUser
              ? author.users
              : person
                ? [person]
                : author.users,
          }
        : person
          ? {
              id: 0,
              name: person.username || username,
              users: [person],
            }
          : null;

    return {
      id: `pattern:${data.id}`,
      timeline_date: null,
      pattern: {
        ...data,
        photos,
        pattern_author: patternAuthor,
      },
    };
  }, [detailQuery.data, detailQuery.isError, pattern, person, username]);

  if (!item) {
    return (
      <PostSkeleton photoUri={bestPhotoUrl(pattern.photos[0] ?? null)} />
    );
  }

  const p = item.pattern;
  const author = p.pattern_author;
  const user = author?.users[0];
  const designer = author?.name || user?.username || p.name;

  return (
    <View style={{ minHeight: POST_ITEM_HEIGHT }} className="bg-black">
      <Post
        variant="pattern"
        authorName={designer}
        authorAvatar={user?.small_photo_url ?? user?.photo_url ?? null}
        authorHref={
          designerProfileHref(author, pathname)
          ?? userProfileHref(username, pathname)
        }
        patternId={p.id}
        patternName={p.name}
        photos={p.photos}
        notesHtml={p.notes_html}
        timelineDate={item.timeline_date}
        favoritesCount={p.favorites_count}
        projectsCount={p.projects_count}
        commentsCount={p.comments_count}
        packsCount={p.packs_count}
      />
    </View>
  );
}
