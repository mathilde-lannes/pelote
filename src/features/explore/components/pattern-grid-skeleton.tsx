import { MotiView } from 'moti';
import * as React from 'react';
import { useWindowDimensions, View } from 'react-native';

import { Text } from '@/components/ui';

const GAP = 2;
const COLUMNS = 3;
const ROWS = 8;

function PatternTileSkeleton({ size }: { size: number }) {
  return (
    <View
      style={{ width: size, height: size }}
      className="bg-ink-200"
    />
  );
}

export function PatternGridSkeleton({
  headerTitle,
}: {
  headerTitle?: string | null;
}) {
  const { width } = useWindowDimensions();
  const cell = (width - GAP * (COLUMNS - 1)) / COLUMNS;
  const tiles = React.useMemo(
    () => Array.from({ length: COLUMNS * ROWS }, (_, index) => index),
    [],
  );

  return (
    <View className="flex-1 bg-black">
      {headerTitle
        ? (
            <View className="items-center border-b border-ink-300 px-4 py-3">
              <Text className="text-lg font-semibold text-white">
                {headerTitle}
              </Text>
            </View>
          )
        : null}
      <MotiView
        from={{ opacity: 0.35 }}
        animate={{ opacity: 0.85 }}
        transition={{
          type: 'timing',
          duration: 750,
          loop: true,
          repeatReverse: true,
        }}
        className="flex-row flex-wrap"
        style={{ gap: GAP }}
      >
        {tiles.map(index => (
          <PatternTileSkeleton
            key={`grid-skeleton-${index}`}
            size={cell}
          />
        ))}
      </MotiView>
    </View>
  );
}
