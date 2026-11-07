import * as React from 'react';
import { ActivityIndicator, FlatList } from 'react-native';

import {
  FocusAwareStatusBar,
  Input,
  SafeAreaView,
  Text,
  View,
} from '@/components/ui';
import { FriendRow } from './components/friend-row';
import { useFriendsScreen } from './use-friends-screen';

export function FriendsScreen() {
  const {
    query,
    setQuery,
    debounced,
    friendsQuery,
    searchQuery,
    friendSet,
    onAdd,
    onRemove,
    showingSearch,
    results,
  } = useFriendsScreen();

  return (
    <SafeAreaView className="flex-1 bg-black px-4 pt-2" edges={['top']}>
      <FocusAwareStatusBar />
      <Text className="mb-1 text-2xl font-semibold text-white">
        Friends & designers
      </Text>
      <Text className="mb-4 text-sm text-fog-400">
        Find people on Ravelry to fill your Pelote feed.
      </Text>

      <Input
        placeholder="Search username or name"
        value={query}
        onChangeText={setQuery}
        autoCapitalize="none"
        autoCorrect={false}
      />

      {friendsQuery.isPending || (showingSearch && searchQuery.isPending)
        ? (
            <View className="mt-10 items-center">
              <ActivityIndicator color="#ffffff" />
            </View>
          )
        : null}

      {!friendsQuery.isPending && !showingSearch && !(friendsQuery.data?.length)
        ? (
            <View className="mt-10 px-2">
              <Text className="text-center text-base text-fog-400">
                No friends yet. Search for makers and designers to follow.
              </Text>
            </View>
          )
        : null}

      <FlatList
        className="mt-4"
        data={results}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <FriendRow
            item={item}
            isFriend={friendSet.has(item.username)}
            onAdd={onAdd}
            onRemove={onRemove}
          />
        )}
        ListHeaderComponent={
          showingSearch
            ? (
                <Text className="mb-2 text-xs font-medium tracking-wide text-fog-500 uppercase">
                  Search results
                </Text>
              )
            : (
                <Text className="mb-2 text-xs font-medium tracking-wide text-fog-500 uppercase">
                  Your friends
                </Text>
              )
        }
        ListEmptyComponent={
          showingSearch && !searchQuery.isPending
            ? (
                <Text className="mt-6 text-center text-sm text-fog-400">
                  No people matched “
                  {debounced}
                  ”.
                </Text>
              )
            : null
        }
      />
    </SafeAreaView>
  );
}
