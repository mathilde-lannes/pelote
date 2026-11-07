import type { FriendActivity } from '@/lib/ravelry/types';
import { Image } from 'expo-image';
import { Link } from 'expo-router';

import { Pressable, Text, View } from '@/components/ui';
import { bestPhotoUrl } from '@/lib/ravelry/api';
import { formatRelative } from '../format-relative';
import {
  activityLabel,
  captionText,
  likesLabel,
} from './activity-card-copy';

function CardHeader({
  item,
  relative,
  verb,
}: {
  item: FriendActivity;
  relative: string;
  verb: string | null;
}) {
  const avatar = item.person.small_photo_url;
  return (
    <View className="flex-row items-center gap-3 p-3">
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
                {item.person.username.slice(0, 1).toUpperCase()}
              </Text>
            </View>
          )}
      <View className="flex-1">
        <Text className="text-sm font-semibold text-white">
          {item.person.username}
          {verb
            ? (
                <Text className="font-normal text-fog-400">
                  {' '}
                  {verb}
                </Text>
              )
            : null}
        </Text>
        {relative
          ? (
              <Text className="text-xs text-fog-500">
                {relative}
              </Text>
            )
          : null}
      </View>
    </View>
  );
}

function CardMedia({
  photoUrl,
  projectHref,
  fallback,
}: {
  photoUrl: string | null;
  projectHref: string | null;
  fallback: string;
}) {
  if (photoUrl && projectHref) {
    return (
      <Link href={projectHref as any} asChild>
        <Pressable>
          <Image
            source={{ uri: photoUrl }}
            style={{ width: '100%', aspectRatio: 4 / 5 }}
            contentFit="cover"
            transition={200}
          />
        </Pressable>
      </Link>
    );
  }
  if (photoUrl) {
    return (
      <Image
        source={{ uri: photoUrl }}
        style={{ width: '100%', aspectRatio: 4 / 5 }}
        contentFit="cover"
        transition={200}
      />
    );
  }
  return (
    <View className="mx-3 mb-2 bg-ink-200 px-4 py-10">
      <Text className="text-center text-fog-300">{fallback}</Text>
    </View>
  );
}

export function ActivityCard({ item }: { item: FriendActivity }) {
  const photoUrl = bestPhotoUrl(item.photo ?? item.project?.first_photo);
  const projectHref
    = item.project
      ? `/project/${item.person.username}/${item.project.id}`
      : null;
  const relative = formatRelative(item.created_at);
  const verb = activityLabel(item);
  const caption = captionText(item);
  const likes = likesLabel(item.project?.favorites_count);

  return (
    <View className="mb-4 bg-black">
      <CardHeader item={item} relative={relative} verb={verb} />
      <CardMedia
        photoUrl={photoUrl}
        projectHref={projectHref}
        fallback={item.pattern_name ?? item.body ?? item.title ?? 'Activity'}
      />
      <View className="gap-1 px-3 pt-2 pb-3">
        {likes
          ? (
              <Text className="text-sm font-semibold text-white">{likes}</Text>
            )
          : null}
        {caption
          ? (
              <Text className="text-sm text-white">
                <Text className="font-semibold">{item.person.username}</Text>
                {' '}
                {caption}
              </Text>
            )
          : null}
        {item.project?.pattern_name
          && caption !== item.project.pattern_name
          ? (
              <Text className="text-sm text-fog-400">
                {item.project.pattern_name}
              </Text>
            )
          : null}
      </View>
    </View>
  );
}
