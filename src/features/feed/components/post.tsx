import type { FavoriteTarget } from '@/features/feed/use-post-favorite';
import type { RavelryPhoto } from '@/lib/ravelry/types';
import { Image } from 'expo-image';
import { Link, usePathname } from 'expo-router';
import * as React from 'react';

import { ExpandableText } from '@/components/expandable-text';
import { Pressable, Text, useModal, View } from '@/components/ui';
import colors from '@/components/ui/colors';
import {
  Bookmark,
  Comments,
  Heart,
  PatternInfo,
  Projects,
  Yarn,
} from '@/components/ui/icons';
import { patternProjectsHref } from '@/features/explore/pattern-href';
import { PatternInfoSheet } from '@/features/feed/components/pattern-info-sheet';
import { PhotoCarousel } from '@/features/feed/components/photo-carousel';
import { ProjectInfoSheet } from '@/features/feed/components/project-info-sheet';
import { YarnPackSheet } from '@/features/feed/components/project-yarn-sheet';
import { UnfavoriteConfirmSheet } from '@/features/feed/components/unfavorite-confirm-sheet';
import { formatCompactCount } from '@/features/feed/format-compact-count';
import { formatRelative } from '@/features/feed/format-relative';
import { usePostFavorite } from '@/features/feed/use-post-favorite';
import { YarnInfoSheet } from '@/features/yarn/yarn-info-sheet';

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
  return n > 0 ? formatCompactCount(n) : null;
}

