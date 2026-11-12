import type { PatternHighlight } from '@/lib/ravelry/types';
import { View } from 'react-native';

import {
  EXPLORE_GAP,
  EXPLORE_PLACEMENTS,
  exploreBlockHeight,
  exploreTileFrame,
} from '../explore-layout';
import { HighlightTile } from './highlight-tile';

export function ExploreBlock({
  items,
  cell,
  width,
}: {
  items: PatternHighlight[];
  cell: number;
  width: number;
}) {
  return (
    <View
      style={{
        height: exploreBlockHeight(cell),
        width,
        marginBottom: EXPLORE_GAP,
      }}
    >
      {items.map((item, index) => {
        const placement = EXPLORE_PLACEMENTS[index];
        if (!placement)
          return null;
        const frame = exploreTileFrame(placement, cell);
        return (
          <View
            key={item.id}
            style={{
              position: 'absolute',
              left: frame.left,
              top: frame.top,
              width: frame.size,
              height: frame.size,
            }}
          >
            <HighlightTile item={item} size={frame.size} />
          </View>
        );
      })}
    </View>
  );
}
