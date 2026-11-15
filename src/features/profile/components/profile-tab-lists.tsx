import type { RavelryFavorite, RavelryPattern, RavelryProject } from '../api';
import type { ProfileTab } from './profile-header';
import * as React from 'react';
import { ActivityIndicator, FlatList } from 'react-native';

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

function EmptyState({ pending, label }: { pending: boolean; label: string }) {
  if (pending) {
    return (
      <View className="items-center py-10">
        <ActivityIndicator color="#ffffff" />
      </View>
    );
  }
  return (
    <Text className="mt-10 text-center text-sm text-fog-400">
      {label}
    </Text>
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
  const listProps = {
    numColumns: PROFILE_GRID_COLS,
    columnWrapperStyle: { gap: PROFILE_GRID_GAP },
    contentContainerStyle: { gap: PROFILE_GRID_GAP, paddingBottom: 24 },
    ListHeaderComponent: header,
  } as const;

  if (tab === 'favourites') {
    return (
      <FlatList
        {...listProps}
        data={favorites}
        keyExtractor={item => `fav-${item.type}-${item.id}`}
        ListEmptyComponent={(
          <EmptyState pending={favoritesPending} label="No favourites yet." />
        )}
        renderItem={({ item }) => <FavoriteTile item={item} />}
      />
    );
  }

  if (tab === 'designs') {
    return (
      <FlatList
        {...listProps}
        data={designs}
        keyExtractor={item => String(item.id)}
        ListEmptyComponent={(
          <EmptyState
            pending={designsPending}
            label="No published designs yet."
          />
        )}
        renderItem={({ item }) => (
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

  return (
    <FlatList
      {...listProps}
      data={projects}
      keyExtractor={item => String(item.id)}
      ListEmptyComponent={(
        <EmptyState pending={projectsPending} label="No public projects yet." />
      )}
      renderItem={({ item }) => (
        <ProjectTile username={displayName} project={item} />
      )}
    />
  );
}
