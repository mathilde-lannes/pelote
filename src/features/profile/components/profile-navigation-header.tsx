import { HeaderBackButton } from '@react-navigation/elements';
import { usePathname, useRouter } from 'expo-router';
import * as React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text, View } from '@/components/ui';
import { ProfileFollowButton } from './profile-follow-button';

type Props = {
  title: string;
  showFollow: boolean;
  followed: boolean;
  followPending: boolean;
  onFollow: () => void;
};

export function ProfileNavigationHeader({
  title,
  showFollow,
  followed,
  followPending,
  onFollow,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  return (
    <View className="bg-black" style={{ paddingTop: insets.top }}>
      <View className="h-11 justify-center">
        <View className="absolute inset-y-0 right-36 left-12 items-center justify-center">
          <Text className="text-center text-[17px] font-semibold text-white" numberOfLines={1}>
            {title}
          </Text>
        </View>
        <View className="flex-row items-center justify-between pr-4 pl-1">
          <HeaderBackButton
            tintColor="#ffffff"
            displayMode="minimal"
            onPress={() => {
              if (router.canGoBack())
                router.back();
              else
                router.replace((pathname.startsWith('/search') ? '/search' : '/') as never);
            }}
          />
          {showFollow
            ? (
                <ProfileFollowButton
                  followed={followed}
                  pending={followPending}
                  onPress={onFollow}
                />
              )
            : <View className="size-6" />}
        </View>
      </View>
    </View>
  );
}
