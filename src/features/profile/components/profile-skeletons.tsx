import { MotiView } from 'moti';
import * as React from 'react';
import { View } from 'react-native';

import {
  PROFILE_GRID_COLS,
  PROFILE_GRID_GAP,
  PROFILE_GRID_TILE,
} from '../profile-grid-layout';

const GRID_ROWS = 4;

function SkeletonBlock({
  className,
  delay = 0,
  style,
}: {
  className?: string;
  delay?: number;
  style?: object;
}) {
  return (
    <MotiView
      from={{ opacity: 0.35 }}
      animate={{ opacity: 0.85 }}
      transition={{
        type: 'timing',
        duration: 750,
        loop: true,
        repeatReverse: true,
        delay,
      }}
      className={className}
      style={style}
    />
  );
}

export function ProfileCountSkeleton() {
  return (
    <View className="gap-1.5">
      <SkeletonBlock className="h-4 w-8 rounded-sm bg-ink-300" />
      <SkeletonBlock className="h-3 w-14 rounded-sm bg-ink-200" delay={60} />
    </View>
  );
}

export function ProfileGridSkeleton({ rows = GRID_ROWS }: { rows?: number }) {
  const tiles = React.useMemo(
    () => Array.from({ length: PROFILE_GRID_COLS * rows }, (_, i) => i),
    [rows],
  );

  return (
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
      style={{ gap: PROFILE_GRID_GAP }}
    >
      {tiles.map(index => (
        <View
          key={`profile-grid-skel-${index}`}
          style={{ width: PROFILE_GRID_TILE, height: PROFILE_GRID_TILE }}
          className="bg-ink-200"
        />
      ))}
    </MotiView>
  );
}

export function ProfileScreenSkeleton({
  showSettings = false,
  showDesignsChip = false,
}: {
  showSettings?: boolean;
  showDesignsChip?: boolean;
}) {
  const chipWidths = showDesignsChip
    ? [76, 72, 64, 88, 56]
    : [72, 64, 88, 56];
  return (
    <View className="flex-1 bg-black pt-2">
      <View className="flex-row items-center gap-5 px-4 pb-2">
        <SkeletonBlock className="size-[86px] rounded-full bg-ink-300" />
        <View className="min-w-0 flex-1">
          <View className="flex-row items-start justify-between gap-3">
            <SkeletonBlock className="h-6 w-36 rounded-sm bg-ink-300" delay={40} />
            {showSettings
              ? <SkeletonBlock className="size-6 rounded-sm bg-ink-300" delay={80} />
              : null}
          </View>
          <View className="mt-3 flex-row gap-6">
            <ProfileCountSkeleton />
            <ProfileCountSkeleton />
          </View>
        </View>
      </View>
      <View className="mt-2 mb-3 gap-1.5 px-4">
        <SkeletonBlock className="h-3 w-full rounded-sm bg-ink-200" delay={60} />
        <SkeletonBlock className="h-3 w-4/5 rounded-sm bg-ink-200" delay={100} />
      </View>
      <View className="mt-3 flex-row gap-2 px-4 pb-3">
        {chipWidths.map((width, index) => (
          <SkeletonBlock
            key={width}
            className="h-8 rounded-full bg-ink-300"
            delay={100 + index * 40}
            style={{ width }}
          />
        ))}
      </View>
      <ProfileGridSkeleton />
    </View>
  );
}
