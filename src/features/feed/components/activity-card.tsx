import type { FriendActivity } from '@/lib/ravelry/types';
import { Image } from 'expo-image';
import { Link } from 'expo-router';

import * as React from 'react';
import { Pressable, Text, View } from '@/components/ui';
import { bestPhotoUrl } from '@/lib/ravelry/api';

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60)
    return `${Math.max(1, mins)}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24)
    return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

function activityLabel(item: FriendActivity) {
  switch (item.type) {
    case 'project_photo':
      return 'shared a project photo';
    case 'stash_photo':
      return 'added stash';
    case 'favorite':
      return 'favorited a pattern';
    case 'queued':
      return 'queued a pattern';
    case 'comment':
      return 'left a comment';
    default:
      return item.title ?? 'was active';
  }
}

export function ActivityCard({ item }: { item: FriendActivity }) {
  const photoUrl = bestPhotoUrl(item.photo ?? item.project?.first_photo);
  const avatar = item.person.small_photo_url;
  const projectHref
    = item.project
      ? `/project/${item.person.username}/${item.project.id}`
      : null;

  return (
    <View className="mb-4 bg-black">
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
            <Text className="font-normal text-fog-400">
              {' '}
              {activityLabel(item)}
            </Text>
          </Text>
          <Text className="text-xs text-fog-500">
            {formatRelative(item.created_at)}
          </Text>
        </View>
      </View>

      {photoUrl && projectHref
        ? (
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
          )
        : photoUrl
          ? (
              <Image
                source={{ uri: photoUrl }}
                style={{ width: '100%', aspectRatio: 4 / 5 }}
                contentFit="cover"
                transition={200}
              />
            )
          : (
              <View className="mx-3 mb-2 bg-ink-200 px-4 py-10">
                <Text className="text-center text-fog-300">
                  {item.pattern_name ?? item.body ?? item.title ?? 'Activity'}
                </Text>
              </View>
            )}

      <View className="p-3">
        {item.project
          ? (
              <Link href={projectHref as any} asChild>
                <Pressable>
                  <Text className="text-base font-semibold text-white">
                    {item.project.name}
                  </Text>
                  {item.project.pattern_name
                    ? (
                        <Text className="mt-0.5 text-sm text-fog-400">
                          {item.project.pattern_name}
                        </Text>
                      )
                    : null}
                </Pressable>
              </Link>
            )
          : item.pattern_name
            ? (
                <Text className="text-base text-fog-200">
                  {item.pattern_name}
                </Text>
              )
            : null}
      </View>
    </View>
  );
}
