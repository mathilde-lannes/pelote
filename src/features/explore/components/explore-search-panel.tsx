import type { RavelryPattern, RavelryPerson } from '@/lib/ravelry/types';
import type { RecentSearch } from '../recent-searches';
import { Image } from 'expo-image';
import * as React from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';

import { Text } from '@/components/ui';
import { bestPhotoUrl } from '@/lib/ravelry/api';
import { ExplorePersonRow } from './explore-person-row';

type Props = {
  recents: RecentSearch[];
  people: RavelryPerson[];
  peoplePending: boolean;
  suggestions: RavelryPattern[];
  suggestionsPending: boolean;
  query: string;
  onSelectRecent: (query: string) => void;
  onRemoveRecent: (query: string) => void;
  onClearRecents: () => void;
  onSelectPerson: (person: RavelryPerson) => void;
  onSelectPattern: (pattern: RavelryPattern) => void;
};

export function ExploreSearchPanel({
  recents,
  people,
  peoplePending,
  suggestions,
  suggestionsPending,
  query,
  onSelectRecent,
  onRemoveRecent,
  onClearRecents,
  onSelectPerson,
  onSelectPattern,
}: Props) {
  const trimmed = query.trim();
  const showRecents = recents.length > 0;
  const showSuggestions = trimmed.length > 0;
  const showPeople = trimmed.length >= 3;
  const anyPending
    = (showPeople && peoplePending) || suggestionsPending;
  const noMatches
    = showSuggestions
      && !anyPending
      && !(showPeople && people.length)
      && !suggestions.length;

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
                  Search for patterns, designers, or Ravelry usernames.
                </Text>
              </View>
            )
          : null}

      {showSuggestions
        ? (
            <>
              {showPeople
                ? (
                    <View className="px-4 pt-5">
                      <Text className="mb-2 text-xs font-medium tracking-wide text-fog-500 uppercase">
                        People
                      </Text>
                      {peoplePending && !people.length
                        ? (
                            <View className="items-center py-4">
                              <ActivityIndicator color="#ffffff" />
                            </View>
                          )
                        : null}
                      {!peoplePending && !people.length
                        ? (
                            <Text className="py-3 text-sm text-fog-400">
                              No people match “
                              {trimmed}
                              ”.
                            </Text>
                          )
                        : null}
                      {people.map(person => (
                        <ExplorePersonRow
                          key={person.id}
                          person={person}
                          onPress={() => onSelectPerson(person)}
                        />
                      ))}
                    </View>
                  )
                : null}

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
                        No patterns match “
                        {trimmed}
                        ”.
                      </Text>
                    )
                  : null}
                {suggestions.map((pattern) => {
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

              {noMatches
                ? (
                    <Text className="px-4 pt-2 text-center text-sm text-fog-500">
                      Try a shorter spelling or a Ravelry username.
                    </Text>
                  )
                : null}
            </>
          )
        : null}
    </ScrollView>
  );
}
