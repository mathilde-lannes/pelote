import type { RavelryPattern } from '@/lib/ravelry/types';
import { Link, Stack, useLocalSearchParams } from 'expo-router';
import * as React from 'react';
import { ActivityIndicator, ScrollView } from 'react-native';

import { ExpandableText } from '@/components/expandable-text';
import { FocusAwareStatusBar, Pressable, Text, View } from '@/components/ui';
import { PhotoCarousel } from '@/features/feed/components/photo-carousel';
import { usePattern } from './api';

function likesLabel(count: number | null | undefined): string | null {
  if (typeof count !== 'number' || !Number.isFinite(count))
    return null;
  const n = Math.max(0, Math.floor(count));
  return n === 1 ? '1 like' : `${n} likes`;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function DesignerLine({ pattern }: { pattern: RavelryPattern }) {
  const author = pattern.pattern_author;
  const username = author?.users[0]?.username ?? null;
  const label = author?.name || username;
  if (!label)
    return null;

  if (!username) {
    return (
      <Text className="mt-1 text-base text-fog-400">
        {label}
      </Text>
    );
  }

  return (
    <Link href={`/user/${username}` as never} asChild>
      <Pressable>
        <Text className="mt-1 text-base text-fog-400">
          {label}
        </Text>
      </Pressable>
    </Link>
  );
}

function PatternBody({ pattern }: { pattern: RavelryPattern }) {
  const likes = likesLabel(pattern.favorites_count);
  const notes = pattern.notes_html ? stripHtml(pattern.notes_html) : '';

  return (
    <ScrollView className="flex-1 bg-black">
      <FocusAwareStatusBar />
      <PhotoCarousel photos={pattern.photos} />
      <View className="px-4 py-5">
        <Text className="text-2xl font-semibold text-white">
          {pattern.name}
        </Text>
        <DesignerLine pattern={pattern} />
        {likes
          ? (
              <Text className="mt-3 text-sm font-semibold text-white">
                {likes}
              </Text>
            )
          : null}
        {pattern.free
          ? (
              <View className="mt-3 self-start rounded-md bg-ink-200 px-2 py-1">
                <Text className="text-xs text-fog-300">Free</Text>
              </View>
            )
          : null}
        {notes
          ? (
              <View className="mt-5">
                <ExpandableText
                  text={notes}
                  numberOfLines={3}
                  className="text-base/6 text-fog-300"
                  moreClassName="mt-1 text-sm text-fog-500"
                />
              </View>
            )
          : null}
      </View>
    </ScrollView>
  );
}

function PatternStatus({ message }: { message: string }) {
  return (
    <View className="flex-1 items-center justify-center bg-black px-6">
      <FocusAwareStatusBar />
      <Text className="text-center text-base text-fog-400">
        {message}
      </Text>
    </View>
  );
}

export function PatternScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = String(params.id ?? '').trim();
  const { data, isPending, isError } = usePattern({
    variables: { id },
    enabled: Boolean(id),
  });

  if (!id)
    return <PatternStatus message="Missing pattern" />;

  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <FocusAwareStatusBar />
        <ActivityIndicator color="#ffffff" />
      </View>
    );
  }

  if (isError || !data)
    return <PatternStatus message="Couldn’t load this pattern." />;

  return (
    <>
      <Stack.Screen options={{ title: data.name }} />
      <PatternBody pattern={data} />
    </>
  );
}
