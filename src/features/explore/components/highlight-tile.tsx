import type { PatternHighlight } from '@/lib/ravelry/types';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui';
import { bestPhotoUrl } from '@/lib/ravelry/api';

export function HighlightTile({
  item,
  size,
}: {
  item: PatternHighlight;
  size: number;
}) {
  const uri = bestPhotoUrl(item.pattern.photos[0]);
  const href = `/pattern/${item.pattern.id}`;

  return (
    <Link href={href as never} asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={item.pattern.name}
        style={{ width: size, height: size, backgroundColor: '#1a1a1a' }}
      >
        {uri
          ? (
              <Image
                source={{ uri }}
                style={{ width: size, height: size }}
                contentFit="cover"
              />
            )
          : (
              <View className="size-full items-center justify-center bg-ink-200 px-2">
                <Text className="text-center text-xs text-fog-400" numberOfLines={3}>
                  {item.pattern.name}
                </Text>
              </View>
            )}
      </Pressable>
    </Link>
  );
}
