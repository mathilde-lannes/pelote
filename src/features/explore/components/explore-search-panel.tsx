import type { RavelryPattern } from '@/lib/ravelry/types';
import type { RecentSearch } from '../recent-searches';
import { Image } from 'expo-image';
import * as React from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';

import { Text } from '@/components/ui';
import { bestPhotoUrl } from '@/lib/ravelry/api';

type Props = {
  recents: RecentSearch[];
  suggestions: RavelryPattern[];
  suggestionsPending: boolean;
  query: string;
  onSelectRecent: (query: string) => void;
  onRemoveRecent: (query: string) => void;
  onClearRecents: () => void;
  onSelectPattern: (pattern: RavelryPattern) => void;
};

export function ExploreSearchPanel({
  recents,
  suggestions,
  suggestionsPending,
  query,
  onSelectRecent,
  onRemoveRecent,
  onClearRecents,
  onSelectPattern,
}: Props) {
  const trimmed = query.trim();
  const showRecents = recents.length > 0;
  const showSuggestions = trimmed.length > 0;

  return (
    <ScrollView
      className="flex-1 bg-black"
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      {showRecents
        ? (
            <View className="px-4 pt-4">
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="text-xs font-medium tracking-wide text-fog-500 uppercase">
                  Recent
                </Text>
                <Pressable
                  onPress={onClearRecents}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Clear recent searches"
                >
                  <Text className="text-sm text-fog-400">Clear</Text>
                </Pressable>
              </View>
              {recents.map(item => (
                <View
                  key={item.query}
                  className="flex-row items-center border-b border-ink-300"
                >
                  <Pressable
                    onPress={() => onSelectRecent(item.query)}
                    className="min-w-0 flex-1 py-3.5"
                    accessibilityRole="button"
                    accessibilityLabel={`Search ${item.query}`}
                  >
                    <Text className="text-base text-white" numberOfLines={1}>
                      {item.query}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => onRemoveRecent(item.query)}
                    hitSlop={10}
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${item.query}`}
                    className="px-2 py-3"
                  >
                    <Text className="text-sm text-fog-500">✕</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          )
        : !showSuggestions
          ? (
              <View className="px-6 pt-10">
                <Text className="text-center text-sm text-fog-400">
                  Search for patterns by name, designer, or yarn weight.
                </Text>
              </View>
            )
          : null}

      {showSuggestions
        ? (
            <View className="px-4 pt-5">
              <Text className="mb-2 text-xs font-medium tracking-wide text-fog-500 uppercase">
                Patterns
              </Text>
              {suggestionsPending && !suggestions.length
                ? (
                    <View className="items-center py-6">
                      <ActivityIndicator color="#ffffff" />
                    </View>
                  )
                : null}
              {!suggestionsPending && !suggestions.length
                ? (
                    <Text className="py-4 text-sm text-fog-400">
                      No close matches for “
                      {trimmed}
                      ”. Try a shorter or different spelling.
                    </Text>
                  )
                : null}
              {suggestions.map(pattern => {
                const uri = bestPhotoUrl(pattern.photos[0]);
                const designer
                  = pattern.pattern_author?.name
                    ?? pattern.pattern_author?.users?.[0]?.username
                    ?? null;
                return (
                  <Pressable
                    key={pattern.id}
                    onPress={() => onSelectPattern(pattern)}
                    className="flex-row items-center gap-3 border-b border-ink-300 py-3"
                    accessibilityRole="button"
                    accessibilityLabel={pattern.name}
                  >
                    <View className="size-12 overflow-hidden rounded-md bg-ink-200">
                      {uri
                        ? (
                            <Image
                              source={{ uri }}
                              style={{ width: '100%', height: '100%' }}
                              contentFit="cover"
                            />
                          )
                        : null}
                    </View>
                    <View className="min-w-0 flex-1">
                      <Text className="text-base text-white" numberOfLines={1}>
                        {pattern.name}
                      </Text>
                      {designer
                        ? (
                            <Text className="mt-0.5 text-sm text-fog-400" numberOfLines={1}>
                              {designer}
                            </Text>
                          )
                        : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )
        : null}
    </ScrollView>
  );
}
