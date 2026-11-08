import type { RavelryPerson, RavelryProject } from '@/lib/ravelry/types';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import * as React from 'react';

import { Pressable, Text, View } from '@/components/ui';
import { useProject } from '@/features/feed/api';
import { likesLabel } from '@/features/feed/components/activity-card-copy';
import { collectProjectPhotos } from '@/features/feed/components/collect-project-photos';
import { PhotoCarousel } from '@/features/feed/components/photo-carousel';
import { PROFILE_POST_ITEM_HEIGHT } from '../profile-feed-layout';

type Props = {
  username: string;
  person?: RavelryPerson | null;
  project: RavelryProject;
};

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
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
  const notes = data.notes_html ? stripHtml(data.notes_html) : '';
  const caption = notes || data.pattern_name || data.name;

  return (
    <View style={{ height: PROFILE_POST_ITEM_HEIGHT }} className="bg-black">
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
          <Text className="text-sm font-semibold text-white">
            {displayName}
          </Text>
        </Pressable>
      </Link>

      <PhotoCarousel photos={photos} />

      <View className="flex-1 gap-1 px-3 pt-2 pb-3">
        {likes
          ? (
              <Text className="text-sm font-semibold text-white">{likes}</Text>
            )
          : null}
        {caption
          ? (
              <Text className="text-sm text-white" numberOfLines={3}>
                <Text className="font-semibold">{displayName}</Text>
                {' '}
                {caption}
              </Text>
            )
          : null}
        {data.pattern_name && caption !== data.pattern_name
          ? (
              <Text className="text-sm text-fog-400" numberOfLines={1}>
                {data.pattern_name}
              </Text>
            )
          : null}
      </View>
    </View>
  );
}
