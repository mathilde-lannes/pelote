import { Image } from 'expo-image';
import { useQueryClient } from '@tanstack/react-query';
import * as React from 'react';
import { ActivityIndicator, FlatList } from 'react-native';
import { showMessage } from 'react-native-flash-message';

import {
  Button,
  FocusAwareStatusBar,
  Input,
  Text,
  View,
} from '@/components/ui';
import { useAuthStore } from '@/features/auth/use-auth-store';
import type { RavelryPerson } from '@/lib/ravelry/types';
import {
  useAddFriend,
  useFriends,
  usePeopleSearch,
  useRemoveFriend,
} from './api';

export function FriendsScreen() {
  const [query, setQuery] = React.useState('');
  const [debounced, setDebounced] = React.useState('');
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  const user = useAuthStore.use.user();
  const friendsQuery = useFriends({ enabled: Boolean(user) });
  const searchQuery = usePeopleSearch({
    variables: { query: debounced },
    enabled: Boolean(user) && debounced.length > 0,
  });

  const addFriend = useAddFriend();
  const removeFriend = useRemoveFriend();

  const friendSet = React.useMemo(
    () => new Set((friendsQuery.data ?? []).map(f => f.username)),
    [friendsQuery.data],
  );

  const invalidate = React.useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['friends'] });
    await queryClient.invalidateQueries({ queryKey: ['friends-activity'] });
  }, [queryClient]);

  const onAdd = async (person: RavelryPerson) => {
    try {
      await addFriend.mutateAsync({
        friendUsername: person.username,
        person,
      });
      showMessage({
        message: `Added ${person.username}`,
        type: 'success',
      });
      await invalidate();
    }
    catch (e) {
      showMessage({
        message: e instanceof Error ? e.message : 'Could not add friend',
        type: 'danger',
      });
    }
  };

  const onRemove = async (username: string) => {
    try {
      await removeFriend.mutateAsync({ friendUsername: username });
      showMessage({ message: `Removed ${username}`, type: 'info' });
      await invalidate();
    }
    catch (e) {
      showMessage({
        message: e instanceof Error ? e.message : 'Could not remove friend',
        type: 'danger',
      });
    }
  };

  const results = debounced ? (searchQuery.data ?? []) : (friendsQuery.data ?? []);
  const showingSearch = debounced.length > 0;

  const renderPerson = ({ item }: { item: RavelryPerson }) => {
    const isFriend = friendSet.has(item.username);
    return (
      <View className="mb-3 flex-row items-center gap-3 rounded-xl bg-oat-50 px-3 py-3">
        {item.small_photo_url
          ? (
              <Image
                source={{ uri: item.small_photo_url }}
                style={{ width: 48, height: 48, borderRadius: 24 }}
              />
            )
          : (
              <View className="size-12 items-center justify-center rounded-full bg-rust-200">
                <Text className="font-semibold text-rust-800">
                  {item.username.slice(0, 1).toUpperCase()}
                </Text>
              </View>
            )}
        <View className="flex-1">
          <Text className="text-base font-semibold text-charcoal-900">
            {item.username}
          </Text>
          {item.first_name || item.about_me
            ? (
                <Text className="text-sm text-charcoal-600" numberOfLines={2}>
                  {item.about_me ?? item.first_name}
                </Text>
              )
            : null}
        </View>
        {isFriend
          ? (
              <Button
                size="sm"
                variant="outline"
                label="Remove"
                onPress={() => onRemove(item.username)}
              />
            )
          : (
              <Button
                size="sm"
                label="Add"
                onPress={() => onAdd(item)}
              />
            )}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-oat-100 px-4 pt-2">
      <FocusAwareStatusBar />
      <Text className="mb-1 font-display text-2xl font-semibold text-charcoal-900">
        Friends & designers
      </Text>
      <Text className="mb-4 text-sm text-charcoal-600">
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
              <ActivityIndicator color="#9A3F24" />
            </View>
          )
        : null}

      {!friendsQuery.isPending && !showingSearch && !(friendsQuery.data?.length)
        ? (
            <View className="mt-10 px-2">
              <Text className="text-center text-base text-charcoal-700">
                No friends yet. Search for makers and designers to follow.
              </Text>
            </View>
          )
        : null}

      <FlatList
        className="mt-4"
        data={results}
        keyExtractor={item => String(item.id)}
        renderItem={renderPerson}
        ListHeaderComponent={
          showingSearch
            ? (
                <Text className="mb-2 text-xs font-medium uppercase tracking-wide text-charcoal-500">
                  Search results
                </Text>
              )
            : (
                <Text className="mb-2 text-xs font-medium uppercase tracking-wide text-charcoal-500">
                  Your friends
                </Text>
              )
        }
        ListEmptyComponent={
          showingSearch && !searchQuery.isPending
            ? (
                <Text className="mt-6 text-center text-sm text-charcoal-600">
                  No people matched “
                  {debounced}
                  ”.
                </Text>
              )
            : null
        }
      />
    </View>
  );
}
