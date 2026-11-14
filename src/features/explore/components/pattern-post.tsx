import type { PatternHighlight } from '@/lib/ravelry/types';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import * as React from 'react';

import { ExpandableText } from '@/components/expandable-text';
import { Pressable, Text, View } from '@/components/ui';
import { likesLabel } from '@/features/feed/components/activity-card-copy';
import { PhotoCarousel } from '@/features/feed/components/photo-carousel';
import { formatRelative } from '@/features/feed/format-relative';
import { patternPostItemHeight } from '../pattern-feed-layout';

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function relativeDate(value: string | null): string {
  if (!value)
    return '';
  const normalized = value.includes('/') ? value.replace(/\//g, '-') : value;
  return formatRelative(normalized);
}

function PatternPostHeader({
  name,
  username,
  avatar,
  relative,
}: {
  name: string;
  username: string | null;
  avatar: string | null;
  relative: string;
}) {
  const initial = (name || '?').slice(0, 1).toUpperCase();
  const identity = (
    <>
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
              <Text className="text-sm font-semibold text-white">{initial}</Text>
            </View>
          )}
      <View className="flex-1">
        <Text className="text-sm font-semibold text-white" numberOfLines={1}>
          {name}
        </Text>
        {relative
          ? <Text className="text-xs text-fog-500">{relative}</Text>
          : null}
      </View>
    </>
  );

  if (!username) {
    return (
      <View className="flex-row items-center gap-3 p-3">
        {identity}
      </View>
    );
  }

  return (
    <Link href={`/user/${username}` as never} asChild>
      <Pressable className="flex-row items-center gap-3 p-3">
        {identity}
      </Pressable>
    </Link>
  );
}

export function PatternPost({ item }: { item: PatternHighlight }) {
  const [captionExpanded, setCaptionExpanded] = React.useState(false);
  const pattern = item.pattern;
  const author = pattern.pattern_author;
  const user = author?.users[0];
  const designer = author?.name || user?.username || pattern.name;
  const notes = pattern.notes_html ? stripHtml(pattern.notes_html) : '';
  const likes = likesLabel(pattern.favorites_count);
  const rowHeight = patternPostItemHeight(item);

  return (
    <View
      style={captionExpanded ? { minHeight: rowHeight } : { height: rowHeight }}
      className="bg-black"
    >
      <PatternPostHeader
        name={designer}
        username={user?.username ?? null}
        avatar={user?.small_photo_url ?? user?.photo_url ?? null}
        relative={relativeDate(item.timeline_date)}
      />
      <PhotoCarousel photos={pattern.photos} />
      <View className="gap-1 px-3 pt-2 pb-3">
        {likes
          ? <Text className="text-sm font-semibold text-white">{likes}</Text>
          : null}
        <Text className="text-sm text-white" numberOfLines={1}>
          <Text className="font-semibold">{designer}</Text>
          {pattern.name
            ? (
                <Text className="font-normal text-fog-300">
                  {' '}
                  {pattern.name}
                </Text>
              )
            : null}
        </Text>
        {notes
          ? (
              <ExpandableText
                text={notes}
                numberOfLines={2}
                onExpandedChange={setCaptionExpanded}
              />
            )
          : null}
      </View>
    </View>
  );
}
