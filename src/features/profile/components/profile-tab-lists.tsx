import type { RavelryFavorite, RavelryPattern, RavelryProject } from '../api';
import type { ProfileTab } from './profile-header';
import * as React from 'react';
import { FlatList } from 'react-native';

import { Text, View } from '@/components/ui';
import {
  PROFILE_GRID_COLS,
  PROFILE_GRID_GAP,
} from '../profile-grid-layout';
import {
  DesignTile,
  FavoriteTile,
  ProjectTile,
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

function PlaceholderEmpty({ title, message }: { title: string; message: string }) {
  return (
    <View className="items-center px-8 pt-16">
      <Text className="text-center text-base font-semibold text-white">
        {title}
      </Text>
      <Text className="mt-1.5 text-center text-sm text-fog-400">
        {message}
      </Text>
    </View>
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

function ChipPlaceholder({
  header,
  title,
  message,
}: {
  header: React.ReactElement;
  title: string;
  message: string;
}) {
  return (
    <FlatList
      data={[]}
      renderItem={() => null}
      ListHeaderComponent={header}
      ListEmptyComponent={<PlaceholderEmpty title={title} message={message} />}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
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
  projectsPending: boolean;
  favoritesPending: boolean;
  designsPending: boolean;
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
  projectsPending,
  favoritesPending,
  designsPending,
}: Props) {
  if (tab === 'queued') {
    return (
      <ChipPlaceholder
        header={header}
        title="Nothing queued yet"
        message="Patterns you queue will show up here."
      />
    );
  }

  if (tab === 'stash') {
    return (
      <ChipPlaceholder
        header={header}
        title="Stash is empty"
        message="Yarn you stash will show up here."
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
