import type { RavelryPattern } from './api';
import { useScrollToTop } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { FlatList, TextInput, View } from 'react-native';

import {
  Button,
  FocusAwareStatusBar,
  SafeAreaView,
  Text,
} from '@/components/ui';
import { useAuthStore } from '@/features/auth/use-auth-store';
import {
  usePatternSearch,
  usePatternSearchSuggestions,
  useRecentlyPopularPatterns,
} from './api';
import { ExploreSearchBar } from './components/explore-search-bar';
import { ExploreSearchPanel } from './components/explore-search-panel';
import { PatternGrid } from './components/pattern-grid';
import { PatternGridSkeleton } from './components/pattern-grid-skeleton';
import { fuzzyFilter } from './fuzzy-match';
import { patternHref, searchResultsFeedHref } from './pattern-href';
import { useRecentSearches } from './use-recent-searches';

function SectionTitle({ title }: { title: string }) {
  return (
    <View className="items-center border-b border-ink-300 px-4 py-3">
      <Text className="text-lg font-semibold text-white">
        {title}
      </Text>
    </View>
  );
}

function ExploreStatus({
  title,
  body,
  onRetry,
}: {
  title: string;
  body: string;
  onRetry?: () => void;
}) {
  return (
    <View className="flex-1 items-center justify-center px-6">
      <Text className="mb-2 text-center text-lg font-semibold text-white">
        {title}
      </Text>
      <Text className="text-center text-sm text-fog-400">
        {body}
      </Text>
      {onRetry
        ? (
            <View className="mt-4">
              <Button label="Retry" onPress={onRetry} />
            </View>
          )
        : null}
    </View>
  );
}

