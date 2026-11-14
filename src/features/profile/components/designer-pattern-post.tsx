import type {
  PatternHighlight,
  RavelryPattern,
  RavelryPerson,
} from '@/lib/ravelry/types';
import { Image } from 'expo-image';
import { usePathname } from 'expo-router';
import * as React from 'react';
import { Dimensions, View } from 'react-native';

import { usePattern } from '@/features/explore/api';
import { Post } from '@/features/feed/components/post';
import { POST_ITEM_HEIGHT } from '@/features/feed/components/post-layout';
import {
  designerProfileHref,
  userProfileHref,
} from '@/features/profile/designer-profile-href';
import { bestPhotoUrl } from '@/lib/ravelry/api';

const SCREEN_WIDTH = Dimensions.get('window').width;

type Props = {
  username: string;
  person?: RavelryPerson | null;
  pattern: RavelryPattern;
};

/**
 * Hold the Post frame steady while Pattern#show loads — search rows are thin
 * (one photo, no notes) and swapping into full details used to resize the post.
 */
function DesignerPatternPostPlaceholder({ pattern }: { pattern: RavelryPattern }) {
  const uri = bestPhotoUrl(pattern.photos[0]);
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

  if (!item)
    return <DesignerPatternPostPlaceholder pattern={pattern} />;

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
