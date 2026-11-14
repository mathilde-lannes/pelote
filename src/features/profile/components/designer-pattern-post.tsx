import type { RavelryPattern, RavelryPerson } from '@/lib/ravelry/types';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import * as React from 'react';

import { ExpandableText } from '@/components/expandable-text';
import { Pressable, Text, View } from '@/components/ui';
import { usePattern } from '@/features/explore/api';
import { likesLabel } from '@/features/feed/components/activity-card-copy';
import { PhotoCarousel } from '@/features/feed/components/photo-carousel';
import { designerProfileHref } from '../designer-profile-href';
import {
  DESIGN_POST_ITEM_HEIGHT,
  DESIGN_POST_MEDIA_HEIGHT,
  designPostChromeHeight,
} from '../designer-patterns-feed-layout';

type Props = {
  username: string;
  person?: RavelryPerson | null;
  pattern: RavelryPattern;
};

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function DesignerPatternPost({ username, person, pattern }: Props) {
  const [captionExpanded, setCaptionExpanded] = React.useState(false);
  // Search list payloads are thin (often one photo, no notes) — enrich like projects.
  const detailQuery = usePattern({
    variables: { id: pattern.id },
    retry: (failureCount, error) => {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 403 || status === 404)
        return false;
      return failureCount < 2;
    },
  });
  const data = detailQuery.data ?? pattern;
  const photos = data.photos?.length ? data.photos : pattern.photos;

  const author = data.pattern_author ?? pattern.pattern_author;
  const linkedUser = author?.users[0];
  const avatar
    = linkedUser?.small_photo_url
      ?? linkedUser?.photo_url
      ?? person?.small_photo_url
      ?? person?.photo_url
      ?? null;
  const displayName
    = author?.name
      || linkedUser?.username
      || person?.username
      || username;
  const profileHref = designerProfileHref(author)
    ?? `/user/${username}`;
  const likes = likesLabel(data.favorites_count);
  const description = data.notes_html ? stripHtml(data.notes_html) : '';
  const rowHeight
    = DESIGN_POST_MEDIA_HEIGHT + designPostChromeHeight(Boolean(description));

  return (
    <View
      style={
        captionExpanded
          ? { minHeight: Math.max(rowHeight, DESIGN_POST_ITEM_HEIGHT) }
          : { height: rowHeight }
      }
      className="bg-black"
    >
      <Link href={profileHref as never} asChild>
        <Pressable className="flex-row items-center gap-3 p-3">
          {avatar
            ? (
                <Image
                  source={{ uri: avatar }}
                  style={{ width: 32, height: 32, borderRadius: 16 }}
                  contentFit="cover"
                />
              )
            : (
                <View className="size-8 items-center justify-center rounded-full bg-ink-300">
                  <Text className="text-sm font-semibold text-white">
                    {displayName.slice(0, 1).toUpperCase()}
                  </Text>
                </View>
              )}
          <View className="flex-1">
            <Text className="text-sm font-semibold text-white" numberOfLines={1}>
              {displayName}
            </Text>
          </View>
        </Pressable>
      </Link>

      <PhotoCarousel photos={photos} />

      <View className="gap-1 px-3 pt-2 pb-3">
        {likes
          ? (
              <Text className="text-sm font-semibold text-white">{likes}</Text>
            )
          : null}
        <Text className="text-sm text-white" numberOfLines={1}>
          <Text className="font-semibold">{displayName}</Text>
          {data.name
            ? (
                <Text className="font-normal text-fog-300">
                  {' '}
                  {data.name}
                </Text>
              )
            : null}
        </Text>
        {description
          ? (
              <ExpandableText
                text={description}
                numberOfLines={2}
                onExpandedChange={setCaptionExpanded}
              />
            )
          : null}
      </View>
    </View>
  );
}
