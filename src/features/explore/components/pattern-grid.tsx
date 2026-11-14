import type { RavelryPattern } from '@/lib/ravelry/types';
import * as React from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  useWindowDimensions,
  View,
} from 'react-native';

import { PatternTile } from './pattern-tile';

const GAP = 2;
const COLUMNS = 3;

function GridFooter({ loading }: { loading: boolean }) {
  if (!loading)
    return null;
  return (
    <View className="items-center py-4">
      <ActivityIndicator color="#ffffff" />
    </View>
  );
}

type Props = {
  patterns: RavelryPattern[];
  listRef?: React.RefObject<FlatList<RavelryPattern> | null>;
  ListHeaderComponent?: React.ReactElement | null;
  onEndReached?: () => void;
  refreshing?: boolean;
  onRefresh?: () => void;
  fetchingNextPage?: boolean;
  hrefForPattern?: (pattern: RavelryPattern) => string | null;
};

export function PatternGrid({
  patterns,
  listRef,
  ListHeaderComponent,
  onEndReached,
  refreshing = false,
  onRefresh,
  fetchingNextPage = false,
  hrefForPattern,
}: Props) {
  const { width } = useWindowDimensions();
  const cell = (width - GAP * (COLUMNS - 1)) / COLUMNS;

  const renderTile = React.useCallback(
    ({ item }: { item: RavelryPattern }) => (
      <PatternTile
        pattern={item}
        size={cell}
        href={hrefForPattern?.(item)}
      />
    ),
    [cell, hrefForPattern],
  );

  return (
    <FlatList
      ref={listRef}
      data={patterns}
      keyExtractor={item => String(item.id)}
      numColumns={COLUMNS}
      columnWrapperStyle={{ gap: GAP }}
      contentContainerStyle={{ gap: GAP }}
      renderItem={renderTile}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        onRefresh
          ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#ffffff"
              />
            )
          : undefined
      }
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={<GridFooter loading={fetchingNextPage} />}
    />
  );
}
