import type { RavelryPerson, RavelryProject } from '@/lib/ravelry/types';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import * as React from 'react';

import { ExpandableText } from '@/components/expandable-text';
import { Pressable, Text, View } from '@/components/ui';
import { useProject } from '@/features/feed/api';
import { likesLabel } from '@/features/feed/components/activity-card-copy';
import { collectProjectPhotos } from '@/features/feed/components/collect-project-photos';
import { PhotoCarousel } from '@/features/feed/components/photo-carousel';
import { formatRelative } from '@/features/feed/format-relative';
import {
  PROFILE_POST_ITEM_HEIGHT,
  PROFILE_POST_MEDIA_HEIGHT,
  profilePostChromeHeight,
} from '../profile-feed-layout';

type Props = {
  username: string;
  person?: RavelryPerson | null;
  project: RavelryProject;
};

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function projectDateLabel(project: RavelryProject): string {
  for (const value of [project.started, project.completed]) {
    if (typeof value !== 'string' || !value.trim())
      continue;
    // formatRelative expects parseable dates; normalize slashes when needed.
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
  const [captionExpanded, setCaptionExpanded] = React.useState(false);
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
  const data = detailQuery.data ?? project;
  const photos = React.useMemo(
    () => collectProjectPhotos(data.first_photo, data.photos),
    [data.first_photo, data.photos],
  );

  const avatar
    = person?.small_photo_url
      ?? person?.photo_url
      ?? null;
  const displayName = person?.username || username;
  const likes = likesLabel(data.favorites_count);
  const description = data.notes_html ? stripHtml(data.notes_html) : '';
  const relative = projectDateLabel(data);
  const rowHeight
    = PROFILE_POST_MEDIA_HEIGHT + profilePostChromeHeight(Boolean(description));

  return (
    <View
      style={
        captionExpanded
          ? { minHeight: Math.max(rowHeight, PROFILE_POST_ITEM_HEIGHT) }
          : { height: rowHeight }
      }
      className="bg-black"
    >
      <Link href={`/user/${displayName}` as any} asChild>
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
            <Text className="text-sm font-semibold text-white">
              {displayName}
            </Text>
            {relative
              ? (
                  <Text className="text-xs text-fog-500">
                    {relative}
                  </Text>
                )
              : null}
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
