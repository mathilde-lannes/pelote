import type { RavelryFavorite, RavelryPattern, RavelryProject, RavelryQueuedProject, RavelryStash } from '../api';
import type { ProfileTab } from './profile-header';
import * as React from 'react';
import { FlatList } from 'react-native';

import { Text } from '@/components/ui';
import {
  PROFILE_GRID_COLS,
  PROFILE_GRID_GAP,
} from '../profile-grid-layout';
import {
  DesignTile,
  FavoriteTile,
  ProjectTile,
  QueueTile,
  StashTile,
} from './profile-grid-tiles';
import { ProfileGridSkeleton } from './profile-skeletons';

function EmptyState({ pending, label }: { pending: boolean; label: string }) {
  if (pending)
    return <ProfileGridSkeleton />;
  return (
    <Text className="mt-10 text-center text-sm text-fog-400">
      {label}
    </Text>
  );
}

function ProfileGrid<T>({
  listKey,
  header,
  data,
  pending,
  emptyLabel,
  keyExtractor,
  renderItem,
}: {
  listKey: string;
  header: React.ReactElement;
  data: T[];
  pending: boolean;
  emptyLabel: string;
  keyExtractor: (item: T) => string;
  renderItem: (item: T) => React.ReactElement;
}) {
  return (
    <FlatList
      key={listKey}
      numColumns={PROFILE_GRID_COLS}
      columnWrapperStyle={{ gap: PROFILE_GRID_GAP }}
      contentContainerStyle={{ gap: PROFILE_GRID_GAP, paddingBottom: 24 }}
      ListHeaderComponent={header}
      data={pending ? [] : data}
      keyExtractor={keyExtractor}
      ListEmptyComponent={<EmptyState pending={pending} label={emptyLabel} />}
      renderItem={({ item }) => renderItem(item)}
    />
  );
}

type Props = {
  tab: ProfileTab;
  header: React.ReactElement;
  displayName: string;
  designerPermalink?: string;
  designerId?: number;
  projects: RavelryProject[];
  favorites: RavelryFavorite[];
  designs: RavelryPattern[];
  stash: RavelryStash[];
  queue: RavelryQueuedProject[];
  projectsPending: boolean;
  favoritesPending: boolean;
  designsPending: boolean;
  stashPending: boolean;
  queuePending: boolean;
};

export function ProfileTabLists({
  tab,
  header,
  displayName,
  designerPermalink,
  designerId,
  projects,
  favorites,
  designs,
  stash,
  queue,
  projectsPending,
  favoritesPending,
  designsPending,
  stashPending,
  queuePending,
}: Props) {
  if (tab === 'queued') {
    return (
      <ProfileGrid
        listKey="queued"
        header={header}
        data={queue}
        pending={queuePending}
        emptyLabel="Nothing queued yet."
        keyExtractor={item => String(item.id)}
        renderItem={item => (
          <QueueTile username={displayName} queued={item} />
        )}
      />
    );
  }

  if (tab === 'stash') {
    return (
      <ProfileGrid
        listKey="stash"
        header={header}
        data={stash}
        pending={stashPending}
        emptyLabel="No stash yet."
        keyExtractor={item => String(item.id)}
        renderItem={item => (
          <StashTile username={displayName} stash={item} />
        )}
      />
    );
  }

  if (tab === 'designs') {
    return (
      <ProfileGrid
        listKey="designs"
        header={header}
        data={designs}
        pending={designsPending}
        emptyLabel="No published designs yet."
        keyExtractor={item => String(item.id)}
        renderItem={item => (
          <DesignTile
            username={displayName}
            pattern={item}
            designerPermalink={designerPermalink}
            designerId={designerId}
          />
        )}
      />
    );
  }

  if (tab === 'favourites') {
    return (
      <ProfileGrid
        listKey="favourites"
        header={header}
        data={favorites}
        pending={favoritesPending}
        emptyLabel="No favourites yet."
        keyExtractor={item => `fav-${item.type}-${item.id}`}
        renderItem={item => <FavoriteTile item={item} />}
      />
    );
  }

  return (
    <ProfileGrid
      listKey="projects"
      header={header}
      data={projects}
      pending={projectsPending}
      emptyLabel="No public projects yet."
      keyExtractor={item => String(item.id)}
      renderItem={item => (
        <ProjectTile username={displayName} project={item} />
      )}
    />
  );
}