function Stat({
  icon,
  count,
  label,
  href,
  onPress,
  accessibilityState,
}: {
  icon: React.ReactNode;
  count: string | null;
  label: string;
  href?: string | null;
  onPress?: () => void;
  accessibilityState?: { selected?: boolean; disabled?: boolean };
}) {
  const body = (
    <>
      {icon}
      {count
        ? (
            <Text className="text-sm font-bold text-white">
              {count}
            </Text>
          )
        : null}
    </>
  );
  const accessibilityLabel = count ? `${label} ${count}` : label;

  if (href) {
    return (
      <Link href={href as never} asChild>
        <Pressable
          className="flex-row items-center gap-2"
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          hitSlop={8}
        >
          {body}
        </Pressable>
      </Link>
    );
  }

  if (onPress) {
    return (
      <Pressable
        className="flex-row items-center gap-2"
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={accessibilityState}
        hitSlop={8}
        disabled={accessibilityState?.disabled}
      >
        {body}
      </Pressable>
    );
  }

  return (
    <View
      className="flex-row items-center gap-2"
      accessibilityLabel={accessibilityLabel}
    >
      {body}
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
  projectId: number;
  projectName: string;
  /** Owner username for Project#show (usually same as authorName). */
  ownerUsername: string;
  /** Linked pattern when known. */
  patternId?: number | null;
  /** Pattern the project is based on, when known. */
  patternName?: string | null;
  /** Designer display name shown next to the pattern name. */
  designerName?: string | null;
  /** Yarn pack count from Project#full when known. */
  packsCount?: number | null;
};

/** A skein from the user’s stash — their yarn, not the catalog page. */
export type YarnPostProps = PostBase & {
  variant: 'yarn';
  stashId: number;
  yarnId?: number | null;
  yarnName: string;
  /** Colorway and catalog yarn, shown under the user. */
  yarnSubtitle: string;
  ownerUsername: string;
};

/** A pattern the user has queued — their queue entry, not the catalog page. */
export type QueuePostProps = PostBase & {
  variant: 'queue';
  queuedProjectId: number;
  patternId?: number | null;
  patternName: string;
  designerName?: string | null;
  yarnId?: number | null;
  yarnName?: string | null;
  skeins?: number | null;
  projectsCount?: number | null;
};

export type PostProps = PatternPostProps | ProjectPostProps | YarnPostProps | QueuePostProps;

function PostStats({
  variant,
  patternId,
  favorites,
  favorited,
  onFavoritePress,
  favoriteDisabled,
  projects,
  comments,
  yarns,
  projectsHref,
  yarnAction,
}: {
  variant: PostProps['variant'];
  patternId?: number;
  favorites: string | null;
  favorited: boolean;
  onFavoritePress?: () => void;
  favoriteDisabled?: boolean;
  projects: string | null;
  comments: string | null;
  yarns: string | null;
  projectsHref?: string | null;
  yarnAction?: React.ReactNode;
}) {
  const heartColor = favorited ? colors.danger[500] : '#ffffff';
  const showProjects
    = (variant === 'pattern' || variant === 'queue') && patternId != null;
  return (
    <View className="flex-row items-center justify-between px-[18px] pt-1">
      <View className="flex-row items-center gap-[19px]">
        <Stat
          icon={<Heart color={heartColor} filled={favorited} />}
          count={favorites}
          label={favorited ? 'Favorited' : 'Favorite'}
          onPress={onFavoritePress}
          accessibilityState={{
            selected: favorited,
            disabled: favoriteDisabled,
          }}
        />
        {showProjects
          ? (
              <Stat
                icon={<Projects color="#ffffff" />}
                count={projects}
                label="Projects"
                href={projectsHref}
              />
            )
          : null}
        <Stat
          icon={<Comments color="#ffffff" />}
          count={comments}
          label="Comments"
        />
        {yarnAction
          ?? (variant === 'pattern'
            ? (
                <Stat
                  icon={<Yarn color="#ffffff" />}
                  count={yarns}
                  label="Yarn"
                />
              )
            : null)}
      </View>
      <Bookmark color="#ffffff" />
    </View>
  );
}

function PostCaption({
  authorName,
  notes,
  fallbackTitle,
  relative,
}: {
  authorName: string;
  notes: string;
  fallbackTitle: string;
  relative: string;
}) {
  return (
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
              {fallbackTitle
                ? (
                    <Text className="font-normal text-fog-300">
                      {' '}
                      {fallbackTitle}
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
  );
}

function PatternInfoTrailing({
  patternId,
  patternName,
}: {
  patternId: number;
  patternName: string;
}) {
  const modal = useModal();
  const [opened, setOpened] = React.useState(false);

  const onPress = React.useCallback(() => {
    setOpened(true);
    modal.present();
  }, [modal]);

  return (
    <>
      <Pressable
        onPress={onPress}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Pattern info"
      >
        <PatternInfo color="#ffffff" />
      </Pressable>
      <PatternInfoSheet
        ref={modal.ref}
        patternId={patternId}
        patternName={patternName}
        enabled={opened}
      />
    </>
  );
}

function YarnInfoTrailing({
  yarnId,
  yarnName,
}: {
  yarnId: number;
  yarnName: string;
}) {
  const modal = useModal();
  const [opened, setOpened] = React.useState(false);

  const onPress = React.useCallback(() => {
    setOpened(true);
    modal.present();
  }, [modal]);

  return (
    <>
      <Pressable
        onPress={onPress}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Yarn info"
      >
        <PatternInfo color="#ffffff" />
      </Pressable>
      <YarnInfoSheet
        ref={modal.ref}
        yarnId={yarnId}
        yarnName={yarnName}
        enabled={opened}
      />
    </>
  );
}

function ProjectInfoTrailing({
  username,
  projectId,
  projectName,
  patternId,
  patternName,
}: {
  username: string;
  projectId: number;
  projectName: string;
  patternId?: number | null;
  patternName?: string | null;
}) {
  const modal = useModal();
  const [opened, setOpened] = React.useState(false);

  const onPress = React.useCallback(() => {
    setOpened(true);
    modal.present();
  }, [modal]);

  return (
    <>
      <Pressable
        onPress={onPress}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Project info"
      >
        <PatternInfo color="#ffffff" />
      </Pressable>
      <ProjectInfoSheet
        ref={modal.ref}
        username={username}
        projectId={projectId}
        projectName={projectName}
        patternId={patternId}
        patternName={patternName}
        enabled={opened}
      />
    </>
  );
}

function CatalogYarnStat({
  yarnId,
  yarnName,
  count,
}: {
  yarnId: number;
  yarnName: string;
  count: string | null;
}) {
  const modal = useModal();
  const [opened, setOpened] = React.useState(false);

  const onPress = React.useCallback(() => {
    setOpened(true);
    modal.present();
  }, [modal]);

  return (
    <>
      <Stat
        icon={<Yarn color="#ffffff" />}
        count={count}
        label="Yarn"
        onPress={onPress}
      />
      <YarnInfoSheet
        ref={modal.ref}
        yarnId={yarnId}
        yarnName={yarnName}
        enabled={opened}
      />
    </>
  );
}

function YarnStat(
  props: {
    count: string | null;
  } & (
    | {
      source: 'pattern';
      patternId: number;
      title: string;
    }
    | {
      source: 'project';
      username: string;
      projectId: number;
      title: string;
    }
  ),
) {
  const modal = useModal();
  const [opened, setOpened] = React.useState(false);

  const onPress = React.useCallback(() => {
    setOpened(true);
    modal.present();
  }, [modal]);

  return (
    <>
      <Stat
        icon={<Yarn color="#ffffff" />}
        count={props.count}
        label="Yarn"
        onPress={onPress}
      />
      {props.source === 'pattern'
        ? (
            <YarnPackSheet
              ref={modal.ref}
              source="pattern"
              patternId={props.patternId}
              title={props.title}
              enabled={opened}
            />
          )
        : (
            <YarnPackSheet
              ref={modal.ref}
              source="project"
              username={props.username}
              projectId={props.projectId}
              title={props.title}
              enabled={opened}
            />
          )}
    </>
  );
}

function projectSubtitle({
  patternName,
  designerName,
  projectName,
}: {
  patternName?: string | null;
  designerName?: string | null;
  projectName: string;
}): string {
  const pattern = patternName?.trim() || '';
  const designer = designerName?.trim() || '';
  if (pattern && designer)
    return `${pattern} · ${designer}`;
  if (pattern)
    return pattern;
  return projectName;
}

function favoriteTargetFor(props: PostProps): FavoriteTarget | null {
  if (props.variant === 'pattern')
    return { type: 'pattern', id: props.patternId };
  if (props.variant === 'project')
    return { type: 'project', id: props.projectId };
  if (props.variant === 'queue' && props.patternId != null && props.patternId > 0)
    return { type: 'pattern', id: props.patternId };
  return null;
}

function postTrailing(props: PostProps) {
  if (props.variant === 'pattern') {
    return (
      <PatternInfoTrailing
        patternId={props.patternId}
        patternName={props.patternName}
      />
    );
  }
  if (props.variant === 'queue') {
    if (props.patternId == null || props.patternId <= 0)
      return null;
    return (
      <PatternInfoTrailing
        patternId={props.patternId}
        patternName={props.patternName}
      />
    );
  }
  if (props.variant === 'yarn') {
    if (props.yarnId == null || props.yarnId <= 0)
      return null;
    return (
      <YarnInfoTrailing yarnId={props.yarnId} yarnName={props.yarnName} />
    );
  }
  return (
    <ProjectInfoTrailing
      username={props.ownerUsername}
      projectId={props.projectId}
      projectName={props.projectName}
      patternId={props.patternId}
      patternName={props.patternName}
    />
  );
}

function postSubtitle(props: PostProps): string {
  if (props.variant === 'pattern')
    return props.patternName;
  if (props.variant === 'yarn')
    return props.yarnSubtitle;
  if (props.variant === 'queue') {
    return projectSubtitle({
      patternName: props.patternName,
      designerName: props.designerName,
      projectName: props.patternName,
    });
  }
  return projectSubtitle(props);
}

function postCaptionTitle(props: PostProps): string {
  if (props.variant === 'pattern' || props.variant === 'queue')
    return props.patternName;
  if (props.variant === 'yarn')
    return props.yarnName;
  return props.projectName;
}

function postProjectsHref(props: PostProps, pathname: string): string | null {
  if (props.variant === 'pattern')
    return patternProjectsHref(props.patternId, pathname);
  if (props.variant === 'queue' && props.patternId != null && props.patternId > 0)
    return patternProjectsHref(props.patternId, pathname);
  return null;
}

function postYarnAction(props: PostProps) {
  if (props.variant === 'yarn')
    return null;
  if (props.variant === 'queue') {
    if (props.yarnId == null || props.yarnId <= 0)
      return null;
    return (
      <CatalogYarnStat
        yarnId={props.yarnId}
        yarnName={props.yarnName || props.patternName}
        count={countLabel(props.skeins)}
      />
    );
  }
  if (props.variant === 'pattern') {
    return (
      <YarnStat
        source="pattern"
        patternId={props.patternId}
        title={props.patternName}
        count={countLabel(props.packsCount)}
      />
    );
  }
  return (
    <YarnStat
      source="project"
      username={props.ownerUsername}
      projectId={props.projectId}
      title={props.projectName}
      count={countLabel(props.packsCount)}
    />
  );
}

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
  const pathname = usePathname();
  const favorite = usePostFavorite(favoriteTargetFor(props), favoritesCount);
  const notes = notesHtml ? stripHtml(notesHtml) : '';
  const relative
    = props.relative?.trim()
      || (props.variant === 'pattern'
        ? relativeDate(props.timelineDate)
        : '');
  const captionFallbackTitle = postCaptionTitle(props);
  const projectsHref = postProjectsHref(props, pathname);
  const unfavoriteTitle = `Remove “${captionFallbackTitle}” from favorites?`;

  return (
    <View className="bg-black pb-4">
      <PostHeader
        name={authorName}
        subtitle={postSubtitle(props)}
        profileHref={authorHref}
        avatar={authorAvatar}
        trailing={postTrailing(props)}
      />
      <PhotoCarousel
        photos={photos}
        aspectRatio={1}
        dotsPlacement="below"
        showCounter={false}
        onDoubleTap={favorite.requestToggle}
      />
      <PostStats
        variant={props.variant}
        patternId={
          props.variant === 'pattern' || props.variant === 'queue'
            ? (props.patternId ?? undefined)
            : undefined
        }
        favorites={countLabel(favorite.displayCount)}
        favorited={favorite.isFavorited}
        onFavoritePress={favorite.requestToggle}
        favoriteDisabled={favorite.pending}
        projects={
          props.variant === 'pattern' || props.variant === 'queue'
            ? countLabel(props.projectsCount)
            : null
        }
        comments={countLabel(commentsCount)}
        yarns={null}
        projectsHref={projectsHref}
        yarnAction={postYarnAction(props)}
      />
      <PostCaption
        authorName={authorName}
        notes={notes}
        fallbackTitle={captionFallbackTitle}
        relative={relative}
      />
      <UnfavoriteConfirmSheet
        ref={favorite.unfavoriteModal.ref}
        title={unfavoriteTitle}
        onConfirm={() => {
          void favorite.confirmRemove();
        }}
        onCancel={favorite.unfavoriteModal.dismiss}
        confirming={favorite.removing}
      />
    </View>
  );
}
