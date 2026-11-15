import type { RavelryFavorite, RavelryPattern, RavelryProject } from '../api';
import { Image } from 'expo-image';
import { Link, usePathname } from 'expo-router';
import * as React from 'react';
import { Pressable } from 'react-native';

import { Text, View } from '@/components/ui';
import { patternHref } from '@/features/explore/pattern-href';
import { bestPhotoUrl } from '@/lib/ravelry/api';
import {
  designerDesignsFeedHref,
  userProjectFeedHref,
} from '../designer-profile-href';
import { PROFILE_GRID_TILE } from '../profile-grid-layout';

function TileFallback({ label }: { label: string }) {
  return (
    <View className="size-full items-center justify-center bg-ink-200 px-2">
      <Text className="text-center text-xs text-fog-400" numberOfLines={3}>
        {label}
      </Text>
    </View>
  );
}

export function ProjectTile({
  username,
  project,
}: {
  username: string;
  project: RavelryProject;
}) {
  const pathname = usePathname();
  const uri = bestPhotoUrl(project.first_photo ?? project.photos?.[0]);
  const href = userProjectFeedHref(username, project.id, pathname);

  return (
    <Link href={href as never} asChild>
      <Pressable style={{ width: PROFILE_GRID_TILE, height: PROFILE_GRID_TILE }}>
        {uri
          ? (
              <Image
                source={{ uri }}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
              />
            )
          : <TileFallback label={project.name} />}
      </Pressable>
    </Link>
  );
}

export function FavoriteTile({ item }: { item: RavelryFavorite }) {
  const pathname = usePathname();
  const label
    = item.name?.trim()
      || (item.type === 'pattern' ? 'Pattern' : 'Project');
  const href
    = item.type === 'pattern'
      ? patternHref(item.type_id, pathname)
      : item.owner_username
        ? userProjectFeedHref(item.owner_username, item.type_id, pathname)
        : null;

  const body = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={!href}
      style={{ width: PROFILE_GRID_TILE, height: PROFILE_GRID_TILE }}
    >
      {item.photo_url
        ? (
            <Image
              source={{ uri: item.photo_url }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
            />
          )
        : <TileFallback label={label} />}
    </Pressable>
  );

  if (!href)
    return body;

  return (
    <Link href={href as never} asChild>
      {body}
    </Link>
  );
}

export function DesignTile({
  username,
  pattern,
  designerPermalink,
  designerId,
}: {
  username: string;
  pattern: RavelryPattern;
  designerPermalink?: string;
  designerId?: number;
}) {
  const pathname = usePathname();
  const uri = bestPhotoUrl(pattern.photos[0]);
  const href
    = designerDesignsFeedHref(
      {
        id: designerId ?? pattern.pattern_author?.id ?? 0,
        name: pattern.pattern_author?.name ?? '',
        permalink: designerPermalink ?? pattern.pattern_author?.permalink,
        users: pattern.pattern_author?.users?.length
          ? pattern.pattern_author.users
          : [{ id: 0, username, small_photo_url: null, photo_url: null }],
      },
      pattern.id,
      pathname,
    )
    ?? `${pathname?.startsWith('/search') ? '/search/user' : '/user'}/${username}/designs/${pattern.id}`;

  return (
    <Link href={href as never} asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={pattern.name}
        style={{ width: PROFILE_GRID_TILE, height: PROFILE_GRID_TILE }}
      >
        {uri
          ? (
              <Image
                source={{ uri }}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
              />
            )
          : <TileFallback label={pattern.name} />}
      </Pressable>
    </Link>
  );
}
