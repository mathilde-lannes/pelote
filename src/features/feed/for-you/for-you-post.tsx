import type { PatternHighlight } from '@/lib/ravelry/types';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import * as React from 'react';

import { ExpandableText } from '@/components/expandable-text';
import { Pressable, Text, View } from '@/components/ui';
import {
  Bookmark,
  Comments,
  Heart,
  PatternInfo,
  Projects,
  Yarn,
} from '@/components/ui/icons';
import { PhotoCarousel } from '@/features/feed/components/photo-carousel';
import { formatRelative } from '@/features/feed/format-relative';
import { designerProfileHref } from '@/features/profile/designer-profile-href';

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function relativeDate(value: string | null): string {
  if (!value)
    return '';
  const normalized = value.includes('/') ? value.replace(/\//g, '-') : value;
  return formatRelative(normalized);
}

function countLabel(count: number | null | undefined): string | null {
  if (typeof count !== 'number' || !Number.isFinite(count))
    return null;
  const n = Math.max(0, Math.floor(count));
  return n > 0 ? String(n) : null;
}

function Stat({
  icon,
  count,
  label,
}: {
  icon: React.ReactNode;
  count: string | null;
  label: string;
}) {
  return (
    <View
      className="flex-row items-center gap-2"
      accessibilityLabel={count ? `${label} ${count}` : label}
    >
      {icon}
      {count
        ? (
            <Text className="text-sm font-bold text-white">
              {count}
            </Text>
          )
        : null}
    </View>
  );
}

function ForYouPostHeader({
  name,
  patternName,
  profileHref,
  avatar,
  patternId,
}: {
  name: string;
  patternName: string;
  profileHref: string | null;
  avatar: string | null;
  patternId: number;
}) {
  const initial = (name || '?').slice(0, 1).toUpperCase();
  const identity = (
    <View className="min-w-0 flex-1 flex-row items-center gap-2.5">
      {avatar
        ? (
            <Image
              source={{ uri: avatar }}
              style={{ width: 32, height: 32, borderRadius: 16 }}
              contentFit="cover"
            />
          )
        : (
            <View className="size-8 items-center justify-center rounded-full bg-ink-400">
              <Text className="text-xs font-semibold text-ink-900">
                {initial}
              </Text>
            </View>
          )}
      <View className="min-w-0 flex-1">
        <Text className="text-sm font-bold text-white" numberOfLines={1}>
          {name}
        </Text>
        {patternName
          ? (
              <Text className="text-sm font-light text-fog-500" numberOfLines={1}>
                {patternName}
              </Text>
            )
          : null}
      </View>
    </View>
  );

  return (
    <View className="flex-row items-center justify-between px-4 py-3">
      {profileHref
        ? (
            <Link href={profileHref as never} asChild>
              <Pressable className="min-w-0 flex-1">
                {identity}
              </Pressable>
            </Link>
          )
        : identity}
      <Link href={`/pattern/${patternId}` as never} asChild>
        <Pressable
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Pattern info"
          className="ml-3"
        >
          <PatternInfo color="#ffffff" />
        </Pressable>
      </Link>
    </View>
  );
}

export function ForYouPost({ item }: { item: PatternHighlight }) {
  const pattern = item.pattern;
  const author = pattern.pattern_author;
  const user = author?.users[0];
  const designer = author?.name || user?.username || pattern.name;
  const profileHref = designerProfileHref(author);
  const notes = pattern.notes_html ? stripHtml(pattern.notes_html) : '';
  const relative = relativeDate(item.timeline_date);
  const favorites = countLabel(pattern.favorites_count);
  const projects = countLabel(pattern.projects_count);
  const comments = countLabel(pattern.comments_count);
  const yarns = countLabel(pattern.packs_count);

  return (
    <View className="bg-black pb-4">
      <ForYouPostHeader
        name={designer}
        patternName={pattern.name}
        profileHref={profileHref}
        avatar={user?.small_photo_url ?? user?.photo_url ?? null}
        patternId={pattern.id}
      />
      <PhotoCarousel
        photos={pattern.photos}
        aspectRatio={1}
        dotsPlacement="below"
        showCounter={false}
      />
      <View className="flex-row items-center justify-between px-[18px] pt-1">
        <View className="flex-row items-center gap-[19px]">
          <Stat
            icon={<Heart color="#ffffff" />}
            count={favorites}
            label="Favorites"
          />
          <Stat
            icon={<Projects color="#ffffff" />}
            count={projects}
            label="Projects"
          />
          <Stat
            icon={<Comments color="#ffffff" />}
            count={comments}
            label="Comments"
          />
          <Stat
            icon={<Yarn color="#ffffff" />}
            count={yarns}
            label="Yarn"
          />
        </View>
        <Bookmark color="#ffffff" />
      </View>
      <View className="mt-2 gap-1 px-4">
        {notes
          ? (
              <ExpandableText
                prefix={designer}
                text={notes}
                numberOfLines={1}
                className="text-sm text-fog-300"
                prefixClassName="font-bold text-white"
                moreClassName="text-sm font-semibold text-fog-500"
              />
            )
          : (
              <Text className="text-sm text-white" numberOfLines={1}>
                <Text className="font-bold">{designer}</Text>
                {pattern.name
                  ? (
                      <Text className="font-normal text-fog-300">
                        {' '}
                        {pattern.name}
                      </Text>
                    )
                  : null}
              </Text>
            )}
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
