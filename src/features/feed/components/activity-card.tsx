import { Link } from 'expo-router';
import * as React from 'react';
import { Image } from 'expo-image';

import type { FriendActivity } from '@/lib/ravelry/types';
import { bestPhotoUrl } from '@/lib/ravelry/api';
import { Pressable, Text, View } from '@/components/ui';

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
    <View className="mb-6 bg-oat-50">
      <View className="flex-row items-center gap-3 px-4 py-3">
        {avatar
          ? (
              <Image
                source={{ uri: avatar }}
                style={{ width: 36, height: 36, borderRadius: 18 }}
                contentFit="cover"
              />
            )
          : (
              <View className="size-9 items-center justify-center rounded-full bg-rust-200">
                <Text className="text-sm font-semibold text-rust-800">
                  {item.person.username.slice(0, 1).toUpperCase()}
                </Text>
              </View>
            )}
        <View className="flex-1">
          <Text className="text-sm font-semibold text-charcoal-900">
            {item.person.username}
            <Text className="font-normal text-charcoal-600">
              {' '}
              {activityLabel(item)}
            </Text>
          </Text>
          <Text className="text-xs text-charcoal-500">
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
              <View className="mx-4 mb-2 rounded-lg bg-oat-200 px-4 py-8">
                <Text className="text-center text-charcoal-700">
                  {item.pattern_name ?? item.body ?? item.title ?? 'Activity'}
                </Text>
              </View>
            )}

      <View className="px-4 py-3">
        {item.project
          ? (
              <Link href={projectHref as any} asChild>
                <Pressable>
                  <Text className="text-base font-semibold text-charcoal-900">
                    {item.project.name}
                  </Text>
                  {item.project.pattern_name
                    ? (
                        <Text className="mt-0.5 text-sm text-charcoal-600">
                          {item.project.pattern_name}
                        </Text>
                      )
                    : null}
                </Pressable>
              </Link>
            )
          : item.pattern_name
            ? (
                <Text className="text-base text-charcoal-800">
                  {item.pattern_name}
                </Text>
              )
            : null}
      </View>
    </View>
  );
}