export function ExploreScreen() {
  const user = useAuthStore.use.user();
  const router = useRouter();
  const listRef = React.useRef<FlatList<RavelryPattern>>(null);
  const inputRef = React.useRef<TextInput>(null);
  useScrollToTop(listRef);

  const [draft, setDraft] = React.useState('');
  const [committedQuery, setCommittedQuery] = React.useState('');
  const [isFocused, setIsFocused] = React.useState(false);
  const [debouncedDraft, setDebouncedDraft] = React.useState('');

  const { recents, remember, remove, clear, refresh } = useRecentSearches();

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedDraft(draft.trim()), 280);
    return () => clearTimeout(timer);
  }, [draft]);

  const showingOverlay = isFocused && !committedQuery;
  const activeSearch = committedQuery.trim().length > 0;

  const popularQuery = useRecentlyPopularPatterns({
    enabled: Boolean(user) && !activeSearch,
  });
  const searchResultsQuery = usePatternSearch({
    variables: { query: committedQuery },
    enabled: Boolean(user) && activeSearch,
  });
  const suggestionsQuery = usePatternSearchSuggestions({
    variables: { query: debouncedDraft },
    enabled: Boolean(user) && showingOverlay && debouncedDraft.length > 0,
  });

  const popularPatterns = React.useMemo(
    () => (popularQuery.data?.pages ?? []).flatMap(page => page.patterns),
    [popularQuery.data],
  );
  const resultPatterns = React.useMemo(
    () => (searchResultsQuery.data?.pages ?? []).flatMap(page => page.patterns),
    [searchResultsQuery.data],
  );

  const filteredRecents = React.useMemo(
    () => fuzzyFilter(recents, draft, item => item.query, 12),
    [recents, draft],
  );

  const commitSearch = React.useCallback((raw: string) => {
    const next = raw.trim();
    if (!next)
      return;
    setDraft(next);
    setCommittedQuery(next);
    remember(next);
    setIsFocused(false);
    inputRef.current?.blur();
  }, [remember]);

  const clearCommitted = React.useCallback(() => {
    setCommittedQuery('');
    setDraft('');
    setIsFocused(false);
    inputRef.current?.blur();
  }, []);

  const onCancel = React.useCallback(() => {
    if (activeSearch) {
      clearCommitted();
      return;
    }
    setDraft('');
    setIsFocused(false);
    inputRef.current?.blur();
    refresh();
  }, [activeSearch, clearCommitted, refresh]);

  const onSelectPattern = React.useCallback((pattern: RavelryPattern) => {
    const q = draft.trim();
    if (q) {
      remember(q);
      setCommittedQuery(q);
    }
    setIsFocused(false);
    inputRef.current?.blur();
    const href
      = (q ? searchResultsFeedHref(q, pattern.id) : null)
        ?? patternHref(pattern.id, '/search');
    router.push(href as never);
  }, [draft, remember, router]);

  const hrefForSearchResult = React.useCallback(
    (pattern: RavelryPattern) =>
      searchResultsFeedHref(committedQuery, pattern.id),
    [committedQuery],
  );

  const onPopularEndReached = React.useCallback(() => {
    if (popularQuery.hasNextPage && !popularQuery.isFetchingNextPage)
      popularQuery.fetchNextPage();
  }, [popularQuery]);

  const onResultsEndReached = React.useCallback(() => {
    if (searchResultsQuery.hasNextPage && !searchResultsQuery.isFetchingNextPage)
      searchResultsQuery.fetchNextPage();
  }, [searchResultsQuery]);

  let body: React.ReactNode = null;

  if (showingOverlay) {
    body = (
      <ExploreSearchPanel
        recents={filteredRecents}
        suggestions={suggestionsQuery.data?.patterns ?? []}
        suggestionsPending={suggestionsQuery.isPending || suggestionsQuery.isFetching}
        query={debouncedDraft}
        onSelectRecent={commitSearch}
        onRemoveRecent={remove}
        onClearRecents={clear}
        onSelectPattern={onSelectPattern}
      />
    );
  }
  else if (activeSearch) {
    if (searchResultsQuery.isPending && !resultPatterns.length) {
      body = <PatternGridSkeleton headerTitle={committedQuery} />;
    }
    else if (searchResultsQuery.isError && !resultPatterns.length) {
      body = (
        <>
          <SectionTitle title={committedQuery} />
          <ExploreStatus
            title="Couldn’t search patterns"
            body="Check your connection and try again."
            onRetry={() => {
              void searchResultsQuery.refetch();
            }}
          />
        </>
      );
    }
    else if (!resultPatterns.length) {
      body = (
        <>
          <SectionTitle title={committedQuery} />
          <ExploreStatus
            title="No patterns found"
            body={`Nothing close to “${committedQuery}”. Try a shorter or different spelling.`}
          />
        </>
      );
    }
    else {
      body = (
        <PatternGrid
          listRef={listRef}
          patterns={resultPatterns}
          ListHeaderComponent={<SectionTitle title={committedQuery} />}
          onEndReached={onResultsEndReached}
          refreshing={searchResultsQuery.isRefetching && !searchResultsQuery.isFetchingNextPage}
          onRefresh={() => {
            void searchResultsQuery.refetch();
          }}
          fetchingNextPage={searchResultsQuery.isFetchingNextPage}
          hrefForPattern={hrefForSearchResult}
        />
      );
    }
  }
  else if (!user || (popularQuery.isPending && !popularPatterns.length)) {
    body = <PatternGridSkeleton />;
  }
  else if (popularQuery.isError && !popularPatterns.length) {
    body = (
      <ExploreStatus
        title="Couldn’t load patterns"
        body="Check your connection and try again."
        onRetry={() => {
          void popularQuery.refetch();
        }}
      />
    );
  }
  else if (!popularPatterns.length) {
    body = (
      <ExploreStatus
        title="No patterns yet"
        body="Recently popular patterns from Ravelry will show up here."
      />
    );
  }
  else {
    body = (
      <PatternGrid
        listRef={listRef}
        patterns={popularPatterns}
        onEndReached={onPopularEndReached}
        refreshing={popularQuery.isRefetching && !popularQuery.isFetchingNextPage}
        onRefresh={() => {
          void popularQuery.refetch();
        }}
        fetchingNextPage={popularQuery.isFetchingNextPage}
      />
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black" edges={['top']}>
      <FocusAwareStatusBar />
      <ExploreSearchBar
        inputRef={inputRef}
        value={draft}
        onChangeText={(value) => {
          setDraft(value);
          if (committedQuery)
            setCommittedQuery('');
        }}
        onFocus={() => {
          setIsFocused(true);
          refresh();
        }}
        onSubmit={() => commitSearch(draft)}
        onClear={onCancel}
      />
      {body}
    </SafeAreaView>
  );
}
