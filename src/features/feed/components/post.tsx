import type { RavelryPhoto } from '@/lib/ravelry/types';
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

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function relativeDate(value: string | null | undefined): string {
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

type PostHeaderProps = {
  name: string;
  subtitle: string;
  profileHref: string | null;
  avatar: string | null;
  trailing?: React.ReactNode;
};

function PostHeader({
  name,
  subtitle,
  profileHref,
  avatar,
  trailing,
}: PostHeaderProps) {
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
        {subtitle
          ? (
              <Text className="text-sm font-light text-fog-500" numberOfLines={1}>
                {subtitle}
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
      {trailing
        ? <View className="ml-3">{trailing}</View>
        : null}
    </View>
  );
}

type PostBase = {
  authorName: string;
  authorAvatar: string | null;
  authorHref: string | null;
  photos: RavelryPhoto[];
  notesHtml?: string | null;
  relative?: string | null;
  favoritesCount?: number | null;
  commentsCount?: number | null;
};

export type PatternPostProps = PostBase & {
  variant: 'pattern';
  patternId: number;
  patternName: string;
  /** How many projects have been made from this pattern. */
  projectsCount?: number | null;
  /** Yarn / pack rows when present on Pattern#full. */
  packsCount?: number | null;
  timelineDate?: string | null;
};

export type ProjectPostProps = PostBase & {
  variant: 'project';
  projectName: string;
  /** Pattern the project is based on, when known. */
  patternName?: string | null;
};

export type PostProps = PatternPostProps | ProjectPostProps;

export function Post(props: PostProps) {
  const {
    authorName,
    authorAvatar,
    authorHref,
    photos,
    notesHtml,
    favoritesCount,
    commentsCount,
  } = props;

  const subtitle
    = props.variant === 'pattern'
      ? props.patternName
      : (props.patternName || props.projectName);
  const notes = notesHtml ? stripHtml(notesHtml) : '';
  const relative
    = props.relative?.trim()
      || (props.variant === 'pattern'
        ? relativeDate(props.timelineDate)
        : '');
  const favorites = countLabel(favoritesCount);
  const comments = countLabel(commentsCount);
  const projects
    = props.variant === 'pattern'
      ? countLabel(props.projectsCount)
      : null;
  const yarns
    = props.variant === 'pattern'
      ? countLabel(props.packsCount)
      : null;
  const captionFallbackTitle
    = props.variant === 'pattern'
      ? props.patternName
      : props.projectName;

  const trailing
    = props.variant === 'pattern'
      ? (
          <Link href={`/pattern/${props.patternId}` as never} asChild>
            <Pressable
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Pattern info"
            >
              <PatternInfo color="#ffffff" />
            </Pressable>
          </Link>
        )
      : null;

  return (
    <View className="bg-black pb-4">
      <PostHeader
        name={authorName}
        subtitle={subtitle}
        profileHref={authorHref}
        avatar={authorAvatar}
        trailing={trailing}
      />
      <PhotoCarousel
        photos={photos}
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
          {props.variant === 'pattern'
            ? (
                <Stat
                  icon={<Projects color="#ffffff" />}
                  count={projects}
                  label="Projects"
                />
              )
            : null}
          <Stat
            icon={<Comments color="#ffffff" />}
            count={comments}
            label="Comments"
          />
          {props.variant === 'pattern'
            ? (
                <Stat
                  icon={<Yarn color="#ffffff" />}
                  count={yarns}
                  label="Yarn"
                />
              )
            : null}
        </View>
        <Bookmark color="#ffffff" />
      </View>
      <View className="mt-2 gap-1 px-4">
        {notes
          ? (
              <ExpandableText
                prefix={authorName}
                text={notes}
                numberOfLines={1}
                className="text-sm text-fog-300"
                prefixClassName="font-bold text-white"
                moreClassName="text-sm font-semibold text-fog-500"
              />
            )
          : (
              <Text className="text-sm text-white" numberOfLines={1}>
                <Text className="font-bold">{authorName}</Text>
                {captionFallbackTitle
                  ? (
                      <Text className="font-normal text-fog-300">
                        {' '}
                        {captionFallbackTitle}
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
