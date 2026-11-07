import * as React from 'react';
import { Text, View } from '@/components/ui';

type Props = {
  children: React.ReactNode;
  title?: string;
};

export function SettingsContainer({ children, title }: Props) {
  return (
    <>
      {title
        ? (
            <Text className="pb-2 pt-4 text-lg text-charcoal-800">{title}</Text>
          )
        : null}
      <View className="rounded-md border border-charcoal-200 bg-oat-50">
        {children}
      </View>
    </>
  );
}
