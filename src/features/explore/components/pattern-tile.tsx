import type { RavelryPattern } from '@/lib/ravelry/types';
import { Image } from 'expo-image';
import { Link, usePathname } from 'expo-router';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui';
import { patternHref } from '@/features/explore/pattern-href';
import { designerDesignsFeedHref } from '@/features/profile/designer-profile-href';
import { bestPhotoUrl } from '@/lib/ravelry/api';

export function PatternTile({
  pattern,
  size,
  href: hrefOverride,
}: {
  pattern: RavelryPattern;
  size: number;
  /** When set (e.g. search-results feed), wins over the designer-feed default. */
  href?: string | null;
}) {
  const pathname = usePathname();
  const uri = bestPhotoUrl(pattern.photos[0]);
  const href
    = hrefOverride
      ?? designerDesignsFeedHref(pattern.pattern_author, pattern.id, pathname)
      ?? patternHref(pattern.id, pathname);

  return (
    <Link href={href as never} asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={pattern.name}
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
                  {pattern.name}
                </Text>
              </View>
            )}
      </Pressable>
    </Link>
  );
}
