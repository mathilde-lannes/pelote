import type { FlatList as FlatListType } from 'react-native';
import type { RavelryPattern } from './api';
import { useLocalSearchParams } from 'expo-router';
import * as React from 'react';
import { ActivityIndicator, FlatList } from 'react-native';

import { FocusAwareStatusBar, Text, View } from '@/components/ui';
import { usePattern } from '@/features/explore/api';
import { useDesignerPatterns, usePerson } from './api';
import { DesignerPatternPost } from './components/designer-pattern-post';
import {
  DESIGN_POST_ITEM_HEIGHT,
  designPostOffset,
} from './designer-patterns-feed-layout';

function FeedStatus({ message }: { message: string }) {
  return (
    <View className="flex-1 items-center justify-center bg-black px-6">
      <FocusAwareStatusBar />
      <Text className="text-center text-base text-fog-400">{message}</Text>
    </View>
  );
}

function useDesignsFeedScroll(
  username: string,
  startId: string,
  patterns: RavelryPattern[],
) {
  const listRef = React.useRef<FlatListType<RavelryPattern>>(null);
  const didScroll = React.useRef(false);

  const startIndex = React.useMemo(() => {
    if (!startId || !patterns.length)
      return 0;
    const index = patterns.findIndex(pattern => String(pattern.id) === startId);
    return index >= 0 ? index : 0;
  }, [patterns, startId]);

  React.useEffect(() => {
    didScroll.current = false;
  }, [username, startId]);

  const getItemLayout = React.useCallback(
    (_: ArrayLike<RavelryPattern> | null | undefined, index: number) => ({
      length: DESIGN_POST_ITEM_HEIGHT,
      offset: designPostOffset(patterns, index),
      index,
    }),
    [patterns],
  );

  const scrollToStart = React.useCallback(() => {
    if (didScroll.current || startIndex <= 0 || !patterns.length)
      return;
    listRef.current?.scrollToIndex({
      index: startIndex,
      animated: false,
      viewPosition: 0,
    });
    didScroll.current = true;
  }, [patterns.length, startIndex]);

  const onScrollToIndexFailed = React.useCallback(
    (info: { index: number }) => {
      setTimeout(() => {
        listRef.current?.scrollToOffset({
          offset: designPostOffset(patterns, info.index),
          animated: false,
        });
        didScroll.current = true;
      }, 16);
    },
    [patterns],
  );

  return {
    listRef,
    startIndex,
    getItemLayout,
    scrollToStart,
    onScrollToIndexFailed,
  };
}

export function DesignerPatternsFeedScreen() {
  const params = useLocalSearchParams<{
    username: string;
    id: string;
    designer?: string;
    designer_id?: string;
  }>();
  const username = String(params.username ?? '').trim();
  const startId = String(params.id ?? '').trim();
  const designerPermalink = String(params.designer ?? '').trim();
  const designerIdRaw = Number(params.designer_id);
  const designerId
    = Number.isFinite(designerIdRaw) && designerIdRaw > 0
      ? designerIdRaw
      : undefined;

  const personQuery = usePerson({
    variables: { username },
    enabled: Boolean(username),
  });
  const designsQuery = useDesignerPatterns({
    variables: {
      username,
      ...(designerPermalink ? { designerPermalink } : {}),
      ...(designerId != null ? { designerId } : {}),
    },
    enabled: Boolean(username),
  });

  const patterns = React.useMemo(
    () => designsQuery.data?.patterns ?? [],
    [designsQuery.data],
  );

  const startPatternId = Number(startId);
  // Warm Pattern#show for the tapped tile so the feed opens without a thin→full resize.
  usePattern({
    variables: { id: startPatternId },
    enabled:
      Boolean(startId)
      && Number.isFinite(startPatternId)
      && startPatternId > 0,
  });

  const {
    listRef,
    startIndex,
    getItemLayout,
    scrollToStart,
    onScrollToIndexFailed,
  } = useDesignsFeedScroll(username, startId, patterns);

  if (!username)
    return <FeedStatus message="Missing username" />;

  if (designsQuery.isPending && !patterns.length) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <FocusAwareStatusBar />
        <ActivityIndicator color="#ffffff" size="large" />
      </View>
    );
  }

  if (designsQuery.isError && !patterns.length)
    return <FeedStatus message="Couldn’t load designs." />;

  return (
    <View className="flex-1 bg-black">
      <FocusAwareStatusBar />
      <FlatList
        ref={listRef}
        data={patterns}
        keyExtractor={(item: RavelryPattern) => String(item.id)}
        key={`${username}:${startId}`}
        getItemLayout={getItemLayout}
        initialScrollIndex={startIndex > 0 ? startIndex : undefined}
        initialNumToRender={Math.min(
          patterns.length,
          Math.max(startIndex + 3, 5),
        )}
        windowSize={7}
        onLayout={scrollToStart}
        onScrollToIndexFailed={onScrollToIndexFailed}
        renderItem={({ item }) => (
          <DesignerPatternPost
            username={username}
            person={personQuery.data}
            pattern={item}
          />
        )}
        ListEmptyComponent={(
          <Text className="mt-10 text-center text-sm text-fog-400">
            No published designs yet.
          </Text>
        )}
      />
    </View>
  );
}
